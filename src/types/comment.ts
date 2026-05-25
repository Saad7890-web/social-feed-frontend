export interface CommentAuthor {
  id: number;
  firstName: string;
  lastName: string;
  email?: string | null;
}

export interface CommentLikerPreview {
  id: number;
  firstName: string;
  lastName: string;
}

export interface CommentItem {
  id: number;
  postId: number;
  parentCommentId: number | null;
  authorId: number;
  author: CommentAuthor | null;
  authorFirstName: string;
  authorLastName: string;
  body: string;
  replyCount: number;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
  likedByMe: boolean;
  likersPreview: CommentLikerPreview[];
}

export interface CommentPage {
  comments: CommentItem[];
  nextCursor: string | null;
}

export interface ReplyPage {
  replies: CommentItem[];
  nextCursor: string | null;
}

export interface CommentLikeSummary {
  likeCount: number;
  likedByMe: boolean;
  likersPreview: CommentLikerPreview[];
}
