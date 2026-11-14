# Karta Connect V22.6.1 — Visual regression patch

## Issues addressed
- Restored top navigation brand mark and wordmark sizing/alignment.
- Restored circular cropping for the Scholar/Alumni profile summary portrait.

## Scope
- CSS-only patch appended to `src/styles/ui-polish.css`.
- No JSX, application state, routing, data, or business logic changed.
- Existing mobile header rules remain in effect below 760px.

## Verification
- CSS selector and stylesheet import path checked against V22.6.
- Browser visual verification remains required locally.
- Run `npm run build`, then inspect Scholar, Alumni, Organization, and Admin headers.
