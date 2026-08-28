# Full phone responsiveness pass (320px and up)

Goal: every Student Pay screen fits phones from 320px to 430px wide with no clipping, no sideways scrolling, and clean alignment. No feature, color, logo or logic changes — presentation only.

## What gets fixed

**Global**
- Guarantee no horizontal overflow app-wide (root-level overflow guard already exists; extend to inner scroll containers).
- Consistent mobile gutters (`px-4`, tightening to `px-3` at very small widths) and safe-area padding top/bottom for notch and gesture-bar phones.
- Bottom nav: keep 5 items evenly spread down to 320px, prevent label wrap/clipping, keep the raised Home button from overlapping neighbours, and reserve matching bottom padding on every screen so content never hides behind it.

**Screens reviewed and adjusted**
- Landing page: hero heading/paragraph scaling, badge wrapping over the image, CTA full-width on small phones, feature and "how it works" cards stacking.
- Guardian auth, forgot password, reset password: oversized display headings scaled for 320px, the 3-column code/segment grid made wrap-safe, inputs and buttons never wider than the viewport.
- Parent dashboard: balance figure scaling, header name truncation, quick-action tiles readable at 320px.
- Wallet QR card: QR sizes relative to container so it never overflows; timer/refresh row stays aligned.
- Add Money + MTN/Telecel/AirtelTigo pay forms: provider cards, amount input, and Pay button fit and stack neatly.
- Transactions and Insights: row layouts with `min-w-0` + truncation on descriptions, amounts never pushed off screen.
- Guardian profile: form sections stack single-column on phones; avatar, edit buttons and children rows stay within bounds.
- Settings index and every settings sub-page: row labels truncate, toggles stay `shrink-0`.
- Notifications/AI alerts panel: long alert text wraps instead of clipping.
- Vendor and Admin dashboards: stat grids and scrollable tab row verified at 320px; long IDs/emails truncate.
- Images and icons: intrinsic sizing with `max-w-full`, `h-auto` where appropriate, `shrink-0` on icons.

## Verification

Automated browser pass at 320, 360, 390 and 430px across landing, auth, parent, add-money, a provider pay page, transactions, insights, profile, settings, QR, vendor and admin — checking `scrollWidth <= clientWidth` and screenshotting each, then fixing anything that fails and re-running until clean.

## Technical notes

- Tailwind v4 utility edits only; no new dependencies, no changes to `src/styles.css` tokens beyond any small responsive helper if needed.
- Patterns used: `grid-cols-[minmax(0,1fr)_auto]` for header rows, `min-w-0` on every flex text container, `shrink-0` on fixed-size icons, `truncate`/`break-words` for long strings, `flex-wrap` + full-width buttons under `sm:`.
- No route, server function, or data-layer file is touched.
