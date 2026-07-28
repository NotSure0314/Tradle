# Account Feature — Design Doc

## Overview

Add user accounts to Tradle. Users can play as guests (auto-generated names, scores stored locally) or create an account (unique username, scores synced to Supabase). Guest scores transfer to the account on signup.

## User Types

| Type | Name | Scores | Leaderboard |
|------|------|--------|-------------|
| Guest | Auto-generated (Guest1234) | localStorage only | Shows with guest name, not transferable until account created |
| Authenticated | User-chosen, unique across all users | Supabase `scores` table | Shows with username, persistent across devices |

## Auth Methods

1. **Email + password** — signup with email, password, and username
2. **Username or email login** — login with either
3. **Google OAuth** — one-click signup/login
4. **GitHub OAuth** — one-click signup/login

## Database Changes

### New table: `profiles`

```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read profiles"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
```

### Update `scores` table

Add `user_id` column (nullable for guest scores):

```sql
ALTER TABLE scores ADD COLUMN user_id uuid REFERENCES profiles(id) ON DELETE CASCADE;
CREATE INDEX idx_scores_user_id ON scores (user_id);
```

## Pages

### `/login`
- Email/password input
- "Login with Google" button
- "Login with GitHub" button
- Link to `/signup`
- Dark theme matching existing design (glass-card, gradient buttons, violet accents)

### `/signup`
- Email input
- Password input
- Username input (validated for uniqueness)
- "Sign up with Google" button
- "Sign up with GitHub" button
- Link to `/login`
- Dark theme matching existing design

### Header changes
- Guest: shows "Login" button in header
- Authenticated: shows username + avatar, dropdown with profile/logout

## Guest Flow

1. On first visit, generate random UUID → store as `guest-id` in localStorage
2. Generate random guest name (Guest + 4 digits) → store as `guest-name` in localStorage
3. Guest scores saved to localStorage (existing behavior)
4. On signup/login:
   - Check localStorage for `guest-scores`
   - Insert all guest scores into `scores` table with `user_id` = new user's ID
   - Clear localStorage guest data
   - Redirect to home page

## Score Transfer

```typescript
async function transferGuestScores(userId: string) {
  const raw = localStorage.getItem("guest-scores");
  if (!raw) return;
  const scores = JSON.parse(raw) as GuestScore[];
  await supabase.from("scores").insert(
    scores.map(s => ({
      score: s.score,
      date: s.date,
      user_id: userId,
    }))
  );
  localStorage.removeItem("guest-scores");
}
```

## Components to Create

| Component | Purpose |
|-----------|---------|
| `src/app/login/page.tsx` | Login page |
| `src/app/signup/page.tsx` | Signup page |
| `src/components/AuthForm.tsx` | Shared form logic (email/password inputs, OAuth buttons) |
| `src/components/UserMenu.tsx` | Header user dropdown (avatar, username, logout) |
| `src/lib/auth.ts` | Auth helper functions (sign up, sign in, sign out, get user, transfer guest scores) |

## Files to Modify

| File | Change |
|------|--------|
| `src/app/layout.tsx` | Add UserMenu to header |
| `src/app/page.tsx` | Add Login/Signup CTA for guests |
| `src/lib/storage.ts` | Add `guest-scores` localStorage management, add `user_id` to score inserts |
| `src/components/GameOver.tsx` | Pass user_id when inserting scores (if authenticated) |
| `.env.local` | Already has Supabase URL + anon key (no change needed) |
| Vercel env | No change needed |

## Styling Notes

- Login/signup pages: dark background (`bg-zinc-950`), centered card
- Form inputs: dark inputs with border (`border-white/10 bg-white/5`)
- OAuth buttons: Google = white bg, GitHub = black bg
- Submit button: gradient (indigo → violet) matching existing `btn-primary`
- Username validation: check uniqueness in real-time as user types (debounced)
- Error states: red text under inputs

## Security

- RLS on `profiles`: users can only update their own profile
- RLS on `scores`: anyone can read, insert with `user_id` = `auth.uid()`
- Guest scores: no user_id, public read, insert only from client
- OAuth: Supabase handles token exchange, we just handle the callback
