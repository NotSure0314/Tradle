## Task 7: OAuth Callback Route

**File created:** `src/app/auth/callback/route.ts`

### What was built
- GET route handler at `/auth/callback` for Google/GitHub OAuth flows
- Extracts `code` query parameter and exchanges it for a session via `supabase.auth.exchangeCodeForSession(code)`
- Fetches authenticated user and creates a profile if one doesn't exist:
  - `username` derived from `user.user_metadata.full_name` (lowercased, spaces→underscores) with fallback to `user_<first 8 chars of id>`
  - `email` and `avatar_url` from user metadata
- Transfers guest scores from localStorage to the authenticated account (same logic as `transferGuestScores` in `auth.ts`), with try-catch guards for server-side safety
- Redirects to `/` on success or error

### Verification
- `npm run build` passes with no TypeScript or compilation errors
- Route appears in build output as `ƒ /auth/callback` (dynamic, server-rendered)
