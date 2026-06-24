# buyStoreItem — API (TBuyStoreItemResult)

> Purchase a specific store item on behalf of the current user.
> Import: `import { TBuyStoreItemResult } from '@smartico/public-api'`
> Search terms: buyStoreItem, store, TBuyStoreItemResult, BuyStoreItemErrorCode, err_code, err_message

## Signature
```ts
_smartico.api.buyStoreItem(item_id: number): Promise<TBuyStoreItemResult>
```

## Parameters
- `item_id` — The store item `id` (from `getStoreItems()`).

## Returns — `Promise<TBuyStoreItemResult>`
`TBuyStoreItemResult`:
- `err_code` (BuyStoreItemErrorCode) — Error code. `0` = success. See `buyStoreItem` TSDoc for the full table.
- `err_message` (string) — Optional error message; populated on non-zero `err_code`.

## Behavioral contract
**Preconditions**
Read the candidate item from `getStoreItems()` first and gate the call
on these fields:
- `can_buy === true` — server-derived; combines segment / visibility
  conditions and any operator-set restrictions.
- `pool == null || pool > 0` — `null` means unlimited stock; a positive
  number means N units remain.
- User's balance for the item's `purchase_type`
  (`'points'` / `'gems'` / `'diamonds'`) is `>= price` (or
  `>= discounted_price` if set). Balances are not on `TStoreItem` —
  read them from the user properties returned by `getUserState()`.
- If `active_till_date` is set, it is in the future.

Calling without satisfying these will most likely return a non-zero
`err_code` (one of the codes below). The SDK does not pre-validate
— it forwards the request to the server unconditionally.



**Idempotency**: NOT idempotent. The server performs no de-duplication —
a second successful call deducts funds again and grants the reward
again (subject to per-user purchase caps). The SDK itself does **not**
enforce a single in-flight call. The consumer MUST guard the call site
against double-clicks (set a local "buying" flag on click, clear it on
response).

**Refresh after success (and after failure)**
The SDK automatically re-fetches the store item list and the
purchased-items history on every response (success or error). Any
`onUpdate` callback registered via `getStoreItems({ onUpdate })` (or
the purchased-items equivalent) fires shortly after with the updated
arrays — reflecting the new `pool`, `can_buy`, and any `purchased_*`
flags. The user's balance (points / gems / diamonds) is exposed on the
user-properties channel and updates independently; if the UI displays
the balance, subscribe to user-property updates separately (it does
NOT flow through `getStoreItems`).

**Side effects** (consumer-observable on success)
- User's points / gems / diamonds balance decreases by `price`
  (or `discounted_price` if set).
- Item's `pool` decrements by 1 (when `pool != null`).
- Per-user purchase counters update — `purchased_today`,
  `purchased_this_week`, `purchased_this_month` on the next
  `getStoreItems()` refresh.
- The reward is delivered: bonus issuance, mini-game spin grant,
  level change, prize drop, raffle ticket, or tangible-item record.
  Each reward type pushes its own follow-up update (e.g. a new
  bonus appears in `getBonuses()`, the spin shows up in
  `getMiniGames()`). Subscribe to each relevant channel separately.
- A purchase row is appended to the user's purchase history,
  surfaced via the purchased-items list.

**UI guidance**: see [UI Guide — `buyStoreItem`](../../docs/ui/store/UIGuide_buyStoreItem.md).

## Example
```ts
const items = await window._smartico.api.getStoreItems({
  onUpdate: (next) => console.log('[smartico] store items updated — re-render store grid with this fresh array', next),
});
const item = items.find(i => i.id === itemId);

if (!item) {
  console.log('[smartico] item not in current store list — keep UI as-is, possibly refresh getStoreItems');
  return;
}

// Local pre-checks: keep these aligned with the Buy-button decision matrix above.
const effectivePrice = item.discounted_price ?? item.price;
const inStock = item.pool == null || item.pool > 0;
const inWindow = !item.active_till_date || Date.now() < item.active_till_date;
if (!item.can_buy || !inStock || !inWindow) {
  console.log('[smartico] buy not applicable — show disabled state with operator copy if any:', item.cant_buy_message);
  return;
}

console.log('[smartico] buy starting — set in-flight flag, show loading dots on Buy button, keep detail modal open');
const r = await window._smartico.api.buyStoreItem(item.id);
console.log('[smartico] buy response received — clear in-flight flag');

if (r.err_code === 0) {
  console.log('[smartico] purchase successful — close the detail modal, show a success toast; getStoreItems onUpdate above will fire with the refreshed list (do NOT manually re-fetch)');
} else if (r.err_code === 11000 || r.err_code === 11011 || r.err_code === 11012) {
  console.error('[smartico] insufficient balance for this purchase_type — show insufficient-balance UI and how many units are missing:', item.purchase_type, effectivePrice);
} else if (r.err_code === 11009) {
  console.error('[smartico] item sold out — show a dedicated "Sold out" message; the auto-refresh will mark the card as such shortly');
} else if (r.err_code === 11006) {
  console.error('[smartico] per-user purchase cap reached — surface the operator-defined limit message:', item.limit_message || r.err_message);
} else if (r.err_code === 11014) {
  console.error('[smartico] outside purchase window — surface the operator-defined purchase-limit message:', item.purchase_limit_message || r.err_message);
} else if (r.err_code === 11004 || r.err_code === 11003) {
  console.error('[smartico] user not eligible / stale visibility — show a localized "try again later" message and let auto-refresh reconcile');
} else {
  console.error('[smartico] buy failed — show a generic error toast/modal with this message:', r.err_message);
}
```

### Example response (REAL shape)
> Where this real payload differs from the typed Returns above (TS interface vs raw wire), the REAL shape is the runtime truth.
```json
{
  "err_code": 11002,
  "err_message": "This bonus cannot be redeemed.You must make at least one real money deposit between redemption of consecutive free bonuses.Please contact support for more in…"
}
```

## Errors
**Error codes** (in `err_code`)
- `0` — success; funds debited and reward delivered.
- `1` — generic server error / control-group rejection. Treat as a
  transient failure; show a "try again later" message.
- `106` — label mismatch detected before the purchase transaction
  (e.g. cross-label item id). From a consumer perspective: the item is
  not purchasable by this user.
- `11000` (`SHOP_NO_BALANCE`) — insufficient **points** balance.
  Show an insufficient-balance message that names how many points are
  missing (`price - current_points_balance`). The Buy button on the
  item should already be disabled when this is the case; this code
  normally fires only on a stale local balance.
- `11001` (`SHOP_WRONG_LABEL`) — user-vs-item label mismatch detected
  inside the purchase transaction. Distinct from `106`; both mean
  "not purchasable by this user" from the consumer's perspective.
  Surface as a generic "item not available" message.
- `11002` (`SHOP_FAILED_TO_BUY_BONUS`) — the bonus configured on the
  store item couldn't be issued (bad / disabled bonus config on the
  operator side). Funds are NOT debited. Surface a generic error and
  advise the user to contact support if it persists.
- `11003` (`SHOP_FAILED_TO_BUY_SHOP_ITEM_CONDITION`) — the item's
  **visibility** segment condition is not satisfied. Shouldn't be
  reachable through a correctly-rendered UI (the item shouldn't be
  shown in the first place); usually indicates a stale local store
  list. Re-fetch via `getStoreItems()`.
- `11004` (`SHOP_FAILED_TO_BUY_SHOP_ITEM_CONDITION_PURSHASE`) — the
  item's **purchase** segment condition is not satisfied (the item is
  visible but the user is not in the buyable segment). Surface a
  localized "try again later" / "you're not eligible" message; do not
  retry automatically.
- `11005` (`SHOP_FAILED_TO_BUY_MATCHING_BONUS`) — matching-bonus
  coupon issuance failed (variant of `11002` for matching-deposit
  bonuses). Funds are NOT debited. Surface a generic error.
- `11006` (`SHOP_FAILED_MAX_BOUGHT_ITEMS_REACHED`) — per-user purchase
  cap reached (e.g. "max 1 per day"). Surface the item's
  `limit_message` if set, otherwise `err_message`. Do not retry.
- `11007` — bonus was issued but a follow-up redemption step failed
  server-side. Funds **are** debited and the purchase event is recorded;
  the consumer's UI should refresh the store list (auto-refresh will
  fire) and surface a soft warning rather than a hard error.
- `11009` (`SHOP_FAILED_POOL_EMPTY`) — stock pool is empty / sold out.
  Show a "sold out" message; auto-refresh will mark the item as such
  in subsequent `getStoreItems()` updates.
- `11011` (`SHOP_NO_BALANCE_GEMS`) — insufficient **gems** balance.
  Same handling as `11000` but for the gems currency.
- `11012` (`SHOP_NO_BALANCE_DIAMONDS`) — insufficient **diamonds**
  balance. Same handling as `11000` but for the diamonds currency.
- `11014` (`SHOP_FAILED_PURCHASE_LIMITATION`) — outside the configured
  purchase window (purchase weekday / time-of-day / window). Surface
  the item's `purchase_limit_message` if set, otherwise `err_message`.
- `9999` — uncaught server exception. Treat as a transient failure;
  surface a generic error and allow retry.
- other non-zero — generic server error. Surface `err_message` if any.
