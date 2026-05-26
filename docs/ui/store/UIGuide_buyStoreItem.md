# UI Guide — `buyStoreItem`

## Overview
Buy is a server round-trip with side effects (DB writes, balance
deduction, reward issuance, optional CRM rules). Expected latency
200–800ms depending on reward type. Always show an in-flight
indicator on the Buy button and disable it for the duration of the
call; never optimistically update the local balance / pool — wait
for the auto-refresh.

## Confirm modal (recommended)
The typical UX shows a confirm modal between the item list and the
Buy click: tapping a card opens the item detail modal which displays
the item image, name, full description, price, the user's current
balance, and the Buy button. The Buy button on the **card itself**
is optional; many implementations only show it inside the detail
modal. This serves both as a confirmation step and as the natural
place to render insufficient-balance / locked / sold-out messages
next to the action.

## Buy button decision matrix

Apply in priority order; **first match wins**. The state checks all
derive from a single `TStoreItem` (from `getStoreItems()`) plus the
user's current balance (from user properties).

  1. `pool != null && pool <= 0` → **disabled "Sold Out" button** (or
     hide the Buy button and show an out-of-stock badge). Auto-refresh
     will update the state if stock is restored.
  2. `active_till_date && Date.now() >= active_till_date` →
     **disabled "Expired" button**. Show the formatted expiry date.
  3. `can_buy === false` → **disabled Buy button**. Surface
     `cant_buy_message` (operator-defined) if set; otherwise a
     generic "Not available" caption. This catches segment locks
     and operator-set restrictions.
  4. User balance for the item's `purchase_type` is less than the
     effective price (`discounted_price ?? price`) →
     **disabled "Insufficient balance" button**. Show how many
     units of the currency are missing (e.g. "120 points needed").
     The button label can stay "Buy" but with a disabled visual.
  5. A purchase is currently in flight for this item (local flag) →
     **Buy button with loading indicator**; ignore additional clicks.
  6. None of the above → **enabled Buy button** labelled e.g. "Buy"
     with the price + currency icon (points / gems / diamonds) as a
     stamp. On click: call `buyStoreItem(item.id)`; set the local
     in-flight flag.

Variants by `purchase_type`:
- `'points'` — show the points icon next to the price.
- `'gems'` — show the gems icon.
- `'diamonds'` — show the diamonds icon.

If `discounted_price` is set, render both prices: the original
`price` with a strikethrough and the `discounted_price` highlighted.

## In-flight UX
- Replace the Buy button label with a loading dots / spinner
  animation while the promise is pending. Keep the button visually
  "pressed" / disabled.
- Do NOT close the detail modal during the call — closing risks the
  user double-clicking after re-opening.

## Success UX
On `err_code === 0`:
- Close the detail modal.
- Show a success toast (e.g. "Item purchased successfully"). The
  toast is the primary feedback — there is no dedicated success
  modal for the generic case.
- Do NOT manually re-fetch `getStoreItems()` — the auto-refresh
  fires.
- Reward-type-specific celebrations (e.g. opening a mini-game spin
  immediately after a `'minigamespin'` purchase, navigating to the
  bonus screen after a bonus purchase) are application choices and
  not enforced by the SDK.

## Error UX per code
- For `11006` (cap reached): prefer the item's `limit_message`
  operator copy over `err_message`.
- For `11014` (time-window): prefer the item's `purchase_limit_message`
  operator copy over `err_message`. Both are localized, operator-tuned
  strings meant for the user.
- For `11009` (sold out): show a dedicated "sold out" message.
- For `11004`: show a localized "try again later" / "not eligible"
  message; the raw `err_message` is rarely user-friendly.
- For all other non-zero codes: fall back to `err_message`, or to
  a generic "Something went wrong. Try again later." if `err_message`
  is empty.
- Render the error in a dedicated error modal (closing the item
  detail modal first) or as an inline message inside the detail
  modal — both patterns are valid; the dedicated modal is the
  reference implementation.

## Status-specific visual treatments on the item card
- `pool != null && pool <= 0` → grey-out overlay + "Out of Stock"
  caption. When operator-enabled, unavailable items can be visually
  greyed out entirely.
- `can_buy === false` → optional "cant_buy" visual treatment
  (border / icon) + tooltip showing `cant_buy_message`.
- `active_till_date` set → live-updating countdown overlay,
  format `DD:HH:MM:SS` (see below). Hide once expired and replace
  with an "Expired" badge.
- `discounted_price` set → discount ribbon (corner overlay) showing
  the percent or a custom ribbon image.
- `purchased_today` / `purchased_this_week` / `purchased_this_month`
  true → optional "purchased recently" badge; useful for items
  with a per-period cap, hints at why the Buy button might be
  disabled.

## Countdown format
For items with `active_till_date`:
  - Format `DD:HH:MM:SS`, each segment zero-padded to 2 digits.
  - Update cadence: 1 second.
  - Once `Date.now() >= active_till_date`, hide the countdown and
    mark the item as expired (disabled Buy button, "Expired" badge).

## Animations
- In-flight: dots / spinner animation on the Buy button.
- Success: a celebratory animation (confetti, coin shower) for
  high-value items is a common pattern but not enforced by the SDK.
  The default minimal UX is the success toast.

## Mobile vs desktop
The buy flow is identical on mobile and desktop; the layout
differences live in the parent list view (see `getStoreItems` for
grid / row variants). The detail modal and Buy button behaviour
are the same on both.

## Empty states
Not applicable to this method (returns a single result). For the
list-level empty / loading / error states, see the `getStoreItems`
documentation.

**Visitor mode**: not supported.
