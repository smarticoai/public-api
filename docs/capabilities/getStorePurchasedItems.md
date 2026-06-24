# getStorePurchasedItems — API (TStoreItem)

> Fetches the authenticated user's **store purchase history** — a paginated, newest-first list of past store purchases (one row per redemption).
> Import: `import { TStoreItem } from '@smartico/public-api'`
> Search terms: getStorePurchasedItems, store, TStoreItem, TRibbon, AchRelatedGame, onUpdate, subscription, id, name, price, purchase_type, image, description, ribbon, priority

## Signature
```ts
_smartico.api.getStorePurchasedItems({
		limit,
		offset,
		onUpdate,
	}: { limit?: number; offset?: number; onUpdate?: (data: TStoreItem[]) => void } = {}): Promise<TStoreItem[]>
```

## Parameters
- `params` — - Optional pagination + callback bag.
- `params.limit` — - Page size. Defaults to `20`. Use `20` as the conventional value (matches the default Smartico UI end-to-end). Avoid non-positive values.
- `params.offset` — - Number of rows to skip from the newest end. Defaults to `0`. For load-more pagination pass the current array length.
- `params.onUpdate` — - Optional callback invoked after a successful `buyStoreItem` elsewhere in the session. Receives the refreshed page for the same `(limit, offset)` used on the call that registered this callback. Only ONE callback can be registered; each new call overwrites the previous one. Pass a stable handler or re-register intentionally on screen entry.

## Returns — `Promise<TStoreItem[]>`
Array of `TStoreItem`. Each item:
- `id` (number) — ID of the store item
- `name` (string) — Name of the store item, translated to the user language
- `description` (string) — Description of the store item, translated to the user language
- `image` (string) — URL of the image of the store item, 256x256px
- `type` ('bonus' | 'tangible' | 'minigamespin' | 'changelevel' | 'prizedrop' | 'unknown' | 'raffleticket') — Type of the store item. Can be 'bonus' or 'tangible' or different others.
- `price` (number) — The price of the store item in the gamification points
- `ribbon` (TRibbon) — The ribbon of the store item. Can be 'sale', 'hot', 'new', 'vip' or URL to the image in case of custom ribbon, 250x300px
- `limit_message` (string) — The message that should be shown to the user if he is not eligible to buy it. this message can be used to explain the reason why user cannot buy the item, e.g. 'You should be VIP to buy this item' and can be used in case can_buy property is false. The message is translated to the user language. *Note**: when user is trying to buy the item, the response from server can return custom error messages that can be shown to the user as well
- `purchase_limit_message` (string) — The message that should be shown to the user if they are not eligible to buy it because of purchase limitation. This message can be used to explain the reason why user cannot buy the item, e.g. 'Item is no more available today. Come back Friday'. The message is translated to the user language. *Note**: when user is trying to buy the item, the response from server can return custom error messages that can be shown to the user as well
- `priority` (number) — The priority of the store item. Can be used to sort the items in the store
- `related_item_ids` (number[]) — The list of IDs of the related items. Can be used to show the related items in the store
- `related_games` (AchRelatedGame[]) — List of casino games (or other types of entities) related to the store item
  - `ext_game_id` (string) — The ID of the related game
  - `game_public_meta` ({
		/** The name of the game */
		name: string;
		/** The URL to the game */
		link: string;
		/** The URL to the image of the game, 1:1 aspect ratio */
		image: string;
		/** The indicator if the game is enabled */
		enabled: boolean;
		/** The list of categories of the game */
		game_categories: string[];
		/** The name of the game provider */
		game_provider: string;
		/** The URL to the mobile game */
		mobile_spec_link: string;
		/** The priority of the game */
		priority?: number;
	}) — Game public meta information
- `can_buy` (boolean) — The indicator if the user can buy the item This indicator is taking into account the segment conditions for the store item, the price of item towards users balance,
- `category_ids` (number[]) — The list of IDs of the categories where the store item is assigned, information about categories can be retrieved with getStoreCategories method
- `pool` (number) — Items remaining in the pool available for purchase. `null` = unlimited supply. Positive integer = remaining stock. `0` = sold out but still returned (operator may instead hide pool-empty items entirely).
- `custom_data` (any) — The custom data of the store item defined by operator. Can be a JSON object, string or number
- `hint_text` (string) — The T&C text for the store item
- `purchase_ts` (number) — Purchase time to show in purchase history screen
- `purchase_points_amount` (number) — The amount of points you can purchase an item
- `purchased_today` (boolean) — Flag for store item indicating that it was purchased today
- `purchased_this_week` (boolean) — Flag for store item indicating that it was purchased this week
- `purchased_this_month` (boolean) — Flag for store item indicating that it was purchased this month
- `purchase_type` ('points' | 'gems' | 'diamonds') — The type of the purchase
- `active_till_date` (number) — The date when the store item will be available till
- `show_timer` (boolean) — Should countdown timer be shown when `active_till_date` is present
- `discounted_price` (number) — The discounted price of the store item
- `discount_price_ribbon` (string) — The ribbon of the discounted price.
- `custom_ribbon_image` (string) — The custom ribbon image of the discounted price, 250x300px
- `custom_section_id` (number) — The ID of the custom section where the store item is assigned
- `only_in_custom_section` (boolean) — The indicator if the store item is visible only in the custom section and should be hidden from the main overview of store items
- `custom_section_type_id` (number) — ID of specific Custom Section type
- `cant_buy_message` (string) — The message that should be shown to the user if they are not eligible to buy it. This message can be used to explain the reason why user cannot buy the item, e.g. 'You should be VIP to buy this item'.

## Behavioral contract
**Preconditions**
- User must be authenticated. Visitor mode is not supported (the SDK only
 exposes this method on the authenticated `_smartico.api`, not on
 `_smartico.vapi`).
- No prerequisite calls — calling without first fetching
 `getStoreItems` or `getStoreCategories` is fine.

**Pagination semantics**
- **Offset-based**, newest-first. The server orders rows by purchase
 timestamp **descending** and the SDK does NOT re-sort — items arrive
 ready to render in display order.
- `limit` — page size. **The SDK default is 20.** There is no server-side
 hard cap, but 20 matches what the default Smartico UI uses end-to-end; the
 protocol and storage layers were sized for this page size. Treat `20`
 as the conventional/recommended value; passing a much larger limit will
 return more rows but is not the supported integration pattern.
 Avoid `limit <= 0` — the server peeks `limit + 1` rows internally, so
 `limit = 0` returns 1 row with a misleading "has more" signal, and
 negative values produce undefined results.
- `offset` — number of items to skip from the start. The SDK default is
 `0` (first page). For load-more pagination, pass
 `offset = (previously-loaded items).length` on each subsequent call.
- **No `hasMore` on the returned array.** `TStoreItem[]` is a flat list;
 the underlying protocol response carries `hasMore` but it is not
 surfaced through this method. Two ways for consumers to know they
 reached the end:
 1. The returned array is shorter than `limit` (definitive end), or
 2. A subsequent call at `offset = previous.length` returns `[]`.
 Either is reliable.
- No date-range / category / status filter parameters — pagination is the
 only server-side slicing. Apply any further filtering client-side.

**No per-item fulfillment status**
- History entries do NOT carry a `delivered` / `pending` / `cancelled` /
 `refunded` field. The list contains rows for committed purchase
 attempts; the server query does not filter by transaction-status, so in
 practice the rows that appear are completed purchases (failed
 transactions roll back and don't write a row). Treat every item as a
 completed transaction unless a future SDK release adds an explicit
 status field.

**Bonus-type entries**
- When the user redeemed a bonus item, the entry's `type` field surfaces
 as `'bonus'`. **Known limitation:** the SDK transform currently maps
 both `Bonus` and `Tangible` server-side item types to the same string
 `'bonus'` — so the `type` field on history rows cannot distinguish a
 bonus redemption from a tangible-prize redemption. The actual bonus
 payload (wallet credit, free spins, etc.) is dispatched by the server
 asynchronously and is NOT embedded in the history entry — consumers
 that need bonus details should subscribe to bonus push events
 separately rather than reading them from this list.
- History rows render identically across types — there is no deep-link to
 the bonus wallet or re-claim affordance on the row itself.

**Per-row data**
Each row uses the `TStoreItem` shape but populates four history-only
fields not present on `getStoreItems` output. `purchase_ts` is the
Unix-ms timestamp of the purchase — format with
`new Date(purchase_ts).toLocaleString()` in the user's local timezone;
no relative labels ("Today" / "Yesterday") are produced by the SDK.
`purchase_points_amount` is the amount actually paid at the time of
purchase — a snapshot of the historical price, which may differ from
the item's current `price`. `purchase_type` is the currency actually
charged (`'points' | 'gems' | 'diamonds'`); render the matching
balance icon next to the amount. The convenience booleans
`purchased_today` / `purchased_this_week` / `purchased_this_month` are
computed client-side from the consumer's local clock — useful for
grouping rows under "Today" / "This Week" headers.

**Catalog fields on a history row**
The promotional fields (`ribbon`, `discounted_price`,
`discount_price_ribbon`, `custom_ribbon_image`, `active_till_date`)
reflect the CURRENT catalog state of the item, NOT its state at
purchase time — the default Smartico UI hides them on history rows to
avoid implying that the historical purchase carried the current
promotional banner. Descriptive marketing fields (`description`,
`hint_text`, `related_games`) are typically suppressed on a compact
history row. The current-purchasability fields `can_buy` and `pool`
reflect now, not then — useful only if you render a "Buy Again"
affordance on the row. One implementation gotcha: unlike
`getStoreItems`, this method's transform does NOT auto-parse JSON
strings in `custom_data` — call `JSON.parse()` yourself if you store
JSON there.

**Cache & refresh**
- The SDK caches each `(limit, offset)` page separately for 30 seconds.
 Repeated calls within that window resolve from cache without a
 network round-trip.
- The cache is invalidated and `onUpdate` (when registered) is invoked
 automatically after a successful `buyStoreItem` call — the SDK
 re-fetches the same page parameters that were registered together with
 the current `onUpdate` callback and pushes the fresh array.
- Multi-tab caveat: if the user has the same brand open in multiple
 tabs, **all open tabs** receive the `onUpdate` event on a purchase,
 not only the tab that initiated the buy. The event is scoped to the
 current authenticated user — a different user's purchase never fires
 this callback.
- Only ONE `onUpdate` callback can be registered at a time. Each call to
 `getStorePurchasedItems({ onUpdate })` overwrites the previous handler.

**Idempotency**: safe. Pure read.

**Side effects**: none — read-only.

**UI guidance**: see [UI Guide — `getStorePurchasedItems`](../../docs/ui/store/UIGuide_getStorePurchasedItems.md).

## Example
```ts
// Initial load + subscribe to refresh-on-purchase.
const handleHistoryUpdate = (items: TStoreItem[]) => {
  console.log(
    '[smartico] purchase history refreshed — re-render the history list with these',
    items.length,
    'items (newest first):',
    items,
  );
};

try {
  const firstPage = await _smartico.api.getStorePurchasedItems({
    limit: 20,
    offset: 0,
    onUpdate: handleHistoryUpdate,
  });

  if (firstPage.length === 0) {
    console.log('[smartico] no purchase history — render the empty state ("No purchases yet")');
  } else {
    console.log(
      '[smartico] render',
      firstPage.length,
      'history rows (newest first). Show "Load more" button if length === 20:',
      firstPage,
    );

    // Inspect the first entry's history-only fields.
    const first = firstPage[0];
    console.log(
      '[smartico] most-recent purchase: name=', first.name,
      'paid', first.purchase_points_amount, first.purchase_type,
      'at', new Date(first.purchase_ts ?? 0).toLocaleString(),
      '— format with toLocaleString (user-local time) on the row.',
    );
  }

  // Load-more pattern: fetch page 2 once the user scrolls / clicks "Load more".
  if (firstPage.length === 20) {
    const nextPage = await _smartico.api.getStorePurchasedItems({
      limit: 20,
      offset: firstPage.length,
    });
    const isLastPage = nextPage.length < 20;
    console.log(
      '[smartico] appended page 2 —',
      nextPage.length,
      'rows.',
      isLastPage ? 'Hide "Load more" — end reached.' : 'Keep "Load more" visible.',
    );
  }
} catch (e) {
  console.error(
    '[smartico] failed to load purchase history — show a generic error placeholder or retry with backoff:',
    e,
  );
}
```

### Example response (REAL shape)
```json
[
  {
    "id": 7158,
    "name": "Okayish Drop",
    "price": 25,
    "purchase_type": "points",
    "image": "https://cdn.example/33fa1a793eac4a807041ac-Gamificationpoints10.webp",
    "description": "A chance to win one out of 6 totally fine prizes",
    "ribbon": "sale",
    "priority": 3,
    "type": "prizedrop",
    "can_buy": true,
    "category_ids": [
      567
    ],
    "pool": 1000,
    "purchase_ts": 1781880583706,
    "purchase_points_amount": 25,
    "purchased_today": false,
    "purchased_this_week": false,
    "purchased_this_month": true,
    "show_timer": false,
    "related_games": []
  }
]
```

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `getStoreItems`
- `getStoreCategories`
- `buyStoreItem`
