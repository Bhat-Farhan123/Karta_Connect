# Karta Connect V22.6.8 — My Network layout regression fix

- Aligns the My Network heading, connection count and search field in one row on desktop; stacks cleanly on tablet/mobile.
- Restricts incoming-request portraits to fixed 64px circular avatars (52px on narrow screens), preventing image intrinsic dimensions from expanding request cards.
- Uses request-list-scoped selectors so unrelated avatars, post media and profile images are not affected.
- CSS-only patch; no React state, routing, or request business logic changed.
- Browser visual verification and production build are still required locally.
