import axios from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FeedLayout } from "../components/feed/FeedLayout";
import {
  type PostCommentThreadState,
  type ReplyThreadState,
} from "../components/feed/PostComment";
import { useAuth } from "../context/AuthContext";
import {
  createCommentForPost,
  createReplyForComment,
  fetchCommentReplies,
  fetchPostComments,
  likeCommentRequest,
  unlikeCommentRequest,
} from "../lib/comment";
import { getApiErrorMessage } from "../lib/errors";
import {
  createPostRequest,
  deletePostRequest,
  fetchFeedPosts,
  likePostRequest,
  unlikePostRequest,
  updatePostRequest,
} from "../lib/posts";
import { uploadPostImage } from "../lib/uploads";
import type { CommentItem, CommentLikeSummary } from "../types/comment";
import type { PostImagePayload, PostItem, Visibility } from "../types/post";

const PAGE_SIZE = 20;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

type FeedState = {
  posts: PostItem[];
  nextCursor: string | null;
  isInitialLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
};

type CommentThreadsState = Record<number, PostCommentThreadState>;

function createReplyThreadState(): ReplyThreadState {
  return {
    replies: [],
    nextCursor: null,
    isLoading: false,
    isLoadingMore: false,
    error: null,
    isOpen: false,
    draft: "",
    isSubmitting: false,
  };
}

function createCommentThreadState(): PostCommentThreadState {
  return {
    isOpen: false,
    isLoading: false,
    isLoadingMore: false,
    error: null,
    comments: [],
    nextCursor: null,
    draft: "",
    isSubmitting: false,
    repliesByParentId: {},
  };
}

function applyLikeSummaryToComment(
  comment: CommentItem,
  summary: CommentLikeSummary,
): CommentItem {
  return {
    ...comment,
    likeCount: summary.likeCount,
    likedByMe: summary.likedByMe,
    likersPreview: summary.likersPreview,
  };
}

function updateThreadCommentLike(
  thread: PostCommentThreadState,
  commentId: number,
  summary: CommentLikeSummary,
): PostCommentThreadState {
  return {
    ...thread,
    comments: thread.comments.map((comment) =>
      comment.id === commentId
        ? applyLikeSummaryToComment(comment, summary)
        : comment,
    ),
    repliesByParentId: Object.fromEntries(
      Object.entries(thread.repliesByParentId).map(
        ([parentId, replyThread]) => [
          parentId,
          {
            ...replyThread,
            replies: replyThread.replies.map((reply) =>
              reply.id === commentId
                ? applyLikeSummaryToComment(reply, summary)
                : reply,
            ),
          },
        ],
      ),
    ),
  };
}

function upsertThreadComment(
  thread: PostCommentThreadState,
  comment: CommentItem,
): PostCommentThreadState {
  if (comment.parentCommentId == null) {
    return {
      ...thread,
      comments: [
        comment,
        ...thread.comments.filter((item) => item.id !== comment.id),
      ],
    };
  }

  const parentId = comment.parentCommentId;
  const replyThread =
    thread.repliesByParentId[parentId] ?? createReplyThreadState();

  return {
    ...thread,
    repliesByParentId: {
      ...thread.repliesByParentId,
      [parentId]: {
        ...replyThread,
        replies: [
          comment,
          ...replyThread.replies.filter((item) => item.id !== comment.id),
        ],
      },
    },
  };
}

function updateThreadReplyCount(
  thread: PostCommentThreadState,
  commentId: number,
  delta: number,
): PostCommentThreadState {
  return {
    ...thread,
    comments: thread.comments.map((comment) =>
      comment.id === commentId
        ? { ...comment, replyCount: Math.max(0, comment.replyCount + delta) }
        : comment,
    ),
  };
}

function findCommentLikeState(
  thread: PostCommentThreadState,
  commentId: number,
) {
  const topLevel = thread.comments.find((comment) => comment.id === commentId);
  if (topLevel) return topLevel;

  for (const replyThread of Object.values(thread.repliesByParentId)) {
    const reply = replyThread.replies.find((item) => item.id === commentId);
    if (reply) return reply;
  }

  return null;
}

export default function FeedPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const [feedState, setFeedState] = useState<FeedState>({
    posts: [],
    nextCursor: null,
    isInitialLoading: true,
    isLoadingMore: false,
    error: null,
  });

  const [commentThreads, setCommentThreads] = useState<CommentThreadsState>({});
  const [busyPostIds, setBusyPostIds] = useState<number[]>([]);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);

  const isEditing = editingPostId !== null;

  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [composerError, setComposerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const previewUrlRef = useRef<string | null>(null);

  const isUnauthorizedError = (error: unknown) =>
    axios.isAxiosError(error) && error.response?.status === 401;

  const clearImagePreview = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    setImageFile(null);
    setImagePreviewUrl(null);
    setImageFileName(null);
  }, []);

  const updateCommentThread = useCallback(
    (
      postId: number,
      updater: (thread: PostCommentThreadState) => PostCommentThreadState,
    ) => {
      setCommentThreads((prev) => {
        const current = prev[postId] ?? createCommentThreadState();
        const next = updater(current);
        if (next === current) return prev;
        return { ...prev, [postId]: next };
      });
    },
    [],
  );

  const updateFeedPosts = useCallback(
    (updater: (posts: PostItem[]) => PostItem[]) => {
      setFeedState((state) => ({
        ...state,
        posts: updater(state.posts),
      }));
    },
    [],
  );

  const withBusyPost = useCallback(
    async <T,>(postId: number, action: () => Promise<T>): Promise<T> => {
      setBusyPostIds((current) =>
        current.includes(postId) ? current : [...current, postId],
      );

      try {
        return await action();
      } finally {
        setBusyPostIds((current) => current.filter((id) => id !== postId));
      }
    },
    [],
  );

  const handleFileSelected = useCallback(
    (file: File | null) => {
      setComposerError(null);

      if (!file) {
        clearImagePreview();
        return;
      }

      if (!file.type.startsWith("image/")) {
        setComposerError("Please choose an image file.");
        return;
      }

      if (file.size > MAX_IMAGE_BYTES) {
        setComposerError("Image is too large.");
        return;
      }

      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }

      const previewUrl = URL.createObjectURL(file);
      previewUrlRef.current = previewUrl;

      setImageFile(file);
      setImagePreviewUrl(previewUrl);
      setImageFileName(file.name);
    },
    [clearImagePreview],
  );

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const loadFeed = useCallback(
    async (cursor?: string | null, append = false) => {
      try {
        setFeedState((state) => ({
          ...state,
          error: null,
          isInitialLoading: !append && state.posts.length === 0,
          isLoadingMore: append,
        }));

        const res = await fetchFeedPosts({
          limit: PAGE_SIZE,
          cursor: cursor ?? null,
        });

        setFeedState((state) => ({
          ...state,
          posts: append ? [...state.posts, ...res.posts] : res.posts,
          nextCursor: res.nextCursor,
          isInitialLoading: false,
          isLoadingMore: false,
        }));
      } catch (error) {
        if (isUnauthorizedError(error)) {
          await signOut();
          navigate("/login", { replace: true });
          return;
        }

        setFeedState((state) => ({
          ...state,
          isInitialLoading: false,
          isLoadingMore: false,
          error: getApiErrorMessage(error, "Failed to load feed"),
        }));
      }
    },
    [navigate, signOut],
  );

  useEffect(() => {
    void loadFeed();
  }, [loadFeed]);

  const handleLoadMore = useCallback(async () => {
    if (!feedState.nextCursor || feedState.isLoadingMore) return;
    await loadFeed(feedState.nextCursor, true);
  }, [feedState.nextCursor, feedState.isLoadingMore, loadFeed]);

  const resetComposer = useCallback(() => {
    setBody("");
    setVisibility("public");
    setComposerError(null);
    setEditingPostId(null);
    clearImagePreview();
  }, [clearImagePreview]);

  const handleSubmitPost = useCallback(async () => {
    const trimmedBody = body.trim();

    const hasText = trimmedBody.length > 0;
    const hasImage = Boolean(imageFile);

    if (!hasText && !hasImage) {
      setComposerError("Write something first.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && editingPostId !== null) {
        const image: PostImagePayload | undefined = imageFile
          ? await uploadPostImage(imageFile, visibility)
          : undefined;

        const updated = await updatePostRequest(editingPostId, {
          body: trimmedBody,
          visibility,
          ...(image ? { image } : {}),
        });

        updateFeedPosts((posts) =>
          posts.map((post) => (post.id === updated.id ? updated : post)),
        );
      } else {
        const image: PostImagePayload | null = imageFile
          ? await uploadPostImage(imageFile, visibility)
          : null;

        const created = await createPostRequest({
          body: trimmedBody,
          visibility,
          image,
        });

        updateFeedPosts((posts) => [created, ...posts]);
      }

      resetComposer();
    } catch (error) {
      if (isUnauthorizedError(error)) {
        await signOut();
        navigate("/login", { replace: true });
        return;
      }

      setComposerError(getApiErrorMessage(error, "Failed to post"));
    } finally {
      setIsSubmitting(false);
    }
  }, [
    body,
    editingPostId,
    imageFile,
    isEditing,
    navigate,
    resetComposer,
    signOut,
    updateFeedPosts,
    visibility,
  ]);

  const handleEditPost = useCallback(
    (post: PostItem) => {
      setEditingPostId(post.id);
      setBody(post.body);
      setVisibility(post.visibility);
      setComposerError(null);
      clearImagePreview();
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [clearImagePreview],
  );

  const handleLikePost = useCallback(
    async (post: PostItem) => {
      if (busyPostIds.includes(post.id)) return;

      try {
        await withBusyPost(post.id, async () => {
          if (post.likedByMe) {
            await unlikePostRequest(post.id);
          } else {
            await likePostRequest(post.id);
          }

          updateFeedPosts((posts) =>
            posts.map((item) =>
              item.id === post.id
                ? {
                    ...item,
                    likedByMe: !post.likedByMe,
                    likeCount: Math.max(
                      0,
                      item.likeCount + (post.likedByMe ? -1 : 1),
                    ),
                  }
                : item,
            ),
          );
        });
      } catch (error) {
        if (isUnauthorizedError(error)) {
          await signOut();
          navigate("/login", { replace: true });
        }
      }
    },
    [busyPostIds, navigate, signOut, updateFeedPosts, withBusyPost],
  );

  const handleDeletePost = useCallback(
    async (post: PostItem) => {
      try {
        await withBusyPost(post.id, async () => {
          await deletePostRequest(post.id);
          updateFeedPosts((posts) =>
            posts.filter((item) => item.id !== post.id),
          );
          setCommentThreads((prev) => {
            const next = { ...prev };
            delete next[post.id];
            return next;
          });
        });
      } catch (error) {
        if (isUnauthorizedError(error)) {
          await signOut();
          navigate("/login", { replace: true });
        }
      }
    },
    [navigate, signOut, updateFeedPosts, withBusyPost],
  );

  const loadCommentPage = useCallback(
    async (postId: number, append = false) => {
      const current = commentThreads[postId] ?? createCommentThreadState();
      if (append && !current.nextCursor) return;

      updateCommentThread(postId, (thread) => ({
        ...thread,
        isOpen: true,
        error: null,
        isLoading: !append && thread.comments.length === 0,
        isLoadingMore: append,
      }));

      try {
        const result = await fetchPostComments({
          postId,
          limit: PAGE_SIZE,
          cursor: append ? current.nextCursor : null,
        });

        updateCommentThread(postId, (thread) => ({
          ...thread,
          isOpen: true,
          comments: append
            ? [...thread.comments, ...result.comments]
            : result.comments,
          nextCursor: result.nextCursor,
          isLoading: false,
          isLoadingMore: false,
        }));
      } catch (error) {
        if (isUnauthorizedError(error)) {
          await signOut();
          navigate("/login", { replace: true });
          return;
        }

        updateCommentThread(postId, (thread) => ({
          ...thread,
          isLoading: false,
          isLoadingMore: false,
          error: getApiErrorMessage(error, "Failed to load comments"),
        }));
      }
    },
    [commentThreads, navigate, signOut, updateCommentThread],
  );

  const handleToggleComments = useCallback(
    async (post: PostItem) => {
      const current = commentThreads[post.id] ?? createCommentThreadState();

      if (current.isOpen) {
        updateCommentThread(post.id, (thread) => ({
          ...thread,
          isOpen: false,
        }));
        return;
      }

      if (current.comments.length > 0) {
        updateCommentThread(post.id, (thread) => ({
          ...thread,
          isOpen: true,
          error: null,
        }));
        return;
      }

      await loadCommentPage(post.id, false);
    },
    [commentThreads, loadCommentPage, updateCommentThread],
  );

  const handleCommentDraftChange = useCallback(
    (postId: number, value: string) => {
      updateCommentThread(postId, (thread) => ({
        ...thread,
        draft: value,
        error: null,
      }));
    },
    [updateCommentThread],
  );

  const handleSubmitComment = useCallback(
    async (postId: number) => {
      const current = commentThreads[postId] ?? createCommentThreadState();
      const text = current.draft.trim();

      if (!text) {
        updateCommentThread(postId, (thread) => ({
          ...thread,
          error: "Write a comment first.",
        }));
        return;
      }

      updateCommentThread(postId, (thread) => ({
        ...thread,
        isOpen: true,
        isSubmitting: true,
        error: null,
      }));

      try {
        const comment = await createCommentForPost({ postId, body: text });

        updateCommentThread(postId, (thread) =>
          upsertThreadComment(
            {
              ...thread,
              draft: "",
              isOpen: true,
              isSubmitting: false,
              error: null,
            },
            comment,
          ),
        );

        updateFeedPosts((posts) =>
          posts.map((post) =>
            post.id === postId
              ? { ...post, commentCount: post.commentCount + 1 }
              : post,
          ),
        );
      } catch (error) {
        if (isUnauthorizedError(error)) {
          await signOut();
          navigate("/login", { replace: true });
          return;
        }

        updateCommentThread(postId, (thread) => ({
          ...thread,
          isSubmitting: false,
          error: getApiErrorMessage(error, "Failed to add comment"),
        }));
      }
    },
    [commentThreads, navigate, signOut, updateCommentThread, updateFeedPosts],
  );

  const handleLoadMoreComments = useCallback(
    async (postId: number) => {
      await loadCommentPage(postId, true);
    },
    [loadCommentPage],
  );

  const handleToggleReplyComposer = useCallback(
    (postId: number, commentId: number) => {
      updateCommentThread(postId, (thread) => {
        const currentReply =
          thread.repliesByParentId[commentId] ?? createReplyThreadState();

        return {
          ...thread,
          repliesByParentId: {
            ...thread.repliesByParentId,
            [commentId]: {
              ...currentReply,
              isOpen: !currentReply.isOpen,
              error: null,
            },
          },
        };
      });
    },
    [updateCommentThread],
  );

  const loadReplyPage = useCallback(
    async (postId: number, commentId: number, append = false) => {
      const currentThread =
        commentThreads[postId] ?? createCommentThreadState();
      const currentReply =
        currentThread.repliesByParentId[commentId] ?? createReplyThreadState();

      if (append && !currentReply.nextCursor) return;

      updateCommentThread(postId, (thread) => ({
        ...thread,
        repliesByParentId: {
          ...thread.repliesByParentId,
          [commentId]: {
            ...currentReply,
            isOpen: true,
            error: null,
            isLoading: !append && currentReply.replies.length === 0,
            isLoadingMore: append,
          },
        },
      }));

      try {
        const result = await fetchCommentReplies({
          commentId,
          limit: PAGE_SIZE,
          cursor: append ? currentReply.nextCursor : null,
        });

        updateCommentThread(postId, (thread) => {
          const replyThread =
            thread.repliesByParentId[commentId] ?? createReplyThreadState();

          return {
            ...thread,
            repliesByParentId: {
              ...thread.repliesByParentId,
              [commentId]: {
                ...replyThread,
                isOpen: true,
                replies: append
                  ? [...replyThread.replies, ...result.replies]
                  : result.replies,
                nextCursor: result.nextCursor,
                isLoading: false,
                isLoadingMore: false,
              },
            },
          };
        });
      } catch (error) {
        if (isUnauthorizedError(error)) {
          await signOut();
          navigate("/login", { replace: true });
          return;
        }

        updateCommentThread(postId, (thread) => {
          const replyThread =
            thread.repliesByParentId[commentId] ?? createReplyThreadState();

          return {
            ...thread,
            repliesByParentId: {
              ...thread.repliesByParentId,
              [commentId]: {
                ...replyThread,
                isLoading: false,
                isLoadingMore: false,
                error: getApiErrorMessage(error, "Failed to load replies"),
              },
            },
          };
        });
      }
    },
    [commentThreads, navigate, signOut, updateCommentThread],
  );

  const handleLoadReplies = useCallback(
    async (postId: number, commentId: number) => {
      const currentThread =
        commentThreads[postId] ?? createCommentThreadState();
      const currentReply =
        currentThread.repliesByParentId[commentId] ?? createReplyThreadState();

      if (currentReply.isOpen) {
        updateCommentThread(postId, (thread) => {
          const replyThread =
            thread.repliesByParentId[commentId] ?? createReplyThreadState();
          return {
            ...thread,
            repliesByParentId: {
              ...thread.repliesByParentId,
              [commentId]: {
                ...replyThread,
                isOpen: false,
                error: null,
              },
            },
          };
        });
        return;
      }

      await loadReplyPage(postId, commentId, false);
    },
    [commentThreads, loadReplyPage, updateCommentThread],
  );

  const handleReplyDraftChange = useCallback(
    (postId: number, commentId: number, value: string) => {
      updateCommentThread(postId, (thread) => {
        const currentReply =
          thread.repliesByParentId[commentId] ?? createReplyThreadState();

        return {
          ...thread,
          repliesByParentId: {
            ...thread.repliesByParentId,
            [commentId]: {
              ...currentReply,
              draft: value,
              error: null,
            },
          },
        };
      });
    },
    [updateCommentThread],
  );

  const handleSubmitReply = useCallback(
    async (postId: number, commentId: number) => {
      const currentThread =
        commentThreads[postId] ?? createCommentThreadState();
      const currentReply =
        currentThread.repliesByParentId[commentId] ?? createReplyThreadState();
      const text = currentReply.draft.trim();

      if (!text) {
        updateCommentThread(postId, (thread) => {
          const replyThread =
            thread.repliesByParentId[commentId] ?? createReplyThreadState();
          return {
            ...thread,
            repliesByParentId: {
              ...thread.repliesByParentId,
              [commentId]: {
                ...replyThread,
                error: "Write a reply first.",
              },
            },
          };
        });
        return;
      }

      updateCommentThread(postId, (thread) => {
        const replyThread =
          thread.repliesByParentId[commentId] ?? createReplyThreadState();
        return {
          ...thread,
          isOpen: true,
          repliesByParentId: {
            ...thread.repliesByParentId,
            [commentId]: {
              ...replyThread,
              isOpen: true,
              isSubmitting: true,
              error: null,
            },
          },
        };
      });

      try {
        const reply = await createReplyForComment({ commentId, body: text });

        updateCommentThread(postId, (thread) => {
          const replyThread =
            thread.repliesByParentId[commentId] ?? createReplyThreadState();

          return updateThreadReplyCount(
            {
              ...thread,
              isOpen: true,
              repliesByParentId: {
                ...thread.repliesByParentId,
                [commentId]: {
                  ...replyThread,
                  isOpen: true,
                  isSubmitting: false,
                  draft: "",
                  error: null,
                },
              },
            },
            commentId,
            1,
          );
        });

        updateCommentThread(postId, (thread) => {
          const replyThread =
            thread.repliesByParentId[commentId] ?? createReplyThreadState();
          return {
            ...thread,
            isOpen: true,
            repliesByParentId: {
              ...thread.repliesByParentId,
              [commentId]: {
                ...replyThread,
                replies: [reply, ...replyThread.replies],
                isSubmitting: false,
                draft: "",
                error: null,
              },
            },
          };
        });

        updateFeedPosts((posts) =>
          posts.map((post) =>
            post.id === postId
              ? { ...post, commentCount: post.commentCount + 1 }
              : post,
          ),
        );
      } catch (error) {
        if (isUnauthorizedError(error)) {
          await signOut();
          navigate("/login", { replace: true });
          return;
        }

        updateCommentThread(postId, (thread) => {
          const replyThread =
            thread.repliesByParentId[commentId] ?? createReplyThreadState();
          return {
            ...thread,
            repliesByParentId: {
              ...thread.repliesByParentId,
              [commentId]: {
                ...replyThread,
                isSubmitting: false,
                error: getApiErrorMessage(error, "Failed to add reply"),
              },
            },
          };
        });
      }
    },
    [commentThreads, navigate, signOut, updateCommentThread, updateFeedPosts],
  );

  const handleLoadMoreReplies = useCallback(
    async (postId: number, commentId: number) => {
      await loadReplyPage(postId, commentId, true);
    },
    [loadReplyPage],
  );

  const handleToggleCommentLike = useCallback(
    async (postId: number, commentId: number) => {
      const currentThread =
        commentThreads[postId] ?? createCommentThreadState();
      const currentComment = findCommentLikeState(currentThread, commentId);

      if (!currentComment) return;

      try {
        const summary = currentComment.likedByMe
          ? await unlikeCommentRequest(commentId)
          : await likeCommentRequest(commentId);

        updateCommentThread(postId, (thread) =>
          updateThreadCommentLike(thread, commentId, summary),
        );
      } catch (error) {
        if (isUnauthorizedError(error)) {
          await signOut();
          navigate("/login", { replace: true });
        }
      }
    },
    [commentThreads, navigate, signOut, updateCommentThread],
  );

  const handleToggleReplyLike = useCallback(
    async (postId: number, replyId: number) => {
      await handleToggleCommentLike(postId, replyId);
    },
    [handleToggleCommentLike],
  );

  const composer = useMemo(
    () => ({
      body,
      visibility,
      imagePreviewUrl,
      imageFileName,
      error: composerError,
      isSubmitting,
      isEditing,
      onBodyChange: setBody,
      onVisibilityChange: setVisibility,
      onChooseImage: () => setComposerError(null),
      onFileSelected: handleFileSelected,
      onRemoveImage: clearImagePreview,
      onSubmit: handleSubmitPost,
      onCancelEdit: resetComposer,
    }),
    [
      body,
      visibility,
      imagePreviewUrl,
      imageFileName,
      composerError,
      isSubmitting,
      isEditing,
      handleFileSelected,
      clearImagePreview,
      handleSubmitPost,
      resetComposer,
    ],
  );

  if (!user) return null;

  return (
    <FeedLayout
      user={user}
      posts={feedState.posts}
      commentThreads={commentThreads}
      isInitialLoading={feedState.isInitialLoading}
      isLoadingMore={feedState.isLoadingMore}
      feedError={feedState.error}
      hasMore={!!feedState.nextCursor}
      busyPostIds={busyPostIds}
      composer={composer}
      onLikePost={handleLikePost}
      onToggleComments={handleToggleComments}
      onCommentDraftChange={handleCommentDraftChange}
      onSubmitComment={handleSubmitComment}
      onLoadMoreComments={handleLoadMoreComments}
      onToggleCommentLike={handleToggleCommentLike}
      onToggleReplyComposer={handleToggleReplyComposer}
      onReplyDraftChange={handleReplyDraftChange}
      onSubmitReply={handleSubmitReply}
      onLoadReplies={handleLoadReplies}
      onLoadMoreReplies={handleLoadMoreReplies}
      onToggleReplyLike={handleToggleReplyLike}
      onEditPost={handleEditPost}
      onDeletePost={handleDeletePost}
      onLoadMore={handleLoadMore}
      onSignOut={async () => {
        await signOut();
        navigate("/login", { replace: true });
      }}
    />
  );
}
