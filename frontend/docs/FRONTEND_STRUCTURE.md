# Frontend structure

## Application composition

- `src/App.jsx` is the application controller. It owns demo state and renders the shared shell.
- `src/app/resolvePage.jsx` selects the page component for the current role and page. Keep this file declarative; state belongs in the controller or feature hooks.
- `src/router/AppRouter.jsx` owns role-entry routes.

## Feature ownership

- `src/features/scholar/`: Scholar discovery, profile, network, opportunities and applications.
- `src/features/organization/`: organization profile, talent, community, jobs, applicants and organization messaging.
- `src/features/admin/`: administration and moderation pages.
- `src/features/alumni/`: alumni directory and demo alumni records.
- `src/features/messaging/`: Scholar/Alumni messaging UI.
- `src/features/community/`, `dashboard/`, `notifications/`, `profiles/`: shared feature areas.

## Stylesheet order

`src/main.jsx` imports `styles/index.css`. The index preserves this order: global styles, legacy app rules, access rules, UI refinements, then portal stylesheet entry points. Global styles are split into `tokens.css` and `reset.css`. The legacy and refinement stylesheets remain intact until selector ownership can be verified safely.
