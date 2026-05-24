import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { User } from "../../types/auth";

type FeedLayoutProps = {
  user: User;
  onSignOut: () => Promise<void> | void;
};

type SocialItem = {
  id: number;
  name: string;
  handle: string;
  image: string;
};

function Icon({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={className}>{children}</span>;
}

function FeedCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="_feed_right_inner_area_card _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
      <div className="_feed_right_inner_area_card_content _mar_b24">
        <h4 className="_feed_right_inner_area_card_content_title _title5">
          {title}
        </h4>
        {subtitle ? (
          <p className="_feed_right_inner_area_card_content_txt">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function AvatarRow({ item }: { item: SocialItem }) {
  return (
    <div className="_feed_right_inner_area_card_ppl">
      <div className="_feed_right_inner_area_card_ppl_box">
        <div className="_feed_right_inner_area_card_ppl_image">
          <img src={item.image} alt={item.name} />
        </div>
        <div className="_feed_right_inner_area_card_ppl_side">
          <h5 className="_feed_right_inner_area_card_ppl_title">{item.name}</h5>
          <p className="_feed_right_inner_area_card_ppl_txt">{item.handle}</p>
        </div>
      </div>
      <button type="button" className="_feed_inner_ppl_btn_link" disabled>
        Follow
      </button>
    </div>
  );
}

export function FeedLayout({ user, onSignOut }: FeedLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const suggestedPeople = useMemo<SocialItem[]>(
    () => [
      {
        id: 1,
        name: "Olivia Rhye",
        handle: "@olivia",
        image: "/assets/images/card_ppl1.png",
      },
      {
        id: 2,
        name: "Noah Kim",
        handle: "@noahkim",
        image: "/assets/images/card_ppl2.png",
      },
      {
        id: 3,
        name: "Ava Stone",
        handle: "@avastone",
        image: "/assets/images/card_ppl3.png",
      },
    ],
    [],
  );

  const stories = useMemo(
    () => [
      {
        id: 1,
        image: "/assets/images/mobile_story_img1.png",
        label: "Your Story",
      },
      {
        id: 2,
        image: "/assets/images/mobile_story_img2.png",
        label: "Explore",
      },
      { id: 3, image: "/assets/images/slider1.png", label: "Weekend" },
      { id: 4, image: "/assets/images/slider2.png", label: "Team" },
    ],
    [],
  );

  const events = useMemo(
    () => [
      { id: 1, title: "Design sprint", time: "Today • 4:30 PM" },
      { id: 2, title: "Frontend review", time: "Tomorrow • 11:00 AM" },
    ],
    [],
  );

  return (
    <section className="_layout _layout_main_wrapper">
      <div className="_layout_mode_swithing_btn">
        <button
          type="button"
          className="_layout_swithing_btn_link"
          aria-label="Theme switch button"
        >
          <div className="_layout_swithing_btn">
            <div className="_layout_swithing_btn_round" />
          </div>
          <div className="_layout_change_btn_ic1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="11"
              height="16"
              fill="none"
              viewBox="0 0 11 16"
            >
              <path
                fill="#fff"
                d="M2.727 14.977l.04-.498-.04.498zm-1.72-.49l.489-.11-.489.11zM3.232 1.212L3.514.8l-.282.413zM9.792 8a6.5 6.5 0 00-6.5-6.5v-1a7.5 7.5 0 017.5 7.5h-1zm-6.5 6.5a6.5 6.5 0 006.5-6.5h1a7.5 7.5 0 01-7.5 7.5v-1zm-.525-.02c.173.013.348.02.525.02v1c-.204 0-.405-.008-.605-.024l.08-.997zm-.261-1.83A6.498 6.498 0 005.792 7h1a7.498 7.498 0 01-3.791 6.52l-.495-.87zM5.792 7a6.493 6.493 0 00-2.841-5.374L3.514.8A7.493 7.493 0 016.792 7h-1zm-3.105 8.476c-.528-.042-.985-.077-1.314-.155-.316-.075-.746-.242-.854-.726l.977-.217c-.028-.124-.145-.09.106-.03.237.056.6.086 1.165.131l-.08.997zm.314-1.956c-.622.354-1.045.596-1.31.792a.967.967 0 00-.204.185c-.01.013.027-.038.009-.12l-.977.218a.836.836 0 01.144-.666c.112-.162.27-.3.433-.42.324-.24.814-.519 1.41-.858L3 13.52zM3.292 1.5a.391.391 0 00.374-.285A.382.382 0 003.514.8l-.563.826A.618.618 0 012.702.95a.609.609 0 01.59-.45v1z"
              />
            </svg>
          </div>
          <div className="_layout_change_btn_ic2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                cx="12"
                cy="12"
                r="4.389"
                stroke="#fff"
                transform="rotate(-90 12 12)"
              />
              <path
                stroke="#fff"
                strokeLinecap="round"
                d="M3.444 12H1M23 12h-2.444M5.95 5.95L4.222 4.22M19.778 19.779L18.05 18.05M12 3.444V1M12 23v-2.445M18.05 5.95l1.728-1.729M4.222 19.779L5.95 18.05"
              />
            </svg>
          </div>
        </button>
      </div>

      <div className="_main_layout">
        <nav className="navbar navbar-expand-lg navbar-light _header_nav _padd_t10">
          <div className="container _custom_container">
            <div className="_logo_wrap">
              <Link className="navbar-brand" to="/feed" aria-label="Go to feed">
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
              aria-label="Toggle menu"
              onClick={() => setMobileMenuOpen((value) => !value)}
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
                    placeholder="Search posts, people, or topics"
                    aria-label="Search"
                    disabled
                  />
                </form>
              </div>

              <ul className="navbar-nav mb-2 mb-lg-0 _header_nav_list ms-auto _mar_r8">
                <li className="nav-item _header_nav_item">
                  <Link
                    className="_header_nav_link_active _header_nav_link nav-link"
                    aria-current="page"
                    to="/feed"
                  >
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
                style={{ marginLeft: 12 }}
              >
                Logout
              </button>
            </div>
          </div>
        </nav>

        {mobileMenuOpen ? (
          <div className="_header_mobile_menu">
            <div className="_header_mobile_menu_wrap">
              <div className="_header_mobile_menu_top_inner">
                <div className="_header_mobile_menu_logo">
                  <img src="/assets/images/logo.svg" alt="Buddy Script" />
                </div>
                <button
                  type="button"
                  className="_header_mobile_toggle"
                  aria-label="Close menu"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  ✕
                </button>
              </div>

              <div className="_header_mobile_search">
                <input
                  type="search"
                  className="form-control _inpt1"
                  placeholder="Search posts, people, or topics"
                  disabled
                />
              </div>

              <div className="_mobile_navigation_bottom_wrap">
                <ul className="_mobile_navigation_bottom_list">
                  <li className="_mobile_navigation_bottom_item">
                    <Link
                      className="_mobile_navigation_bottom_link _mobile_navigation_bottom_link_active"
                      to="/feed"
                    >
                      <Icon className="_mobile_svg">⌂</Icon>
                      Home
                    </Link>
                  </li>
                  <li className="_mobile_navigation_bottom_item">
                    <button
                      type="button"
                      className="_mobile_navigation_bottom_link"
                      disabled
                    >
                      <Icon className="_mobile_svg">◌</Icon>
                      Explore
                    </button>
                  </li>
                  <li className="_mobile_navigation_bottom_item">
                    <button
                      type="button"
                      className="_mobile_navigation_bottom_link"
                      disabled
                    >
                      <Icon className="_mobile_svg">✉</Icon>
                      Messages
                    </button>
                  </li>
                  <li className="_mobile_navigation_bottom_item">
                    <button
                      type="button"
                      className="_mobile_navigation_bottom_link"
                      disabled
                    >
                      <Icon className="_mobile_svg">☰</Icon>
                      More
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : null}

        <div className="_mobile_navigation_bottom_wrapper">
          <div className="_mobile_navigation_bottom_wrap">
            <ul className="_mobile_navigation_bottom_list">
              <li className="_mobile_navigation_bottom_item">
                <Link
                  className="_mobile_navigation_bottom_link _mobile_navigation_bottom_link_active"
                  to="/feed"
                >
                  <Icon className="_mobile_svg">⌂</Icon>
                  Home
                </Link>
              </li>
              <li className="_mobile_navigation_bottom_item">
                <button
                  type="button"
                  className="_mobile_navigation_bottom_link"
                  disabled
                >
                  <Icon className="_mobile_svg">◌</Icon>
                  Explore
                </button>
              </li>
              <li className="_mobile_navigation_bottom_item">
                <button
                  type="button"
                  className="_mobile_navigation_bottom_link"
                  disabled
                >
                  <Icon className="_mobile_svg">✉</Icon>
                  Messages
                </button>
              </li>
              <li className="_mobile_navigation_bottom_item">
                <button
                  type="button"
                  className="_mobile_navigation_bottom_link"
                  disabled
                >
                  <Icon className="_mobile_svg">☰</Icon>
                  More
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="container _custom_container">
          <div className="_layout_inner_wrap">
            <div className="row">
              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                <aside className="_layout_left_sidebar_wrap">
                  <div className="_layout_left_sidebar_inner">
                    <div className="_left_inner_area_suggest _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                      <div className="_left_inner_area_suggest_content _mar_b24">
                        <h4 className="_left_inner_area_suggest_content_title _title5">
                          Stories
                        </h4>
                        <p className="_left_inner_area_suggest_content_txt">
                          Quick updates from people you follow.
                        </p>
                      </div>

                      <div className="_feed_inner_ppl_card_mobile _mar_b16">
                        <div className="_feed_inner_ppl_card_area">
                          {stories.map((story, index) => (
                            <div
                              key={story.id}
                              className="_feed_inner_ppl_card_area_item"
                            >
                              <div
                                className={
                                  index === 0
                                    ? "_feed_inner_ppl_card_area_story _feed_inner_ppl_card_area_story_active"
                                    : "_feed_inner_ppl_card_area_story _feed_inner_ppl_card_area_story_inactive"
                                }
                              >
                                <div className="_feed_inner_profile_story_image">
                                  <img src={story.image} alt={story.label} />
                                </div>
                              </div>
                              <div className="_feed_inner_ppl_card_area_txt">
                                {story.label}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <FeedCard
                      title="Explore"
                      subtitle="Browse public activity and trending groups."
                    >
                      <ul className="_left_inner_area_explore_list">
                        <li className="_left_inner_area_explore_item">
                          <button
                            type="button"
                            className="_left_inner_area_explore_link"
                            disabled
                          >
                            <span className="_left_inner_area_explore_link_txt">
                              Design
                            </span>
                          </button>
                        </li>
                        <li className="_left_inner_area_explore_item">
                          <button
                            type="button"
                            className="_left_inner_area_explore_link"
                            disabled
                          >
                            <span className="_left_inner_area_explore_link_txt">
                              Product
                            </span>
                          </button>
                        </li>
                        <li className="_left_inner_area_explore_item">
                          <button
                            type="button"
                            className="_left_inner_area_explore_link"
                            disabled
                          >
                            <span className="_left_inner_area_explore_link_txt">
                              Frontend
                            </span>
                          </button>
                        </li>
                      </ul>
                    </FeedCard>

                    <FeedCard
                      title="Events"
                      subtitle="A lightweight placeholder for the legacy sidebar."
                    >
                      <div className="_left_iner_event_card">
                        {events.map((event) => (
                          <div
                            key={event.id}
                            className="_left_inner_event_content"
                          >
                            <h5 className="_left_inner_event_card_title">
                              {event.title}
                            </h5>
                            <p className="_left_inner_card_txt">{event.time}</p>
                          </div>
                        ))}
                      </div>
                    </FeedCard>
                  </div>
                </aside>
              </div>

              <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                <main className="_layout_middle_wrap">
                  <div className="_layout_middle_inner">
                    <div className="_feed_inner_text_area _b_radious6 _padd_b24 _padd_t24 _padd_r24 _padd_l24 _mar_b16">
                      <div className="_feed_inner_text_area_box">
                        <div className="_feed_inner_text_area_box_image">
                          <img
                            src="/assets/images/Avatar.png"
                            alt={`${user.firstName} ${user.lastName}`}
                          />
                        </div>
                        <div className="_feed_inner_text_area_item">
                          <div className="_feed_textarea_label">
                            <strong>
                              {user.firstName} {user.lastName}
                            </strong>
                            <span>Public feed</span>
                          </div>
                          <textarea
                            className="_feed_inner_text_mobile form-control"
                            placeholder="Create a post, share an image, and start a conversation."
                            rows={4}
                            disabled
                          />
                        </div>
                      </div>

                      <div className="_feed_inner_text_area_bottom">
                        <div className="_feed_inner_text_area_bottom_photo _feed_common">
                          <button
                            type="button"
                            className="_feed_inner_text_area_bottom_photo_link"
                            disabled
                          >
                            <img
                              className="_feed_inner_text_area_bottom_photo_iamge _mar_img"
                              src="/assets/images/photos1.png"
                              alt=""
                            />
                            Photo
                          </button>
                        </div>
                        <div className="_feed_inner_text_area_bottom_video _feed_common">
                          <button
                            type="button"
                            className="_feed_inner_text_area_bottom_photo_link"
                            disabled
                          >
                            <img
                              src="/assets/images/photos2.png"
                              alt=""
                              className="_feed_inner_text_area_bottom_photo_iamge _mar_img"
                            />
                            Private
                          </button>
                        </div>
                        <div className="_feed_inner_text_area_bottom_article _feed_common">
                          <button
                            type="button"
                            className="_feed_inner_text_area_bottom_photo_link"
                            disabled
                          >
                            <img
                              src="/assets/images/photos3.png"
                              alt=""
                              className="_feed_inner_text_area_bottom_photo_iamge _mar_img"
                            />
                            Public
                          </button>
                        </div>
                        <div className="_feed_inner_text_area_btn">
                          <button
                            type="button"
                            className="_feed_inner_text_area_btn_link"
                            disabled
                          >
                            Post
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
                      <div className="_feed_inner_timeline_post_top">
                        <div className="_feed_inner_timeline_post_box">
                          <div className="_feed_inner_timeline_post_box_image">
                            <img src="/assets/images/chat_profile.png" alt="" />
                          </div>
                          <div className="_feed_inner_timeline_post_box_txt">
                            <h5 className="_feed_inner_timeline_post_box_title">
                              Timeline
                            </h5>
                            <p className="_feed_inner_timeline_post_box_para">
                              Your newest public and private posts will appear
                              here.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="_feed_timeline_dropdown _timeline_dropdown"
                          disabled
                        >
                          ⋮
                        </button>
                      </div>

                      <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
                        <img
                          className="_feed_inner_timeline_image"
                          src="/assets/images/timeline_img.png"
                          alt="Feed preview"
                        />
                      </div>

                      <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26">
                        <div className="_feed_inner_timeline_total_reacts_txt">
                          <span className="_feed_inner_timeline_total_reacts_para">
                            0 likes
                          </span>
                          <span className="_feed_inner_timeline_total_reacts_para1">
                            0 comments
                          </span>
                        </div>
                        <p className="_feed_inner_timeline_total_reacts_para2">
                          Data will be loaded in step 4.
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

                    <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
                      <div className="_feed_inner_timeline_post_top">
                        <div className="_feed_inner_timeline_post_box">
                          <div className="_feed_inner_timeline_post_box_image">
                            <img src="/assets/images/chat_profile.png" alt="" />
                          </div>
                          <div className="_feed_inner_timeline_post_box_txt">
                            <h5 className="_feed_inner_timeline_post_box_title">
                              Second card
                            </h5>
                            <p className="_feed_inner_timeline_post_box_para">
                              This space will become the paginated feed list.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="_feed_timeline_dropdown _timeline_dropdown"
                          disabled
                        >
                          ⋮
                        </button>
                      </div>

                      <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
                        <img
                          className="_feed_inner_timeline_image"
                          src="/assets/images/recommend1.png"
                          alt=""
                        />
                      </div>
                    </div>
                  </div>
                </main>
              </div>

              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                <aside className="_layout_right_sidebar_wrap">
                  <div className="_layout_right_sidebar_inner">
                    <FeedCard
                      title="Suggested people"
                      subtitle="Follow people to personalize your feed."
                    >
                      <div className="_feed_inner_ppl_card_area_list">
                        {suggestedPeople.map((item) => (
                          <AvatarRow key={item.id} item={item} />
                        ))}
                      </div>
                    </FeedCard>

                    <FeedCard
                      title="Profile"
                      subtitle="Signed in session-managed access."
                    >
                      <div className="_feed_inner_pulic_story_para">
                        <strong>
                          {user.firstName} {user.lastName}
                        </strong>
                      </div>
                      <div className="_feed_inner_pulic_story_txt">
                        {user.email}
                      </div>
                    </FeedCard>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
