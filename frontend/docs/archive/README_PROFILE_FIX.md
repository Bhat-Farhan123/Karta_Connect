Karta Connect V22 - Profile Ownership/Public Profile Fix

Install and run:
  npm install
  npm run dev

Test:
1. Select Alumni role.
2. Click Me in the top navigation, then View profile. It should open My Profile (editable), not another person's profile.
3. Open Alumni Directory and select a different Alumni. It should open the read-only public profile with tabs including Activity.
4. Check Activity for posts authored by that Alumni; if none exist, an empty state is shown.
5. Return to the directory using the back link.

This is a frontend-only demo; Supabase persistence and server-side authorization are not connected.
