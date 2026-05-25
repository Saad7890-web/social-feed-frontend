export type Visibility = "public" | "private";
export type ImageDeliveryType = "upload" | "authenticated";

export interface PostImagePayload {
  publicId: string;
  version: number;
  signature: string;
  format?: string | null;
  width?: number | null;
  height?: number | null;
  bytes?: number | null;
  deliveryType: ImageDeliveryType;
}

export interface PostAuthor {
  id: number;
  firstName: string;
  lastName: string;
  email?: string | null;
}

export interface PostLikerPreview {
  id: number;
  firstName: string;
  lastName: string;
}

export interface PostItem {
  id: number;
  authorId: number;
  author: PostAuthor | null;
  authorFirstName: string;
  authorLastName: string;
  body: string;
  visibility: Visibility;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  imageKey: string | null;
  imageDeliveryType: ImageDeliveryType | null;
  imageVersion: number | null;
  imageWidth: number | null;
  imageHeight: number | null;
  imageFormat: string | null;
  imageBytes: number | null;
  imageUrl: string | null;
  likedByMe: boolean;
  likersPreview: PostLikerPreview[];
}

export interface FeedResponse {
  posts: PostItem[];
  nextCursor: string | null;
}

export interface CreatePostInput {
  body: string;
  visibility: Visibility;
  image?: PostImagePayload | null;
}

export interface UpdatePostInput {
  body?: string;
  visibility?: Visibility;
  image?: PostImagePayload | null;
}

export interface PostImagePayload {
  publicId: string;
  version: number;
  signature: string;
  format?: string | null;
  width?: number | null;
  height?: number | null;
  bytes?: number | null;
  deliveryType: ImageDeliveryType;
}
