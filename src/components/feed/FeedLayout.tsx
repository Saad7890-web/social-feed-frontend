import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { formatRelativeTime } from "../../lib/date";
import type { User } from "../../types/auth";
import type { PostItem, Visibility } from "../../types/post";

type FeedLayoutProps = {
  user: User;
  posts: PostItem[];
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
  onLikePost,
  onEditPost,
  onDeletePost,
}: {
  post: PostItem;
  currentUserId: number;
  busy: boolean;
  onLikePost: (post: PostItem) => Promise<void> | void;
  onEditPost: (post: PostItem) => void;
  onDeletePost: (post: PostItem) => Promise<void> | void;
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

        <p className="_feed_inner_timeline_post_desc">{post.body}</p>
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
        <div className="_feed_inner_timeline_total_reacts_txt">
          <span className="_feed_inner_timeline_total_reacts_para">
            {post.likeCount} likes
          </span>
          <span className="_feed_inner_timeline_total_reacts_para1">
            {post.commentCount} comments
          </span>
        </div>

        <p className="_feed_inner_timeline_total_reacts_para2">
          {likersPreview || "Be the first to like this post."}
        </p>
      </div>

      <div className="_feed_inner_timeline_reaction _padd_r24 _padd_l24">
        <button
          type="button"
          className={`_feed_inner_timeline_reaction_link _feed_reaction ${
            post.likedByMe ? "_feed_reaction_active" : ""
          }`}
          disabled={busy}
          onClick={() => void onLikePost(post)}
        >
          {post.likedByMe ? "Unlike" : "Like"}
        </button>
        <button
          type="button"
          className="_feed_inner_timeline_reaction_comment _feed_reaction"
          disabled
        >
          Comment
        </button>
        <button
          type="button"
          className="_feed_inner_timeline_reaction_share _feed_reaction"
          disabled
        >
          Reply
        </button>
      </div>
    </div>
  );
}

function ComposerCard({
  body,
  visibility,
  imagePreviewUrl,
  imageFileName,
  error,
  isSubmitting,
  isEditing,
  onBodyChange,
  onVisibilityChange,
  onChooseImage,
  onFileSelected,
  onRemoveImage,
  onSubmit,
  onCancelEdit,
}: FeedLayoutProps["composer"] & {
  onChooseImage: () => void;
  onFileSelected: (file: File | null) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="_feed_inner_text_area _b_radious6 _padd_b24 _padd_t24 _padd_r24 _padd_l24 _mar_b16">
      <div className="_feed_inner_text_area_box">
        <div className="_feed_inner_text_area_box_image">
          <img
            src="/assets/images/txt_img.png"
            alt="Profile"
            className="_txt_img"
          />
        </div>

        <div
          className="form-floating _feed_inner_text_area_box_form"
          style={{ width: "100%" }}
        >
          <textarea
            className="form-control _textarea"
            placeholder="Leave a comment here"
            id="floatingTextarea"
            value={body}
            onChange={(event) => onBodyChange(event.target.value)}
          />
          <label className="_feed_textarea_label" htmlFor="floatingTextarea">
            {isEditing ? "Update your post ..." : "Write something ..."}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="23"
              height="24"
              fill="none"
              viewBox="0 0 23 24"
            >
              <path
                fill="#666"
                d="M19.504 19.209c.332 0 .601.289.601.646 0 .326-.226.596-.52.64l-.081.005h-6.276c-.332 0-.602-.289-.602-.645 0-.327.227-.597.52-.64l.082-.006h6.276zM13.4 4.417c1.139-1.223 2.986-1.223 4.125 0l1.182 1.268c1.14 1.223 1.14 3.205 0 4.427L9.82 19.649a2.619 2.619 0 01-1.916.85h-3.64c-.337 0-.61-.298-.6-.66l.09-3.941a3.019 3.019 0 01.794-1.982l8.852-9.5zm-.688 2.562l-7.313 7.85a1.68 1.68 0 00-.441 1.101l-.077 3.278h3.023c.356 0 .698-.133.968-.376l.098-.096 7.35-7.887-3.608-3.87zm3.962-1.65a1.633 1.633 0 00-2.423 0l-.688.737 3.606 3.87.688-.737c.631-.678.666-1.755.105-2.477l-.105-.124-1.183-1.268z"
              />
            </svg>
          </label>
        </div>
      </div>

      {error ? (
        <div
          role="alert"
          style={{
            marginTop: 12,
            marginBottom: 0,
            padding: "12px 14px",
            borderRadius: 12,
            background: "rgba(220,53,69,0.08)",
            color: "#dc3545",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          {error}
        </div>
      ) : null}

      {imagePreviewUrl ? (
        <div
          style={{
            marginTop: 14,
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <img
            src={imagePreviewUrl}
            alt={imageFileName ?? "Selected upload preview"}
            style={{
              width: 72,
              height: 72,
              borderRadius: 12,
              objectFit: "cover",
            }}
          />
          <div>
            <p style={{ margin: 0, fontWeight: 600 }}>
              {imageFileName ?? "Selected image"}
            </p>
            <button
              type="button"
              onClick={onRemoveImage}
              style={{
                marginTop: 6,
                border: "none",
                background: "transparent",
                color: "#dc3545",
                padding: 0,
                cursor: "pointer",
              }}
            >
              Remove image
            </button>
          </div>
        </div>
      ) : null}

      <div className="_feed_inner_text_area_bottom">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(event) => {
            const file = event.currentTarget.files?.[0] ?? null;
            onFileSelected(file);
            event.currentTarget.value = "";
          }}
        />

        <div className="_feed_inner_text_area_item">
          <div className="_feed_inner_text_area_bottom_photo _feed_common">
            <button
              type="button"
              className="_feed_inner_text_area_bottom_photo_link"
              onClick={() => {
                onChooseImage();
                fileInputRef.current?.click();
              }}
            >
              <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill="#666"
                    d="M13.916 0c3.109 0 5.18 2.429 5.18 5.914v8.17c0 3.486-2.072 5.916-5.18 5.916H5.999C2.89 20 .827 17.572.827 14.085v-8.17C.827 2.43 2.897 0 6 0h7.917zm0 1.504H5.999c-2.321 0-3.799 1.735-3.799 4.41v8.17c0 2.68 1.472 4.412 3.799 4.412h7.917c2.328 0 3.807-1.734 3.807-4.411v-8.17c0-2.678-1.478-4.411-3.807-4.411zm.65 8.68l.12.125 1.9 2.147a.803.803 0 01-.016 1.063.642.642 0 01-.894.058l-.076-.074-1.9-2.148a.806.806 0 00-1.205-.028l-.074.087-2.04 2.717c-.722.963-2.02 1.066-2.86.26l-.111-.116-.814-.91a.562.562 0 00-.793-.07l-.075.073-1.4 1.617a.645.645 0 01-.97.029.805.805 0 01-.09-.977l.064-.086 1.4-1.617c.736-.852 1.95-.897 2.734-.137l.114.12.81.905a.587.587 0 00.861.033l.07-.078 2.04-2.718c.81-1.08 2.27-1.19 3.205-.275zM6.831 4.64c1.265 0 2.292 1.125 2.292 2.51 0 1.386-1.027 2.511-2.292 2.511S4.54 8.537 4.54 7.152c0-1.386 1.026-2.51 2.291-2.51zm0 1.504c-.507 0-.918.451-.918 1.007 0 .555.411 1.006.918 1.006.507 0 .919-.451.919-1.006 0-.556-.412-1.007-.919-1.007z"
                  />
                </svg>
              </span>
              {imagePreviewUrl ? "Change image" : "Photo"}
            </button>
          </div>

          <div className="_feed_inner_text_area_bottom_video _feed_common">
            <button
              type="button"
              className="_feed_inner_text_area_bottom_photo_link"
              disabled
            >
              <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="24"
                  fill="none"
                  viewBox="0 0 22 24"
                >
                  <path
                    fill="#666"
                    d="M11.485 4.5c2.213 0 3.753 1.534 3.917 3.784l2.418-1.082c1.047-.468 2.188.327 2.271 1.533l.005.141v6.64c0 1.237-1.103 2.093-2.155 1.72l-.121-.047-2.418-1.083c-.164 2.25-1.708 3.785-3.917 3.785H5.76c-2.343 0-3.932-1.72-3.932-4.188V8.688c0-2.47 1.589-4.188 3.932-4.188h5.726zm0 1.5H5.76C4.169 6 3.197 7.05 3.197 8.688v7.015c0 1.636.972 2.688 2.562 2.688h5.726c1.586 0 2.562-1.054 2.562-2.688v-.686-6.329c0-1.636-.973-2.688-2.562-2.688zM18.4 8.57l-.062.02-2.921 1.306v4.596l2.921 1.307c.165.073.343-.036.38-.215l.008-.07V8.876c0-.195-.16-.334-.326-.305z"
                  />
                </svg>
              </span>
              Video
            </button>
          </div>

          <div className="_feed_inner_text_area_bottom_event _feed_common">
            <button
              type="button"
              className="_feed_inner_text_area_bottom_photo_link"
              disabled
            >
              <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="24"
                  fill="none"
                  viewBox="0 0 22 24"
                >
                  <path
                    fill="#666"
                    d="M14.371 2c.32 0 .585.262.627.603l.005.095v.788c2.598.195 4.188 2.033 4.18 5v8.488c0 3.145-1.786 5.026-4.656 5.026H7.395C4.53 22 2.74 20.087 2.74 16.904V8.486c0-2.966 1.596-4.804 4.187-5v-.788c0-.386.283-.698.633-.698.32 0 .584.262.626.603l.006.095v.771h5.546v-.771c0-.386.284-.698.633-.698zm3.546 8.283H4.004l.001 6.621c0 2.325 1.137 3.616 3.183 3.697l.207.004h7.132c2.184 0 3.39-1.271 3.39-3.63v-6.692zm-3.202 5.066a.75.75 0 110 1.5H7.631a.75.75 0 110-1.5h7.084zm0-2.867a.75.75 0 110 1.5H7.631a.75.75 0 110-1.5h7.084z"
                  />
                </svg>
              </span>
              Event
            </button>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <select
            className="form-select form-select-sm"
            value={visibility}
            onChange={(event) =>
              onVisibilityChange(event.target.value as Visibility)
            }
            style={{ minWidth: 120 }}
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>

          {isEditing ? (
            <button
              type="button"
              onClick={onCancelEdit}
              style={{
                border: "none",
                background: "transparent",
                color: "#666",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Cancel
            </button>
          ) : null}

          <div className="_feed_inner_text_area_btn">
            <button
              type="button"
              className="_feed_inner_text_area_btn_link"
              onClick={() => void onSubmit()}
              disabled={isSubmitting}
            >
              <svg
                className="_mar_img"
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="13"
                fill="none"
                viewBox="0 0 14 13"
              >
                <path
                  fill="#fff"
                  fillRule="evenodd"
                  d="M6.37 7.879l2.438 3.955a.335.335 0 00.34.162c.068-.01.23-.05.289-.247l3.049-10.297a.348.348 0 00-.09-.35.341.341 0 00-.34-.088L1.75 4.03a.34.34 0 00-.247.289.343.343 0 00.16.347L5.666 7.17 9.2 3.597a.5.5 0 01.712.703L6.37 7.88zM9.097 13c-.464 0-.89-.236-1.14-.641L5.372 8.165l-4.237-2.65a1.336 1.336 0 01-.622-1.331c.074-.536.441-.96.957-1.112L11.774.054a1.347 1.347 0 011.67 1.682l-3.05 10.296A1.332 1.332 0 019.098 13z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                {isSubmitting ? "Posting..." : isEditing ? "Update" : "Post"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeedLayout({
  user,
  posts,
  isInitialLoading,
  isLoadingMore,
  feedError,
  hasMore,
  busyPostIds,
  composer,
  onLikePost,
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
                  <ComposerCard
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
                        onLikePost={onLikePost}
                        onEditPost={onEditPost}
                        onDeletePost={onDeletePost}
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
