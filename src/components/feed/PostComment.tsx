import { useMemo } from "react";
import { formatRelativeTime } from "../../lib/date";
import type { CommentItem } from "../../types/comment";

export type ReplyThreadState = {
  replies: CommentItem[];
  nextCursor: string | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  isOpen: boolean;
  draft: string;
  isSubmitting: boolean;
};

export type PostCommentThreadState = {
  isOpen: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  comments: CommentItem[];
  nextCursor: string | null;
  draft: string;
  isSubmitting: boolean;
  repliesByParentId: Record<number, ReplyThreadState>;
};

type PostCommentsProps = {
  postId: number;
  thread: PostCommentThreadState;
  onLoadMoreComments: (postId: number) => void;
  onCommentDraftChange: (postId: number, value: string) => void;
  onSubmitComment: (postId: number) => void;
  onToggleCommentLike: (postId: number, commentId: number) => void;
  onToggleReplyComposer: (postId: number, commentId: number) => void;
  onReplyDraftChange: (
    postId: number,
    commentId: number,
    value: string,
  ) => void;
  onSubmitReply: (postId: number, commentId: number) => void;
  onLoadReplies: (postId: number, commentId: number) => void;
  onLoadMoreReplies: (postId: number, commentId: number) => void;
  onToggleReplyLike: (postId: number, replyId: number) => void;
};

function safeName(firstName: string, lastName: string) {
  return (
    [firstName, lastName].filter(Boolean).join(" ").trim() || "Unknown user"
  );
}

function previewSentence(names: string[], likedByMe: boolean) {
  if (!names.length) return "";

  const unique = names.filter(Boolean).slice(0, 3);

  if (likedByMe) {
    if (unique.length === 1) return `You and ${unique[0]} liked this.`;
    if (unique.length === 2)
      return `You and ${unique.join(" and ")} liked this.`;
    return `You and ${unique[0]}, ${unique[1]} liked this.`;
  }

  if (unique.length === 1) return `${unique[0]} liked this.`;
  if (unique.length === 2) return `${unique.join(" and ")} liked this.`;
  return `${unique[0]}, ${unique[1]} liked this.`;
}

function CommentAvatar({ name }: { name: string }) {
  return (
    <div className="_comment_image" aria-hidden="true">
      <img
        src="/assets/images/Avatar.png"
        alt={name}
        className="_comment_img1"
      />
    </div>
  );
}

function CommentLikePreview({ comment }: { comment: CommentItem }) {
  const names = useMemo(
    () =>
      comment.likersPreview
        .map((person) => safeName(person.firstName, person.lastName))
        .filter(Boolean),
    [comment.likersPreview],
  );

  const sentence = previewSentence(names, comment.likedByMe);

  if (!sentence) return null;

  return (
    <p className="_comment_status_text" style={{ marginTop: 8 }}>
      {sentence}
    </p>
  );
}

function ReplyComposer({
  postId,
  commentId,
  value,
  isSubmitting,
  onChange,
  onSubmit,
}: {
  postId: number;
  commentId: number;
  value: string;
  isSubmitting: boolean;
  onChange: (postId: number, commentId: number, value: string) => void;
  onSubmit: (postId: number, commentId: number) => void;
}) {
  return (
    <div className="_feed_inner_comment_box" style={{ marginTop: 12 }}>
      <div className="_feed_inner_comment_box_form">
        <div className="_feed_inner_comment_box_content">
          <div className="_feed_inner_comment_box_content_txt">
            <textarea
              className="form-control _comment_textarea"
              placeholder="Write a reply..."
              value={value}
              onChange={(event) =>
                onChange(postId, commentId, event.target.value)
              }
            />
          </div>
        </div>

        <button
          type="button"
          className="_feed_inner_comment_box_icon_btn"
          disabled={isSubmitting || !value.trim()}
          onClick={() => void onSubmit(postId, commentId)}
        >
          {isSubmitting ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}

function CommentCard({
  postId,
  comment,
  thread,
  onToggleCommentLike,
  onToggleReplyComposer,
  onReplyDraftChange,
  onSubmitReply,
  onLoadReplies,
  onLoadMoreReplies,
  onToggleReplyLike,
}: {
  postId: number;
  comment: CommentItem;
  thread: ReplyThreadState | undefined;
  onToggleCommentLike: (postId: number, commentId: number) => void;
  onToggleReplyComposer: (postId: number, commentId: number) => void;
  onReplyDraftChange: (
    postId: number,
    commentId: number,
    value: string,
  ) => void;
  onSubmitReply: (postId: number, commentId: number) => void;
  onLoadReplies: (postId: number, commentId: number) => void;
  onLoadMoreReplies: (postId: number, commentId: number) => void;
  onToggleReplyLike: (postId: number, replyId: number) => void;
}) {
  const authorName = safeName(comment.authorFirstName, comment.authorLastName);
  const timeLabel = formatRelativeTime(comment.createdAt);
  const replies = thread?.replies ?? [];

  return (
    <div className="_comment_main">
      <CommentAvatar name={authorName} />

      <div className="_comment_area">
        <div className="_comment_details">
          <div className="_comment_details_top">
            <div className="_comment_name">
              <h5 className="_comment_name_title">{authorName}</h5>
              <p className="_comment_status_text">{comment.body}</p>
            </div>
          </div>

          <CommentLikePreview comment={comment} />

          <div className="_comment_reply_num">
            <ul className="_comment_reply_list">
              <li>
                <span className="_time_link">{timeLabel}</span>
              </li>
              <li>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={() => void onToggleCommentLike(postId, comment.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      void onToggleCommentLike(postId, comment.id);
                    }
                  }}
                >
                  {comment.likeCount}{" "}
                  {comment.likeCount === 1 ? "Like" : "Likes"}
                </span>
              </li>
              <li>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={() => void onToggleReplyComposer(postId, comment.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      void onToggleReplyComposer(postId, comment.id);
                    }
                  }}
                >
                  Reply
                </span>
              </li>
            </ul>
          </div>
        </div>

        {thread?.isOpen ? (
          <div style={{ marginTop: 12 }}>
            {thread.error ? (
              <div
                role="alert"
                style={{
                  marginBottom: 12,
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: "rgba(220,53,69,0.08)",
                  color: "#dc3545",
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                {thread.error}
              </div>
            ) : null}

            <ReplyComposer
              postId={postId}
              commentId={comment.id}
              value={thread.draft}
              isSubmitting={thread.isSubmitting}
              onChange={onReplyDraftChange}
              onSubmit={onSubmitReply}
            />
          </div>
        ) : null}

        {comment.replyCount > 0 ? (
          <div style={{ marginTop: 12 }}>
            <button
              type="button"
              className="_previous_comment_txt"
              onClick={() => void onLoadReplies(postId, comment.id)}
            >
              {thread?.isOpen
                ? "Hide replies"
                : `View ${comment.replyCount} replies`}
            </button>
          </div>
        ) : null}

        {thread?.isLoading ? (
          <p className="_comment_status_text" style={{ marginTop: 12 }}>
            Loading replies...
          </p>
        ) : null}

        {thread?.replies.length ? (
          <div style={{ marginTop: 16 }}>
            {replies.map((reply) => {
              const replyAuthorName = safeName(
                reply.authorFirstName,
                reply.authorLastName,
              );
              const replyTimeLabel = formatRelativeTime(reply.createdAt);

              return (
                <div
                  className="_comment_main"
                  key={reply.id}
                  style={{ marginTop: 12 }}
                >
                  <CommentAvatar name={replyAuthorName} />
                  <div className="_comment_area">
                    <div className="_comment_details">
                      <div className="_comment_details_top">
                        <div className="_comment_name">
                          <h5 className="_comment_name_title">
                            {replyAuthorName}
                          </h5>
                          <p className="_comment_status_text">{reply.body}</p>
                        </div>
                      </div>

                      <CommentLikePreview comment={reply} />

                      <div className="_comment_reply_num">
                        <ul className="_comment_reply_list">
                          <li>
                            <span className="_time_link">{replyTimeLabel}</span>
                          </li>
                          <li>
                            <span
                              role="button"
                              tabIndex={0}
                              onClick={() =>
                                void onToggleReplyLike(postId, reply.id)
                              }
                              onKeyDown={(event) => {
                                if (
                                  event.key === "Enter" ||
                                  event.key === " "
                                ) {
                                  event.preventDefault();
                                  void onToggleReplyLike(postId, reply.id);
                                }
                              }}
                            >
                              {reply.likeCount}{" "}
                              {reply.likeCount === 1 ? "Like" : "Likes"}
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {thread.isLoadingMore ? (
              <p className="_comment_status_text" style={{ marginTop: 12 }}>
                Loading more replies...
              </p>
            ) : null}

            {thread.nextCursor ? (
              <button
                type="button"
                className="_previous_comment_txt"
                style={{ marginTop: 8 }}
                onClick={() => void onLoadMoreReplies(postId, comment.id)}
              >
                Load more replies
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function PostComments({
  postId,
  thread,
  onLoadMoreComments,
  onCommentDraftChange,
  onSubmitComment,
  onToggleCommentLike,
  onToggleReplyComposer,
  onReplyDraftChange,
  onSubmitReply,
  onLoadReplies,
  onLoadMoreReplies,
  onToggleReplyLike,
}: PostCommentsProps) {
  if (!thread.isOpen) {
    return null;
  }

  return (
    <div className="_feed_inner_timeline_cooment_area">
      <div className="_feed_inner_comment_box">
        <div className="_feed_inner_comment_box_form">
          <div className="_feed_inner_comment_box_content">
            <div className="_feed_inner_comment_box_content_txt">
              <textarea
                className="form-control _comment_textarea"
                placeholder="Write a comment..."
                value={thread.draft}
                onChange={(event) =>
                  onCommentDraftChange(postId, event.target.value)
                }
              />
            </div>
          </div>

          <button
            type="button"
            className="_feed_inner_comment_box_icon_btn"
            disabled={thread.isSubmitting || !thread.draft.trim()}
            onClick={() => void onSubmitComment(postId)}
          >
            {thread.isSubmitting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>

      {thread.error ? (
        <div
          role="alert"
          style={{
            marginTop: 12,
            padding: "10px 12px",
            borderRadius: 12,
            background: "rgba(220,53,69,0.08)",
            color: "#dc3545",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          {thread.error}
        </div>
      ) : null}

      {thread.isLoading ? (
        <p className="_comment_status_text" style={{ marginTop: 14 }}>
          Loading comments...
        </p>
      ) : null}

      {thread.comments.length === 0 && !thread.isLoading ? (
        <p className="_comment_status_text" style={{ marginTop: 14 }}>
          No comments yet. Be the first to comment.
        </p>
      ) : null}

      <div style={{ marginTop: 16 }}>
        {thread.comments.map((comment) => (
          <div key={comment.id} style={{ marginBottom: 16 }}>
            <CommentCard
              postId={postId}
              comment={comment}
              thread={thread.repliesByParentId[comment.id]}
              onToggleCommentLike={onToggleCommentLike}
              onToggleReplyComposer={onToggleReplyComposer}
              onReplyDraftChange={onReplyDraftChange}
              onSubmitReply={onSubmitReply}
              onLoadReplies={onLoadReplies}
              onLoadMoreReplies={onLoadMoreReplies}
              onToggleReplyLike={onToggleReplyLike}
            />
          </div>
        ))}
      </div>

      {thread.isLoadingMore ? (
        <p className="_comment_status_text" style={{ marginTop: 8 }}>
          Loading more comments...
        </p>
      ) : null}

      {thread.nextCursor ? (
        <button
          type="button"
          className="_previous_comment_txt"
          style={{ marginTop: 8 }}
          onClick={() => void onLoadMoreComments(postId)}
        >
          Load more comments
        </button>
      ) : null}
    </div>
  );
}
