# Account Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add user accounts with email/password, Google/GitHub OAuth, guest mode, and profile-based leaderboards.

**Architecture:** Use Supabase Auth for authentication, a `profiles` table for user data, and link scores to authenticated users via `user_id`. Guest scores persist in localStorage and transfer to accounts on signup.

**Tech Stack:** Next.js 15 (App Router), Supabase Auth, Supabase JS client, Tailwind CSS 4, React 19, TypeScript

## Global Constraints

- All pages must match existing dark theme (zinc-950 bg, glass-card style, violet/indigo gradients)
- Supabase project URL: `https://hvyvynigndzpchprmnbf.supabase.co`
- Supabase anon key: `sb_publishable_PDFCU37MbZJ4hHv02eqGfQ_BKu9DFTW`
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` env vars already set in Vercel
- No new dependencies needed (Supabase JS already installed)

---

## Task 1: Create `profiles` table in Supabase

**Files:**
- SQL to run in Supabase SQL Editor

**Interfaces:**
- Produces: `profiles` table with `id`, `username`, `avatar_url`, `created_at`

- [ ] **Step 1: Run SQL in Supabase SQL Editor**

Go to Supabase Dashboard → SQL Editor → New Query → paste and run:

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

- [ ] **Step 2: Verify table exists**

Run in SQL Editor:

```sql
SELECT * FROM profiles LIMIT 1;
```

Expected: empty result, no error

- [ ] **Step 3: Commit**

```bash
git commit --allow-empty -m "feat: create profiles table in Supabase"
```

---

## Task 2: Add `user_id` column to `scores` table

**Files:**
- SQL to run in Supabase SQL Editor

**Interfaces:**
- Produces: `scores.user_id` nullable FK to `profiles(id)`

- [ ] **Step 1: Run SQL in Supabase SQL Editor**

```sql
ALTER TABLE scores ADD COLUMN user_id uuid REFERENCES profiles(id) ON DELETE CASCADE;
CREATE INDEX idx_scores_user_id ON scores (user_id);
```

- [ ] **Step 2: Verify column exists**

```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'scores' AND column_name = 'user_id';
```

Expected: returns one row with `user_id` and `uuid`

- [ ] **Step 3: Commit**

```bash
git commit --allow-empty -m "feat: add user_id column to scores table"
```

---

## Task 3: Create auth helper library

**Files:**
- Create: `src/lib/auth.ts`

**Interfaces:**
- Produces: `signUp()`, `signIn()`, `signInWithOAuth()`, `signOut()`, `getUser()`, `getProfile()`, `transferGuestScores()`, `generateGuestId()`, `generateGuestName()`

- [ ] **Step 1: Create `src/lib/auth.ts`**

```typescript
import { supabase } from "./supabase";

export type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
};

export async function signUp(email: string, password: string, username: string) {
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .single();

  if (existing) {
    throw new Error("Username already taken");
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;

  if (data.user) {
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({ id: data.user.id, username });

    if (profileError) throw profileError;

    await transferGuestScores(data.user.id);
  }

  return data;
}

export async function signIn(identifier: string, password: string) {
  const isEmail = identifier.includes("@");

  if (isEmail) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: identifier,
      password,
    });
    if (error) throw error;
    return data;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", identifier)
    .single();

  if (!profile) {
    throw new Error("Username not found");
  }

  const { data: user } = await supabase.auth.admin.getUserById(profile.id);

  if (!user?.user?.email) {
    throw new Error("User not found");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: user.user.email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signInWithOAuth(provider: "google" | "github") {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  return data;
}

export function generateGuestId(): string {
  let guestId = localStorage.getItem("guest-id");
  if (!guestId) {
    guestId = crypto.randomUUID();
    localStorage.setItem("guest-id", guestId);
  }
  return guestId;
}

export function generateGuestName(): string {
  let guestName = localStorage.getItem("guest-name");
  if (!guestName) {
    const num = Math.floor(1000 + Math.random() * 9000);
    guestName = `Guest${num}`;
    localStorage.setItem("guest-name", guestName);
  }
  return guestName;
}

type GuestScore = {
  score: number;
  date: string;
};

export async function transferGuestScores(userId: string) {
  const raw = localStorage.getItem("guest-scores");
  if (!raw) return;

  const scores: GuestScore[] = JSON.parse(raw);
  if (scores.length === 0) return;

  await supabase.from("scores").insert(
    scores.map((s) => ({
      score: s.score,
      date: s.date,
      user_id: userId,
    }))
  );

  localStorage.removeItem("guest-scores");
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/auth.ts
git commit -m "feat: add auth helper library"
```

---

## Task 4: Update storage.ts to handle guest vs authenticated scores

**Files:**
- Modify: `src/lib/storage.ts`

**Interfaces:**
- Consumes: `getUser()` from `auth.ts`
- Produces: Updated `addDailyScore()` with `user_id` support, `saveGuestScore()`

- [ ] **Step 1: Read current `src/lib/storage.ts`**

- [ ] **Step 2: Update `src/lib/storage.ts`**

```typescript
import { supabase } from "./supabase";
import { getUser } from "./auth";

export type LeaderboardEntry = {
  score: number;
  date: string;
  username?: string;
};

export async function getDailyLeaderboard(date: string): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from("scores")
    .select("score, date, profiles(username)")
    .eq("date", date)
    .order("score", { ascending: false })
    .limit(100);

  if (error) console.error("getDailyLeaderboard error:", error);
  return (data as LeaderboardEntry[]) ?? [];
}

export async function addDailyScore(date: string, entry: LeaderboardEntry): Promise<void> {
  const user = await getUser();
  const { error } = await supabase.from("scores").insert({
    score: entry.score,
    date,
    user_id: user?.id ?? null,
  });
  if (error) console.error("addDailyScore error:", error);
}

export async function getAllTimeLeaderboard(): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from("scores")
    .select("score, date, profiles(username)")
    .order("score", { ascending: false })
    .limit(100);

  if (error) console.error("getAllTimeLeaderboard error:", error);
  return (data as LeaderboardEntry[]) ?? [];
}

export function saveGuestScore(score: number, date: string) {
  const raw = localStorage.getItem("guest-scores");
  const scores: GuestScore[] = raw ? JSON.parse(raw) : [];
  scores.push({ score, date });
  localStorage.setItem("guest-scores", JSON.stringify(scores));
}

type GuestScore = {
  score: number;
  date: string;
};
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/storage.ts
git commit -m "feat: update storage to support guest vs authenticated scores"
```

---

## Task 5: Create AuthForm component

**Files:**
- Create: `src/components/AuthForm.tsx`

**Interfaces:**
- Consumes: `signUp()`, `signIn()`, `signInWithOAuth()` from `auth.ts`
- Produces: Reusable form component for login/signup

- [ ] **Step 1: Create `src/components/AuthForm.tsx`**

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp, signIn, signInWithOAuth } from "@/lib/auth";

type Props = {
  mode: "login" | "signup";
};

export default function AuthForm({ mode }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signup") {
        if (username.length < 3 || username.length > 20) {
          throw new Error("Username must be 3-20 characters");
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
          throw new Error("Username can only contain letters, numbers, and underscores");
        }
        await signUp(email, password, username);
        router.push("/");
      } else {
        await signIn(email, password);
        router.push("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    try {
      await signInWithOAuth(provider);
    } catch (err) {
      setError(err instanceof Error ? err.message : "OAuth failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8 animate-fade-up">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-400 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">Tradle</span>
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-zinc-500 mt-2">
            {mode === "login"
              ? "Log in to track your scores"
              : "Choose a username and start competing"}
          </p>
        </div>

        <div className="glass-card p-6 space-y-5">
          <div className="flex gap-3">
            <button
              onClick={() => handleOAuth("google")}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-zinc-900 font-medium text-sm hover:bg-zinc-100 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button
              onClick={() => handleOAuth("github")}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 text-white font-medium text-sm hover:bg-zinc-700 transition-colors border border-white/10"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-zinc-900 px-2 text-zinc-500">or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  className="input-field"
                  required
                  minLength={3}
                  maxLength={20}
                  pattern="[a-zA-Z0-9_]+"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                {mode === "login" ? "Email or Username" : "Email"}
              </label>
              <input
                type={mode === "login" ? "text" : "email"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={mode === "login" ? "Enter email or username" : "you@example.com"}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="input-field"
                required
                minLength={6}
              />
            </div>

            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? "Loading..." : mode === "login" ? "Log in" : "Sign up"}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-500">
            {mode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-violet-400 hover:text-violet-300">
                  Sign up
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link href="/login" className="text-violet-400 hover:text-violet-300">
                  Log in
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/AuthForm.tsx
git commit -m "feat: add AuthForm component"
```

---

## Task 6: Create login and signup pages

**Files:**
- Create: `src/app/login/page.tsx`
- Create: `src/app/signup/page.tsx`

**Interfaces:**
- Consumes: `AuthForm` component
- Produces: `/login` and `/signup` routes

- [ ] **Step 1: Create `src/app/login/page.tsx`**

```tsx
import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
```

- [ ] **Step 2: Create `src/app/signup/page.tsx`**

```tsx
import AuthForm from "@/components/AuthForm";

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/login/page.tsx src/app/signup/page.tsx
git commit -m "feat: add login and signup pages"
```

---

## Task 7: Create OAuth callback route

**Files:**
- Create: `src/app/auth/callback/route.ts`

**Interfaces:**
- Consumes: Supabase auth callback
- Produces: Handles OAuth redirect, creates profile if needed

- [ ] **Step 1: Create `src/app/auth/callback/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: existing } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .single();

        if (!existing) {
          const username = user.user_metadata?.full_name
            ?.replace(/\s+/g, "_")
            .toLowerCase() || `user_${user.id.slice(0, 8)}`;

          await supabase.from("profiles").insert({
            id: user.id,
            username,
            avatar_url: user.user_metadata?.avatar_url,
          });
        }

        const raw = localStorage.getItem("guest-scores");
        if (raw) {
          const scores = JSON.parse(raw);
          if (scores.length > 0) {
            await supabase.from("scores").insert(
              scores.map((s: { score: number; date: string }) => ({
                score: s.score,
                date: s.date,
                user_id: user.id,
              }))
            );
            localStorage.removeItem("guest-scores");
          }
        }
      }
    }
  }

  return NextResponse.redirect(`${origin}/`);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/auth/callback/route.ts
git commit -m "feat: add OAuth callback route"
```

---

## Task 8: Create UserMenu component

**Files:**
- Create: `src/components/UserMenu.tsx`

**Interfaces:**
- Consumes: `getUser()`, `getProfile()`, `signOut()` from `auth.ts`
- Produces: Header user dropdown with avatar, username, logout

- [ ] **Step 1: Create `src/components/UserMenu.tsx`**

```tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUser, getProfile, signOut, type Profile } from "@/lib/auth";

export default function UserMenu() {
  const router = useRouter();
  const [user, setUser] = useState<Awaited<ReturnType<typeof getUser>>>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const u = await getUser();
      setUser(u);
      if (u) {
        const p = await getProfile(u.id);
        setProfile(p);
      }
    })();
  }, []);

  if (!user) {
    return (
      <Link href="/login" className="btn-ghost px-4 py-2 text-sm">
        Log in
      </Link>
    );
  }

  const handleLogout = async () => {
    await signOut();
    setOpen(false);
    router.refresh();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/[0.05] transition-colors"
      >
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt=""
            className="w-6 h-6 rounded-full"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-400 flex items-center justify-center text-xs font-bold text-white">
            {profile?.username?.[0]?.toUpperCase() ?? "?"}
          </div>
        )}
        <span className="text-sm text-white font-medium hidden sm:inline">
          {profile?.username ?? "User"}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 glass-card p-1.5 z-50 animate-fade-up">
            <div className="px-3 py-2 border-b border-white/[0.06] mb-1">
              <p className="text-sm text-white font-medium">{profile?.username}</p>
              <p className="text-xs text-zinc-500">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors"
            >
              Log out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/UserMenu.tsx
git commit -m "feat: add UserMenu component"
```

---

## Task 9: Update layout header with UserMenu

**Files:**
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: `UserMenu` component

- [ ] **Step 1: Read `src/app/layout.tsx`**

- [ ] **Step 2: Update `src/app/layout.tsx`**

Add `UserMenu` import and add it to the header. The header should show:
- Left: Tradle logo
- Center: "Daily Challenge" badge
- Right: UserMenu (login button for guests, username for authenticated)

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: add UserMenu to layout header"
```

---

## Task 10: Update GameOver to handle guest vs authenticated

**Files:**
- Modify: `src/components/GameOver.tsx`

**Interfaces:**
- Consumes: `addDailyScore()`, `saveGuestScore()` from `storage.ts`, `getUser()` from `auth.ts`

- [ ] **Step 1: Read `src/components/GameOver.tsx`**

- [ ] **Step 2: Update `src/components/GameOver.tsx`**

Replace the `useEffect` that saves scores:

```typescript
useEffect(() => {
  const today = nyDateKey();
  const entry = { score: totalScore, date: today };

  (async () => {
    const user = await getUser();
    if (user) {
      await addDailyScore(today, entry);
    } else {
      saveGuestScore(totalScore, today);
    }
  })();
}, [totalScore, results]);
```

- [ ] **Step 3: Commit**

```bash
git add src/components/GameOver.tsx
git commit -m "feat: handle guest vs authenticated score saving"
```

---

## Task 11: Update Leaderboard to show usernames

**Files:**
- Modify: `src/components/Leaderboard.tsx`

**Interfaces:**
- Consumes: `LeaderboardEntry` with `username` field

- [ ] **Step 1: Read `src/components/Leaderboard.tsx`**

- [ ] **Step 2: Update `src/components/Leaderboard.tsx`**

Update the entry display to show `entry.username ?? "Guest"` instead of just the score.

- [ ] **Step 3: Commit**

```bash
git add src/components/Leaderboard.tsx
git commit -m "feat: show usernames on leaderboard"
```

---

## Task 12: Update landing page for guest vs authenticated

**Files:**
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `UserMenu` component (already in layout)
- Produces: Landing page shows "Start Today's Puzzle" for all users

- [ ] **Step 1: Read `src/app/page.tsx`**

- [ ] **Step 2: Verify landing page works**

The landing page already has a "Start Today's Puzzle" button that goes to `/play`. No changes needed since the header now shows UserMenu.

- [ ] **Step 3: Commit (if changes needed)**

```bash
git commit --allow-empty -m "chore: verify landing page works with auth"
```

---

## Task 13: Test the full flow

**Files:**
- None (manual testing)

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Test guest flow**

1. Visit `/` — should see "Login" button in header
2. Click "Start Today's Puzzle" — play a game as guest
3. After game, check localStorage for `guest-scores` — should have score
4. Leaderboard should show "GuestXXXX" name

- [ ] **Step 3: Test signup flow**

1. Visit `/signup`
2. Fill in email, password, username
3. Click "Sign up"
4. Should redirect to `/`
5. Header should show username
6. Play a game — score should save with `user_id`
7. Leaderboard should show username

- [ ] **Step 4: Test login flow**

1. Log out via header dropdown
2. Visit `/login`
3. Log in with email + password
4. Header should show username
5. Previous scores should appear on leaderboard

- [ ] **Step 5: Test OAuth flow**

1. Visit `/login`
2. Click "Google" or "GitHub"
3. Complete OAuth flow
4. Should redirect to `/` with username in header
5. Profile should be created in Supabase

- [ ] **Step 6: Test guest score transfer**

1. Clear localStorage
2. Play a game as guest (score saved to localStorage)
3. Sign up for an account
4. Check leaderboard — guest scores should now show with new username

- [ ] **Step 7: Push all changes**

```bash
git push origin account-feature
```

---

## Summary

| Task | Description | Files Created/Modified |
|------|-------------|----------------------|
| 1 | Create profiles table | SQL |
| 2 | Add user_id to scores | SQL |
| 3 | Auth helper library | `src/lib/auth.ts` |
| 4 | Update storage | `src/lib/storage.ts` |
| 5 | AuthForm component | `src/components/AuthForm.tsx` |
| 6 | Login/signup pages | `src/app/login/page.tsx`, `src/app/signup/page.tsx` |
| 7 | OAuth callback | `src/app/auth/callback/route.ts` |
| 8 | UserMenu component | `src/components/UserMenu.tsx` |
| 9 | Update layout | `src/app/layout.tsx` |
| 10 | Update GameOver | `src/components/GameOver.tsx` |
| 11 | Update Leaderboard | `src/components/Leaderboard.tsx` |
| 12 | Verify landing page | `src/app/page.tsx` |
| 13 | Test full flow | Manual |
