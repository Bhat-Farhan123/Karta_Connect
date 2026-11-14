# Karta Connect V22.6.6 — Profile menu dismissal

## Fix
- The header profile menu closes when the user clicks or taps anywhere outside the menu.
- Pressing Escape also closes the menu.
- Clicks inside the profile menu continue to work normally.
- Existing menu actions and navigation behavior are unchanged.

## Files changed
- `src/components/shell.jsx`

## Verification
- Reviewed the Header component and confirmed the outside-click listener is attached only while the menu is open and cleaned up on close/unmount.
- Browser interaction and production build should be verified locally.
