# Karta Connect V22.7.0 — Premium Scholar Home visual redesign

## Design direction
Premium & Minimal: warm cream canvas, deep navy typography, cobalt actions, restrained soft-green supporting accents, delicate borders, gentle shadows, and smooth transitions.

## Scope
- CSS-only visual redesign scoped to `.app-scholar` Home dashboard.
- Refined profile card, quick-access panel, feed heading/tabs, post composer, feed cards, right-rail recommendations, opportunity cards and quote card.
- Restored natural document scrolling on desktop and removed nested dashboard column scrollbars.
- Added responsive tablet/mobile layouts and reduced-motion support.

## Preserved
- Existing Dashboard.jsx and React component structure.
- Existing feed data, composer navigation, post interactions, profile navigation, opportunity cards, network navigation and application logic.
- Organization, Admin and Alumni portal styling and behaviour are not targeted.

## Verification status
- Source archive inspected and CSS patch appended.
- Production build not run because `node_modules` is not included in the provided project archive.
- Browser visual regression still needs local verification at desktop, tablet and mobile widths.
