# Scholar-to-Alumni conversion workflow (frontend demo)

- Existing Scholars request Alumni status from My Profile > Account Status.
- Request captures graduation year, degree, department, graduation date and notes.
- Submission leaves the account as Scholar and records a Pending request.
- Admin reviews the request under Admin > Alumni Management.
- Admin can reject or approve after confirming the graduation year.
- Approval updates the request state; when the Scholar route is opened again, the existing account is presented as Alumni and receives the Alumni navigation/dashboard.
- The same account identity is retained; no second account is created.

## Persistence and limitations

This is a frontend-only demonstration. The request is stored in browser localStorage so the Scholar and Admin views in the same browser can share it. It is not secure, multi-user persistence and must be replaced with authenticated Supabase records and server-enforced authorization before production. Profile data and the rest of the demo application retain their existing frontend-only behavior.
