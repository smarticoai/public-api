import { ECacheContext, OCache } from '../OCache';
import {
	TBuyStoreItemResult,
	TStoreCategory,
	TStoreItem,
} from './WSAPITypes';
import {
	CACHE_DATA_SEC,
	onUpdateContextKey,
} from './WSAPIBase';
import { WSAPIBonuses } from './WSAPIBonuses';

/** @group Store */
export class WSAPIStore extends WSAPIBonuses {
	private storeHistoryOnUpdateParams: { limit: number; offset: number } = { limit: 20, offset: 0 };

	private storeHistoryCacheKey(limit: number, offset: number): string {
		return `${onUpdateContextKey.StoreHistory}:${limit}:${offset}`;
	}

	/**
	 * Returns the catalog of buyable store items visible to the current user,
	 * scoped server-side to what the user is qualified to see. Optionally
	 * subscribes to live updates via `onUpdate`: the callback is invoked with
	 * the full refreshed catalog after every purchase the user makes from this
	 * device.
	 *
	 * The returned list is the canonical source of truth for store state
	 * (`can_buy`, `pool`, `discounted_price`, `active_till_date`, etc.).
	 * Consumers should NEVER mutate it optimistically — always re-fetch (or
	 * wait for the `onUpdate` callback) to observe the new state.
	 *
	 * @remarks
	 * **Preconditions**
	 * The catalog is per-user. Visitor mode is supported with caveats (see
	 * "Visitor mode" below). For the authenticated path, the user's balances
	 * (`ach_points_balance`, `ach_gems_balance`, `ach_diamonds_balance` from
	 * {@link getUserProfile}) must be tracked client-side to drive the
	 * affordability state of the Buy button — the SDK does not pre-compute
	 * affordability into `can_buy`.
	 *
	 * **Subscription model (`onUpdate`)**
	 * The callback receives the FULL refreshed catalog (never a diff/patch).
	 * Each subsequent call to `getStoreItems({ onUpdate })` REPLACES the prior
	 * callback — only one active subscriber at a time. Pass
	 * `onUpdate: undefined` (or omit it) to keep the prior callback in place;
	 * the callback is never auto-cleared.
	 *
	 * **Update triggers**
	 *
	 * Fires after: any `buyStoreItem(...)` call resolves on this connection
	 * (success OR failure). This is the ONLY trigger. The refreshed array
	 * reflects pool decrement on the just-bought item, per-period purchase
	 * cap re-evaluation on `can_buy`, and any `purchased_today` /
	 * `purchased_this_week` / `purchased_this_month` flips visible via
	 * {@link getStorePurchasedItems}.
	 *
	 * Does NOT fire for:
	 * - Operator-side BO catalog edits (price, ribbons, pool seed, segment
	 *   conditions, new/removed items) — surface only on the next cache miss.
	 * - Concurrent purchases by OTHER users — the current user's view of
	 *   `pool` may be stale until they themselves refresh.
	 * - User balance changes from gameplay — the catalog is independent of
	 *   balance; the consumer drives Buy-button affordability from a
	 *   separately-tracked balance source.
	 * - Items going past their `active_till_date` while the page is open —
	 *   the item simply disappears on the next refresh.
	 *
	 * **Server-side filtering** (what's already excluded before the SDK sees it)
	 * - Items outside the `[active_from_date, active_till_date]` window —
	 *   past the till-date, items are ALWAYS filtered out server-side.
	 * - Items the user fails visibility-segment / visibility-condition
	 *   checks for.
	 * - Items configured to hide-when-empty whose pool has reached 0
	 *   (per-item operator flag). Items without that flag are still returned
	 *   with `pool === 0` so a "Sold out" state can be rendered.
	 * - Items where the per-period bought-count cap is reached (and the
	 *   operator chose to hide rather than just disable).
	 *
	 * **Reading state from the returned item**
	 * The catalog row carries everything a Buy button needs except the user's
	 * balance: `can_buy` already reflects segment / visibility / per-period
	 * cap checks, but the SDK does NOT pre-compute balance affordability —
	 * compare `discounted_price ?? price` against the user's balance for
	 * `purchase_type` (`ach_points_balance` / `ach_gems_balance` /
	 * `ach_diamonds_balance` from {@link getUserProfile}). `purchase_type` is
	 * per-item (`'points'` / `'gems'` / `'diamonds'`); operators can mix
	 * currencies within a single catalog. For sold-out display, `pool === 0`
	 * means the operator chose to keep the item visible — render an "Out of
	 * stock" overlay. When `discounted_price` is set, render `price` with a
	 * strikethrough and `discounted_price` as the active price; the
	 * accompanying `discount_price_ribbon` is either a percentage preset
	 * (`'10'`, `'15'`, `'20'`, `'25'`, `'50'`) or the literal `'custom'`
	 * (in which case `custom_ribbon_image` is the artwork at 250×300 px).
	 * A live countdown for time-limited items is rendered only when the
	 * operator has enabled the per-item `show_timer` flag.
	 *
	 * **Cross-references**
	 * `category_ids` joins to `TStoreCategory.id` from
	 * {@link getStoreCategories} (many-to-many — an item can belong to
	 * multiple categories). Items with `only_in_custom_section: true` are
	 * returned in the catalog but intended for their custom-section view
	 * only — filter them client-side for the main store view. The
	 * history-only fields (`purchase_ts`, `purchase_points_amount`, the
	 * `purchased_*` booleans) are populated only by
	 * {@link getStorePurchasedItems}, not by this method.
	 *
	 * **Idempotency**: yes. `getStoreItems` is a pure read. Calling it
	 * repeatedly within the 30-second cache window resolves from the cache
	 * without a network round-trip.
	 *
	 * **Side effects** (of a successful purchase that triggers `onUpdate`)
	 * Documented here because the consumer's `onUpdate` handler will observe
	 * the resulting state changes on the next refreshed array:
	 * - Points / gems / diamonds balance deducted per `purchase_type`. The
	 *   new balance becomes visible on the user's gamification profile via
	 *   the SDK's user-properties update channel (`ach_points_balance` /
	 *   `ach_gems_balance` / `ach_diamonds_balance`).
	 * - `pool` decremented for limited-stock items.
	 * - `type = 'bonus'` → a CRM bonus is granted; surfaces via
	 *   {@link getBonuses}.
	 * - `type = 'raffleticket'` → raffle tickets granted; surfaces via
	 *   `getRaffles`.
	 * - `type = 'changelevel'` → user's level adjusted; surfaces via
	 *   {@link getCurrentLevel}.
	 * - `type = 'minigamespin'` → SAW spin attempts granted; visible via the
	 *   mini-game APIs.
	 * - `type = 'prizedrop'` → one prize-drop attempt granted.
	 * - `type = 'tangible'` → no automatic gameplay effect; the purchase is
	 *   recorded for the operator's manual fulfillment (e.g. physical merch).
	 *
	 * **UI guidance**: see [UI Guide — `getStoreItems`](../../docs/ui/store/UIGuide_getStoreItems.md).
	 *
	 * @param params              Optional. Omit to fetch without subscribing.
	 * @param params.onUpdate     Callback invoked with the full refreshed
	 *                            catalog after every {@link buyStoreItem}
	 *                            round-trip on this connection. Each call to
	 *                            `getStoreItems` overwrites the prior
	 *                            callback. Never fires in visitor mode.
	 * @returns                   Promise resolving to the catalog of store
	 *                            items visible to the user. Empty array if
	 *                            the user has no items (or if the visitor
	 *                            proxy user has none configured).
	 *
	 * @example
	 * ```ts
	 * // 1. Initial fetch + subscribe to live updates
	 * const items = await window._smartico.api.getStoreItems({
	 *   onUpdate: (refreshed) => {
	 *     console.log('[smartico] store catalog refreshed after a purchase — re-render the entire store UI from this array, do not merge with prior state:', refreshed);
	 *
	 *     // 2. onUpdate fires only after the current user's own purchase
	 *     //    round-trip. Pool counts and can_buy flags are now current
	 *     //    for this user.
	 *     const soldOut = refreshed.filter(i => i.pool === 0);
	 *     if (soldOut.length > 0) {
	 *       console.log('[smartico] these items are now sold out — render an "Out of stock" overlay on each:', soldOut.map(i => i.id));
	 *     }
	 *   },
	 * });
	 *
	 * // 3. Live affordability per item. Compare each item's price against
	 * //    the user's balance for its purchase_type (read from
	 * //    getUserProfile(), kept live by the SDK's user-properties channel).
	 * const profile = window._smartico.api.getUserProfile();
	 * const balances = {
	 *   points: profile?.ach_points_balance ?? 0,
	 *   gems: profile?.ach_gems_balance ?? 0,
	 *   diamonds: profile?.ach_diamonds_balance ?? 0,
	 * };
	 *
	 * // 4. Filter out items that are custom-section-only for the main view.
	 * const mainViewItems = items.filter(i => !i.only_in_custom_section);
	 *
	 * // 5. Bucket each item's button state for rendering.
	 * for (const i of mainViewItems) {
	 *   const activePrice = i.discounted_price ?? i.price;
	 *   const canAfford = balances[i.purchase_type] >= activePrice;
	 *   if (i.pool === 0) {
	 *     console.log('[smartico] item', i.id, 'is sold out — render disabled Buy with "Out of stock" overlay');
	 *   } else if (i.can_buy === false) {
	 *     console.log('[smartico] item', i.id, 'is not eligible — render disabled Buy and surface cant_buy_message on the popup:', i.cant_buy_message);
	 *   } else if (!canAfford) {
	 *     console.log('[smartico] item', i.id, 'is unaffordable — render disabled Buy and show "short by" line on popup; deficit =', activePrice - balances[i.purchase_type], i.purchase_type);
	 *   } else {
	 *     console.log('[smartico] item', i.id, 'is buyable — render enabled Buy at price', activePrice, i.purchase_type);
	 *   }
	 * }
	 *
	 * // 6. Visitor-mode equivalent: onUpdate is accepted but never fires.
	 * //    Re-poll if you need fresh data; buyStoreItem is not supported.
	 * // const visitorItems = await window._smartico.vapi('EN').getStoreItems();
	 * // console.log('[smartico] visitor catalog is the brand proxy user\'s — per-user fields are not meaningful');
	 * ```
	 */
	public async getStoreItems({ onUpdate }: { onUpdate?: (data: TStoreItem[]) => void } = {}): Promise<TStoreItem[]> {
		if (typeof onUpdate === 'function') {
			this.onUpdateCallback.set(onUpdateContextKey.StoreItems, onUpdate);
		}
		return OCache.use(
			onUpdateContextKey.StoreItems,
			ECacheContext.WSAPI,
			() => this.api.storeGetItemsT(this.userExtId),
			CACHE_DATA_SEC,
		);
	}

	/**
	 * Purchase a specific store item on behalf of the current user. Spends
	 * the user's points / gems / diamonds (depending on the item's
	 * `purchase_type`) and triggers reward delivery (bonus issuance, mini-game
	 * spin grant, level change, prize-drop, raffle ticket, or tangible item).
	 *
	 * A successful response (`err_code === 0`) means the funds have already
	 * been debited and the reward has been queued / granted server-side. The
	 * user's balance change arrives over a separate push channel, not in this
	 * response — see "Refresh after success" below.
	 *
	 * @remarks
	 * **Preconditions**
	 * Read the candidate item from `getStoreItems()` first and gate the call
	 * on these fields:
	 * - `can_buy === true` — server-derived; combines segment / visibility
	 *   conditions and any operator-set restrictions.
	 * - `pool == null || pool > 0` — `null` means unlimited stock; a positive
	 *   number means N units remain.
	 * - User's balance for the item's `purchase_type`
	 *   (`'points'` / `'gems'` / `'diamonds'`) is `>= price` (or
	 *   `>= discounted_price` if set). Balances are not on `TStoreItem` —
	 *   read them from the user properties returned by `getUserState()`.
	 * - If `active_till_date` is set, it is in the future.
	 *
	 * Calling without satisfying these will most likely return a non-zero
	 * `err_code` (one of the codes below). The SDK does not pre-validate
	 * — it forwards the request to the server unconditionally.
	 *
	 * **Error codes** (in `err_code`)
	 * - `0` — success; funds debited and reward delivered.
	 * - `1` — generic server error / control-group rejection. Treat as a
	 *   transient failure; show a "try again later" message.
	 * - `106` — label mismatch detected before the purchase transaction
	 *   (e.g. cross-label item id). From a consumer perspective: the item is
	 *   not purchasable by this user.
	 * - `11000` (`SHOP_NO_BALANCE`) — insufficient **points** balance.
	 *   Show an insufficient-balance message that names how many points are
	 *   missing (`price - current_points_balance`). The Buy button on the
	 *   item should already be disabled when this is the case; this code
	 *   normally fires only on a stale local balance.
	 * - `11001` (`SHOP_WRONG_LABEL`) — user-vs-item label mismatch detected
	 *   inside the purchase transaction. Distinct from `106`; both mean
	 *   "not purchasable by this user" from the consumer's perspective.
	 *   Surface as a generic "item not available" message.
	 * - `11002` (`SHOP_FAILED_TO_BUY_BONUS`) — the bonus configured on the
	 *   store item couldn't be issued (bad / disabled bonus config on the
	 *   operator side). Funds are NOT debited. Surface a generic error and
	 *   advise the user to contact support if it persists.
	 * - `11003` (`SHOP_FAILED_TO_BUY_SHOP_ITEM_CONDITION`) — the item's
	 *   **visibility** segment condition is not satisfied. Shouldn't be
	 *   reachable through a correctly-rendered UI (the item shouldn't be
	 *   shown in the first place); usually indicates a stale local store
	 *   list. Re-fetch via `getStoreItems()`.
	 * - `11004` (`SHOP_FAILED_TO_BUY_SHOP_ITEM_CONDITION_PURSHASE`) — the
	 *   item's **purchase** segment condition is not satisfied (the item is
	 *   visible but the user is not in the buyable segment). Surface a
	 *   localized "try again later" / "you're not eligible" message; do not
	 *   retry automatically.
	 * - `11005` (`SHOP_FAILED_TO_BUY_MATCHING_BONUS`) — matching-bonus
	 *   coupon issuance failed (variant of `11002` for matching-deposit
	 *   bonuses). Funds are NOT debited. Surface a generic error.
	 * - `11006` (`SHOP_FAILED_MAX_BOUGHT_ITEMS_REACHED`) — per-user purchase
	 *   cap reached (e.g. "max 1 per day"). Surface the item's
	 *   `limit_message` if set, otherwise `err_message`. Do not retry.
	 * - `11007` — bonus was issued but a follow-up redemption step failed
	 *   server-side. Funds **are** debited and the purchase event is recorded;
	 *   the consumer's UI should refresh the store list (auto-refresh will
	 *   fire) and surface a soft warning rather than a hard error.
	 * - `11009` (`SHOP_FAILED_POOL_EMPTY`) — stock pool is empty / sold out.
	 *   Show a "sold out" message; auto-refresh will mark the item as such
	 *   in subsequent `getStoreItems()` updates.
	 * - `11011` (`SHOP_NO_BALANCE_GEMS`) — insufficient **gems** balance.
	 *   Same handling as `11000` but for the gems currency.
	 * - `11012` (`SHOP_NO_BALANCE_DIAMONDS`) — insufficient **diamonds**
	 *   balance. Same handling as `11000` but for the diamonds currency.
	 * - `11014` (`SHOP_FAILED_PURCHASE_LIMITATION`) — outside the configured
	 *   purchase window (purchase weekday / time-of-day / window). Surface
	 *   the item's `purchase_limit_message` if set, otherwise `err_message`.
	 * - `9999` — uncaught server exception. Treat as a transient failure;
	 *   surface a generic error and allow retry.
	 * - other non-zero — generic server error. Surface `err_message` if any.
	 *
	 * **Idempotency**: NOT idempotent. The server performs no de-duplication —
	 * a second successful call deducts funds again and grants the reward
	 * again (subject to per-user purchase caps). The SDK itself does **not**
	 * enforce a single in-flight call. The consumer MUST guard the call site
	 * against double-clicks (set a local "buying" flag on click, clear it on
	 * response).
	 *
	 * **Refresh after success (and after failure)**
	 * The SDK automatically re-fetches the store item list and the
	 * purchased-items history on every response (success or error). Any
	 * `onUpdate` callback registered via `getStoreItems({ onUpdate })` (or
	 * the purchased-items equivalent) fires shortly after with the updated
	 * arrays — reflecting the new `pool`, `can_buy`, and any `purchased_*`
	 * flags. The user's balance (points / gems / diamonds) is exposed on the
	 * user-properties channel and updates independently; if the UI displays
	 * the balance, subscribe to user-property updates separately (it does
	 * NOT flow through `getStoreItems`).
	 *
	 * **Side effects** (consumer-observable on success)
	 * - User's points / gems / diamonds balance decreases by `price`
	 *   (or `discounted_price` if set).
	 * - Item's `pool` decrements by 1 (when `pool != null`).
	 * - Per-user purchase counters update — `purchased_today`,
	 *   `purchased_this_week`, `purchased_this_month` on the next
	 *   `getStoreItems()` refresh.
	 * - The reward is delivered: bonus issuance, mini-game spin grant,
	 *   level change, prize drop, raffle ticket, or tangible-item record.
	 *   Each reward type pushes its own follow-up update (e.g. a new
	 *   bonus appears in `getBonuses()`, the spin shows up in
	 *   `getMiniGames()`). Subscribe to each relevant channel separately.
	 * - A purchase row is appended to the user's purchase history,
	 *   surfaced via the purchased-items list.
	 *
	 * **UI guidance**: see [UI Guide — `buyStoreItem`](../../docs/ui/store/UIGuide_buyStoreItem.md).
	 *
	 * @param item_id  The store item `id` (from `getStoreItems()`).
	 * @returns `{ err_code, err_message }`; success when `err_code === 0`.
	 *
	 * @example
	 * ```ts
	 * const items = await window._smartico.api.getStoreItems({
	 *   onUpdate: (next) => console.log('[smartico] store items updated — re-render store grid with this fresh array', next),
	 * });
	 * const item = items.find(i => i.id === itemId);
	 *
	 * if (!item) {
	 *   console.log('[smartico] item not in current store list — keep UI as-is, possibly refresh getStoreItems');
	 *   return;
	 * }
	 *
	 * // Local pre-checks: keep these aligned with the Buy-button decision matrix above.
	 * const effectivePrice = item.discounted_price ?? item.price;
	 * const inStock = item.pool == null || item.pool > 0;
	 * const inWindow = !item.active_till_date || Date.now() < item.active_till_date;
	 * if (!item.can_buy || !inStock || !inWindow) {
	 *   console.log('[smartico] buy not applicable — show disabled state with operator copy if any:', item.cant_buy_message);
	 *   return;
	 * }
	 *
	 * console.log('[smartico] buy starting — set in-flight flag, show loading dots on Buy button, keep detail modal open');
	 * const r = await window._smartico.api.buyStoreItem(item.id);
	 * console.log('[smartico] buy response received — clear in-flight flag');
	 *
	 * if (r.err_code === 0) {
	 *   console.log('[smartico] purchase successful — close the detail modal, show a success toast; getStoreItems onUpdate above will fire with the refreshed list (do NOT manually re-fetch)');
	 * } else if (r.err_code === 11000 || r.err_code === 11011 || r.err_code === 11012) {
	 *   console.error('[smartico] insufficient balance for this purchase_type — show insufficient-balance UI and how many units are missing:', item.purchase_type, effectivePrice);
	 * } else if (r.err_code === 11009) {
	 *   console.error('[smartico] item sold out — show a dedicated "Sold out" message; the auto-refresh will mark the card as such shortly');
	 * } else if (r.err_code === 11006) {
	 *   console.error('[smartico] per-user purchase cap reached — surface the operator-defined limit message:', item.limit_message || r.err_message);
	 * } else if (r.err_code === 11014) {
	 *   console.error('[smartico] outside purchase window — surface the operator-defined purchase-limit message:', item.purchase_limit_message || r.err_message);
	 * } else if (r.err_code === 11004 || r.err_code === 11003) {
	 *   console.error('[smartico] user not eligible / stale visibility — show a localized "try again later" message and let auto-refresh reconcile');
	 * } else {
	 *   console.error('[smartico] buy failed — show a generic error toast/modal with this message:', r.err_message);
	 * }
	 * ```
	 */
	public async buyStoreItem(item_id: number): Promise<TBuyStoreItemResult> {
		const r = await this.api.buyStoreItem(this.userExtId, item_id);

		const o: TBuyStoreItemResult = {
			err_code: r.errCode,
			err_message: r.errMsg,
		};

		return o;
	}

	/**
	 * Returns the list of active store categories configured for the current label.
	 * Categories are operator-defined groupings used to organize store items into tabs,
	 * sections, or filter chips in the gamification store UI.
	 *
	 * @remarks
	 * **What categories are**
	 * - Operator-defined groupings, configured per-label by the brand operator.
	 *   Only active categories are returned; inactive / archived / deleted ones are
	 *   filtered out server-side.
	 * - Each `TStoreCategory` exposes `{ id, name, order }`. `name` is the display label;
	 *   `order` is the relative position (lower = appears first).
	 * - The same set of categories is returned to every user of the label — there is no
	 *   per-segment / per-currency / per-device filtering on the category list. Item-level
	 *   segment visibility happens on {@link getStoreItems}, not here.
	 *
	 * **Localization / translation**
	 * - `name` is **pre-translated server-side** to the authenticated user's stored language.
	 *   In visitor mode, the language passed to `_smartico.vapi(lang)` drives the translation.
	 *   Consumers never need to translate `name` themselves.
	 * - Fallback if no translation exists for the user's language: the operator-set default
	 *   (typically the brand's English) value is returned. The field is never null for an
	 *   active category.
	 *
	 * **Sort order**
	 * The server does NOT pre-sort. Sort client-side before rendering:
	 * `categories.sort((a, b) => a.order - b.order)`.
	 *
	 * **How store items join to categories**
	 * Each `TStoreItem` exposes `category_ids: number[]` (zero-or-more, many-to-many).
	 * A single store item can belong to multiple categories, or to none. To render a
	 * "category → items" view:
	 * `items.filter(i => i.category_ids.includes(cat.id))`.
	 *
	 * **Uncategorized items**
	 * Items with `category_ids: []` are NOT represented by a synthetic "Other" entry
	 * in the response. The convention used by the reference store UI is to synthesize
	 * a client-side bucket (e.g. labelled "General") for items that have no category, OR
	 * for items whose `category_ids` reference a category that is no longer returned by
	 * this method (e.g. archived since the item was tagged). If you choose to render
	 * such a synthetic bucket, place it first (the reference UI uses an `order: -1`
	 * convention so it precedes all operator-defined categories).
	 *
	 * **Empty categories**
	 * A category may be returned even if zero items currently reference it (since this
	 * method does not join against items). The reference store UI hides such empty
	 * categories from its tab strip — replicate that filter if you don't want to render
	 * tabs that lead to empty content panels.
	 *
	 * **Refresh cadence / cache**
	 * - The SDK caches the response for 30 seconds. Subsequent calls within that window
	 *   return the cached array without a network round-trip.
	 * - The cache is NOT invalidated by store-item push events or purchases — operator-driven
	 *   category changes propagate at the next 30 s cache miss.
	 * - Cache is fully cleared on login / logout.
	 * - In **visitor mode**, additional server-side caching applies on top of the SDK cache;
	 *   worst-case staleness for an edited/added category is on the order of a few minutes
	 *   for anonymous viewers.
	 *
	 * **Idempotency**: safe. Read-only metadata fetch. Cache de-duplicates concurrent calls.
	 *
	 * **Side effects**: none — pure metadata read.
	 *
	 * **UI guidance**: see [UI Guide — `getStoreCategories`](../../docs/ui/store/UIGuide_getStoreCategories.md).
	 *
	 * @returns Array of `{ id, name, order }`. Empty array if no active categories are
	 *   configured for the label. `name` is pre-translated. Order is NOT applied — caller
	 *   must sort.
	 *
	 * @example
	 * ```ts
	 * const [categories, items] = await Promise.all([
	 *   window._smartico.api.getStoreCategories(),
	 *   window._smartico.api.getStoreItems(),
	 * ]);
	 *
	 * if (categories.length === 0) {
	 *   console.log('[smartico] no store categories configured — render items as a flat grid without tabs:', items.length);
	 * } else {
	 *   // Sort categories; build per-category item buckets; hide empty categories
	 *   const sorted = [...categories].sort((a, b) => a.order - b.order);
	 *   const tabs = sorted
	 *     .map(cat => ({ cat, items: items.filter(i => i.category_ids?.includes(cat.id)) }))
	 *     .filter(t => t.items.length > 0);
	 *
	 *   // Optional: synthesize an "Other" bucket for items with no (or unknown) category
	 *   const knownIds = new Set(categories.map(c => c.id));
	 *   const orphans = items.filter(i => !i.category_ids?.length || !i.category_ids.some(id => knownIds.has(id)));
	 *   if (orphans.length > 0) {
	 *     console.log('[smartico] uncategorized store items — render a client-synthesized "Other" tab at the front of the tab strip:', orphans.length);
	 *   }
	 *
	 *   console.log('[smartico] render store tabs in this order with these counts:', tabs.map(t => `${t.cat.name} (${t.items.length})`));
	 * }
	 *
	 * // Visitor mode — same shape, language driven by vapi(lang) argument
	 * const visitorCats = await window._smartico.vapi('DE').getStoreCategories();
	 * console.log('[smartico] visitor-mode store categories (names translated to DE):', visitorCats);
	 * ```
	 */
	public async getStoreCategories(): Promise<TStoreCategory[]> {
		return OCache.use(
			onUpdateContextKey.StoreCategories,
			ECacheContext.WSAPI,
			() => this.api.storeGetCategoriesT(this.userExtId),
			CACHE_DATA_SEC,
		);
	}

	/**
	 * Fetches the authenticated user's **store purchase history** — a paginated,
	 * newest-first list of past store purchases (one row per redemption).
	 *
	 * Designed for a "My Purchases" / "Order History" screen. Each entry carries
	 * the same descriptive fields as the catalog card plus three history-only
	 * fields: `purchase_ts` (when the purchase happened), `purchase_points_amount`
	 * (the amount actually paid at that time — a price snapshot, not the
	 * current `price`), and `purchase_type` (`'points' | 'gems' | 'diamonds'`).
	 *
	 * @remarks
	 * **Preconditions**
	 * - User must be authenticated. Visitor mode is not supported (the SDK only
	 *   exposes this method on the authenticated `_smartico.api`, not on
	 *   `_smartico.vapi`).
	 * - No prerequisite calls — calling without first fetching
	 *   {@link getStoreItems} or {@link getStoreCategories} is fine.
	 *
	 * **Pagination semantics**
	 * - **Offset-based**, newest-first. The server orders rows by purchase
	 *   timestamp **descending** and the SDK does NOT re-sort — items arrive
	 *   ready to render in display order.
	 * - `limit` — page size. **The SDK default is 20.** There is no server-side
	 *   hard cap, but 20 matches what the default Smartico UI uses end-to-end; the
	 *   protocol and storage layers were sized for this page size. Treat `20`
	 *   as the conventional/recommended value; passing a much larger limit will
	 *   return more rows but is not the supported integration pattern.
	 *   Avoid `limit <= 0` — the server peeks `limit + 1` rows internally, so
	 *   `limit = 0` returns 1 row with a misleading "has more" signal, and
	 *   negative values produce undefined results.
	 * - `offset` — number of items to skip from the start. The SDK default is
	 *   `0` (first page). For load-more pagination, pass
	 *   `offset = (previously-loaded items).length` on each subsequent call.
	 * - **No `hasMore` on the returned array.** `TStoreItem[]` is a flat list;
	 *   the underlying protocol response carries `hasMore` but it is not
	 *   surfaced through this method. Two ways for consumers to know they
	 *   reached the end:
	 *     1. The returned array is shorter than `limit` (definitive end), or
	 *     2. A subsequent call at `offset = previous.length` returns `[]`.
	 *   Either is reliable.
	 * - No date-range / category / status filter parameters — pagination is the
	 *   only server-side slicing. Apply any further filtering client-side.
	 *
	 * **No per-item fulfillment status**
	 * - History entries do NOT carry a `delivered` / `pending` / `cancelled` /
	 *   `refunded` field. The list contains rows for committed purchase
	 *   attempts; the server query does not filter by transaction-status, so in
	 *   practice the rows that appear are completed purchases (failed
	 *   transactions roll back and don't write a row). Treat every item as a
	 *   completed transaction unless a future SDK release adds an explicit
	 *   status field.
	 *
	 * **Bonus-type entries**
	 * - When the user redeemed a bonus item, the entry's `type` field surfaces
	 *   as `'bonus'`. **Known limitation:** the SDK transform currently maps
	 *   both `Bonus` and `Tangible` server-side item types to the same string
	 *   `'bonus'` — so the `type` field on history rows cannot distinguish a
	 *   bonus redemption from a tangible-prize redemption. The actual bonus
	 *   payload (wallet credit, free spins, etc.) is dispatched by the server
	 *   asynchronously and is NOT embedded in the history entry — consumers
	 *   that need bonus details should subscribe to bonus push events
	 *   separately rather than reading them from this list.
	 * - History rows render identically across types — there is no deep-link to
	 *   the bonus wallet or re-claim affordance on the row itself.
	 *
	 * **Per-row data**
	 * Each row uses the `TStoreItem` shape but populates four history-only
	 * fields not present on `getStoreItems` output. `purchase_ts` is the
	 * Unix-ms timestamp of the purchase — format with
	 * `new Date(purchase_ts).toLocaleString()` in the user's local timezone;
	 * no relative labels ("Today" / "Yesterday") are produced by the SDK.
	 * `purchase_points_amount` is the amount actually paid at the time of
	 * purchase — a snapshot of the historical price, which may differ from
	 * the item's current `price`. `purchase_type` is the currency actually
	 * charged (`'points' | 'gems' | 'diamonds'`); render the matching
	 * balance icon next to the amount. The convenience booleans
	 * `purchased_today` / `purchased_this_week` / `purchased_this_month` are
	 * computed client-side from the consumer's local clock — useful for
	 * grouping rows under "Today" / "This Week" headers.
	 *
	 * **Catalog fields on a history row**
	 * The promotional fields (`ribbon`, `discounted_price`,
	 * `discount_price_ribbon`, `custom_ribbon_image`, `active_till_date`)
	 * reflect the CURRENT catalog state of the item, NOT its state at
	 * purchase time — the default Smartico UI hides them on history rows to
	 * avoid implying that the historical purchase carried the current
	 * promotional banner. Descriptive marketing fields (`description`,
	 * `hint_text`, `related_games`) are typically suppressed on a compact
	 * history row. The current-purchasability fields `can_buy` and `pool`
	 * reflect now, not then — useful only if you render a "Buy Again"
	 * affordance on the row. One implementation gotcha: unlike
	 * `getStoreItems`, this method's transform does NOT auto-parse JSON
	 * strings in `custom_data` — call `JSON.parse()` yourself if you store
	 * JSON there.
	 *
	 * **Cache & refresh**
	 * - The SDK caches each `(limit, offset)` page separately for 30 seconds.
	 *   Repeated calls within that window resolve from cache without a
	 *   network round-trip.
	 * - The cache is invalidated and `onUpdate` (when registered) is invoked
	 *   automatically after a successful {@link buyStoreItem} call — the SDK
	 *   re-fetches the same page parameters that were registered together with
	 *   the current `onUpdate` callback and pushes the fresh array.
	 * - Multi-tab caveat: if the user has the same brand open in multiple
	 *   tabs, **all open tabs** receive the `onUpdate` event on a purchase,
	 *   not only the tab that initiated the buy. The event is scoped to the
	 *   current authenticated user — a different user's purchase never fires
	 *   this callback.
	 * - Only ONE `onUpdate` callback can be registered at a time. Each call to
	 *   `getStorePurchasedItems({ onUpdate })` overwrites the previous handler.
	 *
	 * **Idempotency**: safe. Pure read.
	 *
	 * **Side effects**: none — read-only.
	 *
	 * **UI guidance**: see [UI Guide — `getStorePurchasedItems`](../../docs/ui/store/UIGuide_getStorePurchasedItems.md).
	 *
	 * @param params - Optional pagination + callback bag.
	 * @param params.limit - Page size. Defaults to `20`. Use `20` as the
	 *   conventional value (matches the default Smartico UI end-to-end). Avoid
	 *   non-positive values.
	 * @param params.offset - Number of rows to skip from the newest end.
	 *   Defaults to `0`. For load-more pagination pass the current array
	 *   length.
	 * @param params.onUpdate - Optional callback invoked after a successful
	 *   {@link buyStoreItem} elsewhere in the session. Receives the refreshed
	 *   page for the same `(limit, offset)` used on the call that registered
	 *   this callback. Only ONE callback can be registered; each new call
	 *   overwrites the previous one. Pass a stable handler or
	 *   re-register intentionally on screen entry.
	 *
	 * @returns Promise resolving to an array of `TStoreItem` history entries
	 *   in newest-first order. Empty array if the user has no purchases (or
	 *   the requested `offset` is beyond the end). Each entry carries
	 *   `purchase_ts`, `purchase_points_amount`, `purchase_type`, and the
	 *   `purchased_today/this_week/this_month` convenience flags in addition
	 *   to the standard item fields.
	 *
	 * @example
	 * ```ts
	 * // Initial load + subscribe to refresh-on-purchase.
	 * const handleHistoryUpdate = (items: TStoreItem[]) => {
	 *   console.log(
	 *     '[smartico] purchase history refreshed — re-render the history list with these',
	 *     items.length,
	 *     'items (newest first):',
	 *     items,
	 *   );
	 * };
	 *
	 * try {
	 *   const firstPage = await _smartico.api.getStorePurchasedItems({
	 *     limit: 20,
	 *     offset: 0,
	 *     onUpdate: handleHistoryUpdate,
	 *   });
	 *
	 *   if (firstPage.length === 0) {
	 *     console.log('[smartico] no purchase history — render the empty state ("No purchases yet")');
	 *   } else {
	 *     console.log(
	 *       '[smartico] render',
	 *       firstPage.length,
	 *       'history rows (newest first). Show "Load more" button if length === 20:',
	 *       firstPage,
	 *     );
	 *
	 *     // Inspect the first entry's history-only fields.
	 *     const first = firstPage[0];
	 *     console.log(
	 *       '[smartico] most-recent purchase: name=', first.name,
	 *       'paid', first.purchase_points_amount, first.purchase_type,
	 *       'at', new Date(first.purchase_ts ?? 0).toLocaleString(),
	 *       '— format with toLocaleString (user-local time) on the row.',
	 *     );
	 *   }
	 *
	 *   // Load-more pattern: fetch page 2 once the user scrolls / clicks "Load more".
	 *   if (firstPage.length === 20) {
	 *     const nextPage = await _smartico.api.getStorePurchasedItems({
	 *       limit: 20,
	 *       offset: firstPage.length,
	 *     });
	 *     const isLastPage = nextPage.length < 20;
	 *     console.log(
	 *       '[smartico] appended page 2 —',
	 *       nextPage.length,
	 *       'rows.',
	 *       isLastPage ? 'Hide "Load more" — end reached.' : 'Keep "Load more" visible.',
	 *     );
	 *   }
	 * } catch (e) {
	 *   console.error(
	 *     '[smartico] failed to load purchase history — show a generic error placeholder or retry with backoff:',
	 *     e,
	 *   );
	 * }
	 * ```
	 */
	public async getStorePurchasedItems({
		limit,
		offset,
		onUpdate,
	}: { limit?: number; offset?: number; onUpdate?: (data: TStoreItem[]) => void } = {}): Promise<TStoreItem[]> {
		const requestLimit = limit === undefined ? 20 : limit;
		const requestOffset = offset === undefined ? 0 : offset;
		const cacheKey = this.storeHistoryCacheKey(requestLimit, requestOffset);

		if (typeof onUpdate === 'function') {
			this.onUpdateCallback.set(onUpdateContextKey.StoreHistory, onUpdate);
			this.storeHistoryOnUpdateParams = { limit: requestLimit, offset: requestOffset };
		}

		return OCache.use(
			cacheKey,
			ECacheContext.WSAPI,
			() => this.api.storeGetPurchasedItemsT(this.userExtId, requestLimit, requestOffset),
			CACHE_DATA_SEC,
		);
	}

	protected async updateStorePurchasedItems() {
		const payload = await this.api.storeGetPurchasedItemsT(
			this.userExtId,
			this.storeHistoryOnUpdateParams.limit,
			this.storeHistoryOnUpdateParams.offset,
		);
		const cacheKey = this.storeHistoryCacheKey(this.storeHistoryOnUpdateParams.limit, this.storeHistoryOnUpdateParams.offset);

		OCache.set(cacheKey, payload, ECacheContext.WSAPI);

		const onUpdate = this.onUpdateCallback.get(onUpdateContextKey.StoreHistory);
		if (onUpdate) {
			onUpdate(payload);
		}
	}

	protected async updateStoreItems() {
		const payload = await this.api.storeGetItemsT(this.userExtId);
		this.updateEntity(onUpdateContextKey.StoreItems, payload);
	}
}
