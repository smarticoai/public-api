# getStoreItems — API (TStoreItem)

> Returns the catalog of buyable store items visible to the current user, scoped server-side to what the user is qualified to see.
> Import: `import { TStoreItem } from '@smartico/public-api'`
> Search terms: getStoreItems, store, TStoreItem, TRibbon, AchRelatedGame, onUpdate, subscription, id, name, purchase_type, price, image, description, ribbon, priority

## Signature
```ts
_smartico.api.getStoreItems({ onUpdate }: { onUpdate?: (data: TStoreItem[]) => void } = {}): Promise<TStoreItem[]>
```

## Parameters
- `params` — Optional. Omit to fetch without subscribing.
- `params.onUpdate` — Callback invoked with the full refreshed catalog after every `buyStoreItem`round-trip on this connection. Each call to `getStoreItems` overwrites the prior callback. Never fires in visitor mode.

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
The catalog is per-user. Visitor mode is supported with caveats (see
"Visitor mode" below). For the authenticated path, the user's balances
(`ach_points_balance`, `ach_gems_balance`, `ach_diamonds_balance` from
`getUserProfile`) must be tracked client-side to drive the
affordability state of the Buy button — the SDK does not pre-compute
affordability into `can_buy`.

**Subscription model (`onUpdate`)**
The callback receives the FULL refreshed catalog (never a diff/patch).
Each subsequent call to `getStoreItems({ onUpdate })` REPLACES the prior
callback — only one active subscriber at a time. Pass
`onUpdate: undefined` (or omit it) to keep the prior callback in place;
the callback is never auto-cleared.

**Update triggers**

Fires after: any `buyStoreItem(...)` call resolves on this connection
(success OR failure). This is the ONLY trigger. The refreshed array
reflects pool decrement on the just-bought item, per-period purchase
cap re-evaluation on `can_buy`, and any `purchased_today` /
`purchased_this_week` / `purchased_this_month` flips visible via
`getStorePurchasedItems`.

Does NOT fire for:
- Operator-side BO catalog edits (price, ribbons, pool seed, segment
 conditions, new/removed items) — surface only on the next cache miss.
- Concurrent purchases by OTHER users — the current user's view of
 `pool` may be stale until they themselves refresh.
- User balance changes from gameplay — the catalog is independent of
 balance; the consumer drives Buy-button affordability from a
 separately-tracked balance source.
- Items going past their `active_till_date` while the page is open —
 the item simply disappears on the next refresh.

**Server-side filtering** (what's already excluded before the SDK sees it)
- Items outside the `[active_from_date, active_till_date]` window —
 past the till-date, items are ALWAYS filtered out server-side.
- Items the user fails visibility-segment / visibility-condition
 checks for.
- Items configured to hide-when-empty whose pool has reached 0
 (per-item operator flag). Items without that flag are still returned
 with `pool === 0` so a "Sold out" state can be rendered.
- Items where the per-period bought-count cap is reached (and the
 operator chose to hide rather than just disable).

**Reading state from the returned item**
The catalog row carries everything a Buy button needs except the user's
balance: `can_buy` already reflects segment / visibility / per-period
cap checks, but the SDK does NOT pre-compute balance affordability —
compare `discounted_price ?? price` against the user's balance for
`purchase_type` (`ach_points_balance` / `ach_gems_balance` /
`ach_diamonds_balance` from `getUserProfile`). `purchase_type` is
per-item (`'points'` / `'gems'` / `'diamonds'`); operators can mix
currencies within a single catalog. For sold-out display, `pool === 0`
means the operator chose to keep the item visible — render an "Out of
stock" overlay. When `discounted_price` is set, render `price` with a
strikethrough and `discounted_price` as the active price; the
accompanying `discount_price_ribbon` is either a percentage preset
(`'10'`, `'15'`, `'20'`, `'25'`, `'50'`) or the literal `'custom'`
(in which case `custom_ribbon_image` is the artwork at 250×300 px).
A live countdown for time-limited items is rendered only when the
operator has enabled the per-item `show_timer` flag.

**Cross-references**
`category_ids` joins to `TStoreCategory.id` from
`getStoreCategories` (many-to-many — an item can belong to
multiple categories). Items with `only_in_custom_section: true` are
returned in the catalog but intended for their custom-section view
only — filter them client-side for the main store view. The
history-only fields (`purchase_ts`, `purchase_points_amount`, the
`purchased_*` booleans) are populated only by
`getStorePurchasedItems`, not by this method.

**Idempotency**: yes. `getStoreItems` is a pure read. Calling it
repeatedly within the 30-second cache window resolves from the cache
without a network round-trip.

**Side effects** (of a successful purchase that triggers `onUpdate`)
Documented here because the consumer's `onUpdate` handler will observe
the resulting state changes on the next refreshed array:
- Points / gems / diamonds balance deducted per `purchase_type`. The
 new balance becomes visible on the user's gamification profile via
 the SDK's user-properties update channel (`ach_points_balance` /
 `ach_gems_balance` / `ach_diamonds_balance`).
- `pool` decremented for limited-stock items.
- `type = 'bonus'` → a CRM bonus is granted; surfaces via
 `getBonuses`.
- `type = 'raffleticket'` → raffle tickets granted; surfaces via
 `getRaffles`.
- `type = 'changelevel'` → user's level adjusted; surfaces via
 `getCurrentLevel`.
- `type = 'minigamespin'` → SAW spin attempts granted; visible via the
 mini-game APIs.
- `type = 'prizedrop'` → one prize-drop attempt granted.
- `type = 'tangible'` → no automatic gameplay effect; the purchase is
 recorded for the operator's manual fulfillment (e.g. physical merch).

**UI guidance**: see [UI Guide — `getStoreItems`](../../docs/ui/store/UIGuide_getStoreItems.md).

## Example
```ts
// 1. Initial fetch + subscribe to live updates
const items = await window._smartico.api.getStoreItems({
  onUpdate: (refreshed) => {
    console.log('[smartico] store catalog refreshed after a purchase — re-render the entire store UI from this array, do not merge with prior state:', refreshed);

    // 2. onUpdate fires only after the current user's own purchase
    //    round-trip. Pool counts and can_buy flags are now current
    //    for this user.
    const soldOut = refreshed.filter(i => i.pool === 0);
    if (soldOut.length > 0) {
      console.log('[smartico] these items are now sold out — render an "Out of stock" overlay on each:', soldOut.map(i => i.id));
    }
  },
});

// 3. Live affordability per item. Compare each item's price against
//    the user's balance for its purchase_type (read from
//    getUserProfile(), kept live by the SDK's user-properties channel).
const profile = window._smartico.api.getUserProfile();
const balances = {
  points: profile?.ach_points_balance ?? 0,
  gems: profile?.ach_gems_balance ?? 0,
  diamonds: profile?.ach_diamonds_balance ?? 0,
};

// 4. Filter out items that are custom-section-only for the main view.
const mainViewItems = items.filter(i => !i.only_in_custom_section);

// 5. Bucket each item's button state for rendering.
for (const i of mainViewItems) {
  const activePrice = i.discounted_price ?? i.price;
  const canAfford = balances[i.purchase_type] >= activePrice;
  if (i.pool === 0) {
    console.log('[smartico] item', i.id, 'is sold out — render disabled Buy with "Out of stock" overlay');
  } else if (i.can_buy === false) {
    console.log('[smartico] item', i.id, 'is not eligible — render disabled Buy and surface cant_buy_message on the popup:', i.cant_buy_message);
  } else if (!canAfford) {
    console.log('[smartico] item', i.id, 'is unaffordable — render disabled Buy and show "short by" line on popup; deficit =', activePrice - balances[i.purchase_type], i.purchase_type);
  } else {
    console.log('[smartico] item', i.id, 'is buyable — render enabled Buy at price', activePrice, i.purchase_type);
  }
}

// 6. Visitor-mode equivalent: onUpdate is accepted but never fires.
//    Re-poll if you need fresh data; buyStoreItem is not supported.
// const visitorItems = await window._smartico.vapi('EN').getStoreItems();
// console.log('[smartico] visitor catalog is the brand proxy user\'s — per-user fields are not meaningful');
```

### Example response (REAL shape)
```json
[
  {
    "id": 7771,
    "name": "Do not the cat",
    "purchase_type": "points",
    "price": 69,
    "image": "https://cdn.example/83109b74be861920197eb8-cat-space.gif",
    "description": "Please do not the cat",
    "ribbon": "hot",
    "priority": 10,
    "type": "unknown",
    "can_buy": false,
    "category_ids": [
      234
    ],
    "pool": 69,
    "custom_data": {},
    "active_till_date": 9223372036854776000,
    "show_timer": false,
    "only_in_custom_section": false,
    "cant_buy_message": "Please do not the cat. Thank you.",
    "related_games": []
  }
]
```

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `getUserProfile`
- `getStorePurchasedItems`
- `getStoreCategories`
- `getBonuses`
- `getCurrentLevel`
- `buyStoreItem`
