# Karta Connect V22.6 — Application and stylesheet organization

## Scope of this pass

- Moved the page-selection/rendering expression out of `src/App.jsx` into `src/app/resolvePage.jsx`.
- Kept all application state and existing callbacks in `App.jsx`; the resolver receives those values as explicit arguments.
- Split global design tokens and browser reset rules into `styles/tokens.css` and `styles/reset.css`.
- Preserved the existing CSS cascade and stylesheet import order. The large legacy stylesheet has intentionally not been divided into portal styles yet because its selectors are shared and overlapping; moving rules without a selector/visual audit risks regressions.

## Responsibilities

- `src/App.jsx`: owns current demo state, state update functions, and the shared application shell.
- `src/app/resolvePage.jsx`: maps the active role/page and selected profile state to the existing feature page components. It must not own React state.
- `src/router/AppRouter.jsx`: owns role-entry routes.
- `src/features/<portal>/`: owns portal page implementations.
- `src/styles/tokens.css`: global design tokens and typography defaults.
- `src/styles/reset.css`: browser reset and shared element defaults.
- `src/styles/legacy-app.css`: retained legacy/shared visual rules until audited and safely categorized.
- `src/styles/portals/`: reserved for portal-specific rules after selector ownership is verified.

## Behavior preservation notes

The page-selection expression was moved without changing its branch order or component props. `setPage` references used inside the resolver are routed through the existing `navigateToPage` callback. Demo state remains in the application controller. No backend or Supabase integration was introduced.

## Verification

- TypeScript compiler JSX transpilation/parser pass: all 17 JavaScript/JSX files parsed without syntax diagnostics.
- Production Vite build: not verified; dependency installation did not complete in the execution environment.
- Manual browser regression: still required for Scholar, Organization, Admin, Alumni, and messaging flows.

## Next safe steps

1. Install dependencies locally and run `npm run build`.
2. Smoke-test every portal and the messaging flows.
3. Audit selector ownership in `legacy-app.css` and `ui-polish.css` before moving rules into portal stylesheets.
4. Extract portal page modules and shared hooks in small batches, running build and browser checks after each batch.
