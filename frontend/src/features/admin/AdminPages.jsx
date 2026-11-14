import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
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
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  LogOut,
  UserRound,
  FileText,
  CheckCircle2,
  Clock3,
  Send,
  MapPin,
  Sparkles,
  LayoutDashboard,
  ChevronRight,
  SlidersHorizontal,
  Camera,
  Image as ImageIcon,
  AtSign,
  CalendarDays,
  Globe2,
  Mail,
  ExternalLink,
  Download,
  FolderKanban,
  Award,
  Pencil,
  Trash2,
  PauseCircle,
  PlayCircle,
  Eye,
  Check,
  Filter,
  RefreshCw,
  Briefcase,
  CalendarCheck,
  
} from "lucide-react";
import { photos, scholars, opportunities, feed } from "../../data";
import { cls, Avatar, Btn, Tag, PageHead } from "../../components/ui";
import {
  Header,
  Sidebar,
  Welcome,
  Metric,
  Person,
  FeedPost,
  Opportunity,
} from "../../components/shell";
import { demoAlumni } from "../alumni/AlumniPages";
import {
  getScholarInvites,
  createScholarInvite,
  updateScholarInvite,
  createBulkScholarInvites,
  sendScholarInvitation,
} from "../../services/scholarService";
import { useAuth } from "../../context/AuthContext";
import { updateUserProfile } from "../../services/authService";
import { supabase } from "../../lib/supabase";
import {
  logAdminActivity,
  getAdminActivities,
} from "../../services/adminActivityService";

import {
  getPosts,
  updatePostStatus,
  deletePost,
} from "../../services/postService";

import { updatePost } from "../../services/postService";

const initialAdminScholars = [];
const initialAdminOrgs = [
  {
    id: 1,
    name: "Northstar Labs",
    logo: "",
    email: "careers@northstarlabs.example",
    industry: "Technology & AI",
    location: "Bengaluru, India",
    website: "https://northstarlabs.example",
    size: "11–50 employees",
    about:
      "An applied AI team building thoughtful products and research tools.",
    submitted: "Today",
    status: "Pending",
  },
  {
    id: 2,
    name: "Orbit Studio",
    logo: "",
    email: "talent@orbitstudio.example",
    industry: "Design",
    location: "Delhi, India",
    website: "https://orbitstudio.example",
    size: "11–50 employees",
    about: "A creative studio working across product and visual design.",
    submitted: "Yesterday",
    status: "Under review",
  },
  {
    id: 3,
    name: "Greenfield Research",
    logo: "",
    email: "hello@greenfield.example",
    industry: "Research",
    location: "Pune, India",
    website: "https://greenfield.example",
    size: "51–200 employees",
    about: "A research organization supporting applied science and innovation.",
    submitted: "2 days ago",
    status: "Approved",
  },
];
const initialReports = [
  {
    id: 1,
    by: "Aarav Sharma",
    target: "Comment on a community post",
    reason: "Spam or misleading content",
    date: "Today",
    status: "Open",
  },
  {
    id: 2,
    by: "Meera Kapoor",
    target: "Community post",
    reason: "Inappropriate content",
    date: "Yesterday",
    status: "Open",
  },
  {
    id: 3,
    by: "Zoya Khan",
    target: "Profile content",
    reason: "Impersonation concern",
    date: "2 days ago",
    status: "Reviewed",
  },
];

export function AdminProfile({ posts = [], setPage }) {
  const { user, profile, refreshProfile } = useAuth();

  const [tab, setTab] = useState("Overview");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState(profile?.full_name || "");
  const avatarInputRef = useRef(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [adminActivities, setAdminActivities] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState("");
  const [activityFilter, setActivityFilter] = useState("All");
  const coverInputRef = useRef(null);
  const [coverUploading, setCoverUploading] = useState(false);

  useEffect(() => {
    setName(profile?.full_name || "");
  }, [profile?.full_name]);

  const loadActivities = async () => {
    try {
      setActivityLoading(true);
      setActivityError("");

      const activities = await getAdminActivities();
      setAdminActivities(activities);
    } catch (err) {
      setActivityError(err.message || "Unable to load admin activity.");
    } finally {
      setActivityLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "Activity") {
      loadActivities();
    }
  }, [tab]);

  const officialPosts = posts.filter(
    (p) => p.authorType === "Official" || p.name === "Karta Connect",
  );

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Please select a JPG, PNG or WebP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5 MB.");
      return;
    }

    if (!user?.id) {
      setError("Unable to identify your admin account.");
      return;
    }

    const extension = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    }[file.type];

    const filePath = `${user.id}/avatar-${Date.now()}.${extension}`;
    let uploaded = false;

    try {
      setAvatarUploading(true);
      setError("");
      setSaved(false);

      const { error: uploadError } = await supabase.storage
        .from("profile-media")
        .upload(filePath, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      uploaded = true;

      const { data } = supabase.storage
        .from("profile-media")
        .getPublicUrl(filePath);

      if (!data?.publicUrl) {
        throw new Error("Unable to generate the profile photo URL.");
      }

      await updateUserProfile(user.id, {
        avatar_url: data.publicUrl,
      });

      await refreshProfile();
      try {
        await logAdminActivity({
          action: "avatar_updated",
          targetType: "admin_profile",
          targetId: user.id,
          targetLabel: "Administrator profile photo",
        });
      } catch (logError) {
        console.error("Avatar activity logging failed:", logError);
      }

      setSaved(true);
    } catch (err) {
      if (uploaded) {
        await supabase.storage.from("profile-media").remove([filePath]);
      }

      setError(err.message || "Unable to upload profile photo.");
    } finally {
      setAvatarUploading(false);
    }
  };
  const handleCoverChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Please select a JPG, PNG or WebP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Cover image must be less than 5 MB.");
      return;
    }

    if (!user?.id) {
      setError("Unable to identify your admin account.");
      return;
    }

    const extension = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    }[file.type];

    const filePath = `${user.id}/cover-${Date.now()}.${extension}`;
    let uploaded = false;

    try {
      setCoverUploading(true);
      setError("");
      setSaved(false);

      const { error: uploadError } = await supabase.storage
        .from("profile-media")
        .upload(filePath, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      uploaded = true;

      const { data } = supabase.storage
        .from("profile-media")
        .getPublicUrl(filePath);

      if (!data?.publicUrl) {
        throw new Error("Unable to generate the cover image URL.");
      }

      await updateUserProfile(user.id, {
        cover_url: data.publicUrl,
      });

      await refreshProfile();

      try {
        await logAdminActivity({
          action: "cover_updated",
          targetType: "admin_profile",
          targetId: user.id,
          targetLabel: "Administrator cover image",
        });
      } catch (logError) {
        console.error("Cover activity logging failed:", logError);
      }

      setSaved(true);
    } catch (err) {
      if (uploaded) {
        await supabase.storage.from("profile-media").remove([filePath]);
      }

      setError(err.message || "Unable to upload cover image.");
    } finally {
      setCoverUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) {
      setError("Unable to identify your admin account.");
      return;
    }

    if (!name.trim()) {
      setError("Full name cannot be empty.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSaved(false);

      await updateUserProfile(user.id, {
        full_name: name.trim(),
      });

      await refreshProfile();
      try {
        await logAdminActivity({
          action: "profile_updated",
          targetType: "admin_profile",
          targetId: user.id,
          targetLabel: "Administrator profile",
          details: {
            updatedFields: ["full_name"],
          },
        });
      } catch (logError) {
        console.error("Profile activity logging failed:", logError);
      }
      setEditing(false);
      setSaved(true);
    } catch (err) {
      setError(err.message || "Unable to save your profile.");
    } finally {
      setSaving(false);
    }
  };
  const activityMeta = {
    profile_updated: {
      label: "Profile information updated",
      category: "Profile",
      icon: UserRound,
    },
    avatar_updated: {
      label: "Profile photo changed",
      category: "Profile",
      icon: ImageIcon,
    },
    cover_updated: {
      label: "Cover image changed",
      category: "Profile",
      icon: ImageIcon,
    },
    password_changed: {
      label: "Password changed",
      category: "Security",
      icon: ShieldCheck,
    },
    security_updated: {
      label: "Security settings updated",
      category: "Security",
      icon: ShieldCheck,
    },
    scholar_approved: {
      label: "Scholar approved",
      category: "Management",
      icon: GraduationCap,
    },
    organization_verified: {
      label: "Organization verified",
      category: "Management",
      icon: Building2,
    },
    job_created: {
      label: "Job created",
      category: "Management",
      icon: BriefcaseBusiness,
    },
  };

  const filteredActivities = adminActivities.filter((activity) => {
    if (activityFilter === "All") return true;

    const category = activityMeta[activity.action]?.category || "Management";

    return category === activityFilter;
  });
  const accountStatus = profile?.account_status || "Unknown";
  const emailVerified = Boolean(user?.email_confirmed_at);

  return (
    <div className="admin-profile-page">
      <div className="admin-profile-page-head">
        <div>
          <span className="overline">YOUR ADMIN ACCOUNT</span>
          <h1>Admin profile</h1>
          <p>
            Manage the identity and account information associated with your
            Karta workspace.
          </p>
        </div>

        <Btn
          kind={editing ? "blue" : "outline"}
          onClick={() => {
            if (editing) {
              handleSave();
            } else {
              setName(profile?.full_name || "");
              setEditing(true);
              setSaved(false);
              setError("");
            }
          }}
        >
          {saving ? "Saving..." : editing ? "Save changes" : "Edit profile"}
          <Pencil size={15} />
        </Btn>
      </div>

      <section className="admin-profile-hero">
        <div
          className="admin-profile-cover-image"
          style={
            profile?.cover_url
              ? {
                  backgroundImage: `url("${profile.cover_url}")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        >
          <input
            ref={coverInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleCoverChange}
            style={{ display: "none" }}
          />

          <button
            type="button"
            className="admin-cover-upload"
            onClick={() => coverInputRef.current?.click()}
            disabled={coverUploading}
            title={coverUploading ? "Uploading cover..." : "Change cover image"}
            aria-label="Change cover image"
          >
            <Camera size={17} />
          </button>
        </div>

        <div className="admin-profile-main">
          <div className="admin-profile-avatar-wrap">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Admin profile" />
            ) : (
              <div className="admin-profile-avatar-fallback">
                {(profile?.full_name || "K").charAt(0).toUpperCase()}
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              style={{ display: "none" }}
            />

            {/* Existing Change photo control */}
            <button
              type="button"
              className="admin-profile-avatar-edit"
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarUploading}
              title={
                avatarUploading ? "Uploading photo..." : "Change profile photo"
              }
              aria-label="Change profile photo"
            >
              <Camera size={17} />
            </button>
          </div>

          <div className="admin-profile-heading">
            <h2>
              {profile?.full_name || "Administrator"}
              <ShieldCheck size={17} />
            </h2>

            <p>{profile?.role || "Administrator"}</p>

            <span>
              <Mail size={14} />
              {profile?.email || user?.email || "No email available"}
            </span>
          </div>

          <Tag tone="green">{accountStatus}</Tag>
        </div>
      </section>

      <nav className="admin-profile-tabs">
        {["Overview", "Activity", "Security"].map((t) => (
          <button
            key={t}
            className={tab === t ? "active" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </nav>

      {saved && (
        <div className="admin-profile-saved">
          <CheckCircle2 size={16} />
          Profile successfully updated.
        </div>
      )}

      {error && (
        <div className="admin-profile-saved">
          <ShieldAlert size={16} />
          {error}
        </div>
      )}

      {tab === "Activity" ? (
        <section className="admin-panel admin-profile-activity">
          <div className="admin-panel-head">
            <div>
              <span className="overline">YOUR ACCOUNT HISTORY</span>
              <h2>Admin activity</h2>
            </div>

            <div className="admin-activity-actions">
              <button
                type="button"
                className="admin-activity-refresh"
                onClick={loadActivities}
                disabled={activityLoading}
              >
                <RefreshCw
                  size={15}
                  className={activityLoading ? "admin-refresh-spinning" : ""}
                />
                {activityLoading ? "Refreshing..." : "Refresh"}
              </button>

              <Btn kind="blue" onClick={() => setPage?.("Home")}>
                Go to admin home <ArrowRight size={14} />
              </Btn>
            </div>
          </div>

          <p className="admin-activity-intro">
            Actions performed through your administrator account.
          </p>

          <div className="admin-activity-count">
            <b>{adminActivities.length}</b>
            <span>recorded actions</span>
          </div>

          <div className="admin-activity-filters">
            {["All", "Profile", "Security", "Management"].map((filter) => (
              <button
                key={filter}
                type="button"
                className={activityFilter === filter ? "active" : ""}
                onClick={() => setActivityFilter(filter)}
              >
                {filter}
                {filter === "All" && <span>{adminActivities.length}</span>}
              </button>
            ))}
          </div>

          {activityLoading ? (
            <div className="admin-activity-message">
              <Clock3 size={20} />
              <p>Loading your activity...</p>
            </div>
          ) : activityError ? (
            <div className="admin-activity-message" role="alert">
              <ShieldAlert size={20} />
              <p>{activityError}</p>
              <button type="button" onClick={loadActivities}>
                Try again
              </button>
            </div>
          ) : filteredActivities.length ? (
            <div className="admin-activity-history">
              {filteredActivities.map((activity) => {
                const meta = activityMeta[activity.action] || {
                  label: activity.action.replaceAll("_", " "),
                  category: "Management",
                  icon: Clock3,
                };

                const ActivityIcon = meta.icon;

                return (
                  <article key={activity.id} className="admin-activity-item">
                    <span className="admin-activity-icon">
                      <ActivityIcon size={18} />
                    </span>

                    <div className="admin-activity-content">
                      <div className="admin-activity-title-row">
                        <b>{meta.label}</b>
                        <span className="admin-activity-category">
                          {meta.category}
                        </span>
                      </div>

                      {activity.target_label && <p>{activity.target_label}</p>}

                      <small>
                        {new Date(activity.created_at).toLocaleString()}
                      </small>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="kp-activity-empty">
              <Clock3 size={24} />
              <h3>
                {adminActivities.length
                  ? "No activities in this category"
                  : "No admin actions recorded yet"}
              </h3>
              <p>
                {adminActivities.length
                  ? "Try selecting another activity filter."
                  : "Your administrator actions will appear here."}
              </p>
            </div>
          )}
        </section>
      ) : tab === "Security" ? (
        <section className="admin-panel admin-profile-security admin-security-standalone">
          <div className="admin-panel-head">
            <div>
              <span className="overline">ACCOUNT & ACCESS</span>
              <h2>Security overview</h2>
            </div>
          </div>

          <div className="admin-security-row">
            <span>
              <ShieldCheck size={18} />
            </span>
            <div>
              <b>Administrator access</b>
              <small>Account status: {accountStatus}</small>
            </div>
            <Tag tone={accountStatus === "active" ? "green" : "orange"}>
              {accountStatus}
            </Tag>
          </div>

          <div className="admin-security-row">
            <span>
              <Mail size={18} />
            </span>
            <div>
              <b>Email verification</b>
              <small>
                {emailVerified
                  ? "Your email address is verified."
                  : "Your email address is not verified."}
              </small>
            </div>
            <Tag tone={emailVerified ? "green" : "orange"}>
              {emailVerified ? "Verified" : "Unverified"}
            </Tag>
          </div>

          <p className="admin-security-note">
            Your role and account status are managed through the platform's
            authorization system.
          </p>
        </section>
      ) : (
        <div className="admin-profile-content-grid">
          <section className="admin-panel admin-profile-about">
            <div className="admin-panel-head">
              <div>
                <span className="overline">ABOUT</span>
                <h2>Administrator account</h2>
              </div>
            </div>

            <p>
              This is your official Karta Connect administrator account. Your
              account identity and access details are managed securely through
              Supabase.
            </p>
          </section>

          <section className="admin-panel">
            <div className="admin-panel-head">
              <div>
                <span className="overline">ACCOUNT DETAILS</span>
                <h2>Profile information</h2>
              </div>
            </div>

            <div className="admin-profile-fields">
              <label>
                Full name
                {editing ? (
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                ) : (
                  <b>{profile?.full_name || "Not added"}</b>
                )}
              </label>

              <label>
                Work email
                <b>{profile?.email || user?.email || "Not available"}</b>
              </label>

              <label>
                Role
                <b>{profile?.role || "Not available"}</b>
              </label>

              <label>
                Account status
                <b>{accountStatus}</b>
              </label>

              <label>
                Member since
                <b>
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString()
                    : "Not available"}
                </b>
              </label>
            </div>
          </section>

          <section className="admin-panel admin-profile-security">
            <div className="admin-panel-head">
              <div>
                <span className="overline">ACCOUNT & ACCESS</span>
                <h2>Security overview</h2>
              </div>
            </div>

            <div className="admin-security-row">
              <span>
                <ShieldCheck size={18} />
              </span>
              <div>
                <b>Administrator access</b>
                <small>Your account status is {accountStatus}.</small>
              </div>
              <Tag tone="green">{accountStatus}</Tag>
            </div>

            <div className="admin-security-row">
              <span>
                <Mail size={18} />
              </span>
              <div>
                <b>Email verification</b>
                <small>
                  {emailVerified ? "Verified email" : "Email not verified"}
                </small>
              </div>
              <Tag tone={emailVerified ? "green" : "orange"}>
                {emailVerified ? "Verified" : "Unverified"}
              </Tag>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export function AdminWorkspace({
  page,
  setPage,
  posts,
  setPosts,
    onDeletePost,

  onViewScholar = () => {},
  onViewOrganization = () => {},
}) {
  const [scholarRows, setScholarRows] = useState(initialAdminScholars);
  const [scholarLoading, setScholarLoading] = useState(true);
  const [scholarError, setScholarError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadScholars() {
      try {
        setScholarLoading(true);
        setScholarError("");

        const rows = await getScholarInvites();
        console.log("SCHOLAR IMAGE DEBUG:", rows.map(x => ({
  name: x.name,
  image: x.image
})));

        if (mounted) setScholarRows(rows);
      } catch (error) {
        if (mounted) setScholarError(error.message);
      } finally {
        if (mounted) setScholarLoading(false);
      }
    }

    loadScholars();

    return () => {
      mounted = false;
    };
  }, []);
  const [orgRows, setOrgRows] = useState(initialAdminOrgs);
  const [reports, setReports] = useState(initialReports);
  const [moderationFilter, setModerationFilter] = useState("All reports");
  const [caseRows, setCaseRows] = useState(
    initialReports.map((r, i) => ({
      ...r,
      caseId: `KRT-${2401 + i}`,
      severity: i === 1 ? "High" : "Medium",
      assignee: "Unassigned",
      evidence: [],
      notes: "",
      resolution: "",
    })),
  );
  const [caseFilter, setCaseFilter] = useState("All cases");
  const [activeCase, setActiveCase] = useState(null);
  const [caseDraft, setCaseDraft] = useState({
    severity: "Medium",
    assignee: "Karta Admin",
    notes: "",
    resolution: "",
  });
  const [warningTarget, setWarningTarget] = useState(null);
  const [warningRows, setWarningRows] = useState([]);
  const [warningDraft, setWarningDraft] = useState({
    reason: "Community guideline reminder",
    message: "",
  });
  const [appealRows, setAppealRows] = useState([
    {
      id: 1,
      caseId: "KRT-2398",
      name: "Demo scholar",
      entity: "Scholar",
      reason: "I believe my account was restricted by mistake.",
      status: "Pending",
      date: "Today",
    },
  ]);
  const [appealFilter, setAppealFilter] = useState("Pending");
  const [enforcementTarget, setEnforcementTarget] = useState(null);
  const [enforcementDraft, setEnforcementDraft] = useState({
    action: "Restricted",
    reason: "Spam or misleading activity",
    duration: "7 days",
    note: "",
  });

  const [audit, setAudit] = useState([
    {
      id: 1,
      action: "Organization approval reviewed",
      actor: "Karta Admin",
      target: "Greenfield Research",
      time: "Today · 09:40",
    },
    {
      id: 2,
      action: "Scholar invitation prepared",
      actor: "Karta Admin",
      target: "Meera Kapoor",
      time: "Yesterday · 16:20",
    },
  ]);
  const [query, setQuery] = useState(""),
    [statusFilter, setStatusFilter] = useState("All");
  const [modal, setModal] = useState(false),
    [draft, setDraft] = useState({
      name: "",
      email: "",
      institution: "",
      field: "",
      year: "2027",
    });
  const [fileName, setFileName] = useState(""),
    [importRows, setImportRows] = useState([]),
    [importMessage, setImportMessage] = useState("");
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [orgModal, setOrgModal] = useState(false);
  const [orgDraft, setOrgDraft] = useState({
    name: "",
    email: "",
    industry: "",
    location: "",
    website: "",
    size: "",
    about: "",
    logo: "",
  });
  const [scholarTab, setScholarTab] = useState("Directory");
  const [selectedScholar, setSelectedScholar] = useState(null);
  const [feedText, setFeedText] = useState("");
  const [feedImage, setFeedImage] = useState("");
  const [adminAccounts, setAdminAccounts] = useState([
    {
      id: 1,
      name: "Karta Super Admin",
      email: "superadmin@karta.example",
      level: "Super Admin",
      status: "Active",
      protected: true,
    },
    {
      id: 2,
      name: "Karta Admin",
      email: "admin@karta.example",
      level: "Admin",
      status: "Active",
    },
  ]);
  const [adminDraft, setAdminDraft] = useState({
    name: "",
    email: "",
    level: "Admin",
    department: "Platform Operations",
  });
  const [adminModal, setAdminModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const log = (action, target) =>
    setAudit((v) => [
      {
        id: Date.now(),
        action,
        actor: "Karta Admin",
        target,
        time: "Just now",
      },
      ...v,
    ]);

  const [postRows, setPostRows] = useState([]);
  const [postLoading, setPostLoading] = useState(false);
  const [postError, setPostError] = useState("");
  const [postSearch, setPostSearch] = useState("");
  const [postAuthorFilter, setPostAuthorFilter] = useState("All");
  const [postStatusFilter, setPostStatusFilter] = useState("All");
  const [editingPost, setEditingPost] = useState(null);
const [editContent, setEditContent] = useState("");
const [editSaving, setEditSaving] = useState(false);
const [editImageFile, setEditImageFile] = useState(null);
const [editRemoveImage, setEditRemoveImage] = useState(false);

  const loadAdminPosts = async () => {
    try {
      setPostLoading(true);
      setPostError("");
      const rows = await getPosts();
      setPostRows(rows);
    } catch (error) {
      setPostError(error.message || "Unable to load posts.");
    } finally {
      setPostLoading(false);
    }
  };

  useEffect(() => {
    if (page === "Post Activity") loadAdminPosts();
  }, [page]);

  const changePostStatus = async (postId, status) => {
    try {
      await updatePostStatus(postId, status);
      await loadAdminPosts();
    } catch (error) {
      setPostError(error.message || "Unable to update post status.");
    }
  };

  const removeAdminPost = async (postId) => {
    if (
      !window.confirm("Are you sure you want to permanently delete this post?")
    )
      return;

    try {
      await deletePost(postId);
      await loadAdminPosts();
    } catch (error) {
      setPostError(error.message || "Unable to delete post.");
    }
  };


    const saveEditedPost = async () => {
    if (!editingPost) return;

    try {
      setEditSaving(true);
      setPostError("");

      await updatePost(editingPost.id, {
        content: editContent,
        imageFile: editImageFile,
        removeImage: editRemoveImage,
      });

      setEditingPost(null);
      setEditContent("");
      setEditImageFile(null);
      setEditRemoveImage(false);

      await loadAdminPosts();
    } catch (error) {
      setPostError(error.message || "Unable to update post.");
    } finally {
      setEditSaving(false);
    }
  };

  const filteredPostRows = postRows.filter((post) => {
    const author = post.is_official
      ? "official"
      : (post.author_role || "").toLowerCase();

    const matchesAuthor =
      postAuthorFilter === "All" || author === postAuthorFilter.toLowerCase();

    const matchesStatus =
      postStatusFilter === "All" ||
      post.status === postStatusFilter.toLowerCase();

    const searchText = [post.content, post.author_name, post.author_role]
      .join(" ")
      .toLowerCase();

    return (
      matchesAuthor &&
      matchesStatus &&
      searchText.includes(postSearch.toLowerCase())
    );
  });

  const addScholar = async () => {
    if (!draft.name.trim() || !draft.email.trim()) return;

    const email = draft.email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setScholarError("Enter a valid email address.");
      return;
    }

    try {
      setScholarError("");

      if (draft.id) {
        // Update an existing pending invitation.
        await updateScholarInvite(draft.id, {
          name: draft.name,
          email,
        });
      } else {
        // Save the authorized invitation first.
        await createScholarInvite({
          name: draft.name,
          email,
        });
      }

      // Refresh the directory regardless of email delivery.
      const rows = await getScholarInvites();
      setScholarRows(rows);

      setDraft({
        name: "",
        email: "",
        institution: "",
        field: "",
        year: "2027",
      });

      setModal(false);

      // Send the invitation email.
      try {
        await sendScholarInvitation({
          name: draft.name,
          email,
        });

        log(
          draft.id
            ? "Scholar invitation updated and email sent"
            : "Scholar invitation email sent",
          draft.name,
        );

        setScholarError("");
      } catch (emailError) {
        setScholarError(
          `Scholar was saved, but the invitation email could not be sent: ${emailError.message}`,
        );
      }
    } catch (error) {
      setScholarError(error.message);
    }
  };

  const addOrganization = () => {
    if (
      !orgDraft.name.trim() ||
      !orgDraft.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orgDraft.email.trim()) ||
      orgRows.some(
        (o) =>
          (o.email || "").toLowerCase() === orgDraft.email.trim().toLowerCase(),
      )
    )
      return;
    const row = {
      ...orgDraft,
      id: Date.now(),
      submitted: "Just now",
      status: "Pending",
      logo: "",
    };
    setOrgRows((v) => [row, ...v]);
    log("Organization added for verification", row.name);
    setOrgDraft({
      name: "",
      email: "",
      industry: "",
      location: "",
      website: "",
      size: "",
      about: "",
      logo: "",
    });
    setOrgModal(false);
  };
  const updateOrg = (id, status) => {
    setOrgRows((v) => v.map((o) => (o.id === id ? { ...o, status } : o)));
    const org = orgRows.find((o) => o.id === id);
    log(
      "Organization status changed to " + status,
      org?.name || "Organization",
    );
    setSelectedOrg(null);
  };
  const updateScholar = (id, status) => {
    const row = scholarRows.find((x) => x.id === id);
    setScholarRows((v) => v.map((x) => (x.id === id ? { ...x, status } : x)));
    log("Scholar status changed to " + status, row?.name || "Scholar");
  };

  const saveCase = () => {
    if (!activeCase) return;
    setCaseRows((v) =>
      v.map((c) => (c.id === activeCase.id ? { ...c, ...caseDraft } : c)),
    );
    log("Moderation case updated", activeCase.caseId);
    setActiveCase(null);
  };
  const issueWarning = (type, row) => {
    setWarningTarget({ type, id: row.id, name: row.name, email: row.email });
    setWarningDraft({ reason: "Community guideline reminder", message: "" });
  };
  const sendWarning = () => {
    if (!warningTarget) return;
    const warning = {
      id: Date.now(),
      ...warningTarget,
      ...warningDraft,
      date: new Date().toLocaleDateString(),
      status: "Issued",
    };
    setWarningRows((v) => [warning, ...v]);
    log(
      "Formal warning issued to " + warningTarget.type,
      warningTarget.name + " · " + warningDraft.reason,
    );
    setWarningTarget(null);
  };
  const openEnforcement = (type, row) => {
    setEnforcementTarget({
      type,
      id: row.id,
      name: row.name,
      email: row.email,
    });
    setEnforcementDraft({
      action: "Restricted",
      reason: "Spam or misleading activity",
      duration: "7 days",
      note: "",
    });
  };
  const applyEnforcement = () => {
    if (!enforcementTarget) return;
    const { type, id, name } = enforcementTarget;
    const { action, reason, duration, note } = enforcementDraft;
    const updater = type === "Scholar" ? setScholarRows : setOrgRows;
    updater((v) =>
      v.map((x) =>
        x.id === id
          ? {
              ...x,
              status:
                action === "Active" ? x.previousStatus || "Active" : action,
              previousStatus:
                action === "Active"
                  ? ""
                  : ["Restricted", "Suspended", "Blocked"].includes(x.status)
                    ? x.previousStatus || "Active"
                    : x.status,
              enforcementReason: action === "Active" ? "" : reason,
              enforcementDuration: action === "Active" ? "" : duration,
              enforcementNote: action === "Active" ? "" : note,
            }
          : x,
      ),
    );
    log(
      (action === "Active" ? "Access restored" : action + " applied") +
        " to " +
        type,
      name + " · " + (action === "Active" ? "Restriction lifted" : reason),
    );
    setEnforcementTarget(null);
  };
  const reviewAppeal = (id, status) => {
    setAppealRows((v) => v.map((a) => (a.id === id ? { ...a, status } : a)));
    log("Appeal " + status.toLowerCase(), `Appeal #${id}`);
  };
  const parseCsv = async (file) => {
    setFileName(file.name);
    setImportMessage("");
    const raw = (await file.text()).replace(/^\uFEFF/, "");
    const matrix = [];
    let row = [],
      cell = "",
      quoted = false;
    for (let i = 0; i < raw.length; i++) {
      const ch = raw[i];
      if (ch === '"') {
        if (quoted && raw[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = !quoted;
      } else if (ch === "," && !quoted) {
        row.push(cell.trim());
        cell = "";
      } else if ((ch === "\n" || ch === "\r") && !quoted) {
        if (ch === "\r" && raw[i + 1] === "\n") i++;
        row.push(cell.trim());
        if (row.some((v) => v !== "")) matrix.push(row);
        row = [];
        cell = "";
      } else cell += ch;
    }
    row.push(cell.trim());
    if (row.some((v) => v !== "")) matrix.push(row);
    if (!matrix.length) {
      setImportRows([]);
      setImportMessage("The selected CSV is empty.");
      return;
    }
    const headers = matrix[0].map((x) => x.trim().toLowerCase());
    const index = (names) => headers.findIndex((x) => names.includes(x));
    const nameIndex = index(["name", "full name", "scholar name"]);
    const emailIndex = index(["email", "email address"]);
    const institutionIndex = index(["institution", "university", "college"]);
    const fieldIndex = index(["field", "field of study", "course"]);
    const yearIndex = index(["year", "graduation year", "graduation"]);
    if (nameIndex < 0 || emailIndex < 0) {
      setImportRows([]);
      setImportMessage("CSV must include Name and Email columns.");
      return;
    }
    const existing = new Set(
      scholarRows.map((x) => (x.email || "").trim().toLowerCase()),
    );
    const seen = new Set();
    const parsed = matrix
      .slice(1)
      .map((cells, i) => {
        const name = cells[nameIndex] || "",
          email = (cells[emailIndex] || "").trim().toLowerCase();
        const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        let issue = !name
          ? "Name is missing"
          : !validEmail
            ? "Email is invalid"
            : existing.has(email)
              ? "Email already exists in Karta"
              : seen.has(email)
                ? "Duplicate email in this file"
                : "";
        if (email) seen.add(email);
        return {
          id: i + 1,
          name,
          email,
          institution:
            institutionIndex >= 0 ? cells[institutionIndex] || "" : "",
          field: fieldIndex >= 0 ? cells[fieldIndex] || "" : "",
          year: yearIndex >= 0 ? cells[yearIndex] || "2027" : "2027",
          valid: !issue,
          issue,
        };
      })
      .filter((x) => x.name || x.email);
    setImportRows(parsed);
    if (!parsed.length)
      setImportMessage("No scholar rows were found below the CSV header.");
  };
  const importValid = async () => {
    const fresh = importRows.filter((x) => x.valid);

    if (!fresh.length) return;

    try {
      setScholarError("");

      await createBulkScholarInvites(
        fresh.map(({ name, email }) => ({ name, email })),
      );

      const rows = await getScholarInvites();
      setScholarRows(rows);

      log("Bulk scholar import completed", `${fresh.length} scholars`);

      setImportMessage(
        `${fresh.length} scholar${fresh.length === 1 ? "" : "s"} added successfully.`,
      );

      setImportRows([]);
    } catch (error) {
      setImportMessage(`Import failed: ${error.message}`);
    }
  };
  const filteredScholars = scholarRows.filter(
    (x) =>
      (x.name + " " + x.email + " " + x.institution + " " + x.field)
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (statusFilter === "All" || x.status === statusFilter),
  );
  const filteredOrgs = orgRows.filter(
    (x) =>
      (x.name + " " + x.email + " " + x.industry)
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (statusFilter === "All" || x.status === statusFilter),
  );
  const stats = {
    scholars: scholarRows.length,
    orgs: orgRows.length,
    pending: orgRows.filter((x) =>
      ["Pending", "Under review"].includes(x.status),
    ).length,
    reports: reports.filter((x) => x.status === "Open").length,
  };
  const heading = (eyebrow, title, sub, action) => (
    <PageHead eyebrow={eyebrow} title={title} sub={sub} action={action} />
  );
  const searchBar = (
    <div className="admin-toolbar">
      <div className="search-inline">
        <Search size={16} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email or organization..."
        />
      </div>
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option>All</option>
        {(page === "Organizations"
          ? [
              "Pending",
              "Under review",
              "Approved",
              "Rejected",
              "Restricted",
              "Suspended",
              "Blocked",
            ]
          : [
              "Active",
              "Pending",
              "Invited",
              "Restricted",
              "Suspended",
              "Blocked",
            ]
        ).map((x) => (
          <option key={x}>{x}</option>
        ))}
      </select>
    </div>
  );
  return (
    <div className="admin-workspace">
      {page === "Overview" && (
        <>
          {heading(
            "PLATFORM CONTROL CENTRE",
            "A clear view of the Karta community.",
            "Manage scholars, verify organizations and keep the platform healthy.",
          )}
          <div className="admin-stat-grid">
            <button onClick={() => setPage("Scholars")}>
              <span className="admin-stat-icon blue">
                <GraduationCap />
              </span>
              <b>{stats.scholars.toLocaleString("en-IN")}</b>
              <small>Registered scholars</small>
              <em>
                Manage scholars <ArrowRight size={13} />
              </em>
            </button>
            <button onClick={() => setPage("Organizations")}>
              <span className="admin-stat-icon green">
                <Building2 />
              </span>
              <b>{stats.orgs}</b>
              <small>Organizations</small>
              <em>
                Review organizations <ArrowRight size={13} />
              </em>
            </button>
            <button
              onClick={() => {
                setPage("Organizations");
                setStatusFilter("Pending");
              }}
            >
              <span className="admin-stat-icon orange">
                <Clock3 />
              </span>
              <b>{stats.pending}</b>
              <small>Pending verification</small>
              <em>
                Review submissions <ArrowRight size={13} />
              </em>
            </button>
            <button onClick={() => setPage("Moderation")}>
              <span className="admin-stat-icon purple">
                <ShieldCheck />
              </span>
              <b>{stats.reports}</b>
              <small>Open reports</small>
              <em>
                Open moderation <ArrowRight size={13} />
              </em>
            </button>
          </div>
          <div className="admin-overview-grid">
            <section className="admin-panel">
              <div className="admin-panel-head">
                <div>
                  <span className="overline">NEEDS YOUR ATTENTION</span>
                  <h2>Organization reviews</h2>
                </div>
                <button onClick={() => setPage("Organizations")}>
                  View all <ArrowRight size={14} />
                </button>
              </div>
              {orgRows
                .filter((x) => x.status !== "Approved")
                .slice(0, 3)
                .map((o) => (
                  <div className="admin-review-row" key={o.id}>
                    <span className="admin-org-avatar">
                      <Building2 size={18} />
                    </span>
                    <div>
                      <b>{o.name}</b>
                      <small>
                        {o.industry} · {o.submitted}
                      </small>
                    </div>
                    <Tag tone="orange">{o.status}</Tag>
                    <button
                      onClick={() => {
                        setPage("Organizations");
                        setSelectedOrg(o);
                      }}
                    >
                      Review
                    </button>
                  </div>
                ))}
            </section>
            <section className="admin-panel">
              <div className="admin-panel-head">
                <div>
                  <span className="overline">QUICK ACTIONS</span>
                  <h2>Keep things moving</h2>
                </div>
              </div>
              <button
                className="admin-quick-action"
                onClick={() => setModal(true)}
              >
                <Plus />
                <span>
                  <b>Add a scholar</b>
                  <small>
                    Create an authorized scholar record and prepare an
                    invitation.
                  </small>
                </span>
                <ArrowRight />
              </button>
              <button
                className="admin-quick-action"
                onClick={() => setPage("Bulk upload")}
              >
                <Upload />
                <span>
                  <b>Bulk import scholars</b>
                  <small>
                    Import multiple scholars from a CSV spreadsheet.
                  </small>
                </span>
                <ArrowRight />
              </button>
              <button
                className="admin-quick-action"
                onClick={() => setPage("Moderation")}
              >
                <ShieldCheck />
                <span>
                  <b>Review reported content</b>
                  <small>Check reports and record moderation decisions.</small>
                </span>
                <ArrowRight />
              </button>
            </section>
          </div>
        </>
      )}
      {page === "Scholars" && (
        <>
          {heading(
            "SCHOLAR MANAGEMENT",
            "Manage your scholar community.",
            "A single workspace to add, invite, review and manage scholar profiles.",
            <Btn
              onClick={() => {
                setDraft({
                  name: "",
                  email: "",
                  institution: "",
                  field: "",
                  year: "2027",
                });
                setModal(true);
              }}
            >
              <Plus size={15} /> Add scholar
            </Btn>,
          )}
          <div className="admin-subtabs">
            {["Directory", "Add individually", "Bulk import"].map((t) => (
              <button
                  key={t}

                className={scholarTab === t ? "active" : ""}
                onClick={() => {
                  setScholarTab(t);
                  if (t === "Add individually") {
                    setDraft({
                      name: "",
                      email: "",
                      institution: "",
                      field: "",
                      year: "2027",
                    });
                    setModal(true);
                  }
                  if (t === "Bulk import") setPage("Bulk upload");
                }}
              >
                {t}
              </button>
            ))}
          </div>
          {searchBar}

          {scholarLoading && <p>Loading scholars from Supabase...</p>}

          {scholarError && (
            <p role="alert" style={{ color: "#c0392b" }}>
              {scholarError}
            </p>
          )}

          <div className="admin-panel">
            <div className="admin-panel-head">
              <div>
                <h2>{filteredScholars.length} scholars</h2>
                <small>
                  Only authorized scholars should be able to activate an
                  account.
                </small>
              </div>
            </div>
            <div className="admin-data-table">
              <div className="admin-data-row header">
                <span>Scholar</span>
                <span>Institution / field</span>
                <span>Status</span>
                <span>Actions</span>
              </div>
              {filteredScholars.map((x) => (
                <div className="admin-data-row" key={x.id}>
                  <div className="admin-scholar-cell">
                    <Avatar
                      src={x.image}
                      initials={x.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    />
                    <span>
                      <button
                        className="admin-name-profile-link"
                        onClick={() => onViewScholar(x)}
                      >
                        {x.name}
                      </button>
                      <small>{x.email}</small>
                    </span>
                  </div>
                  <div>
                    {x.institution || "Not provided"}
                    <small>
                      {x.field || "Field not provided"} · Class of {x.year}
                    </small>
                  </div>
                  <Tag
                    tone={
                      x.status === "Active"
                        ? "green"
                        : x.status === "Suspended"
                          ? "orange"
                          : "blue"
                    }
                  >
                    {x.status}
                  </Tag>
                  <div className="admin-row-actions">
                    <button onClick={() => issueWarning("Scholar", x)}>
                      <Mail size={14} /> Warn
                    </button>
                    <button onClick={() => openEnforcement("Scholar", x)}>
                      <ShieldAlert size={14} />{" "}
                      {["Restricted", "Suspended", "Blocked"].includes(x.status)
                        ? "Manage access"
                        : "Restrict / block"}
                    </button>
                    {x.status === "Invited" && (
                      <button
                        onClick={() =>
                          log("Invitation reminder prepared", x.name)
                        }
                      >
                        <Send size={14} /> Remind
                      </button>
                    )}
                    <button onClick={() => onViewScholar(x)}>
                      <Eye size={14} /> View full profile
                    </button>
                    <button
                      onClick={() => {
                        setDraft({ ...x });
                        setModal(true);
                      }}
                    >
                      <Pencil size={14} /> Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      {page === "Organizations" && (
        <>
          {heading(
            "ORGANIZATION DIRECTORY",
            "Build a trusted organization network.",
            "Add organizations, review their details and manage verification access.",
            <Btn onClick={() => setOrgModal(true)}>
              <Plus size={15} /> Add organization
            </Btn>,
          )}{" "}
          {searchBar}
          <div className="admin-panel">
            <div className="admin-data-table">
              <div className="admin-data-row org header">
                <span>Organization</span>
                <span>Industry / location</span>
                <span>Status</span>
                <span>Review</span>
              </div>
              {filteredOrgs.map((o) => (
                <div className="admin-data-row org" key={o.id}>
                  <div className="admin-org-directory-cell">
                    <span className="admin-org-dp">
                      {o.logo ? (
                        <img
                          src={o.logo}
                          alt=""
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.parentElement.classList.add(
                              "logo-fallback",
                            );
                          }}
                        />
                      ) : (
                        <span className="admin-org-initials">
                          {o.name
                            .split(/\s+/)
                            .map((x) => x[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </span>
                      )}
                    </span>
                    <span>
                      <button
                        className="admin-name-profile-link"
                        onClick={() => onViewOrganization(o)}
                      >
                        {o.name}
                      </button>
                      <small>{o.email}</small>
                    </span>
                  </div>
                  <div>
                    {o.industry}
                    <small>{o.location}</small>
                  </div>
                  <Tag
                    tone={
                      o.status === "Approved"
                        ? "green"
                        : o.status === "Rejected"
                          ? "orange"
                          : "blue"
                    }
                  >
                    {o.status}
                  </Tag>
                  <div className="admin-row-actions">
                    <button onClick={() => onViewOrganization(o)}>
                      <Eye size={14} /> View full profile
                    </button>
                    {o.status !== "Approved" && (
                      <button onClick={() => updateOrg(o.id, "Approved")}>
                        <Check size={14} /> Approve
                      </button>
                    )}
                    <button onClick={() => issueWarning("Organization", o)}>
                      <Mail size={14} /> Warn
                    </button>
                    <button onClick={() => openEnforcement("Organization", o)}>
                      <ShieldAlert size={14} /> Access
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {orgModal && (
            <div className="admin-modal-backdrop">
              <section className="admin-modal">
                <button
                  className="admin-modal-close"
                  onClick={() => setOrgModal(false)}
                >
                  <X />
                </button>
                <span className="overline">ORGANIZATION ONBOARDING</span>
                <h2>Add an organization</h2>
                <p>
                  Create an organization record. It will enter the pending
                  verification queue.
                </p>
                <div className="admin-form-grid">
                  <label className="span-two admin-org-logo-upload">
                    Organization logo / display photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          const r = new FileReader();
                          r.onload = () =>
                            setOrgDraft((v) => ({
                              ...v,
                              logo: String(r.result),
                            }));
                          r.readAsDataURL(f);
                        }
                      }}
                    />
                    {orgDraft.logo && (
                      <img
                        src={orgDraft.logo}
                        alt="Organization logo preview"
                      />
                    )}
                  </label>
                  <label>
                    Organization name
                    <input
                      value={orgDraft.name}
                      onChange={(e) =>
                        setOrgDraft((v) => ({ ...v, name: e.target.value }))
                      }
                    />
                  </label>
                  <label>
                    Contact email
                    <input
                      type="email"
                      value={orgDraft.email}
                      onChange={(e) =>
                        setOrgDraft((v) => ({ ...v, email: e.target.value }))
                      }
                    />
                  </label>
                  <label>
                    Industry
                    <input
                      value={orgDraft.industry}
                      onChange={(e) =>
                        setOrgDraft((v) => ({ ...v, industry: e.target.value }))
                      }
                    />
                  </label>
                  <label>
                    Location
                    <input
                      value={orgDraft.location}
                      onChange={(e) =>
                        setOrgDraft((v) => ({ ...v, location: e.target.value }))
                      }
                    />
                  </label>
                  <label>
                    Website
                    <input
                      value={orgDraft.website}
                      onChange={(e) =>
                        setOrgDraft((v) => ({ ...v, website: e.target.value }))
                      }
                    />
                  </label>
                  <label>
                    Organization size
                    <input
                      value={orgDraft.size}
                      onChange={(e) =>
                        setOrgDraft((v) => ({ ...v, size: e.target.value }))
                      }
                    />
                  </label>
                  <label className="span-two">
                    About
                    <textarea
                      value={orgDraft.about}
                      onChange={(e) =>
                        setOrgDraft((v) => ({ ...v, about: e.target.value }))
                      }
                    />
                  </label>
                </div>
                {orgRows.some(
                  (o) =>
                    (o.email || "").toLowerCase() ===
                    orgDraft.email.trim().toLowerCase(),
                ) &&
                  orgDraft.email && (
                    <small className="admin-duplicate-warning">
                      An organization with this email already exists.
                    </small>
                  )}
                <div className="admin-modal-actions">
                  <Btn kind="outline" onClick={() => setOrgModal(false)}>
                    Cancel
                  </Btn>
                  <Btn
                    disabled={
                      !orgDraft.name.trim() ||
                      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                        orgDraft.email.trim(),
                      ) ||
                      orgRows.some(
                        (o) =>
                          (o.email || "").toLowerCase() ===
                          orgDraft.email.trim().toLowerCase(),
                      )
                    }
                    onClick={addOrganization}
                  >
                    <Plus size={14} /> Add for verification
                  </Btn>
                </div>
              </section>
            </div>
          )}
          {selectedOrg && (
            <div className="admin-modal-backdrop">
              <section className="admin-modal admin-entity-profile-modal">
                <button
                  className="admin-modal-close"
                  onClick={() => setSelectedOrg(null)}
                  aria-label="Close organization profile"
                >
                  <X />
                </button>
                <span className="overline">ORGANIZATION · FULL PROFILE</span>
                <div className="admin-entity-profile-hero">
                  <span className="admin-org-profile-icon">
                    {selectedOrg.logo ? (
                      <img
                        src={selectedOrg.logo}
                        alt={`${selectedOrg.name} logo`}
                      />
                    ) : (
                      <Building2 size={28} />
                    )}
                  </span>
                  <div>
                    <h2>{selectedOrg.name}</h2>
                    <p>
                      {selectedOrg.industry || "Industry not provided"} ·{" "}
                      {selectedOrg.location || "Location not provided"}
                    </p>
                    <Tag
                      tone={
                        selectedOrg.status === "Approved"
                          ? "green"
                          : selectedOrg.status === "Rejected"
                            ? "orange"
                            : "blue"
                      }
                    >
                      {selectedOrg.status}
                    </Tag>
                  </div>
                </div>
                <div className="admin-entity-profile-section">
                  <h3>About the organization</h3>
                  <p>
                    {selectedOrg.about ||
                      "This organization has not added an About description yet."}
                  </p>
                </div>
                <div className="admin-entity-profile-section">
                  <h3>Organization details</h3>
                  <div className="admin-profile-details">
                    <div>
                      <small>Contact email</small>
                      <b>{selectedOrg.email || "Not provided"}</b>
                    </div>
                    <div>
                      <small>Website</small>
                      <b>
                        {selectedOrg.website ? (
                          <a
                            href={selectedOrg.website}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {selectedOrg.website}
                          </a>
                        ) : (
                          "Not provided"
                        )}
                      </b>
                    </div>
                    <div>
                      <small>Industry</small>
                      <b>{selectedOrg.industry || "Not provided"}</b>
                    </div>
                    <div>
                      <small>Location</small>
                      <b>{selectedOrg.location || "Not provided"}</b>
                    </div>
                    <div>
                      <small>Organization size</small>
                      <b>{selectedOrg.size || "Not provided"}</b>
                    </div>
                    <div>
                      <small>Submitted</small>
                      <b>{selectedOrg.submitted || "Not recorded"}</b>
                    </div>
                  </div>
                </div>
                <div className="admin-entity-profile-section">
                  <h3>Verification & access</h3>
                  <div className="admin-detail-line">
                    <b>Verification status</b>
                    <span>{selectedOrg.status}</span>
                  </div>
                  <div className="admin-detail-line">
                    <b>Verification documents</b>
                    <span>
                      Document preview will be available when secure document
                      storage is connected.
                    </span>
                  </div>
                </div>
                <div className="admin-modal-actions">
                  <Btn kind="outline" onClick={() => setSelectedOrg(null)}>
                    Close profile
                  </Btn>
                  {selectedOrg.status !== "Rejected" &&
                    selectedOrg.status !== "Approved" && (
                      <Btn
                        kind="outline"
                        onClick={() => updateOrg(selectedOrg.id, "Rejected")}
                      >
                        Reject
                      </Btn>
                    )}
                  {selectedOrg.status !== "Approved" && (
                    <Btn onClick={() => updateOrg(selectedOrg.id, "Approved")}>
                      <Check size={14} /> Approve organization
                    </Btn>
                  )}
                </div>
              </section>
            </div>
          )}
        </>
      )}
      {page === "Bulk upload" && (
        <>
          {heading(
            "SCHOLAR ONBOARDING",
            "Bring your scholar list into Karta.",
            "Import a CSV with scholar names and email addresses.",
          )}
          <div className="admin-upload-panel">
            <div className="admin-upload-icon">
              <Upload size={25} />
            </div>
            <h2>Import scholars from a spreadsheet</h2>
            <p>
              Upload a CSV with required <b>Name</b> and <b>Email</b> columns.
              Institution, field of study and graduation year are optional.
              Review every row before adding scholars to the authorized list.
            </p>
            <a
              className="admin-csv-template"
              href="data:text/csv;charset=utf-8,Name%2CEmail%2CInstitution%2CField%2CGraduation%20Year%0AMeera%20Kapoor%2Cmeera%40example.com%2CExample%20University%2CComputer%20Science%2C2027"
              download="karta-scholars-template.csv"
            >
              <Download size={14} /> Download CSV template
            </a>
            <label className="admin-file-drop">
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={(e) =>
                  e.target.files?.[0] && parseCsv(e.target.files[0])
                }
              />
              <Upload />
              <b>{fileName || "Choose CSV file"}</b>
              <small>
                CSV · Name and Email required · Optional profile columns
                supported
              </small>
            </label>
            {importMessage && (
              <div className="admin-import-message">{importMessage}</div>
            )}
            {importRows.length > 0 && (
              <>
                <div className="admin-import-summary">
                  {importRows.length} rows ·{" "}
                  {importRows.filter((x) => x.valid).length} valid ·{" "}
                  {importRows.filter((x) => !x.valid).length} invalid
                </div>
                <div className="admin-import-preview">
                  {importRows.slice(0, 10).map((x) => (
                    <div key={x.id}>
                      <span>{x.name || "Missing name"}</span>
                      <span>{x.email || "Missing email"}</span>
                      <span className="admin-import-row-status">
                        <Tag tone={x.valid ? "green" : "orange"}>
                          {x.valid ? "Ready" : "Skipped"}
                        </Tag>
                        {x.issue && <small>{x.issue}</small>}
                      </span>
                    </div>
                  ))}
                </div>
                <Btn onClick={importValid}>
                  <Check size={15} /> Import valid scholars
                </Btn>
              </>
            )}
          </div>
        </>
      )}

      {page === "Community feed" && (
        <>
          {heading(
            "KARTA COMMUNITY",
            "The official Karta voice.",
            "Publish platform announcements, opportunities and community updates that appear in the Scholar feed.",
            <Tag tone="green">Official account</Tag>,
          )}
          <section className="admin-feed-composer">
            <div className="admin-feed-author">
              <span className="admin-brand-avatar">k.</span>
              <div>
                <b>Karta Connect</b>
                <small>
                  Official platform announcement · Visible in Scholar feed
                </small>
              </div>
            </div>
            <textarea
              value={feedText}
              onChange={(e) => setFeedText(e.target.value)}
              placeholder="Share an announcement, opportunity, event or update with the Karta community..."
            />
            {feedImage && (
              <div className="admin-feed-image-preview">
                <img src={feedImage} />
                <button onClick={() => setFeedImage("")}>Remove image</button>
              </div>
            )}
            <div className="admin-feed-tools">
              <label>
                <ImageIcon size={16} /> Add image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      const r = new FileReader();
                      r.onload = () => setFeedImage(String(r.result));
                      r.readAsDataURL(f);
                    }
                  }}
                />
              </label>
              <Btn
                disabled={!feedText.trim()}
                onClick={() => {
                  setPosts((v) => [
                    {
                      id: Date.now(),
                      name: "Karta Connect",
                      field: "Official platform",
                      time: "Just now",
                      kind: "Official announcement",
                      text: feedText,
                      photo: feedImage || null,
                      likes: 0,
                      comments: 0,
                    },
                    ...v,
                  ]);
                  log("Official feed post published", "Karta Connect");
                  setFeedText("");
                  setFeedImage("");
                }}
              >
                <Send size={14} /> Publish to Scholar feed
              </Btn>
            </div>
          </section>
          <div className="admin-panel">
            <div className="admin-panel-head">
              <div>
                <h2>Published community posts</h2>
                <small>{posts.length} posts currently in the demo feed</small>
              </div>
            </div>
            {posts.map((p) => (
              <div className="admin-feed-row" key={p.id}>
                <div>
                  <b>{p.name || "Community member"}</b>
                  <small>
                    {p.field || "Karta community"} · {p.time || "Recently"}
                  </small>
                  <p>{p.text}</p>

{p.photo && (
  <div className="admin-feed-post-image">
    <img
      src={p.photo}
      alt="Community post"
    />
  </div>
)}
                </div>

               
       
<div 
  className="admin-feed-actions"
  style={{
    display: "flex",
    flexDirection: "row",
    flex: "0 0 auto",
    alignItems: "center",
    gap: "8px",
    whiteSpace: "nowrap",
    width: "auto"
  }}
>
  <button
    type="button"
    onClick={() => {
      setEditingPost(p);
      setEditContent(p.content || p.text || "");
      setEditImageFile(null);
      setEditRemoveImage(false);
    }}
  >
    <Pencil size={15} /> Edit
  </button>

  <button
    type="button"
    onClick={async () => {
      if (!window.confirm("Are you sure you want to permanently delete this post?")) return;

      try {
        await deletePost(p.id);
        setPosts((currentPosts) =>
          currentPosts.filter((post) => String(post.id) !== String(p.id))
        );
        log("Feed post removed", p.name || "Community post");
      } catch (error) {
        console.error("Failed to delete post:", error);
        alert(error.message || "Could not delete post.");
      }
    }}
  >
    <Trash2 size={15} /> Remove
  </button>
</div>

              </div>
            ))}
          </div>
        </>
      )}
      {page === "Moderation" && (
        <>
          {heading(
            "TRUST & SAFETY",
            "Moderation case management",
            "Investigate reports, document evidence, issue proportionate actions and review appeals.",
          )}
          <div className="admin-moderation-summary">
            <div>
              <b>{caseRows.filter((x) => x.status === "Open").length}</b>
              <span>Open cases</span>
            </div>
            <div>
              <b>{appealRows.filter((x) => x.status === "Pending").length}</b>
              <span>Pending appeals</span>
            </div>
            <div>
              <b>
                {
                  [...scholarRows, ...orgRows].filter((x) =>
                    ["Restricted", "Suspended", "Blocked"].includes(x.status),
                  ).length
                }
              </b>
              <span>Accounts actioned</span>
            </div>
          </div>
          <div className="admin-panel admin-case-panel">
            <div className="admin-panel-head">
              <div>
                <span className="overline">INVESTIGATION QUEUE</span>
                <h2>Moderation cases</h2>
                <small>
                  Each report should have an owner, severity, evidence and a
                  recorded outcome.
                </small>
              </div>
              <select
                value={caseFilter}
                onChange={(e) => setCaseFilter(e.target.value)}
              >
                <option>All cases</option>
                <option>Open</option>
                <option>Reviewed</option>
                <option>Action taken</option>
                <option>Resolved</option>
              </select>
            </div>
            {caseRows
              .filter(
                (c) => caseFilter === "All cases" || c.status === caseFilter,
              )
              .map((c) => (
                <div className="admin-case-row" key={c.id}>
                  <div className="admin-case-id">
                    {c.caseId}
                    <small>{c.date}</small>
                  </div>
                  <div className="admin-case-main">
                    <b>{c.target}</b>
                    <small>
                      Reported by {c.by} · {c.reason}
                    </small>
                    <small>Assigned: {c.assignee || "Unassigned"}</small>
                  </div>
                  <Tag
                    tone={
                      c.severity === "High"
                        ? "orange"
                        : c.severity === "Critical"
                          ? "red"
                          : "blue"
                    }
                  >
                    {c.severity}
                  </Tag>
                  <Tag
                    tone={
                      c.status === "Open"
                        ? "orange"
                        : c.status === "Resolved"
                          ? "green"
                          : "blue"
                    }
                  >
                    {c.status}
                  </Tag>
                  <button
                    className="admin-enforce-button"
                    onClick={() => {
                      setActiveCase(c);
                      setCaseDraft({
                        severity: c.severity || "Medium",
                        assignee: c.assignee || "Karta Admin",
                        notes: c.notes || "",
                        resolution: c.resolution || "",
                      });
                    }}
                  >
                    Open case
                  </button>
                </div>
              ))}
            {caseRows.length === 0 && (
              <p className="admin-empty-state">No reports yet.</p>
            )}
          </div>
          <div className="admin-panel admin-appeals-panel">
            <div className="admin-panel-head">
              <div>
                <span className="overline">APPEALS</span>
                <h2>Account restriction appeals</h2>
                <small>
                  Review appeals fairly before confirming or reversing an
                  action.
                </small>
              </div>
              <select
                value={appealFilter}
                onChange={(e) => setAppealFilter(e.target.value)}
              >
                <option>Pending</option>
                <option>Approved</option>
                <option>Declined</option>
                <option>All</option>
              </select>
            </div>
            {appealRows
              .filter(
                (a) => appealFilter === "All" || a.status === appealFilter,
              )
              .map((a) => (
                <div className="admin-case-row" key={a.id}>
                  <div className="admin-case-id">
                    APL-{a.id}
                    <small>{a.date}</small>
                  </div>
                  <div className="admin-case-main">
                    <b>
                      {a.name} · {a.entity}
                    </b>
                    <small>
                      {a.caseId} · {a.reason}
                    </small>
                  </div>
                  <Tag tone={a.status === "Pending" ? "orange" : "green"}>
                    {a.status}
                  </Tag>
                  {a.status === "Pending" && (
                    <div className="admin-appeal-actions">
                      <button onClick={() => reviewAppeal(a.id, "Approved")}>
                        Approve appeal
                      </button>
                      <button onClick={() => reviewAppeal(a.id, "Declined")}>
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            {appealRows.length === 0 && (
              <p className="admin-empty-state">No appeals submitted.</p>
            )}
          </div>
          <div className="admin-panel admin-warning-history">
            <div className="admin-panel-head">
              <div>
                <span className="overline">WARNING HISTORY</span>
                <h2>Formal warnings issued</h2>
                <small>Warnings recorded during this admin session.</small>
              </div>
              <Tag>{warningRows.length} issued</Tag>
            </div>
            {warningRows.map((w) => (
              <div className="admin-case-row" key={w.id}>
                <div className="admin-case-id">
                  WRN-{String(w.id).slice(-5)}
                  <small>{w.date}</small>
                </div>
                <div className="admin-case-main">
                  <b>
                    {w.name} · {w.type}
                  </b>
                  <small>{w.reason}</small>
                  <small>{w.message || "No additional message recorded"}</small>
                </div>
                <Tag tone="orange">{w.status}</Tag>
              </div>
            ))}
            {warningRows.length === 0 && (
              <p className="admin-empty-state">
                No warnings issued in this session yet.
              </p>
            )}
          </div>
          <div className="admin-panel admin-enforcement-panel">
            <div className="admin-panel-head">
              <div>
                <span className="overline">ACCOUNT ACTIONS</span>
                <h2>Scholar & organization access</h2>
                <small>
                  Warnings, restrictions, suspensions and blocks. Investigate
                  before taking serious action.
                </small>
              </div>
            </div>
            {[
              ...scholarRows.map((x) => ({ ...x, entityType: "Scholar" })),
              ...orgRows.map((x) => ({ ...x, entityType: "Organization" })),
            ].map((x) => (
              <div className="admin-enforcement-row" key={x.entityType + x.id}>
                <span className="admin-enforcement-avatar">
                  {x.entityType === "Scholar" ? (
                    <GraduationCap size={17} />
                  ) : (
                    <Building2 size={17} />
                  )}
                </span>
                <div className="admin-enforcement-identity">
                  <b>{x.name}</b>
                  <small>
                    {x.entityType} · {x.email}
                  </small>
                  {x.enforcementReason && (
                    <small className="admin-enforcement-reason">
                      Reason: {x.enforcementReason} · {x.enforcementDuration}
                    </small>
                  )}
                </div>
                <Tag
                  tone={
                    ["Blocked", "Suspended"].includes(x.status)
                      ? "orange"
                      : x.status === "Restricted"
                        ? "blue"
                        : "green"
                  }
                >
                  {x.status}
                </Tag>
                <div className="admin-enforcement-actions">
                  <button onClick={() => issueWarning(x.entityType, x)}>
                    <Mail size={13} /> Warn
                  </button>
                  <button onClick={() => openEnforcement(x.entityType, x)}>
                    <ShieldAlert size={13} />{" "}
                    {["Restricted", "Suspended", "Blocked"].includes(x.status)
                      ? "Manage"
                      : "Restrict / block"}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="admin-panel admin-moderation-guidance">
            <div className="admin-panel-head">
              <div>
                <span className="overline">MODERATION PRINCIPLES</span>
                <h2>Fair, evidence-led decisions</h2>
              </div>
            </div>
            <div className="admin-guideline-grid">
              <div>
                <b>Verify evidence</b>
                <p>Review the reported content and context before deciding.</p>
              </div>
              <div>
                <b>Proportionate action</b>
                <p>
                  Use a warning for minor first offences; reserve blocking for
                  serious or repeated violations.
                </p>
              </div>
              <div>
                <b>Document decisions</b>
                <p>
                  Record the reason, duration, evidence and responsible admin.
                </p>
              </div>
              <div>
                <b>Allow appeals</b>
                <p>
                  Provide a clear route to challenge restrictions and request
                  review.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
      {page === "Admin management" && (
        <>
          {heading(
            "ADMIN TEAM",
            "Manage your Karta administrators.",
            "See every administrator, their access level and status, and invite new team members.",
            <Btn onClick={() => setAdminModal(true)}>
              <Plus size={15} /> Add administrator
            </Btn>,
          )}
          <div className="admin-moderation-summary admin-team-summary">
            <div>
              <b>{adminAccounts.length}</b>
              <span>Total administrators</span>
            </div>
            <div>
              <b>{adminAccounts.filter((a) => a.status === "Active").length}</b>
              <span>Active access</span>
            </div>
            <div>
              <b>
                {adminAccounts.filter((a) => a.status === "Invited").length}
              </b>
              <span>Pending invitations</span>
            </div>
          </div>
          <div className="admin-panel admin-team-panel">
            <div className="admin-panel-head">
              <div>
                <span className="overline">ADMIN DIRECTORY</span>
                <h2>All administrators</h2>
                <small>
                  Administrators can view the team directory. Account
                  permissions must be enforced by the backend.
                </small>
              </div>
            </div>
            <div className="admin-team-table">
              <div className="admin-team-row admin-team-head">
                <span>Administrator</span>
                <span>Role / department</span>
                <span>Added by</span>
                <span>Status</span>
                <span>Actions</span>
              </div>
              {adminAccounts.map((a) => (
                <div className="admin-team-row" key={a.id}>
                  <div className="admin-team-person">
                    <span className="admin-team-avatar">
                      {a.name
                        .split(/\\s+/)
                        .map((x) => x[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </span>
                    <span>
                      <b>{a.name}</b>
                      <small>{a.email}</small>
                    </span>
                  </div>
                  <div>
                    <b>{a.level}</b>
                    <small>{a.department || "Platform Operations"}</small>
                  </div>
                  <div className="admin-team-added">
                    {a.createdBy || "System"}
                  </div>
                  <Tag
                    tone={
                      a.status === "Active"
                        ? "green"
                        : a.status === "Suspended"
                          ? "orange"
                          : "blue"
                    }
                  >
                    {a.status}
                  </Tag>
                  <div className="admin-row-actions">
                    <button onClick={() => setSelectedAdmin(a)}>
                      <Eye size={14} /> View
                    </button>
                    {!a.protected && (
                      <button
                        onClick={() => {
                          const next =
                            a.status === "Suspended" ? "Active" : "Suspended";
                          setAdminAccounts((v) =>
                            v.map((x) =>
                              x.id === a.id ? { ...x, status: next } : x,
                            ),
                          );
                          log(
                            next === "Active"
                              ? "Administrator access restored"
                              : "Administrator access suspended",
                            a.name + " · " + a.email,
                          );
                        }}
                      >
                        {a.status === "Suspended" ? (
                          <Check size={14} />
                        ) : (
                          <PauseCircle size={14} />
                        )}{" "}
                        {a.status === "Suspended" ? "Restore" : "Suspend"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {adminModal && (
            <div className="admin-modal-backdrop">
              <section className="admin-modal">
                <button
                  className="admin-modal-close"
                  onClick={() => setAdminModal(false)}
                >
                  <X />
                </button>
                <span className="overline">ADMIN TEAM INVITATION</span>
                <h2>Add an administrator</h2>
                <p>
                  Invite a trusted team member. They will appear in the
                  administrator directory with the selected role.
                </p>
                <div className="admin-form-grid">
                  <label>
                    Full name
                    <input
                      value={adminDraft.name}
                      onChange={(e) =>
                        setAdminDraft((v) => ({ ...v, name: e.target.value }))
                      }
                      placeholder="Administrator name"
                    />
                  </label>
                  <label>
                    Work email
                    <input
                      type="email"
                      value={adminDraft.email}
                      onChange={(e) =>
                        setAdminDraft((v) => ({ ...v, email: e.target.value }))
                      }
                      placeholder="name@company.com"
                    />
                  </label>
                  <label>
                    Access role
                    <select
                      value={adminDraft.level}
                      onChange={(e) =>
                        setAdminDraft((v) => ({ ...v, level: e.target.value }))
                      }
                    >
                      <option>Admin</option>
                      <option>Moderation Admin</option>
                      <option>Scholar Admin</option>
                      <option>Organization Admin</option>
                      <option>Read-only Admin</option>
                    </select>
                  </label>
                  <label>
                    Department
                    <select
                      value={adminDraft.department}
                      onChange={(e) =>
                        setAdminDraft((v) => ({
                          ...v,
                          department: e.target.value,
                        }))
                      }
                    >
                      <option>Platform Operations</option>
                      <option>Trust & Safety</option>
                      <option>Scholar Relations</option>
                      <option>Organization Relations</option>
                      <option>Community Management</option>
                    </select>
                  </label>
                </div>
                <div className="admin-modal-actions">
                  <Btn kind="outline" onClick={() => setAdminModal(false)}>
                    Cancel
                  </Btn>
                  <Btn
                    disabled={
                      !adminDraft.name.trim() ||
                      !adminDraft.email.includes("@") ||
                      adminAccounts.some(
                        (a) =>
                          a.email.toLowerCase() ===
                          adminDraft.email.trim().toLowerCase(),
                      )
                    }
                    onClick={() => {
                      const row = {
                        ...adminDraft,
                        id: Date.now(),
                        status: "Invited",
                        createdBy: "Karta Admin",
                        createdAt: new Date().toLocaleDateString(),
                      };
                      setAdminAccounts((v) => [...v, row]);
                      log(
                        "Administrator invitation prepared",
                        adminDraft.email + " · " + adminDraft.level,
                      );
                      setAdminDraft({
                        name: "",
                        email: "",
                        level: "Admin",
                        department: "Platform Operations",
                      });
                      setAdminModal(false);
                    }}
                  >
                    <Send size={14} /> Prepare invitation
                  </Btn>
                </div>
                {adminAccounts.some(
                  (a) =>
                    a.email.toLowerCase() ===
                    adminDraft.email.trim().toLowerCase(),
                ) &&
                  adminDraft.email && (
                    <small className="admin-duplicate-warning">
                      This email is already in the administrator directory.
                    </small>
                  )}
              </section>
            </div>
          )}
          {selectedAdmin && (
            <div className="admin-modal-backdrop">
              <section className="admin-modal admin-admin-detail">
                <button
                  className="admin-modal-close"
                  onClick={() => setSelectedAdmin(null)}
                >
                  <X />
                </button>
                <span className="overline">ADMINISTRATOR PROFILE</span>
                <div className="admin-admin-detail-head">
                  <span className="admin-team-avatar large">
                    {selectedAdmin.name
                      .split(/\\s+/)
                      .map((x) => x[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </span>
                  <div>
                    <h2>{selectedAdmin.name}</h2>
                    <p>{selectedAdmin.email}</p>
                  </div>
                </div>
                <div className="admin-profile-details">
                  <div>
                    <small>Access role</small>
                    <b>{selectedAdmin.level}</b>
                  </div>
                  <div>
                    <small>Department</small>
                    <b>{selectedAdmin.department || "Platform Operations"}</b>
                  </div>
                  <div>
                    <small>Added by</small>
                    <b>{selectedAdmin.createdBy || "System"}</b>
                  </div>
                  <div>
                    <small>Invitation / added</small>
                    <b>{selectedAdmin.createdAt || "Existing account"}</b>
                  </div>
                  <div>
                    <small>Account status</small>
                    <b>{selectedAdmin.status}</b>
                  </div>
                </div>
                <p className="admin-profile-note">
                  This is an administrator directory preview. Actual
                  permissions, invitations and account activation must be
                  enforced through secure Supabase authentication and
                  server-side role policies.
                </p>
                <div className="admin-modal-actions">
                  <Btn kind="outline" onClick={() => setSelectedAdmin(null)}>
                    Close
                  </Btn>
                  {!selectedAdmin.protected && (
                    <Btn
                      onClick={() => {
                        const next =
                          selectedAdmin.status === "Suspended"
                            ? "Active"
                            : "Suspended";
                        setAdminAccounts((v) =>
                          v.map((x) =>
                            x.id === selectedAdmin.id
                              ? { ...x, status: next }
                              : x,
                          ),
                        );
                        log(
                          next === "Active"
                            ? "Administrator access restored"
                            : "Administrator access suspended",
                          selectedAdmin.name + " · " + selectedAdmin.email,
                        );
                        setSelectedAdmin(null);
                      }}
                    >
                      {selectedAdmin.status === "Suspended"
                        ? "Restore access"
                        : "Suspend access"}
                    </Btn>
                  )}
                </div>
              </section>
            </div>
          )}
        </>
      )}

{page === 'Post Activity' && <>
  {heading(
    'COMMUNITY CONTENT',
    'Post activity',
    'Review and manage posts published across the Karta community.'
  )}

  <div className="admin-panel">
    <div className="admin-panel-head">
      <div>
        <span className="overline">POST MANAGEMENT</span>
        <h2>{postRows.length} total posts</h2>
        <small>Official, scholar, organization and alumni posts.</small>
      </div>

      <Btn kind="outline" onClick={loadAdminPosts} disabled={postLoading}>
        <RefreshCw size={14} />
        {postLoading ? 'Refreshing...' : 'Refresh'}
      </Btn>
    </div>

    <div className="admin-toolbar">
      <div className="search-inline">
        <Search size={16} />
        <input
          value={postSearch}
          onChange={e => setPostSearch(e.target.value)}
          placeholder="Search post content or author..."
        />
      </div>

      <select
        value={postAuthorFilter}
        onChange={e => setPostAuthorFilter(e.target.value)}
      >
        <option>All</option>
        <option>Official</option>
        <option>Scholar</option>
        <option>Organization</option>
        <option>Alumni</option>
      </select>

      <select
        value={postStatusFilter}
        onChange={e => setPostStatusFilter(e.target.value)}
      >
        <option>All</option>
        <option>Published</option>
        <option>Draft</option>
        <option>Archived</option>
      </select>
    </div>

    {postError && (
      <p role="alert" style={{ color: '#c0392b' }}>{postError}</p>
    )}

    {postLoading ? (
      <p>Loading posts from Supabase...</p>
    ) : filteredPostRows.length ? (
      <div>
        {filteredPostRows.map(post => (
          <article
            key={post.id}
            className="admin-feed-row"
            style={{ alignItems: 'flex-start', gap: 16 }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                flexWrap: 'wrap'
              }}>
                <b>{post.author_name}</b>
                <Tag>{post.is_official ? 'Official' : post.author_role}</Tag>
                <Tag tone={
                  post.status === 'published' ? 'green' :
                  post.status === 'archived' ? 'orange' : 'blue'
                }>
                  {post.status}
                </Tag>
              </div>

              <small>
                {new Date(post.created_at).toLocaleString()}
              </small>

              <p style={{ whiteSpace: 'pre-wrap' }}>
                {post.content}
              </p>

              {(post.media_urls || []).map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt="Post attachment"
                  style={{
                    maxWidth: '260px',
                    maxHeight: '220px',
                    objectFit: 'cover',
                    borderRadius: '12px',
                    marginTop: '8px'
                  }}
                />
              ))}
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              minWidth: 125
            }}>
              <select
                value={post.status}
                onChange={e => changePostStatus(post.id, e.target.value)}
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>

              <button
  type="button"
 onClick={() => {
  setEditingPost(post);
  setEditContent(post.content || "");
  setEditImageFile(null);
  setEditRemoveImage(false);
}}
>
  <Pencil size={14} /> Edit post
</button>

              <button
                type="button"
                onClick={() => removeAdminPost(post.id)}
                style={{ color: '#c0392b' }}
              >
                <Trash2 size={14} /> Delete post
              </button>
            </div>
          </article>
        ))}
      </div>
    ) : (
      <div className="admin-empty-state">
        <MessageSquare size={24} />
        <p>No posts found for these filters.</p>
      </div>
    )}
  </div>
</>}

      {page === "Audit activity" && (
        <>
          {heading(
            "AUDIT TRAIL",
            "Every important action, accounted for.",
            "Review a chronological record of administrative decisions in this session.",
          )}
          <div className="admin-panel">
            {audit.map((a) => (
              <div className="admin-review-row" key={a.id}>
                <span className="admin-report-icon">
                  <Clock3 size={17} />
                </span>
                <div>
                  <b>{a.action}</b>
                  <small>
                    {a.actor} · {a.target}
                  </small>
                </div>
                <span className="admin-audit-time">{a.time}</span>
              </div>
            ))}
          </div>
        </>
      )}
    
{editingPost && (
  <div className="admin-modal-backdrop">
    <section className="admin-modal">
      <button
        className="admin-modal-close"
        onClick={() => {
          setEditingPost(null);
          setEditContent("");
          setEditImageFile(null);
          setEditRemoveImage(false);
        }}
      >
        <X />
      </button>

      <span className="overline">EDIT COMMUNITY POST</span>
      <h2>Edit post</h2>
      <p>Update the content or change its image.</p>

      <div className="admin-form-grid">
        <label className="span-two">
          Post content
          <textarea
            rows={6}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            placeholder="Write your post..."
          />
        </label>

        <label className="span-two">
          Replace image
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              setEditImageFile(e.target.files?.[0] || null);
              setEditRemoveImage(false);
            }}
          />
        </label>

        {editingPost.media_urls?.[0] &&
          !editRemoveImage &&
          !editImageFile && (
            <div className="span-two">
              <p>Current image</p>
              <img
                src={editingPost.media_urls[0]}
                alt="Current post"
                style={{
                  maxWidth: "220px",
                  maxHeight: "160px",
                  objectFit: "cover",
                  borderRadius: "12px",
                }}
              />
              <button
                type="button"
                onClick={() => {
                  setEditRemoveImage(true);
                  setEditImageFile(null);
                }}
                style={{ display: "block", color: "#c0392b", marginTop: 8 }}
              >
                Remove current image
              </button>
            </div>
          )}

        {editImageFile && (
          <p className="span-two">
            Selected image: {editImageFile.name}
          </p>
        )}

        {editRemoveImage && (
          <p className="span-two">Current image will be removed.</p>
        )}
      </div>

      <div className="admin-modal-actions">
        <Btn
          kind="outline"
          onClick={() => {
            setEditingPost(null);
            setEditContent("");
            setEditImageFile(null);
            setEditRemoveImage(false);
          }}
        >
          Cancel
        </Btn>

        <Btn
          onClick={saveEditedPost}
          disabled={editSaving || !editContent.trim()}
        >
          <Check size={14} />
          {editSaving ? "Saving..." : "Save changes"}
        </Btn>
      </div>
    </section>
  </div>
)}

      {activeCase && (
        <div className="admin-modal-backdrop">
          <section className="admin-modal admin-case-modal">
            <button
              className="admin-modal-close"
              onClick={() => setActiveCase(null)}
            >
              <X />
            </button>
            <span className="overline">CASE {activeCase.caseId}</span>
            <h2>{activeCase.target}</h2>
            <p>
              Reported by {activeCase.by} · {activeCase.reason}
            </p>
            <div className="admin-form-grid">
              <label>
                Severity
                <select
                  value={caseDraft.severity}
                  onChange={(e) =>
                    setCaseDraft((v) => ({ ...v, severity: e.target.value }))
                  }
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </label>
              <label>
                Assign to
                <select
                  value={caseDraft.assignee}
                  onChange={(e) =>
                    setCaseDraft((v) => ({ ...v, assignee: e.target.value }))
                  }
                >
                  <option>Karta Admin</option>
                  <option>Trust & Safety Team</option>
                  <option>Super Admin</option>
                </select>
              </label>
              <label className="span-two">
                Investigation notes
                <textarea
                  value={caseDraft.notes}
                  onChange={(e) =>
                    setCaseDraft((v) => ({ ...v, notes: e.target.value }))
                  }
                  placeholder="Document what you reviewed and any context..."
                />
              </label>
              <label className="span-two">
                Evidence attachments
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.txt"
                  onChange={(e) =>
                    setCaseDraft((v) => ({
                      ...v,
                      evidence: [
                        ...(v.evidence || []),
                        ...Array.from(e.target.files || []).map((f) => f.name),
                      ],
                    }))
                  }
                />
                <small>
                  {(caseDraft.evidence || []).join(" · ") ||
                    "No evidence attached yet"}
                </small>
              </label>
              <label className="span-two">
                Resolution
                <select
                  value={caseDraft.resolution}
                  onChange={(e) =>
                    setCaseDraft((v) => ({ ...v, resolution: e.target.value }))
                  }
                >
                  <option value="">Choose resolution</option>
                  <option>Insufficient evidence — close</option>
                  <option>Warning issued</option>
                  <option>Content removed</option>
                  <option>Account restricted</option>
                  <option>Account suspended</option>
                  <option>Account blocked</option>
                  <option>Escalated for further review</option>
                </select>
              </label>
              <label className="span-two">
                Case status
                <select
                  value={activeCase.status}
                  onChange={(e) =>
                    setActiveCase((v) => ({ ...v, status: e.target.value }))
                  }
                >
                  <option>Open</option>
                  <option>Reviewed</option>
                  <option>Action taken</option>
                  <option>Resolved</option>
                </select>
              </label>
            </div>
            <div className="admin-modal-actions">
              <Btn kind="outline" onClick={() => setActiveCase(null)}>
                Cancel
              </Btn>
              <Btn onClick={saveCase}>
                <Check size={14} /> Save case record
              </Btn>
            </div>
          </section>
        </div>
      )}
      {warningTarget && (
        <div className="admin-modal-backdrop">
          <section className="admin-modal">
            <button
              className="admin-modal-close"
              onClick={() => setWarningTarget(null)}
            >
              <X />
            </button>
            <span className="overline">FORMAL COMMUNITY WARNING</span>
            <h2>Warn {warningTarget.name}</h2>
            <p>
              {warningTarget.type} · {warningTarget.email}
            </p>
            <div className="admin-form-grid">
              <label className="span-two">
                Warning category
                <select
                  value={warningDraft.reason}
                  onChange={(e) =>
                    setWarningDraft((v) => ({ ...v, reason: e.target.value }))
                  }
                >
                  <option>Community guideline reminder</option>
                  <option>Spam or misleading activity</option>
                  <option>Unprofessional communication</option>
                  <option>Misleading recruitment or opportunity</option>
                  <option>Repeated minor violations</option>
                </select>
              </label>
              <label className="span-two">
                Message
                <textarea
                  value={warningDraft.message}
                  onChange={(e) =>
                    setWarningDraft((v) => ({ ...v, message: e.target.value }))
                  }
                  placeholder="Explain the concern, expected correction and what may happen if it continues."
                />
              </label>
            </div>
            <div className="admin-modal-actions">
              <Btn kind="outline" onClick={() => setWarningTarget(null)}>
                Cancel
              </Btn>
              <Btn onClick={sendWarning}>
                <Send size={14} /> Record warning
              </Btn>
            </div>
          </section>
        </div>
      )}
      {enforcementTarget && (
        <div className="admin-modal-backdrop">
          <section className="admin-modal">
            <button
              className="admin-modal-close"
              onClick={() => setEnforcementTarget(null)}
            >
              <X />
            </button>
            <span className="overline">ACCOUNT ENFORCEMENT</span>
            <h2>{enforcementTarget.name}</h2>
            <p>
              {enforcementTarget.type} · {enforcementTarget.email}
            </p>
            <div className="admin-form-grid">
              <label>
                Action
                <select
                  value={enforcementDraft.action}
                  onChange={(e) =>
                    setEnforcementDraft((v) => ({
                      ...v,
                      action: e.target.value,
                    }))
                  }
                >
                  <option>Restricted</option>
                  <option>Suspended</option>
                  <option>Blocked</option>
                  <option>Active</option>
                </select>
              </label>
              <label>
                Duration
                <select
                  value={enforcementDraft.duration}
                  onChange={(e) =>
                    setEnforcementDraft((v) => ({
                      ...v,
                      duration: e.target.value,
                    }))
                  }
                >
                  <option>24 hours</option>
                  <option>7 days</option>
                  <option>30 days</option>
                  <option>Until manual review</option>
                  <option>Permanent</option>
                </select>
              </label>
              <label className="span-two">
                Reason
                <select
                  value={enforcementDraft.reason}
                  onChange={(e) =>
                    setEnforcementDraft((v) => ({
                      ...v,
                      reason: e.target.value,
                    }))
                  }
                >
                  <option>Spam or misleading activity</option>
                  <option>Fraud or scam attempt</option>
                  <option>Impersonation / fake identity</option>
                  <option>Harassment or abusive conduct</option>
                  <option>Repeated community guideline violations</option>
                  <option>
                    Suspicious organization or recruitment activity
                  </option>
                  <option>Other policy violation</option>
                </select>
              </label>
              <label className="span-two">
                Internal note
                <textarea
                  value={enforcementDraft.note}
                  onChange={(e) =>
                    setEnforcementDraft((v) => ({ ...v, note: e.target.value }))
                  }
                  placeholder="Evidence summary for the audit trail..."
                />
              </label>
            </div>
            <div className="admin-modal-actions">
              <Btn kind="outline" onClick={() => setEnforcementTarget(null)}>
                Cancel
              </Btn>
              <Btn onClick={applyEnforcement}>
                {enforcementDraft.action === "Active"
                  ? "Restore access"
                  : "Apply action"}
              </Btn>
            </div>
          </section>
        </div>
      )}
      {selectedScholar && (
        <div className="admin-modal-backdrop">
          <section className="admin-modal admin-profile-modal admin-entity-profile-modal">
            <button
              className="admin-modal-close"
              onClick={() => setSelectedScholar(null)}
              aria-label="Close scholar profile"
            >
              <X />
            </button>
            <div className="admin-profile-cover" />
            <div className="admin-profile-identity">
              <Avatar
                src={selectedScholar.image}
                initials={selectedScholar.name
                  .split(" ")
                  .map((x) => x[0])
                  .join("")}
                size="large"
              />
              <div>
                <span className="overline">SCHOLAR · FULL PROFILE</span>
                <h2>{selectedScholar.name}</h2>
                <p>
                  {selectedScholar.headline ||
                    selectedScholar.field ||
                    "Professional headline not added"}{" "}
                  · {selectedScholar.institution || "Institution not provided"}
                </p>
              </div>
              <Tag
                tone={selectedScholar.status === "Active" ? "green" : "blue"}
              >
                {selectedScholar.status}
              </Tag>
            </div>
            <div className="admin-entity-profile-section">
              <h3>About</h3>
              <p>
                {selectedScholar.about ||
                  "This scholar has not added an About section yet."}
              </p>
            </div>
            <div className="admin-entity-profile-section">
              <h3>Academic & contact details</h3>
              <div className="admin-profile-details">
                <div>
                  <small>Email</small>
                  <b>{selectedScholar.email || "Not provided"}</b>
                </div>
                <div>
                  <small>Institution</small>
                  <b>{selectedScholar.institution || "Not provided"}</b>
                </div>
                <div>
                  <small>Study area</small>
                  <b>{selectedScholar.field || "Not provided"}</b>
                </div>
                <div>
                  <small>Graduation year</small>
                  <b>{selectedScholar.year || "Not provided"}</b>
                </div>
                <div>
                  <small>Account status</small>
                  <b>{selectedScholar.status || "Not recorded"}</b>
                </div>
                <div>
                  <small>Scholar ID</small>
                  <b>{selectedScholar.id}</b>
                </div>
              </div>
            </div>
            <div className="admin-entity-profile-section">
              <h3>Professional profile</h3>
              <div className="admin-detail-line">
                <b>Skills</b>
                <span>
                  {Array.isArray(selectedScholar.skills)
                    ? selectedScholar.skills.join(" · ")
                    : selectedScholar.skills || "Not added yet"}
                </span>
              </div>
              <div className="admin-detail-line">
                <b>Experience</b>
                <span>
                  {selectedScholar.experience?.length
                    ? selectedScholar.experience
                        .map((x) => x.title || x.role || x.company)
                        .filter(Boolean)
                        .join(" · ")
                    : "No experience details available in this demo record"}
                </span>
              </div>
              <div className="admin-detail-line">
                <b>Projects</b>
                <span>
                  {selectedScholar.projects?.length
                    ? selectedScholar.projects
                        .map((x) => x.title || x.name)
                        .filter(Boolean)
                        .join(" · ")
                    : "No project details available in this demo record"}
                </span>
              </div>
              <div className="admin-detail-line">
                <b>Achievements</b>
                <span>
                  {selectedScholar.achievements?.length
                    ? selectedScholar.achievements
                        .map((x) => x.title || x.name)
                        .filter(Boolean)
                        .join(" · ")
                    : "No achievements added yet"}
                </span>
              </div>
            </div>
            <p className="admin-profile-note">
              This view shows profile information currently available in the
              frontend demo. Full profile sections and resume files will load
              from the scholar's saved profile after backend integration.
            </p>
            <div className="admin-modal-actions">
              <Btn kind="outline" onClick={() => setSelectedScholar(null)}>
                Close profile
              </Btn>
              <Btn
                onClick={() => {
                  setDraft({ ...selectedScholar });
                  setSelectedScholar(null);
                  setModal(true);
                }}
              >
                <Pencil size={14} /> Edit scholar record
              </Btn>
            </div>
          </section>
        </div>
      )}
      {modal && (
        <div className="admin-modal-backdrop">
          <section className="admin-modal">
            <button
              className="admin-modal-close"
              onClick={() => {
                setModal(false);
                setDraft({
                  name: "",
                  email: "",
                  institution: "",
                  field: "",
                  year: "2027",
                });
              }}
            >
              <X />
            </button>
            <span className="overline">SCHOLAR ACCESS</span>
            <h2>{draft.id ? "Edit scholar" : "Add an authorized scholar"}</h2>
            <p>
              Only this invited email will be allowed to activate a scholar
              account.
            </p>
            <div className="admin-form-grid">
              <label>
                Full name
                <input
                  value={draft.name}
                  onChange={(e) =>
                    setDraft((v) => ({ ...v, name: e.target.value }))
                  }
                />
              </label>
              <label>
                Email address
                <input
                  type="email"
                  value={draft.email}
                  onChange={(e) =>
                    setDraft((v) => ({ ...v, email: e.target.value }))
                  }
                />
              </label>
              <label>
                Institution
                <input
                  value={draft.institution}
                  onChange={(e) =>
                    setDraft((v) => ({ ...v, institution: e.target.value }))
                  }
                />
              </label>
              <label>
                Field of study
                <input
                  value={draft.field}
                  onChange={(e) =>
                    setDraft((v) => ({ ...v, field: e.target.value }))
                  }
                />
              </label>
              <label>
                Graduation year
                <input
                  value={draft.year}
                  onChange={(e) =>
                    setDraft((v) => ({ ...v, year: e.target.value }))
                  }
                />
              </label>
            </div>
            <div className="admin-modal-actions">
              <Btn kind="outline" onClick={() => setModal(false)}>
                Cancel
              </Btn>
              <Btn onClick={addScholar}>
                <Send size={14} /> Save & prepare invitation
              </Btn>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export function AdminAlumniManagement({
  requests = [],
  onReviewRequest = () => {},
}) {
  const [tab, setTab] = useState("Requests"),
    [query, setQuery] = useState(""),
    [draft, setDraft] = useState({
      name: "",
      email: "",
      headline: "",
      company: "",
      institution: "",
      graduation: "2026",
      industry: "Technology",
      location: "",
    }),
    [notice, setNotice] = useState("");
  const [records, setRecords] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("kartaAdminAlumniRecords") || "null") ||
        demoAlumni.map((x) => ({
          ...x,
          accountStatus: x.accountStatus || "Active",
        }))
      );
    } catch {
      return demoAlumni.map((x) => ({
        ...x,
        accountStatus: x.accountStatus || "Active",
      }));
    }
  });
  useEffect(() => {
    localStorage.setItem("kartaAdminAlumniRecords", JSON.stringify(records));
  }, [records]);
  const filtered = records.filter((a) =>
    [a.name, a.email, a.headline, a.company, a.institution]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const add = () => {
    if (
      !draft.name.trim() ||
      !draft.email.trim() ||
      !/^\S+@\S+\.\S+$/.test(draft.email)
    ) {
      setNotice("Enter a name and a valid email address.");
      return;
    }
    if (
      records.some((a) => a.email?.toLowerCase() === draft.email.toLowerCase())
    ) {
      setNotice("An Alumni record with this email already exists.");
      return;
    }
    setRecords((v) => [
      {
        ...draft,
        id: `AL-${Date.now()}`,
        skills: [],
        status: "Verified",
        accountStatus: "Active",
        about: "",
        image: photos.portrait2,
      },
      ...v,
    ]);
    setDraft({
      name: "",
      email: "",
      headline: "",
      company: "",
      institution: "",
      graduation: "2026",
      industry: "Technology",
      location: "",
    });
    setNotice("Alumni record added in this demo session.");
  };
  const decide = (r, status) => {
    onReviewRequest(r.id, status, r.graduationYear);
    if (status === "Approved") {
      setRecords((v) =>
        v.some((a) => a.email === r.email)
          ? v
          : [
              {
                id: `AL-${r.id}`,
                name: r.name,
                email: r.email,
                headline: `Graduate · ${r.institution || "Karta community"}`,
                company: "",
                institution: r.institution || "",
                graduation: r.graduationYear || "2026",
                location: "India",
                industry: "Technology",
                about: "",
                skills: [],
                image: photos.portrait2,
                status: "Verified",
                accountStatus: "Active",
              },
              ...v,
            ],
      );
    }
    setNotice(`Request ${status.toLowerCase()}.`);
  };
  return (
    <>
      <PageHead
        eyebrow="ADMINISTRATION · ALUMNI"
        title="Alumni management"
        sub="Review graduation requests, maintain the verified Alumni directory and manage Alumni account access."
        action={
          <Btn onClick={() => setTab("Add Alumni")}>
            <Plus size={15} /> Add Alumni
          </Btn>
        }
      />
      {notice && (
        <div className="org-success">
          <CheckCircle2 size={16} />
          {notice}
          <button onClick={() => setNotice("")}>
            <X size={14} />
          </button>
        </div>
      )}
      <div className="admin-metrics-grid">
        <article className="admin-metric">
          <span>Verified Alumni</span>
          <b>{records.length}</b>
          <small>Directory records in this session</small>
        </article>
        <article className="admin-metric">
          <span>Pending requests</span>
          <b>{requests.filter((r) => r.status === "Pending").length}</b>
          <small>Awaiting graduation verification</small>
        </article>
        <article className="admin-metric">
          <span>Active accounts</span>
          <b>{records.filter((r) => r.accountStatus === "Active").length}</b>
          <small>Alumni access enabled</small>
        </article>
      </div>
      <div className="admin-toolbar">
        <div className="admin-tabs">
          <button
            className={tab === "Requests" ? "active" : ""}
            onClick={() => setTab("Requests")}
          >
            Graduation requests
          </button>
          <button
            className={tab === "Directory" ? "active" : ""}
            onClick={() => setTab("Directory")}
          >
            Alumni directory
          </button>
          <button
            className={tab === "Add Alumni" ? "active" : ""}
            onClick={() => setTab("Add Alumni")}
          >
            Add Alumni
          </button>
        </div>
        {tab === "Directory" && (
          <div className="search-inline">
            <Search size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Alumni, email or company"
            />
          </div>
        )}
      </div>
      {tab === "Requests" && (
        <section className="admin-panel">
          {requests.length ? (
            requests.map((r) => (
              <article className="admin-review-row" key={r.id}>
                <Avatar src={photos.portrait2} />
                <div className="admin-review-copy">
                  <b>{r.name}</b>
                  <small>
                    {r.email} · {r.institution}
                  </small>
                  <small>
                    Expected graduation: {r.graduationYear || "Not supplied"} ·
                    Submitted{" "}
                    {r.submittedAt
                      ? new Date(r.submittedAt).toLocaleDateString()
                      : "Recently"}
                  </small>
                  <Tag
                    tone={
                      r.status === "Approved"
                        ? "green"
                        : r.status === "Rejected"
                          ? "orange"
                          : "blue"
                    }
                  >
                    {r.status}
                  </Tag>
                </div>
                {r.status === "Pending" ? (
                  <div className="admin-row-actions">
                    <Btn kind="outline" onClick={() => decide(r, "Rejected")}>
                      Reject
                    </Btn>
                    <Btn onClick={() => decide(r, "Approved")}>
                      <Check size={14} /> Verify & approve
                    </Btn>
                  </div>
                ) : (
                  <span className="admin-audit-time">{r.status}</span>
                )}
              </article>
            ))
          ) : (
            <div className="empty-discovery">
              <GraduationCap size={26} />
              <b>No graduation requests</b>
              <span>
                Scholar requests will appear here for manual verification.
              </span>
            </div>
          )}
        </section>
      )}
      {tab === "Directory" && (
        <section className="admin-panel">
          {filtered.map((a) => (
            <article className="admin-review-row" key={a.id}>
              <Avatar src={a.image} alumni />
              <div className="admin-review-copy">
                <b>{a.name}</b>
                <small>
                  {a.headline} · {a.institution}
                </small>
                <small>
                  {a.email || "Email not recorded"} · Class of {a.graduation}
                </small>
              </div>
              <Tag tone={a.accountStatus === "Active" ? "green" : "orange"}>
                {a.accountStatus}
              </Tag>
              <button
                className="admin-inline-action"
                onClick={() =>
                  setRecords((v) =>
                    v.map((x) =>
                      x.id === a.id
                        ? {
                            ...x,
                            accountStatus:
                              x.accountStatus === "Active"
                                ? "Deactivated"
                                : "Active",
                          }
                        : x,
                    ),
                  )
                }
              >
                {a.accountStatus === "Active" ? "Deactivate" : "Activate"}
              </button>
            </article>
          ))}
          {!filtered.length && (
            <div className="empty-discovery">
              No Alumni records match your search.
            </div>
          )}
        </section>
      )}
      {tab === "Add Alumni" && (
        <section className="admin-panel admin-form-panel">
          <div>
            <span className="overline">DIRECTORY ADMINISTRATION</span>
            <h2>Add an Alumni record</h2>
            <p>
              Use this for verified graduates who need to be added or corrected
              by the Karta team.
            </p>
          </div>
          <div className="admin-form-grid">
            <label>
              Full name
              <input
                value={draft.name}
                onChange={(e) =>
                  setDraft((v) => ({ ...v, name: e.target.value }))
                }
              />
            </label>
            <label>
              Email address
              <input
                type="email"
                value={draft.email}
                onChange={(e) =>
                  setDraft((v) => ({ ...v, email: e.target.value }))
                }
              />
            </label>
            <label>
              Professional headline
              <input
                value={draft.headline}
                onChange={(e) =>
                  setDraft((v) => ({ ...v, headline: e.target.value }))
                }
              />
            </label>
            <label>
              Current company
              <input
                value={draft.company}
                onChange={(e) =>
                  setDraft((v) => ({ ...v, company: e.target.value }))
                }
              />
            </label>
            <label>
              Institution
              <input
                value={draft.institution}
                onChange={(e) =>
                  setDraft((v) => ({ ...v, institution: e.target.value }))
                }
              />
            </label>
            <label>
              Graduation year
              <input
                value={draft.graduation}
                onChange={(e) =>
                  setDraft((v) => ({ ...v, graduation: e.target.value }))
                }
              />
            </label>
            <label>
              Industry
              <select
                value={draft.industry}
                onChange={(e) =>
                  setDraft((v) => ({ ...v, industry: e.target.value }))
                }
              >
                <option>Technology</option>
                <option>Life Sciences</option>
                <option>Finance</option>
                <option>Education</option>
                <option>Design</option>
                <option>Other</option>
              </select>
            </label>
            <label>
              Location
              <input
                value={draft.location}
                onChange={(e) =>
                  setDraft((v) => ({ ...v, location: e.target.value }))
                }
              />
            </label>
          </div>
          <div className="admin-modal-actions">
            <Btn onClick={add}>
              <Plus size={14} /> Add to Alumni directory
            </Btn>
          </div>
          <small className="admin-profile-note">
            Demo frontend only: records and account changes are held in local
            component state. Supabase persistence and invitation delivery are
            not connected yet.
          </small>
        </section>
      )}
    </>
  );
}
