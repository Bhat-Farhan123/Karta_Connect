import React from "react";
import { photos } from "../data";
import Messages from "../features/messaging/Messages";
import OrganizationMessages from "../features/organization/OrganizationMessages";
import NotificationsPage from "../features/notifications/NotificationsPage";
import CreatePost from "../features/community/CreatePost";
import {
  ScholarPublicProfile,
  AlumniFullProfile,
} from "../features/profiles/PublicProfiles";
import Dashboard from "../features/dashboard/Dashboard";
import {
  Discover,
  Profile,
  Network,
  Opportunities,
  MyApplications,
} from "../features/scholar/ScholarPages";
import {
  OrganizationProfile,
  OrganizationPublicProfile,
  OrganizationTalent,
  OrganizationPostComposer,
  OrganizationCommunity,
  OrganizationJobs,
  OrganizationApplicants,
} from "../features/organization/OrganizationPages";
import { demoAlumni, AlumniDirectory } from "../features/alumni/AlumniPages";
import {
  AdminProfile,
  AdminWorkspace,
  AdminAlumniManagement,
} from "../features/admin/AdminPages";

/** Resolves the active portal page. State remains owned by the application controller. */
export default function resolvePage({
  role,
  page,
  profile,
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
}) {
  return role === "Alumni" && selectedPublicProfile ? (
    <AlumniFullProfile
      person={selectedPublicProfile}
      posts={posts}
      onBack={() => setSelectedPublicProfile(null)}
      onMessage={(person) => {
        setMessageContact({
          name: person.name,
          field: person.headline || "Karta Alumni",
          image: person.image,
        });
        setSelectedPublicProfile(null);
        navigateToPage("Messages");
      }}
    />
  ) : selectedPublicOrganization && (role === "Scholar" || role === "Admin") ? (
    <OrganizationPublicProfile
      organization={selectedPublicOrganization}
      posts={posts}
      onBack={() => setSelectedPublicOrganization(null)}
    />
  ) : selectedPublicProfile &&
    (role === "Scholar" || role === "Organization" || role === "Admin") ? (
    <ScholarPublicProfile
      scholar={selectedPublicProfile}
      onBack={() => setSelectedPublicProfile(null)}
      role={role}
      onMessage={(person) => {
        setMessageContact({
          name: person.name,
          field: person.field || person.headline || "Karta member",
          image: person.image,
        });
        setSelectedPublicProfile(null);
        navigateToPage("Messages");
      }}
    />
  ) : page === "Notifications" && (role === "Scholar" || role === "Alumni") ? (
    <NotificationsPage role={role} profile={profile} />
  ) : role === "Alumni" && page === "Alumni Directory" ? (
    <AlumniDirectory onOpen={setSelectedPublicProfile} />
  ) : role === "Alumni" &&
    (page === "Home" || page === "Overview" || page === "Community Feed") ? (
    <Dashboard
      role="Alumni"
      profile={profile}
      setPage={navigateToPage}
      posts={posts}
      onPublish={handlePublishPost}
      onEditPost={handleEditPost}
      onViewProfile={(person) => {
        const alumni = demoAlumni.find((a) => a.name === person.name);
        setSelectedPublicProfile(alumni || person);
      }}
      PostComposer={OrganizationPostComposer}

    />
  ) : role === "Admin" && page === "Alumni Management" ? (
    <AdminAlumniManagement
      requests={alumniRequest ? [alumniRequest] : []}
      onReviewRequest={reviewAlumniRequest}
    />
  ) : page === "Home" || page === "Overview" ? (
    <Dashboard
      role={role}
      profile={profile}
      setPage={navigateToPage}
      posts={posts}
      onPublish={handlePublishPost}
      onViewProfile={setSelectedPublicProfile}
      PostComposer={OrganizationPostComposer}
    />
  ) : page === "Discover" ? (
    <Discover
      posts={posts}
      onViewOrganization={setSelectedPublicOrganization}
      onViewProfile={setSelectedPublicProfile}
      PostComposer={OrganizationPostComposer}
    />
  ) : page === "Talent" && role === "Organization" ? (
    <OrganizationTalent
      onViewProfile={setSelectedPublicProfile}
      PostComposer={OrganizationPostComposer}
    />
  ) : page === "Community" && role === "Organization" ? (
    <OrganizationCommunity
  posts={posts}
  setPosts={setPosts}
  onPublish={handlePublishPost}
/>
  ) : page === "My network" ? (
    <Network
      onViewProfile={setSelectedPublicProfile}
      PostComposer={OrganizationPostComposer}
    />
  ) : page === "Messages" && role === "Organization" ? (
    <OrganizationMessages initialApplicant={activeChatApplicant} />
  ) : page === "Messages" ? (
    <Messages initialPerson={messageContact} />
  ) : page === "Manage jobs" && role === "Organization" ? (
    <OrganizationJobs
      jobs={orgJobs}
      setJobs={setOrgJobs}
      onViewApplicants={(title) => {
        setSelectedOrgJob(title);
        navigateToPage("Applicants");
      }}
    />
  ) : page === "Applicants" && role === "Organization" ? (
    <OrganizationApplicants
      jobs={orgJobs}
      applicants={orgApplicants}
      setApplicants={setOrgApplicants}
      selectedJob={selectedOrgJob}
      setSelectedJob={setSelectedOrgJob}
      setPage={navigateToPage}
      onMessageCandidate={setActiveChatApplicant}
      onStatusChange={(applicationId, status) =>
        setApplications((v) =>
          v.map((a) =>
            a.id === applicationId
              ? { ...a, status: status === "New" ? "Reviewing" : status }
              : a,
          ),
        )
      }
    />
  ) : page === "Opportunities" ? (
    <Opportunities
      orgJobs={orgJobs}
      applications={applications}
      setPage={navigateToPage}
      onApply={(job, details) => {
        const id = Date.now();
        const app = {
          id,
          jobId: job.id ?? job.title,
          title: job.title,
          company: job.company,
          location: job.place || job.location,
          applied: "Just now",
          status: "Reviewing",
          resume: details,
          coverLetter: details.coverLetter,
          version: 1,
          history: [],
        };
        setApplications((v) => [app, ...v]);
        setAppliedOrgJobs((v) =>
          v.includes(job.id ?? job.title) ? v : [...v, job.id ?? job.title],
        );
        setOrgJobs((v) =>
          v.map((j) =>
            (j.id ?? j.title) === (job.id ?? job.title)
              ? { ...j, applicants: (j.applicants || 0) + 1 }
              : j,
          ),
        );
        setOrgApplicants((v) => [
          {
            id,
            name: "Farhan Nisar",
            image: photos.portrait2,
            institution: "Shoolini University",
            field: "Computer Science & AI",
            role: job.title,
            applied: "Just now",
            status: "New",
            email: "farhan.nisar@example.com",
            applicationId: id,
            resumeName: details.name,
            resumeData: details.data,
            resume: { name: details.name, data: details.data },
            coverLetter: details.coverLetter,
          },
          ...v,
        ]);
      }}
    />
  ) : page === "My applications" ? (
    <MyApplications
      applications={applications}
      onUpdate={(id, changes) => {
        setApplications((v) =>
          v.map((a) => {
            if (a.id !== id) return a;
            const history = [
              ...(a.history || []),
              {
                name: a.resume?.name || "Previous resume",
                date: a.updatedAt || a.applied,
              },
            ];
            return { ...a, ...changes, history };
          }),
        );
        setOrgApplicants((v) =>
          v.map((a) =>
            a.applicationId === id
              ? {
                  ...a,
                  resumeName: changes.resume.name,
                  resumeData: changes.resume.data,
                  resume: changes.resume,
                  coverLetter: changes.coverLetter,
                }
              : a,
          ),
        );
      }}
    />
  ) : page === "Company profile" && role === "Organization" ? (
    <OrganizationProfile
  setPage={navigateToPage}
  posts={posts}
  onDeletePost={handleDeletePost}
  onEditPost={handleEditPost}
/>
  ) : page === "My profile" ? (
    <Profile
      userProfile={profile}
      setPage={navigateToPage}
      posts={posts}
      alumniRequest={alumniRequest}
      onRequestAlumni={submitAlumniRequest}
      role={role}
    />
  ) : page === "Admin profile" && role === "Admin" ? (
    <AdminProfile posts={posts} setPage={navigateToPage} />
  ) : role === "Admin" ? (
    <AdminWorkspace
      page={page}
      setPage={navigateToPage}
      posts={posts}
      setPosts={setPosts}
      onDeletePost={handleDeletePost}
      onViewScholar={(x) => {
        setSelectedPublicProfile({ ...x, topic: x.field, adminView: true });
        setSelectedPublicOrganization(null);
      }}
      onViewOrganization={(x) => {
        setSelectedPublicOrganization(x);
        setSelectedPublicProfile(null);
      }}
    />
  ) : page === "Create post" ? (
    <CreatePost
  profile={profile}
  onPublish={handlePublishPost}
  onBack={() => navigateToPage("Home")}
/>
  ) : (
    <Discover posts={posts} />
  );
}
