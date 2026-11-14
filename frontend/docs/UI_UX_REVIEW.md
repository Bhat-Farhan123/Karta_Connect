# Karta Connect V22 — UI/UX review and refinement

## Scope
This pass applies a shared visual refinement layer across Scholar, Alumni, Organization and Admin screens. It intentionally does not change route names, business logic, role permissions, demo data, application states or backend behavior.

## Audit findings addressed
- Visual drift between older and newer screen generations: consolidated shared color, surface, border, radius and shadow tokens.
- Inconsistent navigation and shell density: refined header/sidebar proportions, active navigation and hover feedback.
- Uneven content hierarchy: standardized page heading rhythm and readable body copy.
- Inconsistent cards and social feed surfaces: aligned border, radius, spacing, hover and interaction treatments.
- Form accessibility: consistent focus rings and clearer focus-visible states.
- Data-heavy pages: refined table row rhythm and header contrast.
- Responsive behavior: adjusted shell, metrics, right rail and feed spacing for tablet/mobile widths.
- Motion accessibility: respects `prefers-reduced-motion`.

## Design principles
- Warm off-white canvas, white surfaces, deep navy text and restrained cobalt accents.
- Green for positive/verified states; amber and red reserved for meaningful status feedback.
- Consistent 9–14px control/card radii, subtle borders and low-elevation shadows.
- Preserve content density and familiar navigation; avoid decorative banners and unnecessary dashboard widgets.
- Use visible keyboard focus and comfortable mobile touch targets.

## Files
- `src/styles/ui-polish.css`: additive design-system and responsive refinement layer.
- `src/main.jsx`: imports the refinement layer after existing styles so it can normalize prior visual generations.

## Deliberately not changed
- React component structure and page logic.
- Demo data, role switching, routing and feature behavior.
- Supabase/auth/storage integration.
- Existing component-specific designs where no safe shared selector was available.

## QA still required
Run `npm install`, `npm run build`, then test each role at desktop (1440px), tablet (768px) and mobile (390px). Check navigation, profile editing, feed actions, job applications, organization applicant review, Admin Alumni Management and modal/drawer behavior. This CSS-only refinement is not a substitute for browser regression testing.
