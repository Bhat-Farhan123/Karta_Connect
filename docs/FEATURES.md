# Feature Inventory

This document distinguishes existing interfaces and service operations from features whose complete implementation or security has not yet been verified.

| Feature | Current understanding |
|---|---|
| Authentication | Supabase Auth integration exists |
| Protected portals | Scholar, Organization, Admin and Alumni routes exist |
| Scholar profiles | Supabase profile integration exists; verify all profile sections |
| Organization profiles | Organization portal and profile functionality exist; verify completeness |
| Community feed | Supabase post service operations exist |
| Post author information | Restricted author-profile view is used |
| Scholar invitations | Single and bulk invitation service operations exist |
| Invitation email | Calls `invite-scholar`; implementation is not present in this repository |
| Job posts | UI and local/demo state exist; verify persistent backend integration |
| Applications | UI and local/demo state exist; verify persistent backend integration |
| Messaging | Messaging interfaces exist; verify end-to-end behavior and access policies |
| Notifications | Notification interface exists; verify data persistence and delivery |
| Admin activity | Service operations for activity logs exist; verify database policies |
| Resume access | Intended for authorized organizations and Admin; verify Storage and database policies |

## Important Verification Rules

A screen or service method does not by itself prove that a feature is complete.

Before marking a feature production-ready, verify:

1. The full user workflow.
2. Persistent database operations.
3. Role-specific authorization.
4. Error handling and empty states.
5. Security policies and Storage permissions.
6. Testing with separate accounts for different roles.

## Known Repository Limitations

- The `invite-scholar` Edge Function source is not present in this workspace.
- The original SQL migration files are not present in the migrations directory.
- Some job and application functionality still uses local/demo state.
- The security of messaging, resumes, official posts, and administrative actions requires database-level verification.
