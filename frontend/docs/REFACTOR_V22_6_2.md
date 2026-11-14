# Karta Connect V22.6.2 — Search and avatar visual fix

- Fixed the top navigation search control to use a centered horizontal flex row so its icon and input remain on one line.
- Added circular cropping and object-fit to the Notifications profile avatar while preserving its existing overlap and dimensions.
- CSS-only change; no React behavior, routing, data, or state changed.
- Browser verification is required locally; run `npm run build` and inspect Scholar Home and Notifications at desktop and mobile widths.
