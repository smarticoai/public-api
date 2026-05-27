import { ECacheContext, OCache } from '../OCache';
import {
	TAchCategory,
	TMissionClaimRewardResult,
	TMissionOptInResult,
	TMissionOrBadge,
} from './WSAPITypes';
import {
	CACHE_DATA_SEC,
	onUpdateContextKey,
} from './WSAPIBase';
import { WSAPIGeneral } from './WSAPIGeneral';

/** @group Missions */
export class WSAPIMissions extends WSAPIGeneral {
	/**
	 * Returns all missions visible to the current user, scoped server-side
	 * to what the user is qualified to see. Optionally subscribes to live
	 * updates via `onUpdate`: the callback is invoked with the full, refreshed
	 * mission array whenever the server pushes a mission-state-changing event.
	 *
	 * The returned list is the canonical source of truth for mission state
	 * (`is_opted_in`, `progress`, `is_completed`, `completion_count`, etc.).
	 * Consumers should NEVER mutate it optimistically — always wait for the
	 * `onUpdate` callback (or a fresh `getMissions()` call after the 30s cache
	 * window expires) to observe the new state.
	 *
	 * @remarks
	 * **Subscription model (`onUpdate`)**
	 * The callback receives the FULL refreshed mission array (never a
	 * diff/patch). Each subsequent call to `getMissions({ onUpdate })`
	 * REPLACES the prior callback — only one active subscriber at a time.
	 * Pass `onUpdate: undefined` (or omit it) to keep the prior callback in
	 * place; the callback is never auto-cleared.
	 *
	 * **Update triggers** — the callback fires when:
	 * 1. **Mutation responses**: `requestMissionOptIn(...)` or
	 *    `requestMissionClaimReward(...)` resolves (any `err_code`).
	 * 2. **Asynchronous server pushes**: a user activity (deposit, bet,
	 *    login, etc.) advances task progress on a task configured to push
	 *    updates, or completes a mission.
	 * 3. **Visibility changes**: the user's level changes, or other
	 *    gamification visibility tags change.
	 *
	 * Operator-side BO mission-config edits do NOT push to connected
	 * clients — those changes surface only on the next cache miss (after
	 * the 30 s TTL) or alongside the next trigger from (1)–(3).
	 *
	 * **What's in the returned list / what's filtered server-side**
	 * The response is pre-filtered by the server. Missions EXCLUDED before
	 * reaching the SDK:
	 * - Missions in `DRAFT` or `ARCHIVED` status (see {@link AchievementStatus}).
	 * - Missions where the user fails visibility conditions. Exception:
	 *   completed missions may remain visible after the user no longer
	 *   qualifies (configurable per-brand).
	 * - `FEATURED_MANUALLY` missions that are still locked — they appear
	 *   only after the user unlocks them.
	 * - Locked missions configured to hide while locked — UNLESS the
	 *   mission is configured to expose immediately on unlock (then the
	 *   locked mission is included as a teaser).
	 * - `RECURRING` missions between cycles, until the next cycle starts.
	 * - `RECURRING_QUANTITY` missions outside their `active_from_ts` /
	 *   `active_till_ts` window.
	 *
	 * Client-side filtering you may still want: missions with
	 * `only_in_custom_section: true` are intended for their custom-section
	 * view only and should be hidden from the main mission list.
	 *
	 * **Reading state from the returned mission**
	 * Drive availability chips ("missed", "coming soon", "needs opt-in",
	 * "in progress", "expired") from `availability_status` (enum
	 * {@link AchievementAvailabilityStatus}) — it's the canonical derived
	 * state and reflects all server-side timing/visibility rules in one
	 * field. For time-limited and recurring missions, `dt_start` doubles
	 * as the opt-in timestamp (for opt-in missions) or unlock timestamp
	 * (for previously-locked missions); the expiration of a time-limited
	 * mission is `dt_start + time_limit_ms`. `next_recurrence_date_ts`
	 * is populated for `RECURRING` / `RECURRING_QUANTITY` missions but
	 * is no longer meaningful once the mission's `active_till_ts` has
	 * passed.
	 *
	 * **Refresh after a mutation**
	 * After `requestMissionOptIn(...)` or `requestMissionClaimReward(...)`
	 * resolves, the SDK auto-refreshes the mission cache; the `onUpdate`
	 * callback fires with the new array shortly after. `is_opted_in`,
	 * `progress`, and `is_completed` flip on the refreshed mission — do
	 * NOT mutate them optimistically while the round-trip is pending.
	 * Render any pending state from your own loading flag.
	 *
	 * **UI guidance**: see [UI Guide — `getMissions`](../../docs/ui/missions/UIGuide_getMissions.md).
	 *
	 * @param params              Optional. Omit to fetch without subscribing.
	 * @param params.onUpdate     Callback invoked with the full refreshed
	 *                            mission array on every server-pushed update
	 *                            (after opt-in / claim-reward calls, or when
	 *                            the server pushes an asynchronous
	 *                            mission-state change). Each call to
	 *                            `getMissions` overwrites the prior callback.
	 *                            Never fires in visitor mode.
	 * @returns                   Promise resolving to the current list of
	 *                            missions visible to the user. Empty array if
	 *                            the user has no missions (or if the visitor
	 *                            proxy user has none configured).
	 *
	 * @example
	 * ```ts
	 * // 1. Initial fetch + subscribe to live updates
	 * const missions = await window._smartico.api.getMissions({
	 *   onUpdate: (refreshed) => {
	 *     console.log('[smartico] mission list refreshed — re-render the entire mission list UI from this array, do not merge with prior state:', refreshed);
	 *
	 *     // 2. onUpdate fires for: opt-in/claim responses, task-progress
	 *     //    pushes that complete a mission or move a "pushToClient" task,
	 *     //    and user-level changes. Treat each call as authoritative.
	 *     const claimable = refreshed.filter(m =>
	 *       m.is_completed && m.requires_prize_claim && !m.prize_claimed_date_ts,
	 *     );
	 *     if (claimable.length > 0) {
	 *       console.log('[smartico] there are unclaimed mission prizes — surface a "Claim" CTA on each of these missions:', claimable.map(m => m.id));
	 *     }
	 *   },
	 * });
	 *
	 * // 3. Filter/render from the returned list. The server already excludes
	 * //    DRAFT/ARCHIVED missions and ones the user can't see. You may need
	 * //    client-side filters for view-specific concerns (custom sections,
	 * //    completed/missed tabs).
	 * const generalView = missions
	 *   .filter(m => !m.only_in_custom_section)
	 *   .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
	 *
	 * console.log('[smartico] initial mission list ready — render', generalView.length, 'missions sorted by position');
	 *
	 * // 4. Visitor-mode equivalent: onUpdate is accepted but never fires.
	 * //    Re-poll if you need fresh data.
	 * // const visitorMissions = await window._smartico.vapi('EN').getMissions();
	 * // console.log('[smartico] visitor missions are the brand proxy user\'s — per-user fields are not meaningful');
	 * ```
	 */
	public async getMissions({ onUpdate }: { onUpdate?: (data: TMissionOrBadge[]) => void } = {}): Promise<TMissionOrBadge[]> {
		if (onUpdate) {
			this.onUpdateCallback.set(onUpdateContextKey.Missions, onUpdate);
		}

		return OCache.use(
			onUpdateContextKey.Missions,
			ECacheContext.WSAPI,
			() => this.api.missionsGetItemsT(this.userExtId),
			CACHE_DATA_SEC,
		);
	}

	/**
	 * Returns all the badges available to the current user.
	 *
	 * Badges are completion-tracked achievements that auto-unlock once the user
	 * meets their criteria — there is no opt-in step, no claim step, and no
	 * task-description reveal. Contrast with {@link getMissions}, which returns
	 * the same `TMissionOrBadge[]` shape but represents explicit opt-in flows.
	 *
	 * @remarks
	 * **Why no `onUpdate` callback?**
	 * Unlike `getMissions({ onUpdate })`, this method does NOT accept an
	 * `onUpdate` subscription. Internally the SDK never refreshes the `Badges`
	 * cache from server pushes: the achievement-related push events
	 * (mission opt-in / claim / reload) refresh the missions cache, NOT
	 * the badges cache. The badges cache is flushed only by:
	 * - its 30-second TTL
	 * - a full SDK cache wipe at login / logout
	 *
	 * **How to refresh the badge list**
	 * If you need near-live badge state, poll manually after the TTL expires.
	 * The first call inside the 30 s window returns the cached payload; the
	 * first call after the TTL triggers a fresh server round-trip. Example:
	 * ```ts
	 * setInterval(async () => {
	 *   const badges = await window._smartico.api.getBadges();
	 *   console.log('[smartico] badge list polled — re-render badge grid from this array', badges);
	 * }, 30_000);
	 * ```
	 * Alternatively, re-fetch on a domain event your app already handles
	 * (e.g. after the user finishes a game round or claims a bonus).
	 *
	 * **Differences from missions** (same `TMissionOrBadge` shape, different
	 * feature)
	 * The opt-in, claim, recurring-cycle, and unlock-description fields on
	 * the returned objects are not populated for badges; treat their values
	 * as undefined / default. Time windows are absolute calendar timestamps
	 * (`active_from_ts` / `active_till_ts`), not opt-in-relative durations —
	 * drive availability chips from the SDK-computed `badgeTimeLimitState`
	 * (enum {@link BadgesTimeLimitStates}), not `time_limit_ms`. Locking for
	 * badges is purely time-based: `is_locked` is `true` only when
	 * `badgeTimeLimitState === BadgesTimeLimitStates.BeforeStartDate` (the
	 * time window hasn't started yet). The primary navigation field is
	 * `category_ids` — call {@link getAchCategories} to resolve category
	 * metadata and group badges by category.
	 *
	 * **Idempotency / Side effects**: fetch-only; safe to call repeatedly.
	 * The cache layer deduplicates concurrent calls within the TTL window.
	 *
	 * **UI guidance**: see [UI Guide — `getBadges`](../../docs/ui/missions/UIGuide_getBadges.md).
	 *
	 * @returns Promise resolving to `TMissionOrBadge[]`. Every item has
	 *          `type === 'badge'`. Cached for 30 s under the `Badges` key.
	 *
	 * @example
	 * ```ts
	 * const [badges, categories] = await Promise.all([
	 *   window._smartico.api.getBadges(),
	 *   window._smartico.api.getAchCategories(),
	 * ]);
	 *
	 * console.log('[smartico] badges fetched — render grouped grid with', badges.length, 'badges across', categories.length, 'categories');
	 *
	 * for (const category of categories) {
	 *   const inCategory = badges.filter(b => b.category_ids?.includes(category.id));
	 *   const completed = inCategory.filter(b => b.is_completed).length;
	 *   console.log(`[smartico] render category section "${category.name}" header showing ${completed}/${inCategory.length}`);
	 *
	 *   for (const badge of inCategory) {
	 *     // Use badgeTimeLimitState (not time_limit_ms) for availability chip
	 *     if (badge.badgeTimeLimitState === 0) { // BadgesTimeLimitStates.BeforeStartDate
	 *       console.log('[smartico] badge not yet started — render grayscaled card with "Starts on" chip for badge', badge.id);
	 *     } else if (badge.is_completed) {
	 *       console.log('[smartico] badge completed — render with completed styling and check-mark for badge', badge.id);
	 *     } else {
	 *       console.log('[smartico] badge in progress — render with stage counter (completed_tasks / total) for badge', badge.id);
	 *     }
	 *   }
	 * }
	 *
	 * // No onUpdate available — poll if live state matters
	 * setInterval(async () => {
	 *   try {
	 *     const fresh = await window._smartico.api.getBadges();
	 *     console.log('[smartico] badge poll tick — diff against previous list and re-render any changed badge cards', fresh);
	 *   } catch (e) {
	 *     console.error('[smartico] badge poll failed — keep showing last known state, retry on next tick:', e);
	 *   }
	 * }, 30_000);
	 * ```
	 */
	public async getBadges(): Promise<TMissionOrBadge[]> {
		return OCache.use(onUpdateContextKey.Badges, ECacheContext.WSAPI, () => this.api.badgetsGetItemsT(this.userExtId), CACHE_DATA_SEC);
	}

	/**
	 * Returns the list of active mission/badge categories configured for the current label.
	 * Categories are operator-defined groupings used to organize missions and badges into
	 * sections, tabs, or filter chips in the gamification UI. The same category list serves
	 * BOTH missions and badges — there is no separate "mission categories" vs "badge
	 * categories" split on the server.
	 *
	 * @remarks
	 * **What categories are**
	 * - Operator-defined groupings, configured per-label by the brand operator.
	 *   Only active categories are returned; inactive/deleted ones are filtered out.
	 * - Each `TAchCategory` exposes `{ id, name, order }`. `name` is the display label;
	 *   `order` is the relative position (lower = appears first).
	 * - The same array covers BOTH missions and badges — categories are not filtered by
	 *   entity type on the server.
	 *
	 * **Localization / translation**
	 * - `name` is **pre-translated server-side** to the authenticated user's stored language.
	 *   In visitor mode, the language passed to `_smartico.vapi(lang)` drives the
	 *   translation. Consumers never need to translate `name` themselves.
	 * - Fallback if no translation exists for the user's language: the brand's EN value
	 *   is returned. The field is never null.
	 *
	 * **Sort order**
	 * The server does NOT pre-sort. Sort client-side before rendering:
	 * `categories.sort((a, b) => a.order - b.order)`.
	 *
	 * **How missions/badges join to categories**
	 * Each `TMissionOrBadge` exposes `category_ids: number[]` (zero-or-more,
	 * many-to-many). A single mission/badge can belong to multiple categories
	 * simultaneously, or to none. To render a "category → items" view:
	 * `missions.filter(m => m.category_ids.includes(cat.id))`.
	 *
	 * **Uncategorized items**
	 * Items with `category_ids: []` are NOT represented by a synthetic "Other" entry.
	 * If your UI needs one, generate it client-side by checking
	 * `item.category_ids.length === 0`.
	 *
	 * **Empty categories**
	 * A category may be returned even if zero missions/badges reference it. Filter
	 * out empty categories on the consumer side if you don't want to render section
	 * headers for them.
	 *
	 * **Refresh cadence / cache**
	 * - The SDK caches the response for 30 seconds. Subsequent calls within that
	 *   window return the cached array without a network round-trip.
	 * - The cache is NOT invalidated by mission/badge push events — operator-driven
	 *   category changes propagate at the next 30 s cache miss.
	 * - Cache is fully cleared on login / logout.
	 * - In **visitor mode** additional server-side caching applies on top of the
	 *   SDK cache; worst-case staleness for an edited/added category is on the order
	 *   of a few minutes for anonymous viewers.
	 *
	 * **Idempotency**: safe. Read-only metadata fetch. Cache de-duplicates concurrent calls.
	 *
	 * **Side effects**: none — pure metadata read.
	 *
	 * **UI guidance**: see [UI Guide — `getAchCategories`](../../docs/ui/missions/UIGuide_getAchCategories.md).
	 *
	 * @returns Array of `{ id, name, order }`. Empty array if no active categories are
	 *   configured for the label. `name` is pre-translated. Order is NOT applied — caller
	 *   must sort.
	 *
	 * @example
	 * ```ts
	 * const categories = await window._smartico.api.getAchCategories();
	 *
	 * if (categories.length === 0) {
	 *   console.log('[smartico] no categories configured — render missions/badges as a flat list without section headers');
	 * } else {
	 *   const sorted = [...categories].sort((a, b) => a.order - b.order);
	 *   console.log('[smartico] categories loaded — render one tab/section per entry in this order:', sorted.map(c => c.name));
	 *
	 *   // Join to missions: render each category as a section
	 *   const missions = await window._smartico.api.getMissions();
	 *   for (const cat of sorted) {
	 *     const items = missions.filter(m => m.category_ids.includes(cat.id));
	 *     if (items.length === 0) {
	 *       console.log('[smartico] category has no missions — skip rendering its section header:', cat.name);
	 *       continue;
	 *     }
	 *     console.log(`[smartico] render section "${cat.name}" with ${items.length} mission(s)`);
	 *   }
	 *
	 *   // Uncategorized items: surface in a caller-provided "Other" bucket if needed
	 *   const uncategorized = missions.filter(m => m.category_ids.length === 0);
	 *   if (uncategorized.length > 0) {
	 *     console.log('[smartico] uncategorized missions exist — render a caller-provided "Other" section; server does NOT return id:-1:', uncategorized.length);
	 *   }
	 * }
	 *
	 * // Visitor mode — same shape, language driven by vapi(lang) argument
	 * const visitorCats = await window._smartico.vapi('DE').getAchCategories();
	 * console.log('[smartico] visitor-mode categories (names translated to DE):', visitorCats);
	 * ```
	 */
	public async getAchCategories(): Promise<TAchCategory[]> {
		return OCache.use(
			onUpdateContextKey.AchCategories,
			ECacheContext.WSAPI,
			() => this.api.achGetCategoriesT(this.userExtId),
			CACHE_DATA_SEC,
		);
	}

	/**
	 * Opt the current user in to a mission. The mission must have
	 * `is_requires_optin: true` (from `getMissions()`) and must not already
	 * be opted-in or locked. After a successful opt-in, the user's task
	 * progress starts counting toward this mission — events fired BEFORE
	 * opt-in do not count retroactively (except `UNLOCK_ACHIEVEMENT` tasks,
	 * which are exempt and can fire pre-opt-in).
	 *
	 * @remarks
	 * **Preconditions**
	 * Only call when the mission has `is_requires_optin === true`,
	 * `is_opted_in === false`, and `is_locked === false`. Calling on a
	 * mission that does not require opt-in is wasted; calling twice returns
	 * `40010`.
	 *
	 * **Error codes** (in `err_code`)
	 * - `0` — success; task progress counting begins
	 * - `105` — wrong mission id (different label) OR visibility conditions
	 *   not met. Same code covers both; use `err_message` to disambiguate.
	 * - `40010` — already opted-in. Safe to treat as "no-op success"; usually
	 *   means local mission state was stale (e.g. user opted in from another
	 *   session/tab).
	 * - `40013` — mission not opt-in-able: missing `requires_optin`, in
	 *   DRAFT/ARCHIVED state, or outside its `active_from_ts` /
	 *   `active_till_ts` window.
	 * - `40014` — mission is locked; user has unlock-tasks remaining.
	 *   Surface the mission's `unlock_mission_description` to guide them.
	 * - other non-zero — generic server error. Surface `err_message` if any.
	 *
	 * **Time-limited missions**
	 * For missions with `time_limit_ms > 0`, the countdown begins at opt-in
	 * time, not at mission creation. Server records expiration as
	 * `optin_date + time_limit_ms`.
	 *
	 * **Refresh after success**
	 * The SDK refreshes its mission cache automatically on opt-in response;
	 * any `onUpdate` callback passed to a prior `getMissions({ onUpdate })`
	 * fires with the new state shortly after. No manual re-fetch needed.
	 *
	 * **Idempotency**: not idempotent. A second call returns `40010`. Guard
	 * the call site against double-clicks.
	 *
	 * **Side effects**: does NOT award points / badges / levels directly.
	 * Rewards come from task completion, which is itself gated on opt-in.
	 * May affect visibility of other missions whose visibility conditions
	 * depend on this opt-in.
	 *
	 * **UI guidance**: see [UI Guide — `requestMissionOptIn`](../../docs/ui/missions/UIGuide_requestMissionOptIn.md).
	 *
	 * **Visitor mode: not supported**
	 *
	 * @param mission_id  The mission `id` (from `getMissions()`)
	 * @returns `{ err_code, err_message }`; success when `err_code === 0`
	 *
	 * @example
	 * ```ts
	 * const missions = await window._smartico.api.getMissions({
	 *   onUpdate: (m) => console.log('[smartico] mission list updated — re-render mission UI from this new array', m),
	 * });
	 * const mission = missions.find(m => m.id === missionId);
	 *
	 * if (!mission || !mission.is_requires_optin || mission.is_opted_in || mission.is_locked) {
	 *   console.log('[smartico] opt-in not applicable — keep UI as-is');
	 *   return;
	 * }
	 *
	 * console.log('[smartico] opt-in starting — show loading spinner on opt-in button and disable it to prevent double-clicks');
	 * const r = await window._smartico.api.requestMissionOptIn(mission.id);
	 * console.log('[smartico] opt-in response received — clear loading spinner');
	 *
	 * if (r.err_code === 0 || r.err_code === 40010) {
	 *   console.log('[smartico] opt-in succeeded (or was already done) — onUpdate above will fire with refreshed mission state; no manual re-fetch needed');
	 * } else if (r.err_code === 40014) {
	 *   console.error('[smartico] mission is locked — surface the unlock description as guidance:', mission.unlock_mission_description);
	 * } else {
	 *   console.error('[smartico] opt-in failed — show an error toast with this message to the user:', r.err_message);
	 * }
	 * ```
	 */
	public async requestMissionOptIn(mission_id: number): Promise<TMissionOptInResult> {
		const r = await this.api.missionOptIn(this.userExtId, mission_id);

		const o: TMissionOptInResult = {
			err_code: r.errCode,
			err_message: r.errMsg,
		};

		return o;
	}

	/**
	 * Claim the prize for a completed mission. This is the step that runs
	 * AFTER `requestMissionOptIn()` (when applicable) and AFTER the user has
	 * completed all of the mission's tasks. Only call when the mission has
	 * `requires_prize_claim === true`, `is_completed === true`, and the prize
	 * has not already been claimed.
	 *
	 * The points / bonuses / badge grants associated with the mission are
	 * awarded server-side synchronously inside this call (before the response
	 * is returned), so a successful response (`err_code === 0`) means the
	 * reward has already landed in the user's account.
	 *
	 * @remarks
	 * **Preconditions**
	 * Only call when, on the mission object from `getMissions()`:
	 * - `is_completed === true`
	 * - `requires_prize_claim === true`
	 * - `prize_claimed_date_ts == null` (i.e. not already claimed)
	 * - `prize_claim_expiration_date` is `null` OR still in the future
	 *
	 * The `ach_completed_id` argument must be passed straight from the same
	 * mission object (`mission.ach_completed_id`). It is a server-side primary
	 * key identifying the specific completion row; the SDK consumer should
	 * never synthesise or cache it across sessions — always re-read it from a
	 * fresh `getMissions()` result.
	 *
	 * **Error codes** (in `err_code`)
	 * - `0` — success; the prize was claimed and rewards have been credited.
	 * - `1` — generic server error. Covers several distinct underlying
	 *   conditions, all collapsed into the same code: stale or wrong
	 *   `ach_completed_id` (does not match user / mission), the mission no
	 *   longer requiring a prize claim, the mission being archived/draft,
	 *   label mismatch, or the completion being too old (server enforces a
	 *   freshness window of several months). Recovery: re-fetch missions
	 *   with `getMissions()`; if the mission still appears claimable,
	 *   surface a generic error.
	 * - `40015` — claim window expired (`prize_claim_expiration_date` has
	 *   passed). Show a "claim period ended" message; do not retry.
	 * - `40016` — mission is not completed yet. Indicates a race or a stale
	 *   local cache. Re-fetch via `getMissions()`; if `is_completed` is still
	 *   false, the UI should hide the claim button.
	 * - `40017` — prize already claimed. Treat as idempotent success: refresh
	 *   the mission list (auto-refresh will fire) and hide the claim button.
	 *   Usually means another tab/session already claimed it.
	 * - other non-zero — generic server error. Surface `err_message` if any.
	 *
	 * **Recurring missions**
	 * The server transparently handles both one-shot and recurring mission
	 * completions. The SDK consumer passes a single `ach_completed_id`
	 * regardless of mission type; the server resolves the correct completion.
	 *
	 * **Refresh after success**
	 * On any claim response (success OR failure), the SDK automatically
	 * re-fetches the mission list and fires any `onUpdate` callback
	 * registered via `getMissions({ onUpdate })`. No manual re-fetch needed.
	 * Note: points balance, badges, and level state arrive through their
	 * own push channels — subscribe to them separately if your UI shows
	 * those values.
	 *
	 * **Idempotency**: not idempotent at the row level. A second call on the
	 * same `ach_completed_id` returns `40017` (already claimed). For a stale
	 * `ach_completed_id` the second call returns `1`. Guard the call site
	 * against double-clicks; the SDK does not enforce its own in-flight lock.
	 *
	 * **Side effects** (consumer-observable effects of a successful claim):
	 * - Points credited to the user's balance.
	 * - CRM-rule activities executed (may grant bonuses, badges; may unlock
	 *   follow-up missions, which arrive as a later mission auto-refresh).
	 * - Analytics / automation events fired downstream; not directly observable
	 *   in the response, but visible via the mission auto-refresh and any
	 *   subsequent bonus / badge updates.
	 *
	 * **UI guidance**: see [UI Guide — `requestMissionClaimReward`](../../docs/ui/missions/UIGuide_requestMissionClaimReward.md).
	 *
	 * @param mission_id        The mission `ach_id` (from `getMissions()`).
	 * @param ach_completed_id  The completion-row identifier, read from
	 *                          `mission.ach_completed_id` on the same mission
	 *                          object fetched via `getMissions()`. Never
	 *                          fabricate or cache across sessions.
	 * @returns `{ err_code, err_message }`; success when `err_code === 0`
	 *          (or `40017` when treated as idempotent no-op).
	 *
	 * @example
	 * ```ts
	 * const missions = await window._smartico.api.getMissions({
	 *   onUpdate: (m) => console.log('[smartico] mission list updated — re-render mission UI from this new array', m),
	 * });
	 * const mission = missions.find(m => m.ach_id === missionId);
	 *
	 * if (
	 *   !mission ||
	 *   !mission.is_completed ||
	 *   !mission.requires_prize_claim ||
	 *   mission.prize_claimed_date_ts ||
	 *   (mission.prize_claim_expiration_date && Date.now() >= mission.prize_claim_expiration_date)
	 * ) {
	 *   console.log('[smartico] claim not applicable — keep claim button hidden');
	 *   return;
	 * }
	 *
	 * console.log('[smartico] claim starting — show loading spinner on claim button and disable it to prevent double-clicks');
	 * const r = await window._smartico.api.requestMissionClaimReward(mission.ach_id, mission.ach_completed_id);
	 * console.log('[smartico] claim response received — clear loading spinner');
	 *
	 * if (r.err_code === 0 || r.err_code === 40017) {
	 *   console.log('[smartico] claim succeeded (or was already claimed) — points/bonuses are credited; mission list auto-refresh will fire via the onUpdate above; hide the claim button');
	 * } else if (r.err_code === 40015) {
	 *   console.error('[smartico] claim window expired — show a "claim period ended" message and remove the claim button:', mission.prize_claim_expiration_date);
	 * } else if (r.err_code === 40016) {
	 *   console.error('[smartico] mission reported as not completed by server — local state was stale; auto-refresh will reconcile, do not retry');
	 * } else {
	 *   console.error('[smartico] claim failed — show an error toast with this message to the user (and re-fetch missions to recover from a stale ach_completed_id):', r.err_message);
	 * }
	 * ```
	 */
	public async requestMissionClaimReward(mission_id: number, ach_completed_id: number): Promise<TMissionClaimRewardResult> {
		const r = await this.api.missionClaimPrize(this.userExtId, mission_id, ach_completed_id);

		const o: TMissionClaimRewardResult = {
			err_code: r.errCode,
			err_message: r.errMsg,
		};

		return o;
	}

	protected async updateMissions() {
		const payload = await this.api.missionsGetItemsT(this.userExtId);
		this.updateEntity(onUpdateContextKey.Missions, payload);
	}
}
