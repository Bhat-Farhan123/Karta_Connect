# Karta Connect frontend architecture

Karta Connect is currently a React + Vite frontend demo for Scholar, Alumni, Organization, and Admin portals. Backend integration is intentionally deferred until the frontend is complete and approved.

## Application flow

`main.jsx` mounts `router/AppRouter.jsx`. The router provides role-specific entry routes and mounts `App.jsx` with the selected role. `App.jsx` remains the composition root for shared demo state and role-aware navigation.

## Feature modules

- `components/`: shared UI primitives and shell.
- `features/dashboard/`: dashboard composition.
- `features/messaging/`: Scholar/Alumni messaging.
- `features/organization/`: Organization-only experiences, including applicant messaging.
- `features/profiles/`: public profile views.
- `features/community/`: post creation.
- `features/notifications/`: notifications.
- `data/`: local demo fixtures.

## Styling

All styles are loaded through `styles/index.css`. `global.css` owns design tokens and browser resets. `legacy-app.css` preserves the original application stylesheet and its cascade while portal styles are migrated incrementally into `styles/portals/`. `ui-polish.css` retains existing refinements. Do not remove the compatibility stylesheet until every role has been visually regression-tested.

See `FRONTEND_STRUCTURE.md` for file ownership and migration rules.
