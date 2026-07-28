# Task 6: Login & Signup Pages

## What was done
Created two thin wrapper pages:
- `src/app/login/page.tsx` — renders `<AuthForm mode="login" />`
- `src/app/signup/page.tsx` — renders `<AuthForm mode="signup" />`

## Verification
`npm run build` passed with no TypeScript errors. Both `/login` and `/signup` routes appear in the build output as static pages (2.8 kB each).
