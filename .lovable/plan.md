# Plan: Quick Actions, Bottom Nav & Add Money Flow

Build a richer parent dashboard with quick actions and a categorized recent-transactions list, add a persistent mobile bottom navigation, and create a dedicated multi-step "Add Money" flow with provider-branded payment screens.

## 1. Parent dashboard updates (`src/routes/parent.tsx`)

**Quick Action Buttons** (4-up grid under the AI Alerts banner):
- Fund Wallet → navigates to `/add-money`
- Withdraw → opens withdraw dialog (reuses existing withdrawal logic)
- Transactions → `/transactions`
- AI Insights → `/insights`

Each rendered as a rounded card with icon + label, using semantic tokens (`bg-card`, `border-border`, `text-primary`).

**Recent Transactions Section** — replace the current flat list with categorized rows. Each transaction gets a `category` derived from existing fields:
- `POS Withdrawal` (withdrawal w/ note containing "POS")
- `Wallet Funding` (deposit)
- `Transfer` (withdrawal w/ note containing "transfer")
- `Vendor Payment` (withdrawal, default)

Show category label + icon, amount, time. "See all" link → `/transactions`.

Remove the inline top-up form from this page (moves to `/add-money`).

## 2. Bottom Navigation Bar (new component)

`src/components/BottomNav.tsx` — fixed bottom bar, 5 items:
- Home (`/parent`)
- Transactions (`/transactions`)
- Scan (center, elevated button — placeholder action, toast "Coming soon")
- Insights (`/insights`)
- Profile (`/guardian/profile`)

Mounted inside authenticated pages (parent, transactions, insights, add-money). Hidden on `md+` if desired, or shown always. Active route highlighted via `useRouterState`.

## 3. Add Money flow (new routes)

### `src/routes/add-money.tsx` — "Add Money" picker
- Title: **Add Money**
- Payment method cards: MTN Mobile Money, Telecel Cash, AirtelTigo Money (reuse `PaymentMethodPicker` styling, excluding Vodafone)
- Amount input (GH₵) with quick-amount chips
- **Continue** button → navigates to `/add-money/{provider}` with amount in search params
- Footer caption: *"Secure payments powered by Student Pay"*

### `src/routes/add-money.mtn.tsx` — MTN Mobile Money
- Header: **MTN Mobile Money** (yellow brand accent)
- Fields: MTN Number, Amount (prefilled from search param)
- Info text: *"You will receive a prompt on your phone. Please enter your MoMo PIN to authorize."*
- **Pay Now** button → simulates payment, calls `addDeposit`, shows success, returns to `/parent`

### `src/routes/add-money.telecel.tsx` — Telecel Cash
Same layout, red brand accent, header **Telecel Cash**.

### `src/routes/add-money.airteltigo.tsx` — AirtelTigo Money
Same layout, blue brand accent, header **AirtelTigo Money**.

Shared logic extracted to `src/components/ProviderPayForm.tsx` to avoid duplication.

## 4. Supporting routes (lightweight placeholders, can grow later)

- `src/routes/transactions.tsx` — full list of all transactions, filterable by type
- `src/routes/insights.tsx` — AI alerts (reuses `generateAIAlerts`) in a dedicated view

Both are auth-gated (redirect to `/guardian/auth` if no guardian) and include the bottom nav.

## 5. Mock store tweak (`src/lib/mock-store.ts`)

Add an optional `category` field to `Transaction` ("POS Withdrawal" | "Wallet Funding" | "Transfer" | "Vendor Payment"). Update `addDeposit` to set `"Wallet Funding"` and `addWithdrawal` to accept a category arg (default `"Vendor Payment"`). Update seed transactions with categories.

## Technical notes

- All new routes use `createFileRoute` with proper `head()` metadata.
- All colors via semantic tokens in `src/styles.css` — provider brand accents added as `--brand-mtn`, `--brand-telecel`, `--brand-airteltigo` for reuse.
- Bottom nav uses `fixed bottom-0` with safe-area padding; main content gets `pb-24` on those pages.
- Each payment-provider page simulates the prompt with a 1.2s loader before completing the deposit via `addDeposit`.
- No backend changes — all flows continue to use the existing mock store.

## Files to create
- `src/routes/add-money.tsx`
- `src/routes/add-money.mtn.tsx`
- `src/routes/add-money.telecel.tsx`
- `src/routes/add-money.airteltigo.tsx`
- `src/routes/transactions.tsx`
- `src/routes/insights.tsx`
- `src/components/BottomNav.tsx`
- `src/components/ProviderPayForm.tsx`
- `src/components/QuickActions.tsx`

## Files to edit
- `src/routes/parent.tsx` (quick actions, categorized recent tx, remove inline top-up, add bottom nav)
- `src/lib/mock-store.ts` (category field)
- `src/styles.css` (provider brand tokens)
