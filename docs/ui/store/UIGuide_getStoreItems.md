# UI Guide — `getStoreItems`

## Overview
- Register `onUpdate` on first render and treat each invocation as
  "discard prior list, re-render from this array". Do not merge.
- Loading indicator: the first `getStoreItems()` is a server round-trip
  (typically 100–500 ms); subsequent calls within the 30 s cache window
  resolve effectively synchronously.
- The SDK returns a flat array; tabs/sections/filters are applied
  client-side using `category_ids`, `custom_section_id`, and
  `only_in_custom_section`.
- The catalog card UI is the SAME for all `type` values. Type-specific
  behavior (lootbox reveal, bonus activation toast, SAW redirect) is
  the consumer's responsibility AFTER the purchase succeeds, not on
  the catalog tile itself.

## List view organization
- **Categories**: render `getStoreCategories()` as tabs/chips. For each
  tab, filter the catalog to items whose `category_ids` includes the
  active category id. An item present in multiple categories appears
  under each.
- **Custom sections**: the operator can group items into
  custom_section_id buckets that live on a separate route from the main
  store. Items with `only_in_custom_section: true` MUST be hidden from
  the main store and appear only inside their `custom_section_id`.
  Items WITHOUT that flag (but with a `custom_section_id`) appear in
  both places.
- **Sorting** (within a category): three modes, operator-configurable
  default order:
    1. "Natural" — a composite sort string from operator config
       (commonly `canbuy desc, priority asc, price asc`). Sorts buyable
       items above non-buyable, then by `priority` (lower first),
       breaking ties by `price`.
    2. "Price" — by numeric `price`, ASC or DESC.
    3. "Name" — alphabetic by `name`, ASC or DESC.
  Default is "Natural". Consumers may expose toggles.
- **No status bucketing** (unlike missions). Sold-out / can't-buy
  items are intermixed with buyable items; the "Natural" sort just
  pushes them lower. Render them with a status overlay (see status
  treatments below) rather than putting them in a separate tab.
- **Search**: optional client-side substring match on `name`
  (case-insensitive). The SDK does not paginate.
- **No pagination**: the SDK returns the full visible catalog in one
  response. For very large catalogs (50+ items), consider client-side
  virtualization. The default Smartico UI does NOT virtualize.

## Item card / tile (list view)

Fields to render on the card:
- `image` — documented source size **256×256 px**, 1:1 aspect ratio.
  CSS `background-image` or `<img>` is conventional.
- `name` — the title. Pre-translated server-side. Safe to render as
  HTML if the consumer sanitizes first.
- Price block — `price` rendered alongside a currency icon driven by
  `purchase_type` (`'points'` / `'gems'` / `'diamonds'`). When
  `discounted_price` is set, render `discounted_price` as the active
  price and strike-through `price`.
- Ribbon overlay (`ribbon` field) — presets `'sale'`, `'hot'`, `'new'`,
  `'vip'` use built-in styling; any other string is a custom URL
  (250×300 px). Position: top-left corner overlay.
- Discount ribbon (`discount_price_ribbon`) — only when set. Presets
  `'10' | '15' | '20' | '25' | '50'` use built-in percent-styled
  ribbons; the literal `'custom'` uses `custom_ribbon_image` (250×300 px)
  as the artwork. Position: top-right corner overlay (or opposite the
  item ribbon).
- Stock indicator — when `pool !== null`:
    - `pool > 0`: render "In stock — N left" (using
      `pool` as the count).
    - `pool === 0`: render "Out of stock" / "Sold out" overlay
      and grey-out the card if the operator enabled the
      `grey_out_unavailable_items` config flag.
  When `pool === null`, render no stock indicator (unlimited supply).
- Countdown timer — render only when `active_till_date` is set AND the
  operator enabled the per-item `show_timer` flag. Format below.
- Buy button — labeled with the "Buy Now" CTA, the price, and the
  currency icon. Disabled / greyed when `can_buy === false`, when the
  user can't afford the item (live balance < `price`), or when
  `pool === 0`.

Fields NOT shown on the card (detail popup only):
- Full `description` HTML (cards typically show just the title)
- `hint_text` (T&C)
- `related_games`
- `related_item_ids`
- `cant_buy_message` (the verbose explanation; show on the popup or as
  a toast when the Buy button is clicked while disabled)
- `limit_message` / `purchase_limit_message` (surfaced post-attempt via
  the buy error toast, not pre-emptively on the card)

Click target: the **whole card** opens the detail popup. The Buy button
inside the popup is where the purchase is actually dispatched — there
is no inline buy from the card in the default Smartico UI.

## Detail popup

Top-to-bottom structure (omit sections whose source field is empty):
  1. Close button.
  2. Item ribbon overlay (same as card).
  3. Discount ribbon overlay (same as card).
  4. Title (`name`).
  5. Countdown timer (when `active_till_date && show_timer`).
  6. Stock indicator ("In stock — N left" / "Out of stock"), with
     grey-out applied to the image when the item is unbuyable AND the
     operator enabled `grey_out_unavailable_items`.
  7. Image (`image`) — render larger than the card variant.
  8. Full `description` (HTML).
  9. Insufficient-balance line — when the live balance for
     `purchase_type` is less than `price`, render a localized
     "You're short by N {points|gems|diamonds}" copy with the deficit
     computed client-side (`price − balance`).
  10. `cant_buy_message` — when `can_buy === false` and there's a
      reason string (e.g. "VIP only").
  11. Buy button block. Disabled state combines the three conditions
      above. While the purchase RPC is in flight, replace the inner
      price/CTA with a loading dots animation.
  12. T&C `hint_text` — surfaced as an info-icon tooltip below the
      Buy button (tap to expand). Not inline.
  13. Related items / related games carousel (collapsed by default,
      expandable). `related_item_ids` resolves against the main
      catalog; `related_games` filtered to those with
      `game_public_meta.enabled === true`. Show navigation arrows when
      5+ items on desktop, 4+ on mobile.

## Action button decision matrix

*(Buy button)*

Apply in priority order; first match wins:

  1. **Purchase RPC in flight** — show loading dots over the price/CTA,
     keep the button disabled until the response arrives. Guard
     double-clicks at the UI layer.
  2. `pool === 0` → **"Sold out"** state; button disabled. The card and
     image may be greyed (operator config).
  3. `can_buy === false` → button disabled. Surface `cant_buy_message`
     (or `limit_message`) on the popup as the explanation.
  4. Balance < `price` for the relevant `purchase_type` → button
     disabled. Surface a localized insufficient-balance line with the
     deficit.
  5. All clear → **"Buy Now"** button enabled. On click: call
     [buyStoreItem](#buystoreitem)(`id`) and show loading dots until the
     response arrives.

After a successful purchase ([buyStoreItem](#buystoreitem) `err_code === 0`):
- Close the popup, show a success toast.
- The SDK auto-fires `onUpdate` with the refreshed catalog — re-render
  from that array, do NOT manually decrement the local `pool`.

On a failed purchase, branch on `err_code` (see [buyStoreItem](#buystoreitem)
for the full error code table — codes `11000` / `11011` / `11012` for
insufficient balance per currency, `11006` for per-period cap reached,
`11009` for pool emptied between catalog fetch and buy, `11014` for
purchase-limit hit, etc.). Surface `purchase_limit_message` for the
limit-hit case, `limit_message` for the cap-reached case; fall back to
`err_message` otherwise.

## Price rendering per `purchase_type`
- **`'points'`**: render `price` with a "points" currency glyph; compare
  against the user's `ach_points_balance`.
- **`'gems'`**: render with a "gems" glyph; compare against
  `ach_gems_balance`.
- **`'diamonds'`**: render with a "diamonds" glyph; compare against
  `ach_diamonds_balance`.
- When `discounted_price` is set: the **discounted** value is the
  active price (used for affordability checks); `price` becomes the
  strikethrough "before" value.
- All three balances update server-side as the user plays and arrive
  on the user's gamification profile asynchronously — keep them live
  without polling.

## Image / asset specs
- `image` (item icon): **256×256 px**, 1:1 aspect ratio.
- `ribbon` (when a URL): **250×300 px** custom artwork.
- `custom_ribbon_image` (discount ribbon when `discount_price_ribbon === 'custom'`):
  **250×300 px**.
- Related game thumbnails: **1:1 aspect ratio** per
  `game_public_meta.image`.
- No built-in fallback placeholders — consumers should provide one when
  source fields are empty.

## Status-specific visual treatments
- **Sold out** (`pool === 0`): "Out of stock" badge on the card; image
  greyscaled when the operator enabled `grey_out_unavailable_items`.
  Buy button disabled.
- **Cannot afford** (balance < `price` for `purchase_type`): Buy button
  disabled (greyed); the rest of the card is full-color. Detail popup
  adds the deficit line. The card image is greyscaled only when the
  operator enabled `grey_out_unavailable_items`.
- **Not eligible** (`can_buy === false`): same as cannot-afford
  visually; the explanation source is `cant_buy_message` (popup) /
  `limit_message` (post-buy-attempt).
- **Discount active** (`discounted_price` set): show the discount
  ribbon overlay and the strikethrough+new-price treatment.
- **New item** (operator marked `ribbon === 'new'` OR client-side
  tracking of newly-added ids in localStorage): "New" ribbon preset.
  The SDK does not track "newness" — the operator's `ribbon` field is
  the source of truth.
- **Flash sale** (`active_till_date && show_timer`): countdown timer
  on the card and popup.

## Countdown / timing format

*(for `active_till_date`)*

Convention used by the default Smartico UI:
- `DD:HH:MM:SS` (zero-padded to 2 digits each) when the timer is set.
- Update the displayed text every **1 second**.
- When the timer reaches 0, the item disappears from the catalog on
  the next refresh (server filters it out). The consumer should NOT
  need a separate "expired" state for catalog items.

## Empty / loading / error states
- **Empty catalog**: "No store items" message + illustration.
- **Empty category** (after filter): same copy or a category-scoped
  variant.
- **Empty search**: no-results state with the search term.
- **Loading**: spinner / skeleton until the first response. Subsequent
  `onUpdate` refreshes are fast enough to render in-place without a
  skeleton.
- **Buy error**: surface `purchase_limit_message` (for
  `err_code === 11014`), `limit_message` (for `err_code === 11006`), or
  the server `err_message` as a modal/toast.

## Animations / transitions
- List entry: stagger-fade-in per card (the default Smartico UI uses a
  ~100 ms stagger per index).
- Popup open: bounce + fade-in on title/image; fade-in on description,
  stock line, and balance line.
- Buy button in flight: loading dots overlay; disable underlying CTA.
- Purchase success: close popup, show success toast; the auto-refresh
  re-renders the catalog (pool decrements, `can_buy` re-evaluates).
- Card hover (desktop): optional scale/shadow per consumer's design.

## Mobile vs desktop
- Mobile: vertical scroll; the default Smartico UI uses a 2-column grid
  for the main store and a list layout for purchase history.
- Desktop: wider multi-column grid. Related-items carousel shows
  navigation arrows at 5+ items on desktop vs 4+ on mobile.
- The detail popup is structurally identical on both; only sizing
  differs.

## Performance
- No pagination. The SDK returns the full visible catalog in one
  response.
- For very large catalogs (50+ items) consider client-side
  virtualization. The default Smartico UI does NOT virtualize.
- The 30-second SDK cache makes intra-session re-renders free; do NOT
  poll `getStoreItems()`.

**Cache TTL**: the SDK caches the response for 30 seconds. The cache is
invalidated and re-fetched automatically after every `buyStoreItem(...)`
call resolves for the current user. It is NOT invalidated by other
users' purchases, by operator BO edits, or by `active_till_date`
elapsing while the page is open.

**Visitor mode**: supported, with caveats.
- The catalog reflects the brand's proxy "visitor" user, not the actual
  anonymous viewer. Per-user fields (`can_buy`, `pool` decrements,
  `purchased_*` flags) reflect the proxy user's state and are not
  meaningful for display.
- `onUpdate` is accepted but NEVER fires in visitor mode — there is no
  live channel, so push events are not delivered.
- [buyStoreItem](#buystoreitem) is not supported in visitor mode; the Buy button
  should deep-link to a login/registration flow instead.
