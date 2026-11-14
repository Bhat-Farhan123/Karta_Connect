# Karta Connect V22.6.9 — Connect-only networking

## Changes
- Removed the Following tab from Scholar My Network.
- Removed Follow/Unfollow state and actions from Scholar Network cards.
- Kept Connect, Request sent (cancel), incoming Accept/Ignore, and Connected states.
- Removed the local follow toggle from the dashboard People to know component; its plus action now opens the person's profile, where the connection action can be accessed.
- No backend, database, messaging authorization, or organization messaging policy changes.

## Verification
- Source-level check only. Run `npm run build` and manually test Discover, Connections, Requests received, and dashboard People to know.
- Connection requests remain local demo state and reset on refresh.
