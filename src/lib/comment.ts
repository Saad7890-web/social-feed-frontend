import type {
  CommentItem,
  CommentLikerPreview,
  CommentLikeSummary,
  CommentPage,
  ReplyPage,
} from "../types/comment";
import { request, unwrap } from "./api";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getField(
  source: Record<string, unknown> | null | undefined,
  keys: string[],
) {
  if (!source) return undefined;

  for (const key of keys) {
    if (key in source) {
      return source[key];
    }
  }

  return undefined;
}

function toStringValue(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function toNumberValue(value: unknown): number | null {
  const normalized =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : Number.NaN;

  return Number.isFinite(normalized) ? normalized : null;
}

function toBooleanValue(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    return ["true", "1", "yes"].includes(value.toLowerCase());
  }
  return false;
}

function normalizeLikerPreview(source: unknown): CommentLikerPreview[] {
  if (!Array.isArray(source)) return [];

  return source
    .map((item): CommentLikerPreview | null => {
      if (typeof item === "string") {
        const [firstName = "", ...rest] = item.split(" ");
        return {
          id: 0,
          firstName,
          lastName: rest.join(" "),
        };
      }

      if (!isRecord(item)) return null;

      return {
        id: toNumberValue(getField(item, ["id", "userId", "user_id"])) ?? 0,
        firstName:
          toStringValue(getField(item, ["firstName", "first_name"])) ?? "",
        lastName:
          toStringValue(getField(item, ["lastName", "last_name"])) ?? "",
      };
    })
    .filter(Boolean) as CommentLikerPreview[];
}

function normalizeAuthor(
  source: Record<string, unknown>,
): CommentItem["author"] {
  const nested = getField(source, ["author"]);
  const authorSource = isRecord(nested) ? nested : null;

  const id =
    toNumberValue(
      getField(source, ["authorId", "author_id"]) ??
        getField(authorSource, ["id", "authorId", "author_id"]),
    ) ?? null;

  const firstName =
    toStringValue(
      getField(source, ["authorFirstName", "author_first_name"]) ??
        getField(authorSource, ["firstName", "first_name"]),
    ) ?? "";

  const lastName =
    toStringValue(
      getField(source, ["authorLastName", "author_last_name"]) ??
        getField(authorSource, ["lastName", "last_name"]),
    ) ?? "";

  const email =
    toStringValue(
      getField(source, ["authorEmail", "author_email"]) ??
        getField(authorSource, ["email"]),
    ) ?? null;

  if (id == null && !firstName && !lastName) {
    return null;
  }

  return {
    id: id ?? 0,
    firstName,
    lastName,
    email,
  };
}

export function normalizeComment(raw: unknown): CommentItem {
  const source = isRecord(raw) ? raw : {};
  const author = normalizeAuthor(source);

  return {
    id: toNumberValue(getField(source, ["id"])) ?? 0,
    postId: toNumberValue(getField(source, ["postId", "post_id"])) ?? 0,
    parentCommentId:
      toNumberValue(
        getField(source, ["parentCommentId", "parent_comment_id"]),
      ) ?? null,
    authorId:
      toNumberValue(getField(source, ["authorId", "userId", "user_id"])) ??
      author?.id ??
      0,
    author,
    authorFirstName:
      toStringValue(
        getField(source, ["authorFirstName", "author_first_name"]) ??
          author?.firstName,
      ) ?? "",
    authorLastName:
      toStringValue(
        getField(source, ["authorLastName", "author_last_name"]) ??
          author?.lastName,
      ) ?? "",
    body: toStringValue(getField(source, ["body"])) ?? "",
    replyCount:
      toNumberValue(getField(source, ["replyCount", "reply_count"])) ?? 0,
    likeCount:
      toNumberValue(getField(source, ["likeCount", "like_count"])) ?? 0,
    createdAt:
      toStringValue(getField(source, ["createdAt", "created_at"])) ??
      new Date().toISOString(),
    updatedAt:
      toStringValue(getField(source, ["updatedAt", "updated_at"])) ??
      new Date().toISOString(),
    likedByMe:
      toBooleanValue(getField(source, ["likedByMe", "liked_by_me"])) ?? false,
    likersPreview: normalizeLikerPreview(
      getField(source, ["likersPreview", "likers_preview"]),
    ),
  };
}

function normalizeCommentPagePayload(raw: unknown): CommentPage {
  const root = unwrap(raw) as unknown;
  const source = isRecord(root) ? root : {};
  const commentsSource =
    getField(source, ["comments", "items", "results"]) ?? [];

  const comments = Array.isArray(commentsSource)
    ? commentsSource.map((item) => normalizeComment(item))
    : [];

  const nextCursor =
    toStringValue(getField(source, ["nextCursor", "next_cursor", "cursor"])) ??
    null;

  return { comments, nextCursor };
}

function normalizeReplyPagePayload(raw: unknown): ReplyPage {
  const root = unwrap(raw) as unknown;
  const source = isRecord(root) ? root : {};
  const repliesSource = getField(source, ["replies", "items", "results"]) ?? [];

  const replies = Array.isArray(repliesSource)
    ? repliesSource.map((item) => normalizeComment(item))
    : [];

  const nextCursor =
    toStringValue(getField(source, ["nextCursor", "next_cursor", "cursor"])) ??
    null;

  return { replies, nextCursor };
}

function normalizeCommentLikeSummary(raw: unknown): CommentLikeSummary {
  const root = unwrap(raw) as unknown;
  const source = isRecord(root) ? root : {};

  return {
    likeCount:
      toNumberValue(getField(source, ["likeCount", "like_count"])) ?? 0,
    likedByMe:
      toBooleanValue(getField(source, ["likedByMe", "liked_by_me"])) ?? false,
    likersPreview: normalizeLikerPreview(
      getField(source, ["likersPreview", "likers_preview"]),
    ),
  };
}

const pendingCommentPageRequests = new Map<string, Promise<CommentPage>>();
const pendingReplyPageRequests = new Map<string, Promise<ReplyPage>>();
const pendingCommentMutationRequests = new Map<
  string,
  Promise<CommentLikeSummary>
>();

export async function fetchPostComments(input: {
  postId: number;
  limit?: number;
  cursor?: string | null;
}): Promise<CommentPage> {
  const limit = input.limit ?? 20;
  const cursor = input.cursor ?? null;
  const cacheKey = JSON.stringify({ postId: input.postId, limit, cursor });

  const existing = pendingCommentPageRequests.get(cacheKey);
  if (existing) return existing;

  const pending = (async () => {
    const params: Record<string, string | number> = { limit };

    if (cursor) {
      params.cursor = cursor;
    }

    const payload = await request<unknown>({
      method: "get",
      url: `/posts/${input.postId}/comments`,
      params,
    });

    return normalizeCommentPagePayload(payload);
  })().finally(() => {
    pendingCommentPageRequests.delete(cacheKey);
  });

  pendingCommentPageRequests.set(cacheKey, pending);
  return pending;
}

export async function fetchCommentReplies(input: {
  commentId: number;
  limit?: number;
  cursor?: string | null;
}): Promise<ReplyPage> {
  const limit = input.limit ?? 20;
  const cursor = input.cursor ?? null;
  const cacheKey = JSON.stringify({
    commentId: input.commentId,
    limit,
    cursor,
  });

  const existing = pendingReplyPageRequests.get(cacheKey);
  if (existing) return existing;

  const pending = (async () => {
    const params: Record<string, string | number> = { limit };

    if (cursor) {
      params.cursor = cursor;
    }

    const payload = await request<unknown>({
      method: "get",
      url: `/comments/${input.commentId}/replies`,
      params,
    });

    return normalizeReplyPagePayload(payload);
  })().finally(() => {
    pendingReplyPageRequests.delete(cacheKey);
  });

  pendingReplyPageRequests.set(cacheKey, pending);
  return pending;
}

export async function createCommentForPost(input: {
  postId: number;
  body: string;
}): Promise<CommentItem> {
  const payload = await request<unknown>({
    method: "post",
    url: `/posts/${input.postId}/comments`,
    data: { body: input.body },
  });

  const root = unwrap(payload) as unknown;
  const source = isRecord(root)
    ? isRecord(root.comment)
      ? root.comment
      : root
    : root;

  return normalizeComment(source);
}

export async function createReplyForComment(input: {
  commentId: number;
  body: string;
}): Promise<CommentItem> {
  const payload = await request<unknown>({
    method: "post",
    url: `/comments/${input.commentId}/replies`,
    data: { body: input.body },
  });

  const root = unwrap(payload) as unknown;
  const source = isRecord(root)
    ? isRecord(root.reply)
      ? root.reply
      : isRecord(root.comment)
        ? root.comment
        : root
    : root;

  return normalizeComment(source);
}

async function requestCommentLikeSummary(
  method: "post" | "delete",
  commentId: number,
  previewLimit = 3,
): Promise<CommentLikeSummary> {
  const cacheKey = `${method}:${commentId}:${previewLimit}`;
  const existing = pendingCommentMutationRequests.get(cacheKey);
  if (existing) return existing;

  const pending = (async () => {
    const payload = await request<unknown>({
      method,
      url: `/comments/${commentId}/like`,
      params: { previewLimit },
    });

    return normalizeCommentLikeSummary(payload);
  })().finally(() => {
    pendingCommentMutationRequests.delete(cacheKey);
  });

  pendingCommentMutationRequests.set(cacheKey, pending);
  return pending;
}

export function likeCommentRequest(commentId: number, previewLimit = 3) {
  return requestCommentLikeSummary("post", commentId, previewLimit);
}

export function unlikeCommentRequest(commentId: number, previewLimit = 3) {
  return requestCommentLikeSummary("delete", commentId, previewLimit);
}

export async function getCommentLikesSummary(
  commentId: number,
  previewLimit = 3,
): Promise<CommentLikeSummary> {
  const payload = await request<unknown>({
    method: "get",
    url: `/comments/${commentId}/likes`,
    params: { previewLimit },
  });

  return normalizeCommentLikeSummary(payload);
}
