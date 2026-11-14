# Security rules

1. Frontend code may contain only the Supabase URL and publishable/anon key.
2. Never put service-role or secret keys in Vite environment variables.
3. Treat RLS as the authorization boundary; do not rely on hidden UI controls.
4. Validate role, account status and organization verification in database policies/RPCs.
5. Keep resumes and organization verification documents in private buckets.
6. Use narrow SQL migrations; do not replace existing policies/functions without inspecting their definitions.
7. Test as scholar, alumni, organization and admin accounts separately.
8. Do not expose private profile fields (email, documents, application data) through public profile queries.
