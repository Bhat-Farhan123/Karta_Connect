# V22.5 — Portal component extraction

## Changes

Moved the large page/component groups out of `src/App.jsx` into role-oriented feature modules:

- Scholar: `src/features/scholar/ScholarPages.jsx`
- Organization: `src/features/organization/OrganizationPages.jsx`
- Admin: `src/features/admin/AdminPages.jsx`
- Alumni: `src/features/alumni/AlumniPages.jsx`

`src/App.jsx` now contains the shared application state, role-aware navigation, page selection, and shared shell composition.

## Preserved

- Existing component implementations and JSX were moved without redesigning their interfaces.
- Demo data and local state behavior remain frontend-only.
- Messaging components remain in their existing dedicated files.
- Existing CSS files and import order were not changed in this batch.

## Validation limitation

A production build could not be run because `npm install --ignore-scripts --no-audit --no-fund` timed out in the execution environment. The project must be installed and built locally. If the build reports any missing imports, resolve those before proceeding to CSS extraction.

## Next batch

Map CSS selector ownership and move portal-specific rules in small batches, checking each portal visually before removing any corresponding rules from `legacy-app.css`.
