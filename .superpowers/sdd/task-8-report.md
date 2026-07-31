# Task 8: UserMenu Component

## Summary
Created `src/components/UserMenu.tsx` — a header dropdown for authenticated users.

## Implementation
- **Auth check on mount**: Uses `getUser()` and `getProfile()` to load the user profile
- **Unauthenticated state**: Shows a "Log in" link (`btn-ghost` class) pointing to `/login`
- **Authenticated state**: Shows a clickable avatar circle (image from `avatar_url` or first-letter gradient fallback)
- **Dropdown**: Toggles on click, uses `.glass-card` for styling, shows username, email, and "Log out" button
- **Sign out**: Calls `signOut()`, closes dropdown, refreshes page
- **Click-outside**: Uses `mousedown` listener to close dropdown when clicking outside
- **Cleanup**: All async work is guarded by a `cancelled` flag to prevent state updates on unmounted components

## Verification
`npm run build` passes with no TypeScript or compilation errors.
