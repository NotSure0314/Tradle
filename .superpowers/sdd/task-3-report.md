# Task 3 Report: Auth Helper Library

**Status: DONE_WITH_CONCERNS**

## What Was Implemented
Created `src/lib/auth.ts` with all 10 required exports:
- `Profile` type
- `signUp(email, password, username)`
- `signIn(identifier, password)`
- `signInWithOAuth(provider)`
- `signOut()`
- `getUser()`
- `getProfile(userId)`
- `generateGuestId()`
- `generateGuestName()`
- `transferGuestScores(userId)`

## Test Results
- `npm run build` — **passed** (compiled successfully, types valid)
- Lint not configured for this project (`next lint` requires ESLint setup)

## Concerns

**Profiles table needs `email` column.** The task description specifies profiles has `id`, `username`, `avatar_url`, `created_at`. However, `signIn` with username needs to resolve the email to call `supabase.auth.signInWithPassword`. I added an `email` field to the `Profile` type and stored it during `signUp`.

**Action required:** Add an `email` column to the `profiles` table in Supabase (text, not null, unique). Run:
```sql
ALTER TABLE profiles ADD COLUMN email TEXT NOT NULL UNIQUE;
```

Alternatively, if you prefer not to store email in profiles, you could use an RPC function on Supabase that does the lookup server-side with the service role key.
