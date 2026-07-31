# Task 5: AuthForm Component

**Status:** ✅ Complete

## What Was Implemented

Created `src/components/AuthForm.tsx` — a reusable login/signup form component.

### Features
- Accepts `mode: "login" | "signup"` prop to toggle between forms
- **Login mode:** email/username + password fields
- **Signup mode:** username + email + password fields
- OAuth buttons (Google, GitHub) at the top using `signInWithOAuth`
- Divider line with "or continue with email" text
- Error display with red styling below the form
- Switch link at bottom ("Don't have an account? Sign up" / "Already have an account? Sign in")
- On submit: calls `signUp` or `signIn` from `@/lib/auth`, redirects to `/` on success
- Username validation: 3-20 chars, alphanumeric + underscores only (`/^[a-zA-Z0-9_]{3,20}$/`)
- Dark theme matching existing design (`.glass-card`, `.input-field`, `.btn-primary`, `.btn-ghost` classes)

### Design Consistency
- Uses existing CSS utility classes from `globals.css`
- Matches component patterns: `"use client"`, default export, typed props
- Follows existing dark theme conventions (zinc-400/500/600 text, violet accents, glass borders)

## Test Results

- `npm run build` — ✅ Compiled successfully, no TypeScript errors
- No lint errors reported

## Concerns

- None. Component is fully typed, follows existing patterns, and builds cleanly.
