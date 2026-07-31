# Task 4: Storage Updates

**Status:** ✅ Complete

## Changes Made

1. **`LeaderboardEntry` type** — Added optional `username?: string` field.

2. **`getDailyLeaderboard`** — Updated select to `score, date, profiles(username)` to join profiles for usernames.

3. **`getAllTimeLeaderboard`** — Same profiles join as daily leaderboard.

4. **`addDailyScore`** — Now imports `getUser()` from auth.ts and includes `user_id` in the insert (falls back to `null` for unauthenticated saves).

5. **`saveGuestScore(score, date)`** — New function that appends `{ score, date }` to `guest-scores` in localStorage, parsing existing data with proper validation.

## Verification

- `npm run build` — ✅ Compiled successfully, no TypeScript errors.
