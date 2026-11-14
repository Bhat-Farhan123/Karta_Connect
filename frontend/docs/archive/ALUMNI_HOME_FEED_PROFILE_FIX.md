# Alumni Home Feed and Profile Menu Fix

## Changes
- Alumni Home now renders the same shared community-feed dashboard used by Scholars, rather than the promotional Alumni landing page with a separate feed link.
- The Alumni Community Feed sidebar item opens the same shared feed view.
- Shared dashboard feed actions and post composer remain available to Alumni.
- The dashboard profile summary identifies the demo user as Alumni rather than Scholar.
- The top-right profile menu displays the Alumni identity.
- Selecting View profile from the Alumni navbar opens the full-page Alumni profile.

## Notes
- This is still frontend demo data and state; no Supabase integration was added.
- A Vite build could not be run because npm dependency installation timed out in this environment.
