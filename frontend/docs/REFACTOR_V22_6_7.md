# Karta Connect V22.6.7 — Network search and connection-request workflow

## Changes
- Kept the compact search field in the My Network heading and clarified its Discover placeholder.
- Search filters discoverable scholars by name, university, course, academic year, graduation year, specialization and skills.
- Added a no-results state with a clear-search-and-filters action.
- Corrected the Discover Connect action: it creates a local pending request instead of immediately adding the scholar to Connections.
- Pending requests show Request sent · Cancel; cancelling removes the local pending state.
- Added subtle styles for the filter control, pending state and empty results.

## Scope and limitations
- Frontend demo state only; sent requests reset on refresh.
- No Supabase/backend changes.
- Existing incoming request acceptance and ignore behavior are unchanged.
- Existing connection, follow and profile navigation behavior is unchanged.

## Verification
- Confirmed targeted source snippets were present before patching.
- Production build and browser interaction testing are still required locally.
