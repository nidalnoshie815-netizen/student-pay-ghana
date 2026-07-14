
## Goal
Turn Student Pay into a multi-role platform. Keep all existing UI, colors, logo, nav, and the current Parent dashboard exactly as they are. Add three new roles (Student, Vendor, Admin) that share the same design language.

## Roles & what each dashboard does

- **Parent** — unchanged. Existing `/parent` dashboard, QR wallet, add-money, transactions, insights, settings.
- **Student** — view own balance (funded by parent), show withdrawal QR (student ID), see recent transactions, pay a vendor.
- **Vendor** — scan/enter a student QR/ID + amount, request payment, see received-payments history.
- **Admin** — overview stats (users per role, total volume), user list with role filter, ability to suspend a user.

## Auth model

Extend the existing mock `guardian-auth` into a generic `auth` layer with a `role` field on every account: `"parent" | "student" | "vendor" | "admin"`.

- Sign-up page adds a role selector (Parent stays the default; Parent-specific "children" section only shows when role = parent; Vendor gets a "Business name" field; Student gets a "Student ID + School" field; Admin is not self-serve — seeded).
- Sign-in is single form; after login we read the role and redirect:
  - parent → `/parent`
  - student → `/student`
  - vendor → `/vendor`
  - admin → `/admin`
- Google sign-in preserved; new Google accounts default to `parent` unless a pending role was set on the auth page.
- One seeded admin account (email `admin@studentpay.gh`, password `admin123`) created on first load if none exists.

## Routing

Add a small `RoleGate` helper (client-side, mirrors existing guardian redirect) used by each new dashboard route. It reads the session and, if the role doesn't match, redirects to that user's correct dashboard (or `/guardian/auth` if signed out).

New route files:
- `src/routes/student.tsx`
- `src/routes/vendor.tsx`
- `src/routes/admin.tsx`

Landing page (`/`) gets a subtle "I'm a …" role tab on the CTA so new users land on the right sign-up flow; visuals unchanged.

## Data (mock localStorage, same pattern as today)

Extend `mock-store` with:
- `users` (already there via guardian) — add `role`, `businessName?`, `suspended?`.
- `studentWallets` — balance per studentId, funded when a parent tops up.
- `vendorPayments` — vendor-initiated charges linked to a studentId.

Parent "Add money" already writes transactions; we'll also credit the linked student's wallet so the Student dashboard shows a real balance. No schema/DB changes — still front-end mock (matches the rest of the app).

## Files to add / edit

Add:
- `src/lib/roles.ts` — role type + `useRequireRole(role)` hook + redirect map.
- `src/routes/student.tsx`, `src/routes/vendor.tsx`, `src/routes/admin.tsx`.
- `src/components/RoleSwitcher.tsx` — role picker used in sign-up.

Edit (minimal, additive):
- `src/lib/guardian-auth.ts` — add `role`, `businessName` fields; seed admin; role-aware redirects; keep function names.
- `src/routes/guardian.auth.tsx` — add role selector; conditional fields; redirect by role after login.
- `src/routes/index.tsx` — role tabs on the hero CTA (design preserved).
- `src/components/BottomNav.tsx` — show only for parent (existing behavior); student/vendor/admin get their own lightweight top nav to stay consistent with the current look.

Nothing in the existing Parent flow, colors, or components changes visually.

## Out of scope for this pass
- Real backend / Lovable Cloud tables (still local mock, matching current app).
- Vendor payouts, admin audit logs, KYC.

Ship this, then we can wire it to Cloud in a follow-up if you want persistence across devices.
