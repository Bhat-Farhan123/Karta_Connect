# Karta Connect Architecture

## 1. Overview

Karta Connect currently uses a React and Vite frontend with Supabase providing backend services.

The frontend communicates with Supabase through the JavaScript client and service modules.

There is no separate Express.js, Node.js API server, or FastAPI application in the current repository structure.

## 2. Frontend Structure

The main application code is inside `frontend/src`.

| Directory | Responsibility |
|---|---|
| `app/` | Page resolution |
| `components/` | Shared UI and protected routes |
| `context/` | Authentication context |
| `features/` | Role-based and feature-specific screens |
| `lib/` | Supabase client |
| `router/` | Application routing |
| `services/` | Supabase data operations |
| `styles/` | Global and shared styles |

## 3. Authentication Flow

1. The application initializes the Supabase client.
2. `AuthContext` retrieves the current session.
3. Authentication changes are observed through the auth subscription.
4. The application loads the corresponding user profile.
5. Protected routes check authentication, account status, and role.
6. Users are directed to the appropriate portal.

The current protected route checks for an active account and the expected role. These frontend checks complement, but do not replace, database authorization.

## 4. Application Roles

The application includes separate areas for:

- Scholars
- Organizations
- Administrators
- Alumni

Access must be enforced by database policies and trusted backend operations as well as frontend routing.

## 5. Supabase Integration

The Supabase client is configured in:

`frontend/src/lib/supabase.js`

Environment variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Application operations are organized into service modules, including authentication, scholar invitations, community posts, and administrative activity.

## 6. Community Feed

The community feed uses Supabase-backed post operations.

The post service supports fetching, creating, updating, status changes, and deleting posts.

Author information is retrieved through the restricted `post_author_profiles` view, alongside relevant organization and scholar profile information.

The current implementation uses the `post-media` and `scholar-media` Storage buckets. Their actual privacy and access policies must be verified in Supabase.

## 7. Invitations

The scholar service supports invitation creation, updates, and bulk invitation records.

It also invokes a Supabase Edge Function named `invite-scholar`. The current repository contains no implementation of that function, so its deployed implementation and configuration must be verified separately.

## 8. Security Boundaries

Frontend route checks are not sufficient authorization.

Verify the following in the hosted Supabase project:

- Row Level Security on all relevant tables and views.
- Role-specific read and write policies.
- Invitation creation and acceptance permissions.
- Official platform posting permissions.
- Scholar-only messaging and message-request permissions.
- Private resume and profile file access.
- Storage bucket policies.
- Administrative activity log permissions.
- Edge Function authorization and secret handling.

Do not treat a feature as securely enforced until its database and backend controls have been verified.

## 9. Database and Migrations

The repository contains a Supabase configuration starter and a migrations directory, but the current workspace does not contain the actual SQL migration history.

The hosted database schema and previously applied SQL changes should be exported or recovered before using this repository as the authoritative migration source.

Do not run destructive database changes based only on this documentation.
