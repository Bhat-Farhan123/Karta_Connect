import React, { useState, useEffect, useRef } from "react";
import {
  Home,
  Compass,
  Users,
  BriefcaseBusiness,
  MessageCircle,
  Bell,
  Bookmark,
  Settings,
  Search,
  Plus,
  Heart,
  MessageSquare,
  Share2,
  MoreHorizontal,
  Menu,
  X,
  GraduationCap,
  Building2,
  ShieldCheck,
  ShieldAlert,
  Upload,
  ArrowRight,
  LogOut,
  UserRound,
  FileText,
  CheckCircle2,
  Send,
  MapPin,
  Sparkles,
  LayoutDashboard,
  ChevronRight,
  Globe2,
  Award,
} from "lucide-react";
import { photos, scholars, opportunities, feed } from "../data";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { cls, Avatar, Btn, Tag } from "./ui";
import { signOut } from "../services/authService";

async function handleSignOut() {
  try {
    await signOut();
    window.location.assign("/login");
  } catch (error) {
    console.error("Logout failed:", error);
    alert("Unable to log out. Please try again.");
  }
}

function Header({
  role,
  profile,
  search,
  setSearch,
  onProfile,
  currentPage,
  setPage,
  onMenu,
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.assign("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Unable to log out. Please try again.");
    }
  };
  const profileMenuRef = useRef(null);
  useEffect(() => {
    if (!profileOpen) return;
    const handlePointerDown = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setProfileOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileOpen]);
  const nav =
    role === "Admin"
      ? [
          ["Overview", LayoutDashboard],
          ["Scholars", GraduationCap],
          ["Organizations", Building2],
          ["Moderation", ShieldCheck],
        ]
      : role === "Organization"
        ? [
            ["Home", Home],
            ["Talent", Compass],
            ["Manage jobs", BriefcaseBusiness],
            ["Applicants", Users],
            ["Messages", MessageCircle],
          ]
        : [
            ["Home", Home],
            ["My network", Users],
            ["Jobs", BriefcaseBusiness],
            ["Messaging", MessageCircle],
            ["Notifications", Bell],
          ];
  return (
    <header className="header topnav-header">
      <button
        className="mobile-menu-trigger"
        onClick={onMenu}
        aria-label="Open navigation"
      >
        <Menu size={23} />
      </button>
      <div className="logo">
        <span className="logo-icon">k.</span>
        <span>
          karta<span>connect</span>
        </span>
      </div>
      <div className="searchbox">
        <Search size={17} />
        <input
          aria-label="Search people, ideas and opportunities"
          placeholder="Search people, ideas and opportunities"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <nav className="topnav-items" aria-label="Main navigation">
        {nav.map(([name, Icon]) => (
          <button
            key={name}
            className={cls(
              "topnav-item",
              currentPage === name ||
                (name === "Jobs" && currentPage === "Opportunities") ||
                (name === "Messaging" && currentPage === "Messages")
                ? "active"
                : "",
            )}
            onClick={() =>
              setPage(
                name === "Jobs"
                  ? "Opportunities"
                  : name === "Messaging"
                    ? "Messages"
                    : name,
              )
            }
          >
            <Icon size={21} />
            <span>{name}</span>
            {name === "Messaging" && <i className="topnav-badge">3</i>}
          </button>
        ))}
      </nav>
      <div className="topnav-me" ref={profileMenuRef}>
        <button
          className="topnav-item me-trigger"
          onClick={() => setProfileOpen((v) => !v)}
        >
          <img
  src={
    role === "Organization"
      ? profile?.organization?.logo_url || photos.portrait2
      : photos.portrait2
  }
  alt="Profile"
/>
          <span>Me</span>
          <ChevronRight size={12} />
        </button>
        {profileOpen && (
          <div className="header-profile-menu">
            <div className="profile-menu-top">
              <img
  src={
    role === "Organization"
      ? profile?.organization?.logo_url || photos.portrait2
      : photos.portrait2
  }
  alt="Profile"
/>
              <div>
                <b>
                  {role === "Organization"
  ? profile?.organization?.organization_name || "Your Organization"
  : profile?.full_name || "Karta Connect"}
                </b>
                <span>
                  {role === "Scholar"
                    ? "Scholar · Class of 2027"
                    : role === "Alumni"
                      ? "Karta Alumni · Class of 2024"
                      : role}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                onProfile();
                setProfileOpen(false);
              }}
            >
              <UserRound size={16} /> View profile
            </button>
            
            <button onClick={() => setProfileOpen(false)}>
              <Globe2 size={16} /> Help & support
            </button>
            <div className="profile-menu-divider" />
            <button onClick={handleSignOut}>

              <LogOut size={16} /> Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
const scholarNav = [
  ["Home", Home],
  ["My profile", UserRound],
  ["Discover", Compass],
  ["My network", Users],
  ["Messages", MessageCircle],
  ["Opportunities", BriefcaseBusiness],
  ["My applications", FileText],
  ["Saved", Bookmark],
];
const alumniNav = [
  ["Home", Home],
  ["My profile", UserRound],
  ["My network", Users],
  ["Alumni Directory", GraduationCap],
  ["Opportunities", BriefcaseBusiness],
  ["My applications", FileText],
  ["Messages", MessageCircle],
  ["Community Feed", MessageSquare],
];
const orgNav = [
  ["Home", Home],
  ["Company profile", Building2],
  ["Talent", Compass],
  ["Manage jobs", BriefcaseBusiness],
  ["Applicants", Users],
  ["Messages", MessageCircle],
];
const adminNav = [
  ["Overview", LayoutDashboard],
  ["Admin profile", UserRound],
  ["Scholars", GraduationCap],
  ["Alumni Management", Award],
  ["Organizations", Building2],
  ["Bulk upload", Upload],
  ["Moderation", ShieldCheck],
  ["Admin management", Users],
  ["Audit activity", FileText],
  ["Post Activity", MessageSquare],
];
function Sidebar({ role, profile, page, setPage, open, setOpen }) {
  let nav =
    role === "Admin"
      ? adminNav
      : role === "Organization"
        ? orgNav
        : role === "Alumni"
          ? alumniNav
          : scholarNav;

  const [sidebarPhoto, setSidebarPhoto] = useState(null);

  useEffect(() => {
    let active = true;

    const loadPhoto = async () => {
      if (!profile?.id || role !== "Scholar") return;

      const { data, error } = await supabase
        .from("scholar_profiles")
        .select("profile_image_path")
        .eq("user_id", profile.id)
        .maybeSingle();

      if (error || !data?.profile_image_path) return;

      const { data: signed, error: imageError } = await supabase.storage
        .from("scholar-media")
        .createSignedUrl(data.profile_image_path, 3600);

      if (active && !imageError) {
        setSidebarPhoto(signed?.signedUrl || null);
      }
    };

    loadPhoto();

    return () => {
      active = false;
    };
  }, [profile?.id, role]);

  return (
    <aside className={cls("sidebar", open && "show")}>
      <div className="side-top">
        <span className="overline">YOUR SPACE</span>
        <button className="side-close" onClick={() => setOpen(false)}>
          <X />
        </button>
      </div>

      <div className="profile-mini">
        <Avatar
  size="small"
  src={
    role === "Organization"
      ? profile?.organization?.logo_url
      : sidebarPhoto ||
        profile?.profileImage ||
        profile?.profile_image ||
        profile?.avatar_url
  }
  initials={
    role === "Organization"
      ? (profile?.organization?.organization_name || "O").charAt(0)
      : profile?.full_name?.charAt(0) || "S"
  }
  alumni={role === "Alumni"}
/>

        <div>
          <b>
            {role === "Organization"
  ? profile?.organization?.organization_name || "Your Organization"
  : profile?.full_name || "Karta Connect"}
          </b>
          <span>
            {role === "Scholar"
              ? "Scholar"
              : role === "Alumni"
                ? "Karta Alumni"
                : role === "Admin"
                  ? "Platform administrator"
                  : "Verified organization"}
          </span>
        </div>

        <MoreHorizontal size={17} />
      </div>

      <div className="nav-label">WORKSPACE</div>

      {nav.map(([name, Icon]) => (
        <button
          key={name}
          className={cls("nav-link", page === name && "current")}
          onClick={() => {
            setPage(name);
            setOpen(false);
          }}
        >
          <Icon size={18} />
          {name}
          {name === "Messages" && <span className="nav-badge">3</span>}
        </button>
      ))}

      <div className="side-bottom">
        <div className="side-promo">
          <div className="promo-icon">
            <Sparkles size={17} />
          </div>
          <b>Your next chapter starts here.</b>
          <p>
            Make one new connection today. You never know where it can lead.
          </p>
          <button
            onClick={() =>
              setPage(role === "Organization" ? "Talent" : "Discover")
            }
          >
            Meet your community <ArrowRight size={14} />
          </button>
        </div>

        <button className="nav-link">
          <Settings size={18} />
          Settings
        </button>

        <button className="nav-link" onClick={handleSignOut}>
          <LogOut size={18} />
          Sign out
        </button>

        <div className="side-foot">© 2026 Karta Connect</div>
      </div>
    </aside>
  );
}
function Welcome({ role, setPage }) {
  return (
    <section className="hero-panel">
      <div
        className="hero-image"
        style={{ backgroundImage: `url(${photos.hero})` }}
      />
      <div className="hero-shade" />
      <div className="hero-text">
        <div className="hero-kicker">
          <span /> THE KARTA COMMUNITY
        </div>
        <h1>
          {role === "Admin"
            ? "A stronger community starts with you."
            : role === "Organization"
              ? "Meet the minds shaping tomorrow."
              : "Your next chapter starts with a connection."}
        </h1>
        <p>
          {role === "Admin"
            ? "A clear view of the people, ideas and opportunities growing across Karta."
            : role === "Organization"
              ? "Discover emerging talent, share opportunities and build relationships that matter."
              : "Discover inspiring people, share what you’re building and find opportunities made for you."}
        </p>
        <div className="hero-ctas">
          <Btn
            kind="lime"
            onClick={() =>
              setPage(
                role === "Admin"
                  ? "Scholars"
                  : role === "Organization"
                    ? "Talent"
                    : "Discover",
              )
            }
          >
            {role === "Organization" ? "Explore talent" : "Explore community"}{" "}
            <ArrowRight size={16} />
          </Btn>
          <button
            className="hero-text-link"
            onClick={() =>
              setPage(role === "Scholar" ? "My profile" : "Company profile")
            }
          >
            Complete your profile <ChevronRight size={15} />
          </button>
        </div>
      </div>
      <div className="hero-glance" aria-label="Your community at a glance">
        <div>
          <strong>248</strong>
          <span>Profile visits</span>
        </div>
        <i />
        <div>
          <strong>186</strong>
          <span>Connections</span>
        </div>
        <i />
        <div>
          <strong>12</strong>
          <span>Saved roles</span>
        </div>
      </div>
      <div className="hero-caption">
        <span>01 / COMMUNITY</span>
        <b>Curiosity connects us.</b>
      </div>
    </section>
  );
}
function Metric({ number, label, change, icon: Icon, tone, image }) {
  return (
    <div className={`metric metric-friendly ${tone}`}>
      <div className="metric-friendly-top">
        <div className={`metric-icon ${tone}`}>
          <Icon size={19} />
        </div>
        {image && (
          <img
            className="metric-friendly-image"
            src={image}
            alt="Community moment"
          />
        )}
      </div>
      <div className="metric-data">
        <b>{number}</b>
        <span>{label}</span>
      </div>
      <small className="metric-friendly-change">{change}</small>
    </div>
  );
}
function Person({ person, onViewProfile = () => {} }) {
  return (
    <div className="person">
      <button
        className="person-avatar-link"
        onClick={() => onViewProfile(person)}
      >
        <Avatar src={person.image} />
      </button>
      <div className="person-copy">
        <button
          className="person-name-link"
          onClick={() => onViewProfile(person)}
        >
          <b>{person.name}</b>
        </button>
        <span>{person.field}</span>
        <small>{person.mutual}</small>
      </div>
      <button
        className="round-add"
        type="button"
        title={`View ${person.name}'s profile to connect`}
        aria-label={`View ${person.name}'s profile to connect`}
        onClick={() => onViewProfile(person)}
      >
        <Plus size={17} />
      </button>
    </div>
  );
}
function FeedPost({
  post,
  onViewProfile,
  onEditPost,
  onDeletePost,
}) {
  const { user } = useAuth();
  const isOwner = user?.id === post.author_id;
  let [liked, setLiked] = useState(false),
    [saved, setSaved] = useState(false),
    [commentOpen, setCommentOpen] = useState(false),
    [comment, setComment] = useState(""),
    [comments, setComments] = useState([]),
    [reported, setReported] = useState(false),
[shared, setShared] = useState(false),
[menuOpen, setMenuOpen] = useState(false);
  return (
    <article className="feed-post v19-feed-post">
      <div className="feed-author">
        <Avatar
          src={post.author_avatar || post.image}
          alumni={
            post.authorType === "Alumni" ||
            post.role === "Alumni" ||
            post.accountType === "Alumni"
          }
        />
        <div className="feed-author-meta">
          <button
            className="feed-author-profile-link"
            onClick={() =>
              onViewProfile?.(
                scholars.find((x) => x.name === post.name) || {
                  name: post.name,
                  field: post.field,
                  image: post.image,
                  topic: post.kind || "Community member",
                },
              )
            }
          >
            <b>
              {post.name}
              <span className="author-connection"> · Community member</span>
            </b>
          </button>
          <span>{post.field}</span>
          <small>
            {post.time || "Just now"} · <Globe2 size={11} />
          </small>
        </div>
       <div className="post-menu">
  <button
    className="dots"
    onClick={() => setMenuOpen((prev) => !prev)}
    aria-label="More post options"
  >
    <MoreHorizontal />
  </button>

  {isOwner && (onEditPost || onDeletePost) && menuOpen && (
    <div className="post-menu-dropdown">
      {onEditPost && (
        <button
          type="button"
          onClick={() => {
            setMenuOpen(false);
            onEditPost(post);
          }}
        >
          Edit post
        </button>
      )}

      {onDeletePost && (
        <button
          type="button"
          className="delete-post-option"
          onClick={() => {
            setMenuOpen(false);
            onDeletePost(post);
          }}
        >
          Delete post
        </button>
      )}
    </div>
  )}
</div>
      </div>
      <div className="feed-copy">
        <p>{post.text}</p>
        {post.kind && post.kind !== "Community update" && (
          <span className="post-context-label">{post.kind}</span>
        )}
      </div>
      {post.photo && (
        <img className="feed-photo" src={post.photo} alt="Post attachment" />
      )}
      <div className="post-stats">
        <span>{(post.likes || 0) + (liked ? 1 : 0)} appreciations</span>
        <span>{(post.comments || 0) + comments.length} comments</span>
        {reported && (
          <small className="feed-feedback">Report noted for review</small>
        )}
      </div>
      <div className="post-actions">
        <button
          className={liked ? "active-like" : ""}
          onClick={() => setLiked(!liked)}
        >
          <Heart size={18} fill={liked ? "currentColor" : "none"} />{" "}
          <span>{liked ? "Appreciated" : "Appreciate"}</span>
        </button>
        <button onClick={() => setCommentOpen(!commentOpen)}>
          <MessageSquare size={18} /> <span>Comment</span>
        </button>
        <button onClick={() => setShared(true)}>
          <Share2 size={18} /> <span>{shared ? "Link copied" : "Share"}</span>
        </button>
        <button
          className={saved ? "active-save" : ""}
          onClick={() => setSaved(!saved)}
          aria-label="Save post"
        >
          <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      {commentOpen && (
        <form
          className="feed-comment-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (comment.trim()) {
              setComments([...comments, comment.trim()]);
              setComment("");
            }
          }}
        >
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a thoughtful comment..."
          />
          <button disabled={!comment.trim()}>Post</button>
        </form>
      )}
      {comments.map((c, i) => (
        <div className="feed-comment" key={i}>
          <b>Farhan Nisar</b>
          <span>{c}</span>
        </div>
      ))}
    </article>
  );
}
function Opportunity({ job }) {
  let [saved, setSaved] = useState(false);
  return (
    <div className="opportunity">
      <img src={job.image} />
      <div className="opp-content">
        <Tag tone="blue">{job.tag}</Tag>
        <b>{job.title}</b>
        <span>
          {job.company} · {job.type}
        </span>
        <small>
          <MapPin size={12} />
          {job.place}
        </small>
        <strong>{job.pay}</strong>
      </div>
      <button
        className={cls("save-btn", saved && "saved")}
        onClick={() => setSaved(!saved)}
      >
        <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
      </button>
    </div>
  );
}

export { Header, Sidebar, Welcome, Metric, Person, FeedPost, Opportunity };
