# V22 Job Details & Application Workflow Update

## Added
- Opportunity cards open a detailed role view with company, location, job type, compensation, deadline, description, responsibilities and requirements.
- Scholars submit an application with a role-specific PDF resume (max 5 MB) and optional cover letter.
- A scholar can use a different resume for each job.
- Added My Applications navigation and application tracking view.
- Scholars can edit an application while it is under review, replace the resume, update the cover letter, and save changes.
- Resume replacement creates a previous-version history entry; the latest resume is stored on the application and is also reflected on the organization-side demo applicant record.
- Editing is disabled for shortlisted, interview, selected, rejected and withdrawn statuses.

## Current implementation boundary
This V22 frontend demo stores application and resume data in local React state/module-level preview state. It is not persistent across a browser refresh and is not secure document storage. Before production, store resume files in Supabase Storage with private buckets and signed access, store application/version metadata in Supabase tables, enforce scholar/organization permissions with RLS and server-side policies, and synchronize status changes between organization and scholar portals.
