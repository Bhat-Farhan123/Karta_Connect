# Profile ownership and public profile fix

- Navbar Me > View profile now opens the signed-in user's editable My Profile page for both Scholar and Alumni roles.
- Alumni owner profile reuses the editable profile-management layout and shows the Karta Alumni identity badge; Scholar-to-Alumni request panel is hidden for Alumni.
- Selecting another Alumni from the Alumni Directory opens a separate read-only full-page profile.
- The public Alumni profile now has About, Education, Experience, Projects, Skills, Achievements and Activity tabs.
- Activity displays public feed posts authored by that Alumni.
- Public profile notice clarifies that contact details and resumes remain private.
- Existing shared home feed and other role navigation are retained.

This is frontend demo behavior. Profile edits and feed interactions are not backed by Supabase and access enforcement must be implemented server-side before production.
