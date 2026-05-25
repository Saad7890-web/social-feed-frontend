import type {
  CreatePostInput,
  FeedResponse,
  PostAuthor,
  PostItem,
  PostLikerPreview,
  UpdatePostInput,
} from "../types/post";
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
  if (typeof value === "string")
    return ["true", "1", "yes"].includes(value.toLowerCase());
  return false;
}

function normalizeAuthor(source: Record<string, unknown>): PostAuthor | null {
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

function normalizeLikerPreview(source: unknown): PostLikerPreview[] {
  if (!Array.isArray(source)) return [];

  return source
    .map((item): PostLikerPreview | null => {
      if (typeof item === "string") {
        const [firstName = "", ...rest] = item.split(" ");
        return {
          id: 0,
          firstName,
          lastName: rest.join(" "),
        };
      }

      if (!isRecord(item)) return null;

      const id =
        toNumberValue(getField(item, ["id", "userId", "user_id"])) ?? 0;
      const firstName =
        toStringValue(getField(item, ["firstName", "first_name"])) ?? "";
      const lastName =
        toStringValue(getField(item, ["lastName", "last_name"])) ?? "";

      return { id, firstName, lastName };
    })
    .filter(Boolean) as PostLikerPreview[];
}

export function normalizePost(raw: unknown): PostItem {
  const source = isRecord(raw) ? raw : {};

  const author = normalizeAuthor(source);

  const imageSource = getField(source, ["image"]);
  const image = isRecord(imageSource) ? imageSource : null;

  const imageUrl =
    toStringValue(
      getField(source, ["imageUrl", "image_url"]) ??
        getField(image, ["url", "secureUrl", "secure_url"]),
    ) ?? null;

  return {
    id: toNumberValue(getField(source, ["id"])) ?? 0,
    authorId:
      toNumberValue(getField(source, ["authorId", "author_id"])) ??
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
    visibility:
      getField(source, ["visibility"]) === "private" ? "private" : "public",
    likeCount:
      toNumberValue(getField(source, ["likeCount", "like_count"])) ?? 0,
    commentCount:
      toNumberValue(getField(source, ["commentCount", "comment_count"])) ?? 0,
    createdAt:
      toStringValue(getField(source, ["createdAt", "created_at"])) ??
      new Date().toISOString(),
    updatedAt:
      toStringValue(getField(source, ["updatedAt", "updated_at"])) ??
      new Date().toISOString(),
    imageKey:
      toStringValue(
        getField(source, ["imageKey", "image_key"]) ??
          getField(image, ["publicId", "public_id"]),
      ) ?? null,
    imageDeliveryType:
      (toStringValue(
        getField(source, ["imageDeliveryType", "image_delivery_type"]) ??
          getField(image, ["deliveryType", "delivery_type"]),
      ) as "upload" | "authenticated" | null) ?? null,
    imageVersion:
      toNumberValue(
        getField(source, ["imageVersion", "image_version"]) ??
          getField(image, ["version"]),
      ) ?? null,
    imageWidth:
      toNumberValue(
        getField(source, ["imageWidth", "image_width"]) ??
          getField(image, ["width"]),
      ) ?? null,
    imageHeight:
      toNumberValue(
        getField(source, ["imageHeight", "image_height"]) ??
          getField(image, ["height"]),
      ) ?? null,
    imageFormat:
      toStringValue(
        getField(source, ["imageFormat", "image_format"]) ??
          getField(image, ["format"]),
      ) ?? null,
    imageBytes:
      toNumberValue(
        getField(source, ["imageBytes", "image_bytes"]) ??
          getField(image, ["bytes"]),
      ) ?? null,
    imageUrl,
    likedByMe:
      toBooleanValue(getField(source, ["likedByMe", "liked_by_me"])) ?? false,
    likersPreview: normalizeLikerPreview(
      getField(source, ["likersPreview", "likers_preview"]),
    ),
  };
}

function normalizeFeedResponse(raw: unknown): FeedResponse {
  const root = unwrap(raw) as unknown;
  const source = isRecord(root) ? root : {};

  const postsSource = getField(source, ["posts", "items", "results"]) ?? [];

  const posts = Array.isArray(postsSource)
    ? postsSource.map((item) => normalizePost(item))
    : [];

  const nextCursor =
    toStringValue(getField(source, ["nextCursor", "next_cursor", "cursor"])) ??
    null;

  return { posts, nextCursor };
}

const pendingFeedRequests = new Map<string, Promise<FeedResponse>>();

export async function fetchFeedPosts(input: {
  limit?: number;
  cursor?: string | null;
}): Promise<FeedResponse> {
  const limit = input.limit ?? 20;
  const cursor = input.cursor ?? null;
  const cacheKey = JSON.stringify({ limit, cursor });

  const existing = pendingFeedRequests.get(cacheKey);
  if (existing) {
    return existing;
  }

  const pending = (async () => {
    const params: Record<string, string | number> = { limit };

    if (cursor) {
      params.cursor = cursor;
    }

    const payload = await request<unknown>({
      method: "get",
      url: "/posts/feed",
      params,
    });

    return normalizeFeedResponse(payload);
  })().finally(() => {
    pendingFeedRequests.delete(cacheKey);
  });

  pendingFeedRequests.set(cacheKey, pending);
  return pending;
}

export async function createPostRequest(input: CreatePostInput) {
  const payload = await request<unknown>({
    method: "post",
    url: "/posts",
    data: {
      body: input.body,
      visibility: input.visibility,
      image: input.image ?? null,
    },
  });

  const root = unwrap(payload);
  const post = isRecord(root) && isRecord(root.post) ? root.post : root;
  return normalizePost(post);
}

export async function updatePostRequest(
  postId: number,
  input: UpdatePostInput,
) {
  const payload = await request<unknown>({
    method: "patch",
    url: `/posts/${postId}`,
    data: {
      ...(input.body !== undefined ? { body: input.body } : {}),
      ...(input.visibility !== undefined
        ? { visibility: input.visibility }
        : {}),
      ...(input.image !== undefined ? { image: input.image } : {}),
    },
  });

  const root = unwrap(payload);
  const post = isRecord(root) && isRecord(root.post) ? root.post : root;
  return normalizePost(post);
}

export async function deletePostRequest(postId: number) {
  await request<unknown>({
    method: "delete",
    url: `/posts/${postId}`,
  });

  return true;
}

export async function likePostRequest(postId: number) {
  await request<unknown>({
    method: "post",
    url: `/posts/${postId}/like`,
  });

  return true;
}

export async function unlikePostRequest(postId: number) {
  await request<unknown>({
    method: "delete",
    url: `/posts/${postId}/like`,
  });

  return true;
}
