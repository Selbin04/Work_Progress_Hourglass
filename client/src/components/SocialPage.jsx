import { useState } from "react";
import "./SocialPage.css";

const FEED = [
  {
    id: "1",
    initial: "A",
    name: "Alex",
    meta: "poured 45 min · Design system",
    body: "Closed the gap on the logo mark and shipped the navbar refresh.",
  },
  {
    id: "2",
    initial: "M",
    name: "Maya",
    meta: "poured 2 hr · API rewrite",
    body: "Three important projects cleared before noon. Hourglass never lied.",
  },
  {
    id: "3",
    initial: "J",
    name: "Jordan",
    meta: "poured 20 min · Writing",
    body: "Short session, one finished draft. Showing up counts.",
  },
];

const GROUPS = [
  { id: "g1", name: "Morning Pour", members: 12, blurb: "Daily check-ins before noon." },
  { id: "g2", name: "Deep Work", members: 8, blurb: "Long pours, few distractions." },
  { id: "g3", name: "Ship Club", members: 21, blurb: "Finish something every week." },
];

function IconLike({ filled }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {filled ? (
        <path
          fill="currentColor"
          d="M12 21s-6.7-4.3-9.3-8.2C.7 9.9 1.5 6.2 4.6 5.1c1.9-.7 4-.2 5.3 1.3L12 8.2l2.1-1.8c1.3-1.5 3.4-2 5.3-1.3 3.1 1.1 3.9 4.8 1.9 7.7C18.7 16.7 12 21 12 21z"
        />
      ) : (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
          d="M12 20.5s-6.2-4-8.7-7.6C1.4 10.2 2.1 6.8 4.9 5.8c1.7-.6 3.6-.1 4.8 1.2L12 9.2l2.3-2.2c1.2-1.3 3.1-1.8 4.8-1.2 2.8 1 3.5 4.4 1.6 7.1C18.2 16.5 12 20.5 12 20.5z"
        />
      )}
    </svg>
  );
}

function IconComment() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        d="M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H10l-4.5 3v-3H5A1.5 1.5 0 0 1 3.5 15V7A1.5 1.5 0 0 1 5 5.5z"
      />
    </svg>
  );
}

function IconShare() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="18" cy="5" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="6" cy="12" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="18" cy="19" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        d="M8 11.2 15.8 6.6M8 12.8l7.8 4.6"
      />
    </svg>
  );
}

function IconReport() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        d="M6 4.5h9.5L13 9l2.5 4.5H6V20"
      />
    </svg>
  );
}

function PostActions({ postId, liked, onLike }) {
  return (
    <div className="social-actions">
      <button
        type="button"
        className={liked ? "is-liked" : ""}
        aria-label={liked ? "Unlike" : "Like"}
        aria-pressed={liked}
        onClick={() => onLike(postId)}
      >
        <IconLike filled={liked} />
      </button>
      <button type="button" aria-label="Comment">
        <IconComment />
      </button>
      <button type="button" aria-label="Share">
        <IconShare />
      </button>
      <button type="button" className="is-report" aria-label="Report">
        <IconReport />
      </button>
    </div>
  );
}

export default function SocialPage() {
  const [section, setSection] = useState("view");
  const [likedIds, setLikedIds] = useState(() => new Set());

  const toggleLike = (id) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section className="social-page" aria-label="Social">
      <div className="social-tabs" role="tablist" aria-label="Social sections">
        <button
          type="button"
          role="tab"
          id="social-tab-view"
          aria-selected={section === "view"}
          aria-controls="social-panel-view"
          className={section === "view" ? "is-active" : ""}
          onClick={() => setSection("view")}
        >
          View
        </button>
        <button
          type="button"
          role="tab"
          id="social-tab-groups"
          aria-selected={section === "groups"}
          aria-controls="social-panel-groups"
          className={section === "groups" ? "is-active" : ""}
          onClick={() => setSection("groups")}
        >
          Groups
        </button>
      </div>

      {section === "view" ? (
        <div
          className="social-feed"
          role="tabpanel"
          id="social-panel-view"
          aria-labelledby="social-tab-view"
        >
          {FEED.map((item) => (
            <article key={item.id} className="social-card">
              <div className="social-card-top">
                <span className="social-avatar" aria-hidden="true">
                  {item.initial}
                </span>
                <div>
                  <strong>{item.name}</strong>
                  <span className="social-meta">{item.meta}</span>
                </div>
              </div>
              <p>{item.body}</p>
              <PostActions
                postId={item.id}
                liked={likedIds.has(item.id)}
                onLike={toggleLike}
              />
            </article>
          ))}
        </div>
      ) : (
        <div
          className="social-groups"
          role="tabpanel"
          id="social-panel-groups"
          aria-labelledby="social-tab-groups"
        >
          {GROUPS.map((group) => (
            <article key={group.id} className="social-card">
              <div className="social-card-top">
                <span className="social-avatar social-avatar-group" aria-hidden="true">
                  {group.name.slice(0, 1)}
                </span>
                <div>
                  <strong>{group.name}</strong>
                  <span className="social-meta">{group.members} members</span>
                </div>
              </div>
              <p>{group.blurb}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
