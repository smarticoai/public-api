import { CoreUtils } from '../Core';
import { ECacheContext, OCache } from '../OCache';
import {
	TActivityLog,
	TLevel,
	TLevelCurrent,
	TSegmentCheckResult,
	TUserProfile,
	UserLevelExtraCountersT,
} from './WSAPITypes';
import {
	CACHE_DATA_SEC,
	onUpdateContextKey,
} from './WSAPIBase';
import { WSAPIBase } from './WSAPIBase';

/** @group User */
export class WSAPIUser extends WSAPIBase {
	/**
	 * Returns the current user's public profile — the source of truth for
	 * balances (points / gems / diamonds), the current level ID, the
	 * display username + avatar, language, public tags, and the inbox
	 * unread count. **This method is synchronous** (returns `TUserProfile`,
	 * not a Promise): the SDK keeps a local snapshot of the user's public
	 * properties that is initialised at identify time and kept live by a
	 * server-driven update channel — every call returns the latest cached
	 * values without a network round-trip.
	 *
	 * Subscribe to changes by registering a callback on `_smartico.on('props_change', ...)`
	 * — the callback fires with the full snapshot at identify and with
	 * partial-key updates on every subsequent server push (typically
	 * under 1 second after the underlying state change).
	 *
	 * @remarks
	 * **Preconditions**
	 * The tracker must be initialised — calling this before the identify
	 * round-trip completes throws (`"Tracker is not initialized, cannot
	 * getUserProfile"`). Safe ways to wait for readiness:
	 * - register `_smartico.on('identify', (errCode, props) => ...)` —
	 *   fires once after a successful identify with the full props
	 * - register `_smartico.on('props_change', () => ...)` — fires first
	 *   at identify with the full snapshot, then on every push update
	 *
	 * **What's kept live (push-updated)**
	 * Balance fields (`ach_points_balance`, `ach_gems_balance`,
	 * `ach_diamonds_balance`, `ach_points_ever`), `ach_level_current_id`,
	 * `core_public_tags`, `core_inbox_unread_count`, `core_user_language`,
	 * `avatar_url`, `public_username`, and the AI-driven recommended-amount
	 * fields all flow over the SDK's user-properties update channel as
	 * partial updates — the snapshot is patched in place when any of them
	 * change server-side. Re-call `getUserProfile()` (or watch
	 * `props_change`) to observe new values.
	 *
	 * **Reading state from the returned profile**
	 * Balances (`ach_points_balance`, `ach_gems_balance`,
	 * `ach_diamonds_balance`) are the canonical source for affordability
	 * checks across the SDK — compare against `entry_fee_amount` (clans),
	 * `registration_cost_points` / `_gems` / `_diamonds` (tournaments), and
	 * `price` / `discounted_price` + `purchase_type` (store items).
	 * `ach_points_ever` is monotonic — store purchases deduct from
	 * `ach_points_balance` but NEVER from `ach_points_ever`, so it remains
	 * useful for level-progress math (`required_points` on the next
	 * {@link getLevels} entry minus `ach_points_ever`). `ach_level_current_id`
	 * is the FK into the level ladder — resolve metadata via
	 * {@link getCurrentLevel} (richer, includes progress %) or
	 * {@link getLevels} (full ladder lookup table).
	 *
	 * **Inbox unread count** — `core_inbox_unread_count` on this profile
	 * is push-updated in real time (under 1 second). For an inbox badge,
	 * prefer this field over {@link getInboxUnreadCount} (which is cached
	 * for 30 s) — same value, fresher signal.
	 *
	 * **Language**: `core_user_language` reflects the server's stored
	 * language. If the consumer just called `_smartico.changeLanguage(...)`,
	 * the field may briefly lag the local intent until the server push
	 * arrives. Use `_smartico.getPublicProps()` for the
	 * client-fallback-applied version if instant accuracy matters.
	 *
	 * **Idempotency / Side effects**: trivially safe — no network call,
	 * no state mutation.
	 *
	 * **UI guidance**: see [UI Guide — `getUserProfile`](../../docs/ui/user/UIGuide_getUserProfile.md).
	 *
	 * **Visitor mode**: not supported — throws. Visitor sessions do not
	 * have a public-profile snapshot.
	 *
	 * @returns The current cached `TUserProfile` snapshot. A shallow copy —
	 *          mutating it does not affect the SDK's internal state.
	 * @throws  `Error("Tracker is not initialized, cannot getUserProfile")`
	 *          if called before identify completes or from a visitor session.
	 *
	 * @example
	 * ```ts
	 * // Wait for identify before calling.
	 * window._smartico.on('identify', (errCode) => {
	 *   if (errCode !== 0) return;
	 *   const profile = window._smartico.api.getUserProfile();
	 *   console.log('[smartico] initial profile loaded — render the user widget:', profile);
	 * });
	 *
	 * // Stay in sync with live updates.
	 * window._smartico.on('props_change', (changed) => {
	 *   // `changed` is the partial keys for this push (full snapshot at identify).
	 *   const profile = window._smartico.api.getUserProfile();
	 *   console.log('[smartico] profile updated — re-render any widgets bound to:', Object.keys(changed),
	 *     '— balances now:', profile.ach_points_balance, profile.ach_gems_balance, profile.ach_diamonds_balance);
	 *
	 *   // React to specific fields.
	 *   if ('ach_level_current_id' in changed) {
	 *     console.log('[smartico] level changed — call getCurrentLevel() for richer detail, animate the level badge');
	 *   }
	 *   if ('core_inbox_unread_count' in changed) {
	 *     console.log('[smartico] inbox unread count changed — update the badge to:', profile.core_inbox_unread_count);
	 *   }
	 * });
	 *
	 * // Affordability gating example — used inside a clan / tournament / store CTA handler.
	 * const profile = window._smartico.api.getUserProfile();
	 * const item = await window._smartico.api.getStoreItems().then(items => items[0]);
	 * const price = item.discounted_price ?? item.price;
	 * const balance = {
	 *   points: profile.ach_points_balance,
	 *   gems: profile.ach_gems_balance,
	 *   diamonds: profile.ach_diamonds_balance,
	 * }[item.purchase_type];
	 * if (balance < price) {
	 *   console.log('[smartico] insufficient', item.purchase_type, '— disable Buy and show deficit', price - balance);
	 * }
	 * ```
	 */
	public getUserProfile(): TUserProfile {
		if (this.api.tracker) {
			const o: TUserProfile = Object.assign({}, this.api.tracker.userPublicProps);
			o.avatar_url = CoreUtils.avatarUrl(this.api.tracker.userPublicProps.avatar_id, this.api.avatarDomain);
			return o;
		} else {
			throw new Error('Tracker is not initialized, cannot getUserProfile');
		}
	}

	/** Check if user belongs to specific segments
	 * **Example**:
	 * ```
	 * _smartico.api.checkSegmentMatch(1).then((result) => {
	 *   console.log(result);
	 * });
	 * ```
	 *
	 * **Visitor mode: not supported**
	 */
	public async checkSegmentMatch(segment_id: number): Promise<boolean> {
		const r = await this.api.coreCheckSegments(this.userExtId, [segment_id]);
		if (r && r.find((s) => s.segment_id === segment_id && s.is_matching)) {
			return true;
		} else {
			return false;
		}
	}

	/** Check if user belongs to specific list of segments
	 * **Example**:
	 * ```
	 * _smartico.api.checkSegmentListMatch([1, 2, 3]).then((result) => {
	 *    console.log(result);
	 * });
	 * ```
	 * **Visitor mode: not supported**
	 */
	public async checkSegmentListMatch(segment_ids: number[]): Promise<TSegmentCheckResult[]> {
		return await this.api.coreCheckSegments(this.userExtId, Array.isArray(segment_ids) ? segment_ids : [segment_ids]);
	}

	/**
	 * Returns the full level ladder configured for the current label —
	 * one `TLevel` per active level, server-sorted by `required_points`
	 * ASC (lowest first; `ordinal_position` is a 1-based index into the
	 * returned array). Use this to render a level map / progression
	 * screen, or as a lookup table to resolve `ach_level_current_id` from
	 * {@link getUserProfile} into a richer level object.
	 *
	 * @remarks
	 * **Server-side filtering**
	 * The server returns ALL active levels for the label. There is NO
	 * per-user filtering on visibility, level-status, or anything else —
	 * the response is identical across users of the same label. Apply
	 * `visibility_points` filtering client-side if you want to hide
	 * not-yet-reached levels (compare against
	 * `getUserProfile().ach_points_ever` and exclude levels where
	 * `visibility_points > ach_points_ever`).
	 *
	 * **Sort order**
	 * The returned array is already sorted by `required_points` ASC, and
	 * `ordinal_position` is a 1-based index into that same sort order —
	 * client-side re-sorting is not required for the default rendering.
	 * If your label uses sliding-window leveling logic
	 * (see {@link getUserLevelExtraCounters}) and you want to sort by
	 * a multi-criteria key (`required_points`, then
	 * `required_level_counter_1`, then `required_level_counter_2`), do
	 * that client-side.
	 *
	 * **Cache TTL**: the SDK caches the response for 30 seconds. Cache
	 * is fully cleared on login / logout. Operator-driven level edits
	 * surface on the next cache miss.
	 *
	 * **Idempotency / Side effects**: safe. Read-only metadata. Calls
	 * within the cache window de-duplicate to the same cached array.
	 *
	 * **UI guidance**: see [UI Guide — `getLevels`](../../docs/ui/user/UIGuide_getLevels.md).
	 *
	 * **Visitor mode**: supported. Use `_smartico.vapi(lang).getLevels()`
	 * to fetch the ladder for anonymous viewers; the level configuration
	 * is label-scoped static data so the response is meaningful even
	 * without an authenticated user. Per-user fields (the implicit
	 * "current level" via {@link getCurrentLevel}, or the user's progress)
	 * are not available in visitor mode.
	 *
	 * @returns Promise resolving to the ordered `TLevel[]` ladder. Empty
	 *          if no levels are configured for the label.
	 *
	 * @example
	 * ```ts
	 * const [levels, profile] = await Promise.all([
	 *   window._smartico.api.getLevels(),
	 *   Promise.resolve(window._smartico.api.getUserProfile()),
	 * ]);
	 *
	 * // Resolve the user's current level by ID.
	 * const current = levels.find(l => l.id === profile.ach_level_current_id);
	 * console.log('[smartico] render header badge — current level:', current?.name,
	 *   '(position', current?.ordinal_position, 'of', levels.length, ')');
	 *
	 * // Filter to levels the user has unlocked enough to see.
	 * const visible = levels.filter(l =>
	 *   l.visibility_points == null || l.visibility_points <= profile.ach_points_ever
	 * );
	 * console.log('[smartico] render the level map with', visible.length, 'visible tiles');
	 *
	 * // Visitor-mode equivalent: returns the same ladder; no per-user state.
	 * // const visitorLevels = await window._smartico.vapi('EN').getLevels();
	 * ```
	 */
	public async getLevels(): Promise<TLevel[]> {
		return OCache.use(onUpdateContextKey.Levels, ECacheContext.WSAPI, () => this.api.levelsGetT(this.userExtId), CACHE_DATA_SEC);
	}

	/**
	 * Returns the user's current level — every `TLevel` field plus a
	 * computed `progress` percentage toward the next level. Use this to
	 * power a level badge with a progress bar.
	 *
	 * @remarks
	 * **How `progress` is computed**
	 * The SDK derives `progress` as the *delta-from-current-level-floor*:
	 * `(ach_points_ever − current.required_points) / (next.required_points
	 * − current.required_points) × 100`, clamped to `[0, 100]`. At the
	 * highest level (no next level), `progress` is `100`. Reading the
	 * source values directly from {@link getUserProfile}'s
	 * `ach_points_ever` and {@link getLevels} would also work, but
	 * `progress` saves the math.
	 *
	 * **Cache TTL**: the SDK caches the response for 30 seconds. There is
	 * no push event that refreshes this cache; a server-side level change
	 * (visible immediately on {@link getUserProfile}'s `ach_level_current_id`
	 * via the user-properties update channel) becomes visible on this
	 * method only after the cache TTL expires, or after
	 * `_smartico.api.clearCaches()` is called.
	 *
	 * **Leveling logic**
	 * The semantics of how a user advances depends on the label's
	 * leveling logic (configured per brand): points-only (the default),
	 * sliding-window with extra counters (uses
	 * {@link getUserLevelExtraCounters}), or fully-manual operator
	 * assignment. The `progress` percentage on this method assumes the
	 * points-only model — it's not meaningful for manual-only labels
	 * where level changes are operator-driven rather than points-driven.
	 *
	 * **Idempotency**: safe. Read-only. Repeated calls within the cache
	 * window return a deep-cloned cached value without a network
	 * round-trip.
	 *
	 * **Side effects**: none — pure read.
	 *
	 * **Visitor mode**: not supported.
	 *
	 * @returns Promise resolving to `TLevelCurrent` — the current level
	 *          plus `progress: number` (0–100).
	 *
	 * @example
	 * ```ts
	 * const level = await window._smartico.api.getCurrentLevel();
	 * console.log('[smartico] render level badge — name:', level.name,
	 *   'progress:', Math.round(level.progress), '%');
	 *
	 * // Detect level-up via getUserProfile's push channel.
	 * window._smartico.on('props_change', async (changed) => {
	 *   if ('ach_level_current_id' in changed) {
	 *     await window._smartico.api.clearCaches();   // bust the 30 s cache
	 *     const fresh = await window._smartico.api.getCurrentLevel();
	 *     console.log('[smartico] user levelled up — animate badge to new level:', fresh.name);
	 *   }
	 * });
	 * ```
	 */
	public async getCurrentLevel(): Promise<TLevelCurrent> {
		return OCache.use(onUpdateContextKey.CurrentLevel, ECacheContext.WSAPI, () => this.api.getLevelCurrent(this.userExtId), CACHE_DATA_SEC);
	}

	/**
	 * Returns the user's current values for the two label-defined "extra
	 * counters" used by sliding-window leveling logic. Operators
	 * configure what each counter means per label (e.g. `level_counter_1`
	 * = total deposits in the last 30 days, `level_counter_2` = total
	 * wagering in the last 30 days). Compare against
	 * `required_level_counter_1` / `_2` on the next level from
	 * {@link getLevels} to know how close the user is to advancing.
	 *
	 * @remarks
	 * **When this matters**
	 * Only labels configured for sliding-window leveling populate the
	 * counter fields. On the default points-only leveling model, both
	 * `level_counter_1` and `level_counter_2` are `undefined`. Detect
	 * a points-only label by either counter being `undefined`.
	 *
	 * **Counter semantics — operator-defined**
	 * The SDK exposes raw numeric values; the meaning of each counter
	 * (deposit amount, wager amount, lifetime spend, etc.) is fully
	 * operator-defined per label. Resolve labels for display via
	 * {@link getTranslations} — the operator's display strings are
	 * stored under the translation keys `levelsCounter1Name` and
	 * `levelsCounter2Name`.
	 *
	 * **Refresh cadence**
	 * Sliding-window counters are recomputed by a server-side job that
	 * runs roughly every 60 seconds against the operator's BigQuery
	 * dataset; level transitions driven by counter changes have a
	 * latency of up to several minutes after the underlying activity
	 * (e.g. a deposit). The SDK caches the response for 30 seconds; no
	 * push event refreshes this cache. After a level change visible on
	 * {@link getUserProfile}'s `ach_level_current_id`, call
	 * `_smartico.api.clearCaches()` to force a fresh fetch.
	 *
	 * **Idempotency**: safe. Read-only. Repeated calls within the cache
	 * window return a deep-cloned cached value without a network
	 * round-trip.
	 *
	 * **Side effects**: none — pure read.
	 *
	 * **Visitor mode**: not supported.
	 *
	 * @returns Promise resolving to `UserLevelExtraCountersT`. Both
	 *          fields are `undefined` on labels not using sliding-window
	 *          leveling.
	 *
	 * @example
	 * ```ts
	 * const [counters, levels, profile] = await Promise.all([
	 *   window._smartico.api.getUserLevelExtraCounters(),
	 *   window._smartico.api.getLevels(),
	 *   Promise.resolve(window._smartico.api.getUserProfile()),
	 * ]);
	 *
	 * // Quick detection: undefined means this label doesn't use sliding-window leveling.
	 * if (counters.level_counter_1 === undefined) {
	 *   console.log('[smartico] points-only label — skip counter UI; show points progress only');
	 *   return;
	 * }
	 *
	 * // Find the next level and render a 3-bar progress block.
	 * const currentIdx = levels.findIndex(l => l.id === profile.ach_level_current_id);
	 * const next = levels[currentIdx + 1];
	 * if (next) {
	 *   console.log('[smartico] render points bar:', profile.ach_points_ever, '/', next.required_points);
	 *   if (next.required_level_counter_1) {
	 *     console.log('[smartico] render counter 1 bar:', counters.level_counter_1, '/', next.required_level_counter_1);
	 *   }
	 *   if (next.required_level_counter_2) {
	 *     console.log('[smartico] render counter 2 bar:', counters.level_counter_2, '/', next.required_level_counter_2);
	 *   }
	 * }
	 * ```
	 */
	public async getUserLevelExtraCounters(): Promise<UserLevelExtraCountersT> {
		return OCache.use(
			onUpdateContextKey.LevelExtraCounters,
			ECacheContext.WSAPI,
			() => this.api.getUserGamificationInfoT(this.userExtId),
			CACHE_DATA_SEC,
		);
	}

	/**
	 * Returns the activity log for a user within a specified time range.
	 * The response includes both points changes and gems/diamonds changes.
	 * Each log entry contains information about the change amount, balance, and source.
	 * The returned list is cached for 30 seconds.
	 * You can pass the onUpdate callback as a parameter, it will be called every time the activity log is updated and will provide the updated list of activity logs for the last 10 minutes.
	 *
	 * **Example**:
	 * ```
	 * const startTime = Math.floor(Date.now() / 1000) - 86400 * 30; // 30 days ago
	 * const endTime = Math.floor(Date.now() / 1000); // now
	 *
	 * _smartico.api.getActivityLog({
	 *      startTimeSeconds: startTime,
	 *      endTimeSeconds: endTime,
	 *      from: 0,
	 *      to: 50,
	 *      onUpdate: (data) => console.log('Updated:', data)
	 * }).then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 * **Visitor mode: not supported**
	 *
	 * @param params - Activity log parameters
	 * @param params.startTimeSeconds - Start time in seconds (epoch timestamp)
	 * @param params.endTimeSeconds - End time in seconds (epoch timestamp)
	 * @param params.from - Start index of records to return
	 * @param params.to - End index of records to return
	 * @param params.onUpdate - Optional callback function that will be called when the activity log is updated
	 */
	public async getActivityLog({
		startTimeSeconds,
		endTimeSeconds,
		from,
		to,
		onUpdate,
	}: {
		startTimeSeconds: number;
		endTimeSeconds: number;
		from: number;
		to: number;
		onUpdate?: (data: TActivityLog[]) => void;
	}): Promise<TActivityLog[]> {

		if (onUpdate) {
			this.onUpdateCallback.set(onUpdateContextKey.ActivityLog, onUpdate);
		}

		return await OCache.use(
			onUpdateContextKey.ActivityLog,
			ECacheContext.WSAPI,
			() => this.api.getActivityLogT(this.userExtId, startTimeSeconds, endTimeSeconds, from, to),
			CACHE_DATA_SEC,
		);
	}

	protected async notifyActivityLogUpdate() {
		const startSeconds = Date.now() / 1000 - 600;
		const endSeconds = Date.now() / 1000;
		const payload = await this.api.getActivityLogT(this.userExtId, startSeconds, endSeconds, 0, 50);

		this.updateEntity(onUpdateContextKey.ActivityLog, payload);
	}
}
