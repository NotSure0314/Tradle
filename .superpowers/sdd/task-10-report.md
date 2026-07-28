# Task 10: Guest vs Authenticated Score Saving

## Changes

### `src/components/GameOver.tsx`
- Added imports: `getUser` from `@/lib/auth`, `saveGuestScore` from `@/lib/storage`, `generateGuestName` from `@/lib/auth`
- Added `useState` import and `guestName` state
- Updated `useEffect` to check auth via `getUser()`:
  - Authenticated → `addDailyScore(today, { score: totalScore, date: today })`
  - Guest → `saveGuestScore(totalScore, today)` + set `guestName` via `generateGuestName()`
- Passed `guestName` prop to `Leaderboard`

### `src/components/Leaderboard.tsx`
- Added `guestName?: string | null` to `Props`
- Updated "You" tag to display `guestName ?? "You"` so guests see their generated name

## Verification
- `npm run build` passes with no TypeScript errors
