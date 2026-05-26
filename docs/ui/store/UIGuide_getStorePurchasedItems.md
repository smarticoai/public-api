# UI Guide — `getStorePurchasedItems`

## Overview
Loading indicator recommended on cold fetch (no cache hit, typical
100–500 ms latency). The default Smartico UI renders a full-screen spinner
while the first page is in flight, then a fade-in on the list. On load-
more pagination, the recommended pattern is to hide the "Load more"
button while the next page is fetching rather than showing a separate
spinner.

## List view
- Flat newest-first list. The default Smartico UI does NOT group by date
  (no "Today" / "This Week" / "Older" headers) and does NOT offer
  category / type / status filter chips. If your design needs date
  bucketing, use the SDK-provided `purchased_today` /
  `purchased_this_week` / `purchased_this_month` booleans for grouping.
- Pagination UI: render a "Load more" button below the list when the
  previous page returned exactly `limit` items. Hide it once a page
  returns fewer than `limit` rows. The default Smartico UI uses an explicit
  button; infinite scroll is a valid alternative but not the reference
  pattern.
- Stagger animation: the default Smartico UI fades each row in with a
  100 ms incremental `animationDelay` (row 0 at 0 ms, row 1 at 100 ms,
  etc.) for a cascade effect on the first page. Optional.

## Item card (history row)
Two-column desktop / single-column-with-footer mobile layout. Rendered
fields, top-to-bottom:
  1. Item image (`image`) on the left, 1:1 aspect (256×256 source spec,
     typically rendered ~64–96 px on screen via CSS).
  2. Stock indicator — only when `pool !== null`. `pool > 0` shows
     "In stock — N left"; `pool === 0` shows "Out of stock".
     (This reflects CURRENT stock for "Buy Again" context, not stock at
     purchase time.)
  3. Item name (`name`) — HTML, sanitize to plain text or render with
     `dangerouslySetInnerHTML` after trusted sanitization.
  4. Price stamp — `purchase_points_amount` paired with the currency
     icon implied by `purchase_type`. This is the historical amount
     paid, NOT the current item `price`.
  5. Purchase date — `purchase_ts` formatted via
     `toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'medium' })`
     and prefixed with a "Purchased:" label.
  6. **"Buy Again" button** — opens the standard buy modal for the
     same item. Disabled when:
       - `can_buy === false` (server says the user cannot purchase it
         right now), OR
       - the user's current balance is below the item's CURRENT
         `price` (not `purchase_points_amount`), OR
       - `pool === 0` (out of stock).
     Layout: inline on desktop (right column), in a bottom footer strip
     on mobile.

## Fields explicitly NOT rendered on the row
- `description`, `ribbon`, `hint_text`, `custom_data`, `type`,
  `related_games`, `category_ids`, `discounted_price`,
  `discount_price_ribbon`, `custom_ribbon_image`, `active_till_date`,
  `cant_buy_message` — the default Smartico UI omits these on the history
  row.

## Detail view
No tap-to-expand inline detail view exists for history rows. "Buy
Again" is the only action; it routes through the standard
[getStoreItems](#getstoreitems) buy modal (full description, related games, etc.
are surfaced there).

## Status-specific treatments
- No fulfillment status field; rows have no delivered/pending/cancelled
  visual variants.
- Stock-based modifier: when `pool === 0`, grey out / disable the "Buy
  Again" button and show the "Out of stock" label in the info area.
  This is a CURRENT availability signal, not a status on the past
  purchase itself.

## Image / asset specs
- `image`: documented source size **256×256 px**, 1:1 aspect ratio.
- Typically rendered via `<img>` (the default Smartico UI uses an `<img>`,
  not CSS background-image, for history rows).
- No built-in fallback placeholder — provide one when `image` is empty.

## Date formatting
- Format `purchase_ts` with `toLocaleString(undefined, ...)` to render
  in the user's OS locale and timezone. Do NOT assume UTC display — the
  stored timestamp is UTC milliseconds but humans read it locally.
- For relative formatting ("3 hours ago", "Yesterday"), use
  `purchased_today` / `purchased_this_week` / `purchased_this_month`
  as buckets or compute deltas client-side.

## Empty state
When the first page returns an empty array, render a "No purchases yet"
empty state (icon + copy). Do NOT distinguish "no purchases at all"
from "no purchases in selected period" — this method has no period
filter, so any empty response means the user has zero history entries
total.

## Error handling
On a network or server failure the Promise rejects. The SDK does not
surface an `err_code`/`err_message` shape on this method (the array
either resolves or the call throws). Wrap in `try { ... } catch` and
either retry with backoff or surface a generic "Couldn't load purchase
history" message — the default Smartico UI's behavior is to silently clear
the loading state, which leaves the previous list visible.

## Mobile vs desktop
- Desktop: two-column row (image left, info+actions right). "Buy Again"
  and purchase-date inline in the info column.
- Mobile: single-column with a bottom footer strip carrying the
  purchase-date and the "Buy Again" button.
- No CSS-breakpoint magic in the default Smartico UI — the layout toggle
  is a runtime `isMobile` boolean.

## Performance
- 20 rows per page is small enough that virtualization is not needed
  under typical history sizes.
- Cache (30 s) is fine for in-screen re-renders. Do not call this on
  every render — fetch once on screen mount and on demand for "Load
  more" / `onUpdate` triggers.
- Polling is unnecessary — the `onUpdate` callback delivers fresh data
  automatically when the user makes another purchase. For background
  activity (purchases made on other surfaces), the cache TTL gives
  eventual consistency within 30 seconds of the next call.

**Visitor mode**: not supported.
