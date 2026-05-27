import { ECacheContext, OCache } from '../OCache';
import {
	TBonus,
	TClaimBonusResult,
} from './WSAPITypes';
import {
	CACHE_DATA_SEC,
	onUpdateContextKey,
} from './WSAPIBase';
import { WSAPIMissions } from './WSAPIMissions';

/** @group Bonuses */
export class WSAPIBonuses extends WSAPIMissions {
	/**
	 * Returns the bonuses awarded to the current user — both pending
	 * (player-claim required) and already-redeemed. Each bonus carries
	 * a `bonus_status_id` ({@link BonusStatus}) describing its lifecycle
	 * stage and an `is_redeemable` flag that signals whether the
	 * consumer must trigger a manual {@link claimBonus} call.
	 *
	 * Bonuses originate from many sources (CRM rules, mission/tournament
	 * rewards, store redemptions, mini-game prizes, manual operator
	 * awards) and all surface through this single list. The consumer
	 * cannot distinguish the source server-side without operator
	 * coordination.
	 *
	 * @remarks
	 * **Subscription model (`onUpdate`)**
	 * The callback receives the FULL refreshed bonuses list (never a
	 * diff/patch). Each subsequent call to `getBonuses({ onUpdate })`
	 * REPLACES the prior callback. Pass `onUpdate: undefined` (or omit
	 * it) to keep the prior callback in place; the callback is never
	 * auto-cleared.
	 *
	 * **Update triggers** — the callback fires after every
	 * {@link claimBonus} call resolves on this connection (success OR
	 * failure). This is the ONLY trigger.
	 *
	 * Does NOT fire when: a new bonus is awarded server-side
	 * (CRM rule, mission completion, store purchase, etc.), a bonus
	 * expires, or an operator manually issues / cancels a bonus. Those
	 * changes surface only on the next cache miss (after the 30 s TTL).
	 * Re-call `getBonuses()` manually if your UI needs near-live state
	 * for server-driven awards.
	 *
	 * **Reading state from the returned bonus**
	 * Drive UI bucketing from `bonus_status_id` (enum {@link BonusStatus}):
	 *
	 * - `COUPON_ISSUED` (2) — actionable; player must claim. Pair with
	 *   `is_redeemable === true` to gate the Claim button.
	 * - `REDEEM_FAILED` (4) — also actionable; the previous claim
	 *   attempt failed but the bonus is still valid. Surface a retry CTA
	 *   — the default Smartico UI treats this identically to
	 *   `COUPON_ISSUED` from the player's perspective.
	 * - `REDEEMED` (3) — historical; show in a "claimed" tab.
	 * - `New` (1), `COUPON_ISSUE_FAILED` (5), `EXPIRED` (6) — these
	 *   should not normally reach the client and are typically filtered
	 *   out by operator-side widget configuration; if they do appear,
	 *   they have no player-actionable state.
	 *
	 * `is_redeemable` is the authoritative gate for showing the Claim
	 * button — it's `true` only when the bonus is in a claimable status
	 * AND the operator's integration uses a coupon model (where the
	 * player must explicitly trigger delivery). Auto-redeemed bonuses
	 * arrive already in `REDEEMED` state with `is_redeemable: false`.
	 *
	 * **Field hierarchy — display amount**
	 * Bonuses carry both template-level (`label_bonus_template_meta_map.description`)
	 * and instance-level (`bonus_meta_map.uiAmount`) display strings.
	 * Prefer `bonus_meta_map.uiAmount` when present — it's the dynamic
	 * amount computed at issuance time (e.g. from a dynamic-bonus
	 * formula). Fall back to `label_bonus_template_meta_map.description`
	 * (which can include HTML; sanitize before injecting).
	 *
	 * **Date format**
	 * `create_date` and `redeem_date` are ISO 8601 UTC strings WITHOUT
	 * a timezone suffix (`"YYYY-MM-DDTHH:MM:SS"`). Parse as UTC and
	 * display in the user's local timezone. `redeem_date` is absent
	 * until the bonus reaches `REDEEMED` status.
	 *
	 * **Cache TTL**: the SDK caches the response for 30 seconds. Cache
	 * is fully cleared on login / logout.
	 *
	 * **Idempotency / Side effects**: safe. Read-only.
	 *
	 * **UI guidance**: see [UI Guide — `getBonuses`](../../docs/ui/bonuses/UIGuide_getBonuses.md).
	 *
	 * **Visitor mode**: not supported.
	 *
	 * @param params              Optional. Omit to fetch without subscribing.
	 * @param params.onUpdate     Callback invoked with the full refreshed
	 *                            bonuses list after every
	 *                            {@link claimBonus} resolves. Each call
	 *                            to `getBonuses` overwrites the prior
	 *                            callback.
	 * @returns                   Promise resolving to the bonuses list.
	 *                            Empty array if no bonuses are visible.
	 *
	 * @example
	 * ```ts
	 * const bonuses = await window._smartico.api.getBonuses({
	 *   onUpdate: (refreshed) => {
	 *     console.log('[smartico] bonuses refreshed (after claimBonus) — re-render the bonuses UI from this array:', refreshed);
	 *   },
	 * });
	 *
	 * // Bucket into pending vs redeemed tabs. The default Smartico UI groups
	 * // COUPON_ISSUED + REDEEM_FAILED into the same "Pending" tab.
	 * const pending = bonuses.filter(b =>
	 *   b.bonus_status_id === 2 || b.bonus_status_id === 4  // COUPON_ISSUED or REDEEM_FAILED
	 * );
	 * const redeemed = bonuses.filter(b => b.bonus_status_id === 3);  // REDEEMED
	 *
	 * console.log('[smartico] render bonus tabs: pending=', pending.length, 'redeemed=', redeemed.length);
	 *
	 * // Render each pending bonus card; show Claim button only when redeemable.
	 * for (const b of pending) {
	 *   const amount = b.bonus_meta_map?.uiAmount || b.label_bonus_template_meta_map?.description;
	 *   if (b.is_redeemable) {
	 *     console.log('[smartico] render Claim button for bonus', b.bonus_id, '— amount:', amount);
	 *   } else {
	 *     console.log('[smartico] render bonus as informational (no Claim button) — amount:', amount);
	 *   }
	 * }
	 *
	 * // Server-awarded bonuses (e.g. from a CRM campaign) do NOT push;
	 * // poll if you need near-live awareness.
	 * setInterval(async () => {
	 *   const fresh = await window._smartico.api.getBonuses();
	 *   const newCount = fresh.filter(b => b.bonus_status_id === 2 || b.bonus_status_id === 4).length;
	 *   console.log('[smartico] poll tick — pending bonuses now:', newCount);
	 * }, 30_000);
	 * ```
	 */
	public async getBonuses({ onUpdate }: { onUpdate?: (data: TBonus[]) => void } = {}): Promise<TBonus[]> {
		if (onUpdate) {
			this.onUpdateCallback.set(onUpdateContextKey.Bonuses, onUpdate);
		}

		return OCache.use(onUpdateContextKey.Bonuses, ECacheContext.WSAPI, () => this.api.bonusesGetItemsT(this.userExtId), CACHE_DATA_SEC);
	}

	/**
	 * Triggers manual redemption of a coupon-model bonus the user has
	 * been awarded. For bonuses with `is_redeemable === true` returned
	 * by {@link getBonuses}, this is the call that asks the operator's
	 * integration to actually credit the bonus to the player's account.
	 * Bonuses on integrations that auto-redeem arrive already in
	 * `REDEEMED` state and do not require this call.
	 *
	 * Use this for `bonus_status_id` of `COUPON_ISSUED` (2) as the
	 * first-time claim, and for `REDEEM_FAILED` (4) as a retry after a
	 * prior unsuccessful attempt.
	 *
	 * @remarks
	 * **Preconditions**
	 * Read the candidate bonus from {@link getBonuses} and gate the
	 * call on `is_redeemable === true`. The SDK forwards the request
	 * unconditionally — calling on a non-claimable bonus returns
	 * `err_code = -1`.
	 *
	 * **Error codes** (in `err_code`)
	 *
	 * The SDK currently types `err_code` as {@link SAWSpinErrorCode} for
	 * historical reasons, but the values returned by this method come
	 * from the server's general error space and are NOT mini-game codes.
	 * Branch on the numeric values:
	 *
	 * - `0` — success; the bonus has been redeemed and the operator's
	 *   integration has credited the player's account.
	 * - `-1` — bonus not claimable: not found, already claimed by
	 *   another session, or its status is no longer `COUPON_ISSUED` /
	 *   `REDEEM_FAILED`. Treat as idempotent — refresh
	 *   {@link getBonuses} and reconcile.
	 * - `1` — generic server error. Transient; allow retry after a brief
	 *   delay.
	 * - `9999` — uncaught server exception. Treat as a transient failure;
	 *   surface a generic error and allow retry.
	 * - other non-zero — generic server error. Surface `err_message` if
	 *   any.
	 *
	 * **`success` field is unreliable**: the wire response does not
	 * carry a `success` boolean — the field on `TClaimBonusResult` will
	 * be `undefined` in practice. Always branch on `err_code === 0`
	 * for the success check.
	 *
	 * **Refresh after success (and after failure)**
	 * The SDK automatically refreshes the bonuses cache on every
	 * response (success OR failure) and fires any `onUpdate` callback
	 * registered via {@link getBonuses}'s `onUpdate`. After
	 * `err_code === 0`, the redeemed bonus shifts from
	 * `COUPON_ISSUED` / `REDEEM_FAILED` to `REDEEMED` on the refreshed
	 * array, with `redeem_date` populated. After a failure, the bonus
	 * typically lands in `REDEEM_FAILED` and remains claimable for a
	 * retry.
	 *
	 * **Idempotency**: NOT idempotent at the SDK level. A second call
	 * returns `err_code = -1` once the first has succeeded — treat that
	 * as success in the UI rather than as a real error. Guard the call
	 * site against double-clicks (set a local "claiming" flag on click,
	 * clear it on response).
	 *
	 * **Side effects** (on `err_code === 0`)
	 * - Bonus status transitions to `REDEEMED`; `redeem_date` is set.
	 * - The operator's integration credits the player's account
	 *   externally. The SDK does not observe that credit directly —
	 *   balance updates flow over the user-properties channel from the
	 *   operator's side, not from this response.
	 * - Server-side analytics events fire downstream (not directly
	 *   observable from the SDK).
	 *
	 * **UI guidance**: see [UI Guide — `claimBonus`](../../docs/ui/bonuses/UIGuide_claimBonus.md).
	 *
	 * **Visitor mode**: not supported.
	 *
	 * @param bonus_id  The `bonus_id` from a `TBonus` returned by
	 *                  {@link getBonuses}.
	 * @returns `{ err_code, err_message, success? }`; success when
	 *          `err_code === 0` (or `err_code === -1` when treated as
	 *          idempotent no-op). The `success` field is unreliable —
	 *          ignore it.
	 *
	 * @example
	 * ```ts
	 * const bonuses = await window._smartico.api.getBonuses({
	 *   onUpdate: (refreshed) => console.log('[smartico] bonuses refreshed — re-render from this array', refreshed),
	 * });
	 * const bonus = bonuses.find(b => b.bonus_id === bonusId);
	 *
	 * if (!bonus) {
	 *   console.log('[smartico] bonus no longer visible — refresh list and hide CTA');
	 *   return;
	 * }
	 * if (!bonus.is_redeemable) {
	 *   console.log('[smartico] bonus is not claimable (auto-redeemed or already finalised) — keep CTA hidden');
	 *   return;
	 * }
	 *
	 * console.log('[smartico] claim starting — set in-flight flag, show loading dots on the Claim button, keep the modal open');
	 * const r = await window._smartico.api.claimBonus(bonus.bonus_id);
	 * console.log('[smartico] claim response received — clear in-flight flag');
	 *
	 * if (r.err_code === 0 || r.err_code === -1) {
	 *   console.log('[smartico] claim succeeded (or was already done) — show a success toast; the getBonuses onUpdate above will fire with the refreshed list');
	 * } else if (r.err_code === 9999) {
	 *   console.error('[smartico] uncaught server exception — show a generic error toast and allow retry');
	 * } else {
	 *   console.error('[smartico] claim failed — surface this error message to the user; the bonus will move to REDEEM_FAILED state and remain claimable for a retry:', r.err_message);
	 * }
	 * ```
	 */
	public async claimBonus(bonus_id: number): Promise<TClaimBonusResult> {
		const r = await this.api.bonusClaimItem(this.userExtId, bonus_id);

		const o: TClaimBonusResult = {
			err_code: r.errCode,
			err_message: r.errMsg,
			success: r.success,
		};

		return o;
	}

	protected async updateBonuses() {
		const payload = await this.api.bonusesGetItemsT(this.userExtId);
		this.updateEntity(onUpdateContextKey.Bonuses, payload);
	}
}
