import React, { useState, useEffect } from 'react';
import { photos, scholars } from "./data";
import {
  getPosts,
  createPost,
  updatePost,
  deletePost,
} from "./services/postService";
import { Header, Sidebar } from "./components/shell";
import resolvePage from "./app/resolvePage";
import { useAuth } from "./context/AuthContext";
import { supabase } from "./lib/supabase";


let demoCommunityPosts = null,
  demoOrganizationJobs = null,
  demoOrganizationApplicants = null,
  demoAppliedOrgJobs = [],
  demoScholarApplications = [];
export default function App({ initialRole = "Scholar" }) {
    console.log("APP COMPONENT IS RENDERING");
    
  const { profile } = useAuth();
  useEffect(() => {
  const checkUser = async () => {
    const { data, error } = await supabase.auth.getUser();

    console.log("AUTH USER ID:", data?.user?.id);
    console.log("AUTH ERROR:", error);
  };

  checkUser();
}, []);
  useEffect(() => {
  if (!profile?.id) return;

  let isMounted = true;

  const loadPosts = async () => {
    try {
      console.log("Loading Karta feed from Supabase...");

      const data = await getPosts();

      if (!isMounted) return;

      const formattedPosts = data.map((post) => ({
        ...post,
        name: post.author_name,
        field: post.is_official
          ? "Official platform"
          : post.author_role,
        time: new Date(post.created_at).toLocaleString(),
        kind: post.is_official
          ? "Official announcement"
          : `${post.author_role} post`,
        text: post.content,
        photo: post.media_urls?.[0] || null,
        image: post.author_avatar || null,
        likes: 0,
        comments: 0,
        authorType: post.is_official
          ? "Official"
          : post.author_role,
      }));

      _setPosts(formattedPosts);

      console.log("Karta feed loaded:", formattedPosts);
    } catch (error) {
      console.error("Failed to load Karta feed:", error);
    }
  };

  loadPosts();

  return () => {
    isMounted = false;
  };
}, [profile?.id]);

  


   
  let [role] = useState(() => {
      try {
        return initialRole === "Scholar" &&
          JSON.parse(localStorage.getItem("kartaAlumniRequest") || "null")
            ?.status === "Approved"
          ? "Alumni"
          : initialRole;
      } catch {
        return initialRole;
      }
    }),
    [posts, _setPosts] = useState([]),
    [page, setPage] = useState(initialRole === "Admin" ? "Overview" : "Home"),
    [search, setSearch] = useState(""),
    [menu, setMenu] = useState(false),
    [activeChatApplicant, setActiveChatApplicant] = useState(null),
    [selectedPublicProfile, setSelectedPublicProfile] = useState(null),
    [selectedPublicOrganization, setSelectedPublicOrganization] =
      useState(null);
  const [messageContact, setMessageContact] = useState(null);
  const [alumniRequest, setAlumniRequest] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("kartaAlumniRequest") || "null");
    } catch {
      return null;
    }
  });
  const submitAlumniRequest = (value) => {
    if (value === null) {
      setAlumniRequest(null);
      return;
    }
    if (value === "open") {
      setAlumniRequest("open");
      return;
    }
    const request = {
      ...value,
      id: Date.now(),
      name: "Farhan Nisar",
      email: "farhan.nisar@example.com",
      institution: "Shoolini University",
      status: "Pending",
      submittedAt: new Date().toISOString(),
    };
    setAlumniRequest(request);
    localStorage.setItem("kartaAlumniRequest", JSON.stringify(request));
  };
  const reviewAlumniRequest = (id, status, year) => {
    setAlumniRequest((current) => {
      if (!current || current.id !== id) return current;
      const next = {
        ...current,
        status,
        graduationYear: year || current.graduationYear,
        reviewedAt: new Date().toISOString(),
      };
      localStorage.setItem("kartaAlumniRequest", JSON.stringify(next));
      return next;
    });
  };
  const setPosts = (update) =>
    _setPosts((prev) => {
      const next = typeof update === "function" ? update(prev) : update;
      demoCommunityPosts = next;
      return next;
    });

    const handlePublishPost = async (post) => {
  try {
    const savedPost = await createPost({
  content: post.text || post.content || "",
  imageFile: post.imageFile || null,
  isOfficial: role === "Admin",
});

    const updatedPosts = await getPosts();

    const formattedPosts = updatedPosts.map((item) => ({
      ...item,
      name: item.author_name,
      field: item.is_official ? "Official platform" : item.author_role,
      time: new Date(item.created_at).toLocaleString(),
      kind: item.is_official
        ? "Official announcement"
        : `${item.author_role} post`,
      text: item.content,
      photo: item.media_urls?.[0] || null,
      likes: 0,
      comments: 0,
      authorType: item.is_official ? "Official" : item.author_role,
    }));

    _setPosts(formattedPosts);

    console.log("Post saved successfully:", savedPost);
  } catch (error) {
    console.error("Failed to publish post:", error);
    alert(error.message || "Could not publish post.");
  }
};
const handleDeletePost = async (postId) => {
  await deletePost(postId);

  _setPosts((prev) =>
    prev.filter((post) => String(post.id) !== String(postId))
  );
};

const handleEditPost = async (postId, changes) => {
  try {
    await updatePost(postId, changes);

    const updatedPosts = await getPosts();

    const formattedPosts = updatedPosts.map((item) => ({
      ...item,
      name: item.author_name,
      field: item.is_official ? "Official platform" : item.author_role,
      time: new Date(item.created_at).toLocaleString(),
      kind: item.is_official
        ? "Official announcement"
        : `${item.author_role} post`,
      text: item.content,
      photo: item.media_urls?.[0] || null,
      likes: 0,
      comments: 0,
      authorType: item.is_official ? "Official" : item.author_role,
    }));

    _setPosts(formattedPosts);
  } catch (error) {
    console.error("Failed to edit post:", error);
    alert(error.message || "Could not update post.");
    throw error;
  }
};
  const navigateToPage = (next) => {
    setSelectedPublicProfile(null);
    setSelectedPublicOrganization(null);
    setPage(next);
  };
  const [orgJobs, _setOrgJobs] = useState(
    () =>
      demoOrganizationJobs ?? [
        {
          id: 101,
          title: "AI Research Intern",
          type: "Internship",
          location: "Remote · India",
          pay: "₹20,000–30,000 / month",
          description:
            "Work with our applied AI team on research prototypes and product experiments.",
          requirements: "Python, machine learning fundamentals",
          deadline: "2026-12-15",
          status: "Active",
          applicants: 12,
          company: "Northstar Labs",
        },
        {
          id: 102,
          title: "Junior Full-stack Engineer",
          type: "Full-time",
          location: "Bengaluru · Hybrid",
          pay: "₹5–7 LPA",
          description:
            "Build reliable product experiences with our engineering team.",
          requirements: "React, JavaScript, APIs",
          deadline: "2026-12-20",
          status: "Active",
          applicants: 8,
          company: "Northstar Labs",
        },
        {
          id: 103,
          title: "Research Assistant",
          type: "Research",
          location: "Bengaluru · On-site",
          pay: "Stipend provided",
          description: "Support research exploration and evaluation.",
          requirements: "Research methods, analytical thinking",
          deadline: "2026-11-25",
          status: "Paused",
          applicants: 4,
          company: "Northstar Labs",
        },
      ],
  );
  const setOrgJobs = (update) =>
    _setOrgJobs((prev) => {
      const next = typeof update === "function" ? update(prev) : update;
      demoOrganizationJobs = next;
      return next;
    });
  const [selectedOrgJob, setSelectedOrgJob] = useState(null),
    [appliedOrgJobs, _setAppliedOrgJobs] = useState(() => demoAppliedOrgJobs);
  const setAppliedOrgJobs = (update) =>
    _setAppliedOrgJobs((prev) => {
      const next = typeof update === "function" ? update(prev) : update;
      demoAppliedOrgJobs = next;
      return next;
    });
  const [applications, _setApplications] = useState(
    () => demoScholarApplications,
  );
  const setApplications = (update) =>
    _setApplications((prev) => {
      const next = typeof update === "function" ? update(prev) : update;
      demoScholarApplications = next;
      return next;
    });
  const [orgApplicants, _setOrgApplicants] = useState(
    () =>
      demoOrganizationApplicants ?? [
        {
          id: 1,
          name: "Aarav Sharma",
          image: scholars[0].image,
          institution: "IIT Delhi",
          field: "AI Research",
          role: "AI Research Intern",
          applied: "Today",
          status: "New",
          email: "aarav.sharma@example.com",
        },
        {
          id: 2,
          name: "Meera Kapoor",
          image: scholars[1].image,
          institution: "Shoolini University",
          field: "Biotechnology",
          role: "Research Assistant",
          applied: "Yesterday",
          status: "Reviewing",
          email: "meera.kapoor@example.com",
        },
        {
          id: 3,
          name: "Rohan Verma",
          image: scholars[3].image,
          institution: "BITS Pilani",
          field: "Data Science",
          role: "Junior Full-stack Engineer",
          applied: "2 days ago",
          status: "Shortlisted",
          email: "rohan.verma@example.com",
        },
        {
          id: 4,
          name: "Zoya Khan",
          image: scholars[2].image,
          institution: "NIFT Delhi",
          field: "Product Design",
          role: "AI Research Intern",
          applied: "3 days ago",
          status: "Reviewing",
          email: "zoya.khan@example.com",
        },
      ],
  );
  const setOrgApplicants = (update) =>
    _setOrgApplicants((prev) => {
      const next = typeof update === "function" ? update(prev) : update;
      demoOrganizationApplicants = next;
      return next;
    });
  const content = resolvePage({
  role,
  profile,
  page,
  posts,
  setPosts,
  handlePublishPost,
  handleDeletePost,
  handleEditPost,
  navigateToPage,
    selectedPublicProfile,
    setSelectedPublicProfile,
    selectedPublicOrganization,
    setSelectedPublicOrganization,
    alumniRequest,
    submitAlumniRequest,
    reviewAlumniRequest,
    activeChatApplicant,
    setActiveChatApplicant,
    messageContact,
    setMessageContact,
    orgJobs,
    setOrgJobs,
    selectedOrgJob,
    setSelectedOrgJob,
    appliedOrgJobs,
    setAppliedOrgJobs,
    applications,
    setApplications,
    orgApplicants,
    setOrgApplicants,
  });
  return (
    <div className={`app app-${role.toLowerCase()}`}>
      <Header
        role={role}
        profile={profile}
        search={search}
        setSearch={setSearch}
        currentPage={page}
        setPage={navigateToPage}
        onMenu={() => setMenu(true)}
        onProfile={() =>
          navigateToPage(
            role === "Scholar" || role === "Alumni"
              ? "My profile"
              : role === "Organization"
                ? "Company profile"
                : "Admin profile",
          )
        }
      />
      {menu && (
        <button
          className="drawer-backdrop"
          aria-label="Close navigation"
          onClick={() => setMenu(false)}
        />
      )}
      <div className="layout">
        <Sidebar
          role={role}
          profile={profile}
          page={page}
          setPage={navigateToPage}
          open={menu}
          setOpen={setMenu}
        />
        <main className="main">
          <div className="main-inner">{content}</div>
         
<footer className="app-footer">
  <div className="footer-brand">
    <span className="footer-logo">k.</span>
    <div>
      <strong>karta<span>connect</span></strong>
      <p>Connecting talent with opportunity.</p>
    </div>
  </div>

  <div className="footer-center">
    © 2026 Karta Connect. All rights reserved.
  </div>

  <a className="footer-top" href="#top">
    Back to top <span>↑</span>
  </a>
</footer>

        </main>
      </div>
    </div>
  );
}
