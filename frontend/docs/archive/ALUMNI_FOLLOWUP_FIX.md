# Alumni follow-up fix

- Added the missing Alumni Community Feed route and connected it to the existing shared Scholar/Alumni feed UI, including post composer and feed interactions.
- Prioritized Alumni full-profile routing so selecting an Alumni from the directory opens the full-page profile instead of falling through to another role's profile route.
- Both the Alumni name and View full profile action use the same profile-opening handler.
- No Supabase integration; this remains a frontend demo.
