import { ECacheContext, OCache } from '../OCache';
import {
	TRaffle,
	TRaffleDraw,
	TRaffleDrawRun,
	TransformedRaffleClaimPrizeResponse,
	TRaffleOptinResponse,
} from './WSAPITypes';
import {
	drawRunHistoryTransform,
	raffleClaimPrizeResponseTransform,
	GetRaffleWonPrizesResponse,
} from '../Raffle';
import {
	CACHE_DATA_SEC,
	onUpdateContextKey,
} from './WSAPIBase';
import { WSAPIJackpots } from './WSAPIJackpots';

/** @group Raffles */
export class WSAPIRaffles extends WSAPIJackpots {
	protected async updateRaffles() {
		const payload = await this.api.getRafflesT(this.userExtId);
		this.updateEntity(onUpdateContextKey.Raffles, payload);
	}

	/**
	 * Returns all raffles visible to the current user, each carrying an
	 * embedded `draws[]` array with per-draw state (current state, ticket
	 * counts, opt-in status, prize structure). Use this to power a
	 * raffles lobby screen and to drive per-draw CTAs (opt-in, view
	 * winners, claim).
	 *
	 * The embedded `draws[i]` objects are sufficient for rendering all
	 * draw cards — winner details with usernames / avatars require a
	 * follow-up {@link getRaffleDrawRun} call (the embedded form carries
	 * only `winners_total` / `winners_limit` / `winners_offset` metadata,
	 * not individual winner rows).
	 *
	 * @remarks
	 * **Subscription model (`onUpdate`)**
	 * The callback receives the FULL refreshed raffle list (never a
	 * diff/patch). Each subsequent call to `getRaffles({ onUpdate })`
	 * REPLACES the prior callback. Pass `onUpdate: undefined` (or omit
	 * it) to keep the prior callback in place; the callback is never
	 * auto-cleared.
	 *
	 * **Update triggers** — the callback fires when:
	 *
	 * 1. {@link claimRafflePrize} resolves on this connection (any
	 *    response code) — the refreshed list reflects the new
	 *    `has_unclaimed_prize` / `claimed_date` state.
	 * 2. {@link requestRaffleOptin} resolves on this connection (any
	 *    response code) — the refreshed list reflects the new
	 *    `user_opted_in` state on the affected draw.
	 *
	 * Does NOT fire for: server-side draw executions, ticket increments
	 * (other users earning tickets), or operator-side raffle/draw config
	 * changes. Those changes surface only on the next cache miss (after
	 * the 30 s TTL) — poll manually if your UI needs sub-30s freshness
	 * during an in-progress draw.
	 *
	 * **Reading state from the returned raffle**
	 * - `current_tickets_count` vs `max_tickets_count` drives the
	 *   `ticket_cap_visualization` banner (enum
	 *   {@link RaffleTicketCapVisualization}: `Empty` = no banner,
	 *   `Counter` = show "X tickets remaining", `Message` = show
	 *   sold-out message).
	 * - Within each draw, `current_state`
	 *   ({@link RaffleDrawInstanceState}) buckets the draw into Open
	 *   (accepting tickets), WinnerSelection (currently drawing), or
	 *   Executed (winners selected).
	 * - `execution_type` ({@link RaffleDrawTypeExecution}) distinguishes
	 *   one-shot (`ExecDate`), repeating (`Recurring`), or special
	 *   one-shot (`Grand`) draws. Recurring draws share a stable
	 *   `draws[i].id` (the schedule definition) across runs — `run_id`
	 *   is the per-execution instance.
	 *
	 * **Cache TTL**: the SDK caches the response for 30 seconds. Cache
	 * is fully cleared on login / logout. The server also invalidates
	 * the SDK cache when a draw executes on the server side.
	 *
	 * **Idempotency / Side effects**: safe. Read-only.
	 *
	 * **UI guidance**: see [UI Guide — `getRaffles`](../../docs/ui/raffles/UIGuide_getRaffles.md).
	 *
	 * **Visitor mode**: supported. The same shape is returned, scoped
	 * to the brand's public raffles. Per-user fields (`my_tickets_count`,
	 * `my_last_tickets`, `user_opted_in`) are not meaningful for
	 * visitors. The `onUpdate` callback is accepted but never fires
	 * because the mutation methods that trigger it
	 * ({@link claimRafflePrize}, {@link requestRaffleOptin}) are not
	 * available / not effective in visitor mode.
	 *
	 * @param params              Optional. Omit to fetch without subscribing.
	 * @param params.onUpdate     Callback invoked with the full refreshed
	 *                            raffles list after every
	 *                            {@link claimRafflePrize} or
	 *                            {@link requestRaffleOptin} round-trip
	 *                            on this connection.
	 * @returns                   Promise resolving to the raffles list.
	 *
	 * @example
	 * ```ts
	 * const raffles = await window._smartico.api.getRaffles({
	 *   onUpdate: (refreshed) => {
	 *     console.log('[smartico] raffles refreshed (after claim/optin) — re-render from this array:', refreshed);
	 *   },
	 * });
	 *
	 * for (const raffle of raffles) {
	 *   console.log('[smartico] render raffle', raffle.id, '—', raffle.name, ':', raffle.draws.length, 'draws');
	 *
	 *   // Bucket draws: active/upcoming first (sorted by execution_ts ASC), then executed last.
	 *   const sorted = [...raffle.draws].sort((a, b) => {
	 *     const aDone = a.current_state === 3;  // Executed
	 *     const bDone = b.current_state === 3;
	 *     if (aDone !== bDone) return aDone ? 1 : -1;  // executed sink to the bottom
	 *     return a.execution_ts - b.execution_ts;
	 *   });
	 *
	 *   for (const d of sorted) {
	 *     if (d.requires_optin && !d.user_opted_in && d.is_active && d.current_state !== 3) {
	 *       console.log('[smartico] draw', d.run_id, '— show OPT IN CTA (requires_optin + not yet opted in + still active)');
	 *     }
	 *     if (d.current_state === 3) {
	 *       console.log('[smartico] draw', d.run_id, 'executed — fetch winner details via getRaffleDrawRun');
	 *     }
	 *   }
	 * }
	 *
	 * // For winner detail on an executed draw, call getRaffleDrawRun separately.
	 * ```
	 */
	public async getRaffles({ onUpdate }: { onUpdate?: (data: TRaffle[]) => void } = {}): Promise<TRaffle[]> {
		if (onUpdate) {
			this.onUpdateCallback.set(onUpdateContextKey.Raffles, onUpdate);
		}

		return OCache.use(onUpdateContextKey.Raffles, ECacheContext.WSAPI, () => this.api.getRafflesT(this.userExtId), CACHE_DATA_SEC);
	}

	/**
	 * Returns the full detail of a single raffle draw run — same shape
	 * as the embedded `TRaffleDraw` in {@link getRaffles}, but populated
	 * with paginated `prizes[].winners[]` rows including usernames and
	 * avatars. Use this to render a draw detail / winners screen, or to
	 * page through the winner list of an executed draw.
	 *
	 * Each call is a fresh server round-trip — there is no client cache.
	 * Re-call to refresh.
	 *
	 * @remarks
	 * **Preconditions**
	 * Pass `raffle_id` (the parent raffle's `id`) and `run_id` (the
	 * specific run instance — `TRaffleDraw.run_id` from
	 * {@link getRaffles}'s embedded draws). Note that
	 * `TRaffleDraw.id` is the *schedule_id* (stable across runs of a
	 * recurring draw) — that's NOT what this method takes; it takes the
	 * per-instance `run_id`.
	 *
	 * **Refresh model**
	 * - **No subscription.** One-shot promise.
	 * - **No client cache.** Every call sends a network request.
	 * - **No push event** refreshes the response. Live winner-list
	 *   updates require a fresh call.
	 * - The default Smartico UI polls this method on a variable cadence
	 *   while a draw is in flight: every 3 s during `WinnerSelection`,
	 *   every 10 s when the countdown is under 5 minutes, every 30 s
	 *   otherwise.
	 *
	 * **Winner pagination**
	 * `winners_from` / `winners_to` define a half-open range of winner
	 * indices. The default window is `0–20` (20 winners). The server
	 * caps the window at 50 rows per call — passing a larger range
	 * silently truncates. For "load more" pagination, advance
	 * `winners_from` by the prior page size and pass the same
	 * `winners_to` offset. `winners_total` on the returned
	 * `TRaffleDraw` is the authoritative total count for pagination.
	 *
	 * The current user's own winning rows (if any) are server-sorted
	 * to the top of the result.
	 *
	 * **Throws**
	 * Both `raffle_id` and `run_id` are required — the SDK throws
	 * synchronously when either is missing or falsy.
	 *
	 * **Idempotency / Side effects**: safe. Read-only.
	 *
	 * **UI guidance**: see [UI Guide — `getRaffleDrawRun`](../../docs/ui/raffles/UIGuide_getRaffleDrawRun.md).
	 *
	 * **Visitor mode**: supported.
	 *
	 * @param props.raffle_id      The parent raffle's `id` (from `TRaffle.id`).
	 * @param props.run_id         The draw run instance ID (from
	 *                             `TRaffleDraw.run_id`, not `TRaffleDraw.id`).
	 * @param props.winners_from   First winner index to return (0-based).
	 *                             Defaults to `0`.
	 * @param props.winners_to     Last winner index (exclusive).
	 *                             Defaults to `20`. Server caps the
	 *                             window at 50 rows per call.
	 * @returns                    Promise resolving to `TRaffleDraw`
	 *                             with `prizes[].winners[]` populated
	 *                             and `winners_total` set.
	 *
	 * @example
	 * ```ts
	 * const raffles = await window._smartico.api.getRaffles();
	 * const raffle = raffles[0];
	 * const draw = raffle.draws.find(d => d.current_state === 3);  // Executed
	 *
	 * if (!draw) {
	 *   console.log('[smartico] no executed draw — skip detail view');
	 *   return;
	 * }
	 *
	 * // First page of winners.
	 * const detail = await window._smartico.api.getRaffleDrawRun({
	 *   raffle_id: raffle.id,
	 *   run_id: draw.run_id,   // NOTE: run_id, NOT draw.id
	 *   winners_from: 0,
	 *   winners_to: 20,
	 * });
	 *
	 * for (const prize of detail.prizes) {
	 *   console.log('[smartico] prize', prize.name, '— winners on this page:', prize.winners.length);
	 *   const myWin = prize.winners.find(w => w.username === currentUsername);  // or another match
	 *   if (myWin) {
	 *     console.log('[smartico] current user won this prize — surface a Claim CTA if not yet claimed');
	 *   }
	 * }
	 *
	 * // Load more — pagination via winners_from / winners_to.
	 * if ((detail.winners_total ?? 0) > 20) {
	 *   const next = await window._smartico.api.getRaffleDrawRun({
	 *     raffle_id: raffle.id,
	 *     run_id: draw.run_id,
	 *     winners_from: 20,
	 *     winners_to: 40,
	 *   });
	 *   console.log('[smartico] page 2 loaded — append', next.prizes.flatMap(p => p.winners).length, 'winners');
	 * }
	 * ```
	 */
	public async getRaffleDrawRun(props: { raffle_id: number; run_id: number; winners_from?: number; winners_to?: number }): Promise<TRaffleDraw> {
		if (!props.raffle_id || !props.run_id) {
			throw new Error('both raffle_id and run_id are required');
		}

		return await this.api.getRaffleDrawRunT(this.userExtId, props.raffle_id, props.run_id, props.winners_from, props.winners_to);
	}

	/**
	 * Returns the history of past-executed draw runs for a raffle —
	 * optionally scoped to a single recurring draw schedule. Each row
	 * is a previously-executed run with its scheduled and
	 * actual-execution timestamps, the user's win status, and an
	 * unclaimed-prize flag for surfacing a Claim CTA on history rows.
	 *
	 * @remarks
	 * **Preconditions**
	 * `raffle_id` is required. `draw_id` is optional — when omitted,
	 * the response includes history for ALL draws of the raffle; when
	 * supplied, it scopes to that one draw's recurring history. The
	 * `draw_id` to pass is `TRaffleDraw.id` (the schedule_id, stable
	 * across runs), not `run_id`.
	 *
	 * **Server-side filtering**
	 * Draws configured by the operator to hide their history are
	 * excluded from the response automatically. Cancelled runs are
	 * also excluded.
	 *
	 * **Sort order**
	 * Server returns rows by scheduled `execution_ts` descending
	 * (newest first). No client-side sort required.
	 *
	 * **Refresh model**
	 * - **No subscription.** One-shot promise.
	 * - **No client cache.** Every call hits the server.
	 * - **No push event** refreshes the response. Re-call manually to
	 *   pick up newly-executed runs or `has_unclaimed_prize` flips
	 *   after a {@link claimRafflePrize} call.
	 *
	 * **Idempotency / Side effects**: safe. Read-only.
	 *
	 * **UI guidance**: see [UI Guide — `getRaffleDrawRunsHistory`](../../docs/ui/raffles/UIGuide_getRaffleDrawRunsHistory.md).
	 *
	 * **Visitor mode**: supported. The same shape is returned with
	 * `is_winner` and `has_unclaimed_prize` always `false` for visitors.
	 *
	 * @param props.raffle_id  The parent raffle's `id` (from `TRaffle.id`).
	 *                         Required.
	 * @param props.draw_id    Optional — the draw's schedule_id
	 *                         (`TRaffleDraw.id`). When set, scopes the
	 *                         history to that one draw's runs. When
	 *                         omitted, includes all draws of the raffle.
	 * @returns                Promise resolving to a `TRaffleDrawRun[]`
	 *                         ordered newest-first. Empty if no executed
	 *                         runs exist.
	 *
	 * @example
	 * ```ts
	 * const raffles = await window._smartico.api.getRaffles();
	 * const raffle = raffles[0];
	 *
	 * // History across all draws of the raffle.
	 * const allHistory = await window._smartico.api.getRaffleDrawRunsHistory({
	 *   raffle_id: raffle.id,
	 * });
	 *
	 * // Highlight rows where the user has an unclaimed prize.
	 * const unclaimed = allHistory.filter(r => r.has_unclaimed_prize);
	 * if (unclaimed.length > 0) {
	 *   console.log('[smartico] surface a "Claim" CTA on these', unclaimed.length, 'history rows:', unclaimed.map(r => r.run_id));
	 * }
	 *
	 * // Scoped history of one recurring draw (use draw.id, the schedule_id).
	 * const oneDrawHistory = await window._smartico.api.getRaffleDrawRunsHistory({
	 *   raffle_id: raffle.id,
	 *   draw_id: raffle.draws[0].id,   // schedule_id (stable across recurring runs)
	 * });
	 * console.log('[smartico] render history rows for the daily draw — newest first:', oneDrawHistory.length, 'rows');
	 * ```
	 */
	public async getRaffleDrawRunsHistory(props: { raffle_id: number; draw_id?: number }): Promise<TRaffleDrawRun[]> {
		
		const res = await this.api.getRaffleDrawRunsHistory(this.userExtId, props);

		if (!props.raffle_id) {
			throw new Error('raffle_id is required');
		}

		return drawRunHistoryTransform(res);
	}

	/**
	 * Claims a raffle prize the user has won. Call this when the user
	 * has a winning row with `should_claim === true` and an unclaimed
	 * `won_id` (read from a `TRafflePrizeWinner` on a
	 * {@link getRaffleDrawRun} result, or surfaced by `has_unclaimed_prize`
	 * on a {@link getRaffleDrawRunsHistory} row that the consumer drills
	 * into).
	 *
	 * On success (`errorCode === 0`), the server records the claim and
	 * triggers prize delivery through the operator's integration —
	 * delivery is server-side, not part of this response.
	 *
	 * @remarks
	 * **Result shape note**: this method returns
	 * `TransformedRaffleClaimPrizeResponse` with `errorCode` /
	 * `errorMessage` (camelCase full-word) — different from most other
	 * SDK result types which use `err_code` / `err_message` (snake_case
	 * short-word). Branch on the camelCase keys when reading this
	 * method's result.
	 *
	 * **Preconditions**
	 * Pass a `won_id` that identifies an unclaimed winning row for the
	 * current user. The `won_id` comes from
	 * `TRafflePrizeWinner.raf_won_id` returned by
	 * {@link getRaffleDrawRun}.
	 *
	 * **Error codes** (in `errorCode`)
	 * - `0` — success; the claim is recorded and prize delivery is
	 *   queued server-side.
	 * - `1` — generic claim failure. The `errorMessage` distinguishes
	 *   the specific cause (the server uses one error code for several
	 *   distinct conditions): the prize has already been claimed, the
	 *   `won_id` doesn't match a winning row for this user, or the user
	 *   is in a control group for this raffle. Treat `1` as a retryable
	 *   error if the message suggests a transient condition; treat as
	 *   idempotent success if the message indicates already-claimed
	 *   (the underlying state is what the consumer wants either way —
	 *   the prize is claimed).
	 * - other non-zero — generic server error. Surface `errorMessage`
	 *   if any.
	 *
	 * **Claim window**
	 * There is no server-enforced claim deadline. Won prizes remain
	 * claimable indefinitely until the operator archives them.
	 *
	 * **Idempotency**: NOT idempotent. A second call on the same
	 * `won_id` returns `errorCode === 1` with `errorMessage` indicating
	 * the prize has already been claimed. The SDK does NOT enforce an
	 * in-flight lock. Guard the call site against double-clicks (set
	 * a local "claiming" flag on click, clear it on response).
	 *
	 * **Refresh after success (and after failure)**
	 * The SDK automatically refreshes the raffles cache on every
	 * response — both success and failure paths fire the `onUpdate`
	 * callback registered via {@link getRaffles}. After `errorCode === 0`,
	 * the affected `TRaffleDrawRun.has_unclaimed_prize` (in history)
	 * and the winner row's `claimed_date` reflect the claim on the next
	 * refresh.
	 *
	 * **Side effects** (on `errorCode === 0`)
	 * - The winner row's `claimed_date` is set server-side.
	 * - Prize delivery is queued for the operator's integration to
	 *   process. Balance / bonus / inbox updates that result from the
	 *   delivery arrive through their own channels — not in this
	 *   response.
	 *
	 * **Throws**
	 * `won_id` is required — the SDK throws synchronously when missing
	 * or falsy.
	 *
	 * **UI guidance**: see [UI Guide — `claimRafflePrize`](../../docs/ui/raffles/UIGuide_claimRafflePrize.md).
	 *
	 * **Visitor mode**: not meaningfully supported. The SDK does not
	 * block the call, but visitor sessions have no win history and the
	 * server will reject it.
	 *
	 * @param props.won_id  The winning row's `raf_won_id` (from
	 *                      `TRafflePrizeWinner` returned by
	 *                      {@link getRaffleDrawRun}).
	 * @returns `{ errorCode, errorMessage? }`; success when
	 *          `errorCode === 0`. Note camelCase keys (see "Result
	 *          shape note" above).
	 *
	 * @example
	 * ```ts
	 * const detail = await window._smartico.api.getRaffleDrawRun({
	 *   raffle_id: raffleId,
	 *   run_id: runId,
	 * });
	 * const myWin = detail.prizes.flatMap(p => p.winners).find(w => /* user match here *\/ true);
	 *
	 * if (!myWin || !myWin.raf_won_id || myWin.claimed_date) {
	 *   console.log('[smartico] nothing to claim — keep CTA hidden');
	 *   return;
	 * }
	 *
	 * console.log('[smartico] claim starting — set in-flight flag, show loading dots on the Claim button, keep the modal open');
	 * const r = await window._smartico.api.claimRafflePrize({ won_id: myWin.raf_won_id });
	 * console.log('[smartico] claim response received — clear in-flight flag');
	 *
	 * if (r.errorCode === 0) {
	 *   console.log('[smartico] claim succeeded — show a success toast; getRaffles onUpdate above will fire with refreshed state; prize delivery happens server-side');
	 * } else if (r.errorCode === 1 && r.errorMessage?.toLowerCase().includes('already claimed')) {
	 *   console.log('[smartico] prize was already claimed (perhaps from another tab) — treat as success, hide the Claim CTA');
	 * } else {
	 *   console.error('[smartico] claim failed — surface this error message to the user and allow retry:', r.errorMessage);
	 * }
	 * ```
	 */
	public async claimRafflePrize(props: { won_id: number }): Promise<TransformedRaffleClaimPrizeResponse> {
		if (!props.won_id) {
			throw new Error('won_id is required');
		}

		const res = await this.api.claimRafflePrize(this.userExtId, { won_id: props.won_id });
		return raffleClaimPrizeResponseTransform(res);
	}

	/**
	 * Opts the current user into a specific raffle draw run. Required
	 * for draws where `TRaffleDraw.requires_optin === true` — without
	 * opt-in, the user's tickets do NOT participate in that run, even
	 * if they hold tickets for the raffle.
	 *
	 * Opt-in is per-run: a recurring draw's next run requires a fresh
	 * opt-in. The user's `TRaffleDraw.user_opted_in` flag reflects the
	 * current state for the current run only.
	 *
	 * @remarks
	 * **Preconditions**
	 * Read the candidate draw from {@link getRaffles}'s embedded
	 * `draws[]` and gate the call on
	 * `requires_optin === true && !user_opted_in && is_active &&
	 * current_state !== Executed`. Calling without these guards may
	 * return a non-zero `err_code`.
	 *
	 * **Argument mapping** — the three IDs come from different fields:
	 * - `raffle_id` — the parent raffle's `TRaffle.id`
	 * - `draw_id` — `TRaffleDraw.id` (schedule_id, stable across runs)
	 * - `raffle_run_id` — `TRaffleDraw.run_id` (instance ID for this
	 *   specific run)
	 *
	 * **Error codes** (in `err_code`)
	 * - `0` — success; the user is opted into this run. Tickets
	 *   collected after the run's `ticket_start_ts` will participate.
	 * - `1` — generic opt-in failure. The `err_message` distinguishes
	 *   the specific cause: the draw doesn't require opt-in
	 *   (`requires_optin === false`), `raffle_id` doesn't match the
	 *   `draw_id`, the user is already opted in (or the draw has
	 *   completed), or the user is in a control group for this raffle.
	 * - other non-zero — generic server error. Surface `err_message`.
	 *
	 * **Idempotency**: NOT idempotent. A second call on the same
	 * `raffle_run_id` returns `err_code === 1` with `err_message`
	 * indicating the user is already opted in. Treat as success in
	 * the UI — the underlying state is what the consumer wants.
	 * Guard the call site against double-clicks.
	 *
	 * **Refresh after success (and after failure)**
	 * The SDK automatically refreshes the raffles cache on every
	 * response and fires the `onUpdate` callback registered via
	 * {@link getRaffles}. After `err_code === 0`, the affected draw's
	 * `user_opted_in` flips to `true` on the refreshed list.
	 *
	 * **Side effects** (on `err_code === 0`)
	 * - The user is registered for this run. Tickets earned within
	 *   the run's eligibility window will participate in the draw.
	 * - No balance change. No CRM-side rewards. Opt-in is a metadata
	 *   operation only.
	 *
	 * **Throws**
	 * `raffle_id`, `draw_id`, and `raffle_run_id` are all required —
	 * the SDK throws synchronously when any is missing or falsy.
	 *
	 * **UI guidance**: see [UI Guide — `requestRaffleOptin`](../../docs/ui/raffles/UIGuide_requestRaffleOptin.md).
	 *
	 * **Visitor mode**: not supported.
	 *
	 * @param props.raffle_id      The parent raffle's `id`.
	 * @param props.draw_id        The draw's schedule_id (`TRaffleDraw.id`).
	 * @param props.raffle_run_id  The run instance ID (`TRaffleDraw.run_id`).
	 * @returns                    `{ err_code, err_message? }`; success
	 *                             when `err_code === 0` (treat
	 *                             "already opted in" as idempotent
	 *                             success).
	 *
	 * @example
	 * ```ts
	 * const raffles = await window._smartico.api.getRaffles({
	 *   onUpdate: (refreshed) => console.log('[smartico] raffles refreshed — re-render', refreshed),
	 * });
	 * const raffle = raffles[0];
	 * const draw = raffle.draws.find(d =>
	 *   d.requires_optin && !d.user_opted_in && d.is_active && d.current_state !== 3
	 * );
	 *
	 * if (!draw) {
	 *   console.log('[smartico] no opt-in-required draw available — keep CTA hidden');
	 *   return;
	 * }
	 *
	 * console.log('[smartico] opt-in starting — set in-flight flag, show loading dots on the Opt-in button');
	 * const r = await window._smartico.api.requestRaffleOptin({
	 *   raffle_id: raffle.id,
	 *   draw_id: draw.id,        // schedule_id, NOT run_id
	 *   raffle_run_id: draw.run_id,
	 * });
	 * console.log('[smartico] opt-in response received — clear in-flight flag');
	 *
	 * if (r.err_code === 0) {
	 *   console.log('[smartico] opted in successfully — show "Fully opted in" state on the draw card; onUpdate above will fire with user_opted_in: true');
	 * } else if (r.err_code === 1 && r.err_message?.toLowerCase().includes('already opted in')) {
	 *   console.log('[smartico] already opted in (perhaps from another tab) — treat as success, show "Fully opted in"');
	 * } else {
	 *   console.error('[smartico] opt-in failed — surface this error to the user:', r.err_message);
	 * }
	 * ```
	 */
	public async requestRaffleOptin(props: { raffle_id: number; draw_id: number; raffle_run_id: number }): Promise<TRaffleOptinResponse> {
		if (!props.raffle_id) {
			throw new Error('raffle_id is required');
		}
		if (!props.draw_id) {
			throw new Error('draw_id is required');
		}
		if (!props.raffle_run_id) {
			throw new Error('raffle_run_id is required');
		}

		const r = await this.api.raffleOptin(this.userExtId, props);

		return {
			err_code: r.errCode,
			err_message: r.errMsg,
		};
	}

	/**
	 * Returns every prize the current user has won within a single raffle —
	 * across ALL of that raffle's draws, newest-won first — in one paginated
	 * call. Use this to power a "my prizes" screen for a raffle (prize name,
	 * prize image, the user's name/avatar) without walking
	 * {@link getRaffleDrawRunsHistory} and then paging
	 * {@link getRaffleDrawRun}'s per-draw winner lists.
	 *
	 * Each row carries its own `raf_won_id`, which IS the `won_id` to pass to
	 * {@link claimRafflePrize}: a row with `requires_claim === true` and no
	 * `claimed_date` is directly claimable.
	 *
	 * @remarks
	 * **Authentication required**
	 * Works only for an identified (logged-in) user. Visitor / anonymous
	 * sessions are rejected — call this only after identify.
	 *
	 * **Preconditions**
	 * `raffle_id` is required — the SDK throws synchronously when it is
	 * missing or falsy.
	 *
	 * **Coverage & sort order**
	 * Includes the user's wins from every draw of the raffle — recurring,
	 * one-shot, and grand draws, across all historical runs. Rows are ordered
	 * newest-win first; there is no "unclaimed first" ordering, so sort
	 * client-side if you want claimable prizes at the top.
	 *
	 * **Pagination**
	 * `offset` / `limit` page the `won_prizes[]` rows (the SDK defaults to
	 * `0` / `20`). `total` is the authoritative full count of the user's wins
	 * for this raffle across all draws — drive "load more" from it
	 * (`offset + won_prizes.length < total`). An `offset` past the end returns
	 * an empty `won_prizes[]` with the real `total` and `errCode 0` — not an
	 * error. The server does NOT clamp `limit`, so always pass an explicit,
	 * sane page size.
	 *
	 * **Rate limit**
	 * The server caps this at roughly 30 calls per minute with a ~5-second
	 * minimum gap between calls. Fetch on screen open and on explicit "load
	 * more" — don't poll it on a timer.
	 *
	 * **Error codes** (in `errCode`)
	 * - `0` — success. Also returned with an empty `won_prizes[]` and
	 *   `total 0` when the user has no wins, or is not eligible to see this
	 *   raffle.
	 * - `1` — generic server error; surface `errMsg` if present.
	 *
	 * There are no granular codes — an unknown raffle, an ineligible user,
	 * and "no wins" all surface as `errCode 0` with an empty list.
	 *
	 * **Reading the result**
	 * - Null-check `user` before reading it — it is `null` whenever
	 *   `won_prizes` is empty.
	 * - For the avatar, use `user.avatar_id` (already a full URL for a system
	 *   avatar, otherwise an avatar token to resolve against the widget's
	 *   avatar domain); `user.avatar_url` is always `null`.
	 * - Render `public_username` as-is (it is server-masked for privacy, e.g.
	 *   `"32:r*****"`) and substitute a "You" label for the current user.
	 * - Treat `claimed_date` as the claim flag: `null` until claimed, then
	 *   epoch ms.
	 *
	 * **Idempotency / Side effects**: safe and read-only — one-shot promise,
	 * no client cache, no subscription. The server caches the response
	 * briefly; a successful {@link claimRafflePrize} invalidates that cache,
	 * so a follow-up call reflects the new `claimed_date`. This method does
	 * NOT refresh the {@link getRaffles} list or fire its `onUpdate` — re-call
	 * manually to pick up newly-won prizes or a `claimed_date` flip.
	 *
	 * **UI guidance**: see [UI Guide — `getRaffleWonPrizes`](../../docs/ui/raffles/UIGuide_getRaffleWonPrizes.md).
	 *
	 * **Visitor mode**: not supported (see "Authentication required").
	 *
	 * @param props.raffle_id  The parent raffle's `id` (from `TRaffle.id`). Required.
	 * @param props.offset     Zero-based index of the first row to return. Defaults to `0`.
	 * @param props.limit      Page size. Defaults to `20`.
	 * @returns                Promise resolving to {@link GetRaffleWonPrizesResponse}
	 *                         (`user`, this page of `won_prizes`, and `total`;
	 *                         `errCode 0` on success).
	 *
	 * @example
	 * ```ts
	 * const raffles = await window._smartico.api.getRaffles();
	 * const raffle = raffles[0];
	 *
	 * // First page of the user's won prizes for this raffle.
	 * const page = await window._smartico.api.getRaffleWonPrizes({
	 *   raffle_id: raffle.id,
	 *   offset: 0,
	 *   limit: 20,
	 * });
	 *
	 * if (page.errCode !== 0) {
	 *   console.error('[smartico] could not load won prizes — show a retry state:', page.errMsg);
	 *   return;
	 * }
	 * if (page.won_prizes.length === 0) {
	 *   console.log('[smartico] no wins in this raffle (or not eligible) — render the empty state');
	 *   return;
	 * }
	 *
	 * console.log('[smartico]', page.user?.public_username, 'won', page.total, 'prizes total');
	 * for (const prize of page.won_prizes) {
	 *   console.log('[smartico] render prize card —', prize.public_meta.name, prize.public_meta.image_url);
	 *   if (prize.requires_claim && !prize.claimed_date) {
	 *     console.log('[smartico] show a Claim CTA — on click call claimRafflePrize({ won_id:', prize.raf_won_id, '})');
	 *   }
	 * }
	 *
	 * // Load more.
	 * if (page.offset + page.won_prizes.length < page.total) {
	 *   const next = await window._smartico.api.getRaffleWonPrizes({
	 *     raffle_id: raffle.id,
	 *     offset: page.offset + page.limit,
	 *     limit: 20,
	 *   });
	 *   console.log('[smartico] appended', next.won_prizes.length, 'more prizes');
	 * }
	 * ```
	 */
	public async getRaffleWonPrizes(props: { raffle_id: number; offset?: number; limit?: number }): Promise<GetRaffleWonPrizesResponse> {
		if (!props.raffle_id) {
			throw new Error('raffle_id is required');
		}

		return await this.api.getRaffleWonPrizes(this.userExtId, {
			raffle_id: props.raffle_id,
			offset: props.offset ?? 0,
			limit: props.limit ?? 20,
		});
	}
}
