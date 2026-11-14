# Incremental integration plan

1. Verify frontend install/build and Supabase client configuration.
2. Connect authentication and restore role-based routing without changing page design.
3. Add safe profile read/write services.
4. Integrate scholar invitation activation and organization verification.
5. Integrate feed, connections and notifications.
6. Integrate message requests and realtime chat.
7. Integrate jobs, applications and private resume access.
8. Integrate admin workflows, alumni network and skill assessments.

For each step: inspect current component behavior, add a focused service, make the smallest possible UI wiring change, test all affected roles, and retain a rollback point.
