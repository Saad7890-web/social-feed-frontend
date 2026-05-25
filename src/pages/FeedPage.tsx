import axios from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FeedLayout } from "../components/feed/FeedLayout";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../lib/errors";
import {
  createPostRequest,
  deletePostRequest,
  fetchFeedPosts,
  likePostRequest,
  unlikePostRequest,
  updatePostRequest,
} from "../lib/posts";
import { uploadImageToCloudinary } from "../lib/uploads";
import { postComposerSchema } from "../lib/validators/post";
import type { PostItem, Visibility } from "../types/post";

const PAGE_SIZE = 20;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

type FeedState = {
  posts: PostItem[];
  nextCursor: string | null;
  isInitialLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
};

function isUnauthorizedError(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 401;
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

  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [composerError, setComposerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [busyPostIds, setBusyPostIds] = useState<number[]>([]);

  const previewUrlRef = useRef<string | null>(null);

  const isEditing = editingPostId !== null;

  const clearImagePreview = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    setImageFile(null);
    setImagePreviewUrl(null);
    setImageFileName(null);
  }, []);

  const applyImageFile = useCallback(
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
        setComposerError("Image is too large. Please choose a smaller file.");
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

  const updateFeedPost = useCallback((post: PostItem) => {
    setFeedState((current) => ({
      ...current,
      posts: current.posts.map((item) =>
        item.id === post.id ? { ...item, ...post } : item,
      ),
    }));
  }, []);

  const removeFeedPost = useCallback((postId: number) => {
    setFeedState((current) => ({
      ...current,
      posts: current.posts.filter((item) => item.id !== postId),
    }));
  }, []);

  const toggleBusy = useCallback((postId: number, busy: boolean) => {
    setBusyPostIds((current) => {
      if (busy) {
        if (current.includes(postId)) return current;
        return [...current, postId];
      }

      return current.filter((id) => id !== postId);
    });
  }, []);

  const loadFeed = useCallback(
    async ({
      cursor,
      append,
    }: { cursor?: string | null; append?: boolean } = {}) => {
      try {
        setFeedState((current) => ({
          ...current,
          error: null,
          isInitialLoading: !append && current.posts.length === 0,
          isLoadingMore: Boolean(append),
        }));

        const result = await fetchFeedPosts({
          limit: PAGE_SIZE,
          cursor: cursor ?? null,
        });

        setFeedState((current) => ({
          ...current,
          posts: append ? [...current.posts, ...result.posts] : result.posts,
          nextCursor: result.nextCursor,
          isInitialLoading: false,
          isLoadingMore: false,
          error: null,
        }));
      } catch (error) {
        if (isUnauthorizedError(error)) {
          await signOut();
          navigate("/login", { replace: true });
          return;
        }

        setFeedState((current) => ({
          ...current,
          isInitialLoading: false,
          isLoadingMore: false,
          error: getApiErrorMessage(error, "Unable to load the feed."),
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
    await loadFeed({ cursor: feedState.nextCursor, append: true });
  }, [feedState.isLoadingMore, feedState.nextCursor, loadFeed]);

  const resetComposer = useCallback(() => {
    setBody("");
    setVisibility("public");
    setComposerError(null);
    setEditingPostId(null);
    clearImagePreview();
  }, [clearImagePreview]);

  const handleSubmitPost = useCallback(async () => {
    setComposerError(null);

    const parsed = postComposerSchema.safeParse({
      body,
      visibility,
    });

    if (!parsed.success) {
      setComposerError(
        parsed.error.issues[0]?.message || "Please check your post.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      let image = null;
      if (imageFile) {
        image = await uploadImageToCloudinary(imageFile, visibility);
      }

      if (editingPostId != null) {
        const updatedPost = await updatePostRequest(editingPostId, {
          body: parsed.data.body,
          visibility: parsed.data.visibility,
          ...(image ? { image } : {}),
        });

        updateFeedPost(updatedPost);
      } else {
        const createdPost = await createPostRequest({
          body: parsed.data.body,
          visibility: parsed.data.visibility,
          ...(image ? { image } : {}),
        });

        setFeedState((current) => ({
          ...current,
          posts: [
            createdPost,
            ...current.posts.filter((item) => item.id !== createdPost.id),
          ],
        }));
      }

      resetComposer();
    } catch (error) {
      if (isUnauthorizedError(error)) {
        await signOut();
        navigate("/login", { replace: true });
        return;
      }

      setComposerError(
        getApiErrorMessage(
          error,
          editingPostId != null
            ? "Unable to update the post."
            : "Unable to create the post.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    body,
    clearImagePreview,
    editingPostId,
    imageFile,
    navigate,
    resetComposer,
    signOut,
    updateFeedPost,
    visibility,
  ]);

  const handleLikePost = useCallback(
    async (post: PostItem) => {
      if (busyPostIds.includes(post.id)) return;

      toggleBusy(post.id, true);

      const previousLikedByMe = post.likedByMe;
      const previousLikeCount = post.likeCount;

      updateFeedPost({
        ...post,
        likedByMe: !previousLikedByMe,
        likeCount: Math.max(
          0,
          previousLikeCount + (previousLikedByMe ? -1 : 1),
        ),
      });

      try {
        if (previousLikedByMe) {
          await unlikePostRequest(post.id);
        } else {
          await likePostRequest(post.id);
        }
      } catch (error) {
        updateFeedPost({
          ...post,
          likedByMe: previousLikedByMe,
          likeCount: previousLikeCount,
        });

        if (isUnauthorizedError(error)) {
          await signOut();
          navigate("/login", { replace: true });
          return;
        }

        setFeedState((current) => ({
          ...current,
          error: getApiErrorMessage(error, "Unable to update the like state."),
        }));
      } finally {
        toggleBusy(post.id, false);
      }
    },
    [busyPostIds, navigate, signOut, toggleBusy, updateFeedPost],
  );

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

  const handleDeletePost = useCallback(
    async (post: PostItem) => {
      if (!window.confirm("Delete this post?")) return;
      if (busyPostIds.includes(post.id)) return;

      toggleBusy(post.id, true);

      const snapshot = feedState.posts;

      removeFeedPost(post.id);

      try {
        await deletePostRequest(post.id);
        if (editingPostId === post.id) {
          resetComposer();
        }
      } catch (error) {
        setFeedState((current) => ({
          ...current,
          posts: snapshot,
          error: getApiErrorMessage(error, "Unable to delete the post."),
        }));

        if (isUnauthorizedError(error)) {
          await signOut();
          navigate("/login", { replace: true });
          return;
        }
      } finally {
        toggleBusy(post.id, false);
      }
    },
    [
      busyPostIds,
      editingPostId,
      feedState.posts,
      navigate,
      removeFeedPost,
      resetComposer,
      signOut,
      toggleBusy,
    ],
  );

  const handleFileSelected = useCallback(
    (file: File | null) => {
      applyImageFile(file);
    },
    [applyImageFile],
  );

  const handleVisibilityChange = useCallback((nextValue: Visibility) => {
    setVisibility(nextValue);
  }, []);

  const handleBodyChange = useCallback(
    (value: string) => {
      setBody(value);
      if (composerError) setComposerError(null);
    },
    [composerError],
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
      onBodyChange: handleBodyChange,
      onVisibilityChange: handleVisibilityChange,
      onChooseImage: () => setComposerError(null),
      onFileSelected: handleFileSelected,
      onRemoveImage: clearImagePreview,
      onSubmit: handleSubmitPost,
      onCancelEdit: resetComposer,
    }),
    [
      body,
      clearImagePreview,
      composerError,
      handleBodyChange,
      handleFileSelected,
      handleSubmitPost,
      handleVisibilityChange,
      imageFileName,
      imagePreviewUrl,
      isEditing,
      isSubmitting,
      resetComposer,
      visibility,
    ],
  );

  if (!user) {
    return null;
  }

  return (
    <FeedLayout
      user={user}
      posts={feedState.posts}
      isInitialLoading={feedState.isInitialLoading}
      isLoadingMore={feedState.isLoadingMore}
      feedError={feedState.error}
      hasMore={Boolean(feedState.nextCursor)}
      busyPostIds={busyPostIds}
      composer={composer}
      onLikePost={handleLikePost}
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
