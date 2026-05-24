import { Link } from "react-router-dom";
import type { User } from "../../types/auth";

type FeedLayoutProps = {
  user: User;
  onSignOut: () => Promise<void> | void;
};

type Suggestion = {
  name: string;
  role: string;
  image: string;
  href?: string;
};

type Friend = {
  name: string;
  role: string;
  image: string;
  status?: "online" | "offline";
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

function PostCard({
  author,
  time,
  visibility,
  body,
  image,
  likes,
  comments,
  likedByMe,
}: {
  author: string;
  time: string;
  visibility: "Public" | "Private";
  body: string;
  image?: string;
  likes: number;
  comments: number;
  likedByMe?: boolean;
}) {
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
              <h4 className="_feed_inner_timeline_post_box_title">{author}</h4>
              <p className="_feed_inner_timeline_post_box_para">
                {time} . <a href="#0">{visibility}</a>
              </p>
            </div>
          </div>

          <div className="_feed_inner_timeline_post_box_dropdown">
            <div className="_feed_timeline_post_dropdown">
              <button
                type="button"
                className="_feed_timeline_post_dropdown_link"
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
            </div>
          </div>
        </div>

        <p className="_feed_inner_timeline_post_desc">{body}</p>
      </div>

      {image ? (
        <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
          <img src={image} alt="" className="_feed_inner_timeline_image" />
        </div>
      ) : null}

      <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26">
        <div className="_feed_inner_timeline_total_reacts_txt">
          <span className="_feed_inner_timeline_total_reacts_para">
            {likes} likes
          </span>
          <span className="_feed_inner_timeline_total_reacts_para1">
            {comments} comments
          </span>
        </div>
        <p className="_feed_inner_timeline_total_reacts_para2">
          {likedByMe
            ? "You liked this post."
            : "Like and comment interactions will connect in the next step."}
        </p>
      </div>

      <div className="_feed_inner_timeline_reaction _padd_r24 _padd_l24">
        <button
          type="button"
          className="_feed_inner_timeline_reaction_link _feed_reaction"
          disabled
        >
          Like
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

export function FeedLayout({ user, onSignOut }: FeedLayoutProps) {
  const suggestions: Suggestion[] = [
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

  const friends: Friend[] = [
    {
      name: "Steve Jobs",
      role: "CEO of Apple",
      image: "/assets/images/people1.png",
      status: "offline",
    },
    {
      name: "Ryan Roslansky",
      role: "CEO of Linkedin",
      image: "/assets/images/people2.png",
      status: "online",
    },
    {
      name: "Avery Clark",
      role: "Product Designer",
      image: "/assets/images/people3.png",
      status: "online",
    },
    {
      name: "Mia Chen",
      role: "Frontend Engineer",
      image: "/assets/images/people1.png",
      status: "offline",
    },
  ];

  return (
    <div className="_layout _layout_main_wrapper">
      <div className="_layout_mode_swithing_btn">
        <button
          type="button"
          className="_layout_swithing_btn_link"
          disabled
          aria-label="Theme switch"
        >
          <div className="_layout_swithing_btn">
            <div className="_layout_swithing_btn_round" />
          </div>
          <div className="_layout_change_btn_ic1" />
          <div className="_layout_change_btn_ic2" />
        </button>
      </div>

      <div className="_main_layout">
        <nav className="navbar navbar-expand-lg navbar-light _header_nav _padd_t10">
          <div className="container _custom_container">
            <div className="_logo_wrap">
              <Link className="navbar-brand" to="/feed">
                <img
                  src="/assets/images/logo.svg"
                  alt="Buddy Script"
                  className="_nav_logo"
                />
              </Link>
            </div>

            <button
              className="navbar-toggler bg-light"
              type="button"
              aria-label="Toggle navigation"
              disabled
            >
              <span className="navbar-toggler-icon" />
            </button>

            <div
              className="collapse navbar-collapse"
              id="navbarSupportedContent"
            >
              <div className="_header_form ms-auto">
                <form
                  className="_header_form_grp"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <svg
                    className="_header_form_svg"
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
                    className="form-control me-2 _inpt1"
                    type="search"
                    placeholder="input search text"
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
                  <div className="_header_nav_profile">
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
                        disabled
                      >
                        {user.firstName} {user.lastName}
                      </button>
                    </div>
                  </div>
                </li>
              </ul>

              <button
                type="button"
                className="_feed_inner_ppl_btn_link"
                onClick={() => void onSignOut()}
              >
                Logout
              </button>
            </div>
          </div>
        </nav>

        <div className="_mobile_navigation_bottom_wrapper">
          <div className="_mobile_navigation_bottom_wrap">
            <div className="conatiner">
              <div className="row">
                <div className="col-xl-12 col-lg-12 col-md-12">
                  <ul className="_mobile_navigation_bottom_list">
                    <li className="_mobile_navigation_bottom_item">
                      <Link
                        to="/feed"
                        className="_mobile_navigation_bottom_link _mobile_navigation_bottom_link_active"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="27"
                          fill="none"
                          viewBox="0 0 24 27"
                        >
                          <path
                            className="_mobile_svg"
                            fill="#000"
                            fillOpacity=".6"
                            stroke="#666666"
                            strokeWidth="1.5"
                            d="M1 13.042c0-2.094 0-3.141.431-4.061.432-.92 1.242-1.602 2.862-2.965l1.571-1.321C8.792 2.232 10.256 1 12 1c1.744 0 3.208 1.232 6.136 3.695l1.572 1.321c1.62 1.363 2.43 2.044 2.86 2.965.432.92.432 1.967.432 4.06v6.54c0 2.908 0 4.362-.92 5.265-.921.904-2.403.904-5.366.904H7.286c-2.963 0-4.445 0-5.365-.904C1 23.944 1 22.49 1 19.581v-6.54z"
                          />
                          <path
                            fill="#fff"
                            stroke="#fff"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9.07 18.497h5.857v7.253H9.07v-7.253z"
                          />
                        </svg>
                      </Link>
                    </li>
                    <li className="_mobile_navigation_bottom_item">
                      <button
                        type="button"
                        className="_mobile_navigation_bottom_link"
                        disabled
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="27"
                          height="20"
                          fill="none"
                          viewBox="0 0 27 20"
                        >
                          <path
                            className="_dark_svg"
                            fill="#000"
                            fillOpacity=".6"
                            fillRule="evenodd"
                            d="M13.334 12.405h.138l.31.001c2.364.015 7.768.247 7.768 3.81 0 3.538-5.215 3.769-7.732 3.784h-.932c-2.364-.015-7.77-.247-7.77-3.805 0-3.543 5.405-3.774 7.77-3.789l.31-.001h.138zm0 1.787c-2.91 0-6.38.348-6.38 2.003 0 1.619 3.263 1.997 6.114 2.018l.266.001c2.91 0 6.379-.346 6.379-1.998 0-1.673-3.469-2.024-6.38-2.024zm9.742-2.27c2.967.432 3.59 1.787 3.59 2.849 0 .648-.261 1.83-2.013 2.48a.953.953 0 01-.327.058.919.919 0 01-.858-.575.886.886 0 01.531-1.153c.83-.307.83-.647.83-.81 0-.522-.682-.886-2.027-1.082a.9.9 0 01-.772-1.017c.074-.488.54-.814 1.046-.75zm-18.439.75a.9.9 0 01-.773 1.017c-1.345.196-2.027.56-2.027 1.082 0 .163 0 .501.832.81a.886.886 0 01.531 1.153.92.92 0 01-.858.575.953.953 0 01-.327-.058C.262 16.6 0 15.418 0 14.77c0-1.06.623-2.417 3.592-2.85.506-.061.97.263 1.045.751zM13.334 0c3.086 0 5.596 2.442 5.596 5.442 0 3.001-2.51 5.443-5.596 5.443H13.3a5.616 5.616 0 01-3.943-1.603A5.308 5.308 0 017.74 5.439C7.739 2.442 10.249 0 13.334 0zm0 1.787c-2.072 0-3.758 1.64-3.758 3.655-.003.977.381 1.89 1.085 2.58a3.772 3.772 0 002.642 1.076l.03.894v-.894c2.073 0 3.76-1.639 3.76-3.656 0-2.015-1.687-3.655-3.76-3.655zm7.58-.62c2.153.344 3.717 2.136 3.717 4.26-.004 2.138-1.647 3.972-3.82 4.269a.911.911 0 01-1.036-.761.897.897 0 01.782-1.01c1.273-.173 2.235-1.248 2.237-2.501 0-1.242-.916-2.293-2.179-2.494a.897.897 0 01-.756-1.027.917.917 0 011.055-.736zM6.81 1.903a.897.897 0 01-.757 1.027C4.79 3.13 3.874 4.182 3.874 5.426c.002 1.251.963 2.327 2.236 2.5.503.067.853.519.783 1.008a.912.912 0 01-1.036.762c-2.175-.297-3.816-2.131-3.82-4.267 0-2.126 1.563-3.918 3.717-4.262.515-.079.972.251 1.055.736z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </li>
                    <li className="_mobile_navigation_bottom_item">
                      <button
                        type="button"
                        className="_mobile_navigation_bottom_link"
                        disabled
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="25"
                          height="27"
                          fill="none"
                          viewBox="0 0 25 27"
                        >
                          <path
                            className="_dark_svg"
                            fill="#000"
                            fillOpacity=".6"
                            fillRule="evenodd"
                            d="M10.17 23.46c.671.709 1.534 1.098 2.43 1.098.9 0 1.767-.39 2.44-1.099.36-.377.976-.407 1.374-.067.4.34.432.923.073 1.3-1.049 1.101-2.428 1.708-3.886 1.708h-.003c-1.454-.001-2.831-.608-3.875-1.71a.885.885 0 01.072-1.298 1.01 1.01 0 011.374.068zM12.663 0c5.768 0 9.642 4.251 9.642 8.22 0 2.043.549 2.909 1.131 3.827.576.906 1.229 1.935 1.229 3.88-.453 4.97-5.935 5.375-12.002 5.375-6.067 0-11.55-.405-11.998-5.296-.004-2.024.649-3.053 1.225-3.959l.203-.324c.501-.814.928-1.7.928-3.502C3.022 4.25 6.897 0 12.664 0zm0 1.842C8.13 1.842 4.97 5.204 4.97 8.22c0 2.553-.75 3.733-1.41 4.774-.531.836-.95 1.497-.95 2.932.216 2.316 1.831 3.533 10.055 3.533 8.178 0 9.844-1.271 10.06-3.613-.004-1.355-.423-2.016-.954-2.852-.662-1.041-1.41-2.221-1.41-4.774 0-3.017-3.161-6.38-7.696-6.38z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </li>
                    <li className="_mobile_navigation_bottom_item">
                      <button
                        type="button"
                        className="_mobile_navigation_bottom_link"
                        disabled
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            className="_dark_svg"
                            fill="#000"
                            fillOpacity=".6"
                            d="M12 11.5A3.5 3.5 0 1112 4.5a3.5 3.5 0 010 7zm0 2c-3.59 0-7 1.8-7 4v1h14v-1c0-2.2-3.41-4-7-4z"
                          />
                        </svg>
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container _custom_container">
          <div className="_layout_inner_wrap">
            <div className="row">
              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                <div className="_layout_left_sidebar_wrap">
                  <div className="_layout_left_sidebar_inner">
                    <div className="_left_inner_area_explore _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                      <h4 className="_left_inner_area_explore_title _title5 _mar_b24">
                        Explore
                      </h4>
                      <ul className="_left_inner_area_explore_list">
                        <li className="_left_inner_area_explore_item _explore_item">
                          <a
                            href="#0"
                            className="_left_inner_area_explore_link"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              fill="none"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fill="#666"
                                d="M10 0c5.523 0 10 4.477 10 10s-4.477 10-10 10S0 15.523 0 10 4.477 0 10 0zm0 1.395a8.605 8.605 0 100 17.21 8.605 8.605 0 000-17.21zm-1.233 4.65l.104.01c.188.028.443.113.668.203 1.026.398 3.033 1.746 3.8 2.563l.223.239.08.092a1.16 1.16 0 01.025 1.405c-.04.053-.086.105-.19.215l-.269.28c-.812.794-2.57 1.971-3.569 2.391-.277.117-.675.25-.865.253a1.167 1.167 0 01-1.07-.629c-.053-.104-.12-.353-.171-.586l-.051-.262c-.093-.57-.143-1.437-.142-2.347l.001-.288c.01-.858.063-1.64.157-2.147.037-.207.12-.563.167-.678.104-.25.291-.45.523-.575a1.15 1.15 0 01.58-.14zm.14 1.467l-.027.126-.034.198c-.07.483-.112 1.233-.111 2.036l.001.279c.009.737.053 1.414.123 1.841l.048.235.192-.07c.883-.372 2.636-1.56 3.23-2.2l.08-.087-.212-.218c-.711-.682-2.38-1.79-3.167-2.095l-.124-.045z"
                              />
                            </svg>
                            Learning
                          </a>
                          <span className="_left_inner_area_explore_link_txt">
                            New
                          </span>
                        </li>
                        <li className="_left_inner_area_explore_item">
                          <a
                            href="#0"
                            className="_left_inner_area_explore_link"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="22"
                              height="24"
                              fill="none"
                              viewBox="0 0 22 24"
                            >
                              <path
                                fill="#666"
                                d="M10.999 0c2.837 0 5.167 2.079 5.382 4.71l.008.22v.428h.933C19.34 5.358 21 7 21.15 9.062l.008.21v8.897c0 2.362-1.794 4.301-4.084 4.456l-.231.008H5.154C2.818 22.633 1.02 20.842.857 18.584l-.008-.21V9.272C.85 6.91 2.644 4.97 4.934 4.815l.22-.008h.926v-.427C6.08 2.079 8.41 0 11.000 0zm8.17 9.917H2.833v8.457c0 1.476 1.084 2.677 2.454 2.784l.176.007h11.998c1.4 0 2.543-1.11 2.699-2.52l.009-.182V9.917zm-4.164-3.58H7.833v.427c0 1.207.855 2.208 1.96 2.404l.187.03.187.008h1.838c1.242 0 2.258-.955 2.383-2.14l.01-.15v-.427zm-3.854 5.198c.403 0 .732.308.771.7l.004.08v1.604h1.634a.78.78 0 01.81.7.78.78 0 01-.678.85l-.088.004H11.93v1.604a.78.78 0 01-.7.808.78.78 0 01-.85-.677l-.004-.089v-1.645H9.18a.78.78 0 01-.81-.7.78.78 0 01.678-.85l.088-.004h1.292V12.25c0-.44.342-.798.773-.798zM11 1.555c-1.745 0-3.31 1.47-3.453 3.163l-.011.153h6.928c0-1.74-1.708-3.316-3.464-3.316z"
                              />
                            </svg>
                            Events
                          </a>
                        </li>
                        <li className="_left_inner_area_explore_item">
                          <a
                            href="#0"
                            className="_left_inner_area_explore_link"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="18"
                              fill="none"
                              viewBox="0 0 24 18"
                            >
                              <path
                                fill="#666"
                                d="M2 0h20a2 2 0 012 2v14a2 2 0 01-2 2H2a2 2 0 01-2-2V2a2 2 0 012-2zm0 2v14h20V2H2zm2 2h16v2H4V4zm0 4h10v2H4V8z"
                              />
                            </svg>
                            Articles
                          </a>
                        </li>
                      </ul>
                    </div>

                    <div className="_feed_inner_ppl_card_mobile _mar_b16">
                      <div className="_feed_inner_ppl_card_area">
                        <div className="_feed_inner_ppl_card_area_item">
                          <a
                            href="#0"
                            className="_feed_inner_ppl_card_area_link"
                          >
                            <div className="_feed_inner_ppl_card_area_story">
                              <img
                                src="/assets/images/mobile_story_img.png"
                                alt="Story"
                                className="_card_story_img"
                              />
                            </div>
                            <p className="_feed_inner_ppl_card_area_txt">
                              Story 1
                            </p>
                          </a>
                        </div>

                        <div className="_feed_inner_ppl_card_area_item">
                          <a
                            href="#0"
                            className="_feed_inner_ppl_card_area_link"
                          >
                            <div className="_feed_inner_ppl_card_area_story_active">
                              <img
                                src="/assets/images/mobile_story_img1.png"
                                alt="Story"
                                className="_card_story_img1"
                              />
                            </div>
                            <p className="_feed_inner_ppl_card_area_txt">
                              Story 2
                            </p>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                <div className="_layout_middle_wrap">
                  <div className="_layout_middle_inner">
                    <div className="_feed_inner_text_area _b_radious6 _padd_b24 _padd_t24 _padd_r24 _padd_l24 _mar_b16">
                      <div className="_feed_inner_text_area_box">
                        <div className="_feed_inner_text_area_box_image">
                          <img
                            src="/assets/images/txt_img.png"
                            alt="Profile"
                            className="_txt_img"
                          />
                        </div>
                        <div className="form-floating _feed_inner_text_area_box_form">
                          <textarea
                            className="form-control _textarea"
                            placeholder="Leave a comment here"
                            id="floatingTextarea"
                            disabled
                          />
                          <label
                            className="_feed_textarea_label"
                            htmlFor="floatingTextarea"
                          >
                            Write something ...
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

                      <div className="_feed_inner_text_area_bottom">
                        <div className="_feed_inner_text_area_item">
                          <div className="_feed_inner_text_area_bottom_photo _feed_common">
                            <button
                              type="button"
                              className="_feed_inner_text_area_bottom_photo_link"
                              disabled
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
                              Photo
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

                        <div className="_feed_inner_text_area_btn">
                          <button
                            type="button"
                            className="_feed_inner_text_area_btn_link"
                            disabled
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
                            <span>Post</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <PostCard
                      author="Karim Saif"
                      time="5 minute ago"
                      visibility="Public"
                      body="This is the first feed card placeholder. In the next step this section will be replaced by real cursor-paginated posts from the backend."
                      image="/assets/images/timeline_img.png"
                      likes={24}
                      comments={6}
                      likedByMe={false}
                    />

                    <PostCard
                      author="Maya Rahman"
                      time="17 minute ago"
                      visibility="Private"
                      body="This is a private post placeholder. Only the author will see private posts once the feed API is connected."
                      image="/assets/images/recommend1.png"
                      likes={8}
                      comments={2}
                      likedByMe={true}
                    />
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
                              <a href={item.href ?? "#0"}>
                                <Avatar src={item.image} alt={item.name} />
                              </a>
                            </div>
                            <div className="_right_inner_area_info_box_txt">
                              <a href={item.href ?? "#0"}>
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
                            >
                              See All
                            </a>
                          </span>
                        </div>

                        <form
                          className="_feed_right_inner_area_card_form"
                          onSubmit={(e) => e.preventDefault()}
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
                                <a href="#0">
                                  <img
                                    src={friend.image}
                                    alt={friend.name}
                                    className="_box_ppl_img"
                                  />
                                </a>
                              </div>
                              <div className="_feed_right_inner_area_card_ppl_txt">
                                <a href="#0">
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
    </div>
  );
}
