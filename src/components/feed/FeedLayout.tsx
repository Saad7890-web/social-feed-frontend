import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { formatRelativeTime } from "../../lib/date";
import type { User } from "../../types/auth";
import type { PostItem, Visibility } from "../../types/post";
import { PostComments, type PostCommentThreadState } from "./PostComment";
import { PostComposer } from "./PostComposer";

type FeedLayoutProps = {
  user: User;
  posts: PostItem[];
  commentThreads: Record<number, PostCommentThreadState>;
  isInitialLoading: boolean;
  isLoadingMore: boolean;
  feedError: string | null;
  hasMore: boolean;
  busyPostIds: number[];
  composer: {
    body: string;
    visibility: Visibility;
    imagePreviewUrl: string | null;
    imageFileName: string | null;
    error: string | null;
    isSubmitting: boolean;
    isEditing: boolean;
    onBodyChange: (value: string) => void;
    onVisibilityChange: (value: Visibility) => void;
    onChooseImage: () => void;
    onFileSelected: (file: File | null) => void;
    onRemoveImage: () => void;
    onSubmit: () => void;
    onCancelEdit: () => void;
  };
  onLikePost: (post: PostItem) => Promise<void> | void;
  onToggleComments: (post: PostItem) => Promise<void> | void;
  onCommentDraftChange: (postId: number, value: string) => void;
  onSubmitComment: (postId: number) => void;
  onLoadMoreComments: (postId: number) => void;
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
  onEditPost: (post: PostItem) => void;
  onDeletePost: (post: PostItem) => Promise<void> | void;
  onLoadMore: () => Promise<void> | void;
  onSignOut: () => Promise<void> | void;
};

function IconHome() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="21"
      fill="none"
      viewBox="0 0 18 21"
    >
      <path
        className="_home_active"
        stroke="#000"
        strokeWidth="1.5"
        strokeOpacity=".6"
        d="M1 9.924c0-1.552 0-2.328.314-3.01.313-.682.902-1.187 2.08-2.196l1.143-.98C6.667 1.913 7.732 1 9 1c1.268 0 2.333.913 4.463 2.738l1.142.98c1.179 1.01 1.768 1.514 2.081 2.196.314.682.314 1.458.314 3.01v4.846c0 2.155 0 3.233-.67 3.902-.669.67-1.746.67-3.901.67H5.57c-2.155 0-3.232 0-3.902-.67C1 18.002 1 16.925 1 14.77V9.924z"
      />
      <path
        className="_home_active"
        stroke="#000"
        strokeOpacity=".6"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M11.857 19.341v-5.857a1 1 0 00-1-1H7.143a1 1 0 00-1 1v5.857"
      />
    </svg>
  );
}

function Avatar({ src, alt }: { src: string; alt: string }) {
  return <img src={src} alt={alt} />;
}

function safeName(firstName: string, lastName: string) {
  return (
    [firstName, lastName].filter(Boolean).join(" ").trim() || "Unknown user"
  );
}

function visibilityLabel(value: Visibility) {
  return value === "private" ? "Private" : "Public";
}

function PostOptionsMenu({
  canEdit,
  onEdit,
  onDelete,
}: {
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);

  if (!canEdit) {
    return (
      <button
        type="button"
        className="_feed_timeline_post_dropdown_link"
        aria-label="Post actions"
        disabled
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="4"
          height="17"
          fill="none"
          viewBox="0 0 4 17"
        >
          <circle cx="2" cy="2" r="2" fill="#C4C4C4" />
          <circle cx="2" cy="8" r="2" fill="#C4C4C4" />
          <circle cx="2" cy="15" r="2" fill="#C4C4C4" />
        </svg>
      </button>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        className="_feed_timeline_post_dropdown_link"
        aria-label="Post actions"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="4"
          height="17"
          fill="none"
          viewBox="0 0 4 17"
        >
          <circle cx="2" cy="2" r="2" fill="#C4C4C4" />
          <circle cx="2" cy="8" r="2" fill="#C4C4C4" />
          <circle cx="2" cy="15" r="2" fill="#C4C4C4" />
        </svg>
      </button>

      {open ? (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            right: 0,
            zIndex: 20,
            minWidth: 160,
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 16px 32px rgba(0, 0, 0, 0.14)",
            overflow: "hidden",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            style={{
              width: "100%",
              border: "none",
              background: "#fff",
              padding: "10px 14px",
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            Edit post
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            style={{
              width: "100%",
              border: "none",
              background: "#fff",
              padding: "10px 14px",
              textAlign: "left",
              cursor: "pointer",
              color: "#dc3545",
            }}
          >
            Delete post
          </button>
        </div>
      ) : null}
    </div>
  );
}

function FeedPostCard({
  post,
  currentUserId,
  busy,
  commentThread,
  onLikePost,
  onToggleComments,
  onEditPost,
  onDeletePost,
  onCommentDraftChange,
  onSubmitComment,
  onLoadMoreComments,
  onToggleCommentLike,
  onToggleReplyComposer,
  onReplyDraftChange,
  onSubmitReply,
  onLoadReplies,
  onLoadMoreReplies,
  onToggleReplyLike,
}: {
  post: PostItem;
  currentUserId: number;
  busy: boolean;
  commentThread: PostCommentThreadState;
  onLikePost: (post: PostItem) => Promise<void> | void;
  onToggleComments: (post: PostItem) => Promise<void> | void;
  onEditPost: (post: PostItem) => void;
  onDeletePost: (post: PostItem) => Promise<void> | void;
  onCommentDraftChange: (postId: number, value: string) => void;
  onSubmitComment: (postId: number) => void;
  onLoadMoreComments: (postId: number) => void;
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
  const authorName = safeName(post.authorFirstName, post.authorLastName);
  const timeLabel = formatRelativeTime(post.createdAt);
  const imageSrc = post.imageUrl || null;
  const canEdit = post.authorId === currentUserId;

  const likersPreview = useMemo(() => {
    if (!post.likersPreview.length) return "";
    const names = post.likersPreview
      .map((person) => safeName(person.firstName, person.lastName))
      .filter(Boolean);

    if (!names.length) return "";

    if (post.likedByMe) {
      return names.length === 1
        ? `You and ${names[0]} liked this post.`
        : `You and ${names.slice(0, 2).join(", ")} liked this post.`;
    }

    return names.length === 1
      ? `${names[0]} liked this post.`
      : `${names.slice(0, 2).join(", ")} liked this post.`;
  }, [post.likedByMe, post.likersPreview]);

  return (
    <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
      <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
        <div className="_feed_inner_timeline_post_top">
          <div className="_feed_inner_timeline_post_box">
            <div className="_feed_inner_timeline_post_box_image">
              <img
                src="/assets/images/post_img.png"
                alt=""
                className="_post_img"
              />
            </div>

            <div className="_feed_inner_timeline_post_box_txt">
              <h4 className="_feed_inner_timeline_post_box_title">
                {authorName}
              </h4>
              <p className="_feed_inner_timeline_post_box_para">
                {timeLabel} .{" "}
                <a href="#0" onClick={(event) => event.preventDefault()}>
                  {visibilityLabel(post.visibility)}
                </a>
              </p>
            </div>
          </div>

          <div className="_feed_inner_timeline_post_box_dropdown">
            <div className="_feed_timeline_post_dropdown">
              <PostOptionsMenu
                canEdit={canEdit}
                onEdit={() => onEditPost(post)}
                onDelete={() => onDeletePost(post)}
              />
            </div>
          </div>
        </div>

        <p
          className="_feed_inner_timeline_post_desc"
          style={{ fontWeight: 400, color: "#000" }}
        >
          {post.body}
        </p>
      </div>

      {imageSrc ? (
        <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
          <img
            src={imageSrc}
            alt=""
            className="_feed_inner_timeline_image _time_img"
          />
        </div>
      ) : null}

      <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26">
        <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26">
          <div className="_feed_inner_timeline_total_reacts_txt">
            <span className="_feed_inner_timeline_total_reacts_para">
              <span className="_feed_inner_timeline_total_reacts_circle">
                {post.likeCount}
              </span>
            </span>

            <span
              className="_feed_inner_timeline_total_reacts_para1"
              style={{ display: "inline-block", marginTop: "5px" }}
            >
              {post.commentCount} comments
            </span>
          </div>
        </div>

        <p className="_feed_inner_timeline_total_reacts_para2">
          {likersPreview || "Be the first to like this post."}
        </p>
      </div>

      <div className="_feed_inner_timeline_reaction _padd_r24 _padd_l24">
        <button
          type="button"
          className={`_feed_inner_timeline_reaction_link _feed_reaction _feed_inner_timeline_reaction_emoji_link ${
            post.likedByMe ? "_feed_reaction_active" : ""
          }`}
          disabled={busy}
          onClick={() => void onLikePost(post)}
        >
          <span
            className={post.likedByMe ? "_reaction_heart" : "_reaction_like"}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M12.1 20.3L12 20.4L11.89 20.3C6.14 15.1 2.4 11.7 2.4 7.6C2.4 4.9 4.5 2.8 7.2 2.8C8.8 2.8 10.3 3.6 11.2 4.9C12.1 3.6 13.6 2.8 15.2 2.8C17.9 2.8 20 4.9 20 7.6C20 11.7 16.26 15.1 12.1 20.3Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{post.likedByMe ? "Unlike" : "Like"}</span>
          </span>
          <span className="_total">{post.likeCount}</span>
        </button>
        <button
          type="button"
          className="_feed_inner_timeline_reaction_comment _feed_reaction"
          disabled={busy}
          onClick={() => void onToggleComments(post)}
        >
          {commentThread.isOpen ? "Hide comments" : "Comment"}
        </button>
        <button
          type="button"
          className="_feed_inner_timeline_reaction_share _feed_reaction"
          disabled={busy}
          onClick={() => void onToggleComments(post)}
        >
          Reply
        </button>
      </div>

      <PostComments
        postId={post.id}
        thread={commentThread}
        onLoadMoreComments={onLoadMoreComments}
        onCommentDraftChange={onCommentDraftChange}
        onSubmitComment={onSubmitComment}
        onToggleCommentLike={onToggleCommentLike}
        onToggleReplyComposer={onToggleReplyComposer}
        onReplyDraftChange={onReplyDraftChange}
        onSubmitReply={onSubmitReply}
        onLoadReplies={onLoadReplies}
        onLoadMoreReplies={onLoadMoreReplies}
        onToggleReplyLike={onToggleReplyLike}
      />
    </div>
  );
}

export function FeedLayout({
  user,
  posts,
  commentThreads,
  isInitialLoading,
  isLoadingMore,
  feedError,
  hasMore,
  busyPostIds,
  composer,
  onLikePost,
  onToggleComments,
  onCommentDraftChange,
  onSubmitComment,
  onLoadMoreComments,
  onToggleCommentLike,
  onToggleReplyComposer,
  onReplyDraftChange,
  onSubmitReply,
  onLoadReplies,
  onLoadMoreReplies,
  onToggleReplyLike,
  onEditPost,
  onDeletePost,
  onLoadMore,
  onSignOut,
}: FeedLayoutProps) {
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const userName = safeName(user.firstName, user.lastName);

  const suggestions = [
    {
      name: "Radovan SkillArena",
      role: "Founder & CEO at Trophy",
      image: "/assets/images/Avatar.png",
    },
    {
      name: "Steve Jobs",
      role: "CEO of Apple",
      image: "/assets/images/people1.png",
    },
    {
      name: "Ryan Roslansky",
      role: "CEO of Linkedin",
      image: "/assets/images/people2.png",
    },
  ];

  const friends = [
    {
      name: "Steve Jobs",
      role: "CEO of Apple",
      image: "/assets/images/people1.png",
      status: "offline" as const,
    },
    {
      name: "Ryan Roslansky",
      role: "CEO of Linkedin",
      image: "/assets/images/people2.png",
      status: "online" as const,
    },
    {
      name: "Avery Clark",
      role: "Product Designer",
      image: "/assets/images/people3.png",
      status: "online" as const,
    },
    {
      name: "Mia Chen",
      role: "Frontend Engineer",
      image: "/assets/images/people1.png",
      status: "offline" as const,
    },
  ];

  return (
    <div className="_layout _layout_main_wrapper">
      <div className="_layout_mode_swithing_btn">
        <button
          type="button"
          className="_layout_mode_swithing_btn_link"
          aria-label="Switch mode"
          disabled
        />
      </div>

      <div className="_header_mobile_menu">
        <div className="_header_mobile_menu_top">
          <div className="_header_mobile_menu_top_inner">
            <div className="_header_mobile_menu_top_logo">
              <a href="#0" className="_header_mobile_menu_top_logo_link">
                <img src="/assets/images/logo.svg" alt="Buddy Script" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="_layout_header">
        <div className="container">
          <div className="_layout_header_inner">
            <nav className="navbar navbar-expand-lg navbar-light">
              <Link className="navbar-brand" to="/feed">
                <img src="/assets/images/logo.svg" alt="Buddy Script" />
              </Link>

              <div className="_header_search_wrap">
                <form
                  className="_header_search_form"
                  onSubmit={(event) => event.preventDefault()}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="17"
                    height="17"
                    fill="none"
                    viewBox="0 0 17 17"
                  >
                    <circle cx="7" cy="7" r="6" stroke="#666" />
                    <path stroke="#666" strokeLinecap="round" d="M16 16l-3-3" />
                  </svg>
                  <input
                    className="form-control me-2 _header_search_form_inpt"
                    type="search"
                    placeholder="Search"
                    aria-label="Search"
                    disabled
                  />
                </form>
              </div>

              <ul className="navbar-nav mb-2 mb-lg-0 _header_nav_list ms-auto _mar_r8">
                <li className="nav-item _header_nav_item">
                  <Link
                    className="nav-link _header_nav_link_active _header_nav_link"
                    aria-current="page"
                    to="/feed"
                  >
                    <IconHome />
                  </Link>
                </li>

                <li className="nav-item _header_nav_item">
                  <button
                    type="button"
                    className="_nav_drop_btn_link nav-link"
                    disabled
                    aria-label="Notifications"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="20"
                      fill="none"
                      viewBox="0 0 18 20"
                    >
                      <path
                        stroke="#000"
                        strokeWidth="1.5"
                        strokeOpacity=".6"
                        d="M9 20c1.1 0 2-.9 2-2H7c0 1.1.9 2 2 2Zm6-6V9c0-3.3-2.1-6.1-5-7V1a1 1 0 10-2 0v1C5.1 2.9 3 5.7 3 9v5l-2 2v1h16v-1l-2-2Z"
                      />
                    </svg>
                  </button>
                </li>

                <li className="nav-item _header_nav_item">
                  <div
                    className="_header_nav_profile"
                    style={{ position: "relative" }}
                  >
                    <div className="_header_nav_profile_image">
                      <img
                        src="/assets/images/Avatar.png"
                        alt={`${user.firstName} ${user.lastName}`}
                      />
                    </div>
                    <div className="_header_nav_dropdown">
                      <button
                        type="button"
                        className="_dropdown_toggle nav-link _header_nav_para"
                        onClick={() => setAccountMenuOpen((value) => !value)}
                      >
                        {userName}
                        <svg
                          className="_header_nav_dropdown_btn"
                          xmlns="http://www.w3.org/2000/svg"
                          width="10"
                          height="6"
                          fill="none"
                          viewBox="0 0 10 6"
                        >
                          <path
                            fill="#666"
                            d="M4.995 5.5a.83.83 0 01-.53-.195l-4-3.333A.667.667 0 111.325.955l3.67 3.053 3.67-3.053a.667.667 0 111.73.91l-4 3.333A.833.833 0 014.995 5.5z"
                          />
                        </svg>
                      </button>

                      {accountMenuOpen ? (
                        <div
                          style={{
                            position: "absolute",
                            top: "calc(100% + 10px)",
                            right: 0,
                            zIndex: 30,
                            minWidth: 180,
                            background: "#fff",
                            borderRadius: 12,
                            boxShadow: "0 16px 32px rgba(0, 0, 0, 0.14)",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              padding: "12px 14px",
                              borderBottom: "1px solid rgba(0,0,0,0.06)",
                            }}
                          >
                            <div style={{ fontWeight: 600 }}>{userName}</div>
                            <div style={{ fontSize: 12, color: "#666" }}>
                              {user.email}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              setAccountMenuOpen(false);
                              await onSignOut();
                            }}
                            style={{
                              width: "100%",
                              border: "none",
                              background: "#fff",
                              padding: "12px 14px",
                              textAlign: "left",
                              cursor: "pointer",
                              color: "#dc3545",
                            }}
                          >
                            Sign out
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      <div className="container _custom_container">
        <div className="_layout_inner_wrap">
          <div className="row">
            <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
              <div className="_layout_left_sidebar_wrap">
                <div className="_layout_left_sidebar_inner">
                  <div className="_left_sidebar_card _padd_t24 _padd_b24 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                    <div className="_left_sidebar_card_profile _mar_b24">
                      <div className="_left_sidebar_card_profile_image">
                        <img
                          src="/assets/images/Avatar.png"
                          alt={`${user.firstName} ${user.lastName}`}
                          className="_left_sidebar_card_profile_img"
                        />
                      </div>
                      <div className="_left_sidebar_card_profile_txt">
                        <h4 className="_left_sidebar_card_profile_title">
                          {userName}
                        </h4>
                        <p className="_left_sidebar_card_profile_para">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="_left_sidebar_card_profile_btn">
                      <button
                        type="button"
                        className="_left_sidebar_card_profile_btn_link"
                        disabled
                      >
                        Edit profile
                      </button>
                    </div>
                  </div>

                  <div className="_left_inner_area _padd_t24 _padd_b24 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                    <div className="_left_inner_area_content _mar_b24">
                      <h4 className="_left_inner_area_content_title _title5">
                        Explore
                      </h4>
                    </div>
                    <hr className="_underline" />
                    <ul className="_left_inner_area_explore">
                      <li className="_left_inner_area_explore_item">
                        <a href="#0" className="_left_inner_area_explore_link">
                          Home
                        </a>
                      </li>
                      <li className="_left_inner_area_explore_item">
                        <a href="#0" className="_left_inner_area_explore_link">
                          Messages
                        </a>
                      </li>
                      <li className="_left_inner_area_explore_item">
                        <a href="#0" className="_left_inner_area_explore_link">
                          Learning
                        </a>
                      </li>
                      <li className="_left_inner_area_explore_item">
                        <a href="#0" className="_left_inner_area_explore_link">
                          Events
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
              <div className="_layout_middle_wrap">
                <div className="_layout_middle_inner">
                  <PostComposer
                    body={composer.body}
                    visibility={composer.visibility}
                    imagePreviewUrl={composer.imagePreviewUrl}
                    imageFileName={composer.imageFileName}
                    error={composer.error}
                    isSubmitting={composer.isSubmitting}
                    isEditing={composer.isEditing}
                    onBodyChange={composer.onBodyChange}
                    onVisibilityChange={composer.onVisibilityChange}
                    onChooseImage={composer.onChooseImage}
                    onFileSelected={composer.onFileSelected}
                    onRemoveImage={composer.onRemoveImage}
                    onSubmit={composer.onSubmit}
                    onCancelEdit={composer.onCancelEdit}
                  />

                  {feedError ? (
                    <div
                      role="alert"
                      style={{
                        marginBottom: 16,
                        padding: "12px 14px",
                        borderRadius: 12,
                        background: "rgba(220,53,69,0.08)",
                        color: "#dc3545",
                        fontSize: 13,
                        lineHeight: 1.5,
                      }}
                    >
                      {feedError}
                    </div>
                  ) : null}

                  {isInitialLoading ? (
                    <div
                      className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16"
                      style={{ textAlign: "center" }}
                    >
                      <div style={{ padding: "32px 16px" }}>
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: "50%",
                            border: "4px solid rgba(0,0,0,0.12)",
                            borderTopColor: "#111",
                            animation: "spin 0.8s linear infinite",
                            margin: "0 auto 12px",
                          }}
                        />
                        <p style={{ margin: 0 }}>Loading your feed...</p>
                      </div>
                    </div>
                  ) : posts.length === 0 ? (
                    <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
                      <div style={{ padding: "24px" }}>
                        <h4 style={{ marginTop: 0 }}>No posts yet</h4>
                        <p style={{ marginBottom: 0, color: "#666" }}>
                          Create your first post using the box above.
                        </p>
                      </div>
                    </div>
                  ) : (
                    posts.map((post) => (
                      <FeedPostCard
                        key={post.id}
                        post={post}
                        currentUserId={user.id}
                        busy={busyPostIds.includes(post.id)}
                        commentThread={
                          commentThreads[post.id] ?? {
                            isOpen: false,
                            isLoading: false,
                            isLoadingMore: false,
                            error: null,
                            comments: [],
                            nextCursor: null,
                            draft: "",
                            isSubmitting: false,
                            repliesByParentId: {},
                          }
                        }
                        onLikePost={onLikePost}
                        onToggleComments={onToggleComments}
                        onEditPost={onEditPost}
                        onDeletePost={onDeletePost}
                        onCommentDraftChange={onCommentDraftChange}
                        onSubmitComment={onSubmitComment}
                        onLoadMoreComments={onLoadMoreComments}
                        onToggleCommentLike={onToggleCommentLike}
                        onToggleReplyComposer={onToggleReplyComposer}
                        onReplyDraftChange={onReplyDraftChange}
                        onSubmitReply={onSubmitReply}
                        onLoadReplies={onLoadReplies}
                        onLoadMoreReplies={onLoadMoreReplies}
                        onToggleReplyLike={onToggleReplyLike}
                      />
                    ))
                  )}

                  {hasMore ? (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        padding: "6px 0 24px",
                      }}
                    >
                      <button
                        type="button"
                        className="_feed_inner_text_area_btn_link"
                        onClick={() => void onLoadMore()}
                        disabled={isLoadingMore}
                      >
                        <span>
                          {isLoadingMore ? "Loading..." : "Load more"}
                        </span>
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
              <div className="_layout_right_sidebar_wrap">
                <div className="_layout_right_sidebar_inner">
                  <div className="_right_inner_area_info _padd_t24 _padd_b24 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                    <div className="_right_inner_area_info_content _mar_b24">
                      <h4 className="_right_inner_area_info_content_title _title5">
                        You Might Like
                      </h4>
                      <span className="_right_inner_area_info_content_txt">
                        <a
                          className="_right_inner_area_info_content_txt_link"
                          href="#0"
                          onClick={(event) => event.preventDefault()}
                        >
                          See All
                        </a>
                      </span>
                    </div>
                    <hr className="_underline" />
                    <div className="_right_inner_area_info_ppl">
                      {suggestions.map((item) => (
                        <div
                          className="_right_inner_area_info_box"
                          key={item.name}
                        >
                          <div className="_right_inner_area_info_box_image">
                            <a
                              href="#0"
                              onClick={(event) => event.preventDefault()}
                            >
                              <Avatar src={item.image} alt={item.name} />
                            </a>
                          </div>
                          <div className="_right_inner_area_info_box_txt">
                            <a
                              href="#0"
                              onClick={(event) => event.preventDefault()}
                            >
                              <h4 className="_right_inner_area_info_box_title">
                                {item.name}
                              </h4>
                            </a>
                            <p className="_right_inner_area_info_box_para">
                              {item.role}
                            </p>
                          </div>
                        </div>
                      ))}

                      <div className="_right_info_btn_grp">
                        <button
                          type="button"
                          className="_right_info_btn_link"
                          disabled
                        >
                          Ignore
                        </button>
                        <button
                          type="button"
                          className="_right_info_btn_link _right_info_btn_link_active"
                          disabled
                        >
                          Follow
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="_feed_right_inner_area_card _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                    <div className="_feed_top_fixed">
                      <div className="_feed_right_inner_area_card_content _mar_b24">
                        <h4 className="_feed_right_inner_area_card_content_title _title5">
                          Your Friends
                        </h4>
                        <span className="_feed_right_inner_area_card_content_txt">
                          <a
                            className="_feed_right_inner_area_card_content_txt_link"
                            href="#0"
                            onClick={(event) => event.preventDefault()}
                          >
                            See All
                          </a>
                        </span>
                      </div>

                      <form
                        className="_feed_right_inner_area_card_form"
                        onSubmit={(event) => event.preventDefault()}
                      >
                        <svg
                          className="_feed_right_inner_area_card_form_svg"
                          xmlns="http://www.w3.org/2000/svg"
                          width="17"
                          height="17"
                          fill="none"
                          viewBox="0 0 17 17"
                        >
                          <circle cx="7" cy="7" r="6" stroke="#666" />
                          <path
                            stroke="#666"
                            strokeLinecap="round"
                            d="M16 16l-3-3"
                          />
                        </svg>
                        <input
                          className="form-control me-2 _feed_right_inner_area_card_form_inpt"
                          type="search"
                          placeholder="input search text"
                          aria-label="Search"
                          disabled
                        />
                      </form>
                    </div>

                    <div className="_feed_bottom_fixed">
                      {friends.map((friend) => (
                        <div
                          className={
                            friend.status === "offline"
                              ? "_feed_right_inner_area_card_ppl _feed_right_inner_area_card_ppl_inactive"
                              : "_feed_right_inner_area_card_ppl"
                          }
                          key={friend.name}
                        >
                          <div className="_feed_right_inner_area_card_ppl_box">
                            <div className="_feed_right_inner_area_card_ppl_image">
                              <a
                                href="#0"
                                onClick={(event) => event.preventDefault()}
                              >
                                <img
                                  src={friend.image}
                                  alt={friend.name}
                                  className="_box_ppl_img"
                                />
                              </a>
                            </div>
                            <div className="_feed_right_inner_area_card_ppl_txt">
                              <a
                                href="#0"
                                onClick={(event) => event.preventDefault()}
                              >
                                <h4 className="_feed_right_inner_area_card_ppl_title">
                                  {friend.name}
                                </h4>
                              </a>
                              <p className="_feed_right_inner_area_card_ppl_para">
                                {friend.role}
                              </p>
                            </div>
                          </div>

                          <div className="_feed_right_inner_area_card_ppl_side">
                            {friend.status === "online" ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                fill="none"
                                viewBox="0 0 14 14"
                              >
                                <rect
                                  width="12"
                                  height="12"
                                  x="1"
                                  y="1"
                                  fill="#0ACF83"
                                  stroke="#fff"
                                  strokeWidth="2"
                                  rx="6"
                                />
                              </svg>
                            ) : (
                              <span>5 minute ago</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
