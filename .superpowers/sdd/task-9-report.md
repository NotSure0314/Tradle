# Task 9: Add Shared Header with Tradle Logo and UserMenu

## Summary
Added a shared header to `src/app/layout.tsx` containing the Tradle logo and `UserMenu` component.

## Changes

### `src/app/layout.tsx`
- Imported `UserMenu` from `@/components/UserMenu`
- Added `<header>` inside `page-shell` div (before `{children}`)
- Header contains: Tradle gradient icon + "Tradle" text (left), `UserMenu` (right)
- Styled with: `flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full`

### `src/app/page.tsx`
- Removed the duplicate logo from `page.tsx` header (now lives in layout)
- Header now only shows "Daily Challenge" badge, centered

## Verification
- `npm run build` passed with no TypeScript errors
