import axios from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FeedLayout } from "../components/feed/FeedLayout";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../lib/errors";

import { createPostRequest, fetchFeedPosts } from "../lib/posts";

import { uploadPostImage } from "../lib/uploads";
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

export default function FeedPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  // ---------------- FEED STATE ----------------
  const [feedState, setFeedState] = useState<FeedState>({
    posts: [],
    nextCursor: null,
    isInitialLoading: true,
    isLoadingMore: false,
    error: null,
  });

  const [busyPostIds, setBusyPostIds] = useState<number[]>([]);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);

  const isEditing = editingPostId !== null;

  // ---------------- COMPOSER STATE ----------------
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [composerError, setComposerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const previewUrlRef = useRef<string | null>(null);

  // ---------------- HELPERS ----------------
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

  // ---------------- FEED ----------------
  const loadFeed = useCallback(
    async (cursor?: string | null, append = false) => {
      try {
        setFeedState((s) => ({
          ...s,
          error: null,
          isInitialLoading: !append && s.posts.length === 0,
          isLoadingMore: append,
        }));

        const res = await fetchFeedPosts({
          limit: PAGE_SIZE,
          cursor: cursor ?? null,
        });

        setFeedState((s) => ({
          ...s,
          posts: append ? [...s.posts, ...res.posts] : res.posts,
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

        setFeedState((s) => ({
          ...s,
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

  // ---------------- COMPOSER ACTIONS ----------------
  const resetComposer = useCallback(() => {
    setBody("");
    setVisibility("public");
    setComposerError(null);
    setEditingPostId(null);
    clearImagePreview();
  }, [clearImagePreview]);

  const handleSubmitPost = useCallback(async () => {
    if (!body.trim()) {
      setComposerError("Write something first.");
      return;
    }

    setIsSubmitting(true);

    try {
      const image: PostImagePayload | null = imageFile
        ? await uploadPostImage(imageFile, visibility)
        : null;

      await createPostRequest({
        body: body.trim(),
        visibility,
        image,
      });

      resetComposer();
    } catch (error) {
      setComposerError(getApiErrorMessage(error, "Failed to post"));
    } finally {
      setIsSubmitting(false);
    }
  }, [body, imageFile, visibility, resetComposer]);

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

  // ---------------- COMPOSER OBJECT ----------------
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
      isInitialLoading={feedState.isInitialLoading}
      isLoadingMore={feedState.isLoadingMore}
      feedError={feedState.error}
      hasMore={!!feedState.nextCursor}
      busyPostIds={busyPostIds}
      composer={composer}
      onLikePost={() => {}}
      onEditPost={handleEditPost}
      onDeletePost={() => {}}
      onLoadMore={handleLoadMore}
      onSignOut={async () => {
        await signOut();
        navigate("/login", { replace: true });
      }}
    />
  );
}
