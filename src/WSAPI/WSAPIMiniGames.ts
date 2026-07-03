import { SAWSpinsCountPush } from '../MiniGames';
import { ECacheContext, OCache } from '../OCache';
import {
	TMiniGamePlayResult,
	TMiniGameTemplate,
	TMiniGamePlayBatchResult,
	TSawHistory,
} from './WSAPITypes';
import {
	CACHE_DATA_SEC,
	onUpdateContextKey,
} from './WSAPIBase';
import { WSAPIRaffles } from './WSAPIRaffles';

/** @group MiniGames */
export class WSAPIMiniGames extends WSAPIRaffles {
	/**
	 * Returns all mini-game templates ("SAW" = Spin And Win — the
	 * umbrella term for wheel-spin, scratch-card, lootbox, gift-box,
	 * treasure-hunt, plinko, coin-flip, quiz, and several other formats)
	 * configured for the label. Optionally subscribes to live updates
	 * via `onUpdate`: the callback fires whenever the user's
	 * `spin_count` changes, jackpot grows, a manual spin is issued, or
	 * a spin response lands.
	 *
	 * The list is NOT filtered by spin availability — every configured
	 * template is returned, including ones the user cannot currently
	 * play. The `visibile_when_can_spin` flag on each template hints
	 * which to hide in a default lobby view (consumer-side filter).
	 *
	 * @remarks
	 * **Subscription model (`onUpdate`)**
	 * The callback receives the FULL refreshed template list (never a
	 * diff/patch). Each subsequent call to `getMiniGames({ onUpdate })`
	 * REPLACES the prior callback. Pass `onUpdate: undefined` (or omit
	 * it) to keep the prior callback in place; the callback is never
	 * auto-cleared.
	 *
	 * **Update triggers** — the callback fires when:
	 *
	 * 1. The server pushes a `spin_count` change (campaign award,
	 *    store purchase, BO manual issuance, mission reward).
	 * 2. Any {@link playMiniGame} or {@link playMiniGameBatch}
	 *    resolves on this connection — the cached array refreshes
	 *    with updated `spin_count`, `jackpot_current`, and any new
	 *    `next_available_spin_ts`.
	 * 3. Acknowledge responses land (via auto-acknowledge or
	 *    {@link miniGameWinAcknowledgeRequest}).
	 *
	 * Jackpot growth is observable on the refreshed `jackpot_current`
	 * field — the SDK inlines the live value into template `name` /
	 * `promo_text` / prize `name` via a `{{jackpot}}` template
	 * substitution at fetch time.
	 *
	 * **Game-type variants**
	 * All twelve `SAWGameType` values (`SpinAWheel`, `ScratchCard`,
	 * `MatchX`, `GiftBox`, `PrizeDrop`, `Quiz`, `LootboxWeekdays`,
	 * `LootboxCalendarDays`, `TreasureHunt`, `Voyager`, `Plinko`,
	 * `CoinFlip`) surface through the same template shape. Most are
	 * played via {@link playMiniGame}; the exceptions are:
	 * - `PrizeDrop` — server-push only; the consumer does NOT call
	 *   `playMiniGame`. Prizes arrive via the prize-drop push channel.
	 * - `MatchX` / `Quiz` — predictions are submitted via a separate
	 *   games server (not this SDK); the SAW spin is fired
	 *   server-internally to deduct the buy-in.
	 *
	 * **Per-prize statistics (`expose_game_stat_on_api`)**
	 * Each template's `prizes` array always carries the definition
	 * fields — name, icon, `prize_type`, `prize_value`, acknowledge
	 * configuration. The stock-statistics fields are gated by an
	 * operator template setting, surfaced as
	 * `expose_game_stat_on_api`:
	 * - Populated when enabled: `pool` (remaining stock),
	 *   `wins_count` (total wins across all players), `weekdays`
	 *   (ISO 1–7 days the prize can be won), `active_from_ts` /
	 *   `active_till_ts` (prize availability window).
	 * - Omitted when disabled (the default) — this keeps the live
	 *   prize economy (stock levels, win rates, schedules) hidden
	 *   from players.
	 * - Exception: `pool` is always populated for `MatchX` / `Quiz`
	 *   templates, whose game flow needs the remaining stock.
	 * - `pool_initial` is populated regardless of the setting.
	 * When enabled, the values are also kept current — the server
	 * refreshes the prize rows on each fetch and drops its template
	 * caches after every play, so `pool` / `wins_count` are safe to
	 * drive an "X prizes left" scarcity UI.
	 *
	 * **Cache TTL**: the SDK caches the response for 30 seconds. Cache
	 * is fully cleared on login / logout.
	 *
	 * **Idempotency / Side effects**: safe. Read-only.
	 *
	 * **UI guidance**: see [UI Guide — `getMiniGames`](../../docs/ui/minigames/UIGuide_getMiniGames.md).
	 *
	 * **Visitor mode**: supported. Only templates configured with
	 * `is_visitor_mode = true` in the BO are returned for anonymous
	 * sessions. Spins from these templates may also be played (visitor
	 * mode is the one mini-game flow that does support play — see
	 * {@link playMiniGame} for the visitor-stop semantics).
	 *
	 * @param params              Optional. Omit to fetch without subscribing.
	 * @param params.onUpdate     Callback invoked with the full refreshed
	 *                            template array after any spin-count
	 *                            change, spin response, or acknowledge
	 *                            response on this connection.
	 * @returns                   Promise resolving to the template
	 *                            array. Empty if no templates are
	 *                            visible to the user.
	 *
	 * @example
	 * ```ts
	 * const games = await window._smartico.api.getMiniGames({
	 *   onUpdate: (refreshed) => {
	 *     console.log('[smartico] mini-game templates refreshed — re-render lobby from this array:', refreshed);
	 *   },
	 * });
	 *
	 * // Filter the lobby view per the visibility flag.
	 * const visible = games.filter(g =>
	 *   !g.visibile_when_can_spin || (g.spin_count && g.spin_count > 0)
	 * );
	 *
	 * for (const g of visible) {
	 *   console.log('[smartico] render game card', g.id, '—', g.name,
	 *     '— type:', g.saw_game_type,
	 *     '— buy-in:', g.saw_buyin_type,
	 *     '— spins available:', g.spin_count ?? 0,
	 *     '— jackpot:', g.jackpot_current, g.jackpot_symbol);
	 * }
	 * ```
	 */
	public async getMiniGames({ onUpdate }: { onUpdate?: (data: TMiniGameTemplate[]) => void } = {}): Promise<
		TMiniGameTemplate[]
	> {
		if (typeof onUpdate === 'function') {
			this.onUpdateCallback.set(onUpdateContextKey.Saw, onUpdate);
		}

		return OCache.use(onUpdateContextKey.Saw, ECacheContext.WSAPI, () => this.api.sawGetTemplatesT(this.userExtId), CACHE_DATA_SEC);
	}

	/**
	 * Returns a paginated, newest-first list of the user's past
	 * mini-game spins — each row carries the won prize ID, the
	 * client-side `request_id` used for the spin, and a
	 * server-recorded `is_claimed` flag (`true` if the spin has been
	 * acknowledged). Optionally filter to a single template via
	 * `saw_template_id`.
	 *
	 * Use this to power a "My prizes" / win-history surface, or to
	 * recover unacknowledged spins (rows with `is_claimed === false`
	 * carry a `client_request_id` you can pass to
	 * {@link miniGameWinAcknowledgeRequest}).
	 *
	 * @remarks
	 * **Pagination**
	 * `limit` defaults to 20, `offset` defaults to 0. Sort order is
	 * `create_date` DESC (newest first) — no client-side re-sort
	 * required. For "load more" pagination, advance `offset` by the
	 * page size on each subsequent call.
	 *
	 * The underlying protocol carries a `hasMore` boolean on the
	 * response, but the SDK strips it from the public surface —
	 * detect end of list when the returned array length is less than
	 * `limit`.
	 *
	 * **`is_claimed` semantics**
	 * Maps directly to the server's "acknowledge_date is non-null"
	 * state. A spin where the auto-acknowledge fire-and-forget
	 * succeeded shows `is_claimed: true`; a spin where the
	 * acknowledge was lost (network drop) or where the user is on an
	 * explicit-acknowledge flow shows `is_claimed: false` with a
	 * usable `client_request_id`. A server-side fallback job
	 * auto-acknowledges stale rows every ~60 seconds — so even
	 * "lost" prizes are eventually delivered without consumer action.
	 *
	 * **Cache TTL**: the SDK caches the response for 30 seconds.
	 * Cache is invalidated implicitly when a new spin or acknowledge
	 * response lands.
	 *
	 * **Idempotency / Side effects**: safe. Read-only.
	 *
	 * **UI guidance**: see [UI Guide — `getMiniGamesHistory`](../../docs/ui/minigames/UIGuide_getMiniGamesHistory.md).
	 *
	 * **Visitor mode**: not supported.
	 *
	 * @param params                  Optional pagination + filter bag.
	 * @param params.limit            Page size. Defaults to 20.
	 * @param params.offset           Number of rows to skip. Defaults to 0.
	 * @param params.saw_template_id  When set, scopes the history to
	 *                                a single template's spins.
	 *
	 * @returns Promise resolving to `TSawHistory[]` in newest-first
	 *          order. Empty when the user has no history.
	 *
	 * @example
	 * ```ts
	 * const history = await window._smartico.api.getMiniGamesHistory({ limit: 20 });
	 *
	 * // Show unacknowledged spins with a Claim CTA.
	 * const unacknowledged = history.filter(h => !h.is_claimed);
	 * console.log('[smartico] surface a "Claim" CTA on these', unacknowledged.length, 'history rows:',
	 *   unacknowledged.map(h => h.client_request_id));
	 *
	 * // Load-more pagination — advance offset by the prior page size.
	 * const page2 = await window._smartico.api.getMiniGamesHistory({ limit: 20, offset: 20 });
	 * console.log('[smartico] page 2 loaded —', page2.length, 'more rows;',
	 *   page2.length < 20 ? 'end of list reached, hide "Load more"' : 'keep "Load more" visible');
	 * ```
	 */

	public async getMiniGamesHistory({
		limit,
		offset,
		saw_template_id,
	}: {
		limit?: number;
		offset?: number;
		saw_template_id?: number;
	}): Promise<TSawHistory[]> {
		return OCache.use(
			`${onUpdateContextKey.SAWHistory}:${saw_template_id ?? ''}:${limit ?? ''}:${offset ?? ''}`,
			ECacheContext.WSAPI,
			() => this.api.getSawWinningHistoryT(this.userExtId, limit, offset, saw_template_id),
			CACHE_DATA_SEC,
		);
	}

	/**
	 * Plays one round of a mini-game template — runs the server's
	 * randomised prize selection, deducts the buy-in cost (if any),
	 * credits the won prize, and returns the won `prize_id`. By default
	 * (`acknowledge: true`) the SDK then sends a server-side
	 * acknowledgement and AWAITS it before resolving, so the win is
	 * marked delivered by the time the promise settles. Pass
	 * `acknowledge: false` to skip that step and finalise the win
	 * yourself later (see the `acknowledge` parameter).
	 *
	 * Works for all `SAWGameType` values EXCEPT:
	 * - `PrizeDrop` — prizes arrive server-pushed; do NOT call
	 *   `playMiniGame` for this type.
	 * - `MatchX` / `Quiz` — prediction submission goes through a
	 *   separate games server; `playMiniGame` is not the entry point.
	 *
	 * @remarks
	 * **Preconditions**
	 * Read the candidate template from {@link getMiniGames} and check:
	 * - `spin_count > 0` for spin-based templates
	 *   (`saw_buyin_type === 'spins'`).
	 * - Sufficient balance for paid templates — points / gems /
	 *   diamonds from {@link getUserProfile} against
	 *   `buyin_cost_points` / `_gems` / `_diamonds`.
	 * - `next_available_spin_ts` is in the past (or unset) — the
	 *   server enforces a per-period max-attempts cap.
	 * - Template is currently in its active period
	 *   (operator-configured `activeFromDate` / `activeTillDate`).
	 *
	 * **Error codes** (in `err_code`, typed as {@link SAWSpinErrorCode})
	 * - `0` (`SAW_OK`) — success; `prize_id` identifies the won prize
	 *   in `template.prizes`.
	 * - `40001` (`SAW_NO_SPINS`) — user has no spin attempts for a
	 *   spin-based template.
	 * - `40002` (`SAW_PRIZE_POOL_EMPTY`) — all prize slots in the
	 *   template are depleted.
	 * - `40003` (`SAW_NOT_ENOUGH_POINTS`) — insufficient points for a
	 *   points-cost template.
	 * - `40004` (`SAW_FAILED_MAX_SPINS_REACHED`) — per-period
	 *   max-attempts cap reached. The server's
	 *   `first_spin_in_period` value (exposed in
	 *   {@link TMiniGamePlayBatchResult}; not surfaced in the single
	 *   `TMiniGamePlayResult`) marks the period start.
	 * - `40007` (`SAW_TEMPLATE_NOT_ACTIVE`) — template outside its
	 *   active time window.
	 * - `40009` (`SAW_NOT_IN_SEGMENT`) — user fails the template's
	 *   visibility segment check, OR (for lootbox variants) the day's
	 *   prize pool is empty.
	 * - `40011` (`SAW_NO_BALANCE_GEMS`) — insufficient gems.
	 * - `40012` (`SAW_NO_BALANCE_DIAMONDS`) — insufficient diamonds.
	 * - `-40001` (`SAW_VISITOR_STOP_SPIN_REQUEST`) — visitor session
	 *   tried to play a non-visitor-mode template. The default UI
	 *   silently stops the game; no prize awarded.
	 * - other non-zero — generic server error. Surface `err_message`.
	 *
	 * **Prize handling**
	 * On `err_code === 0`, `prize_id` matches an entry in
	 * `template.prizes`. Look up the prize's `prize_type`
	 * ({@link MiniGamePrizeTypeName}) to decide UI treatment:
	 * - `'no-prize'` — the user spun but won nothing (an operator-
	 *   configured "loss" slot). Buy-in is still deducted.
	 * - `'points'` / `'gems-and-diamonds'` / `'spin'` — value
	 *   credited to the user's profile / spin balance; visible on
	 *   the next refresh.
	 * - `'bonus'` — surfaces via {@link getBonuses}.
	 * - `'jackpot'` — drains the template's `jackpot_current` to the
	 *   user; resets the accumulator.
	 * - `'raffle-ticket'` — adds tickets to the relevant raffle.
	 * - `'mission'` / `'change-level'` — visible via the
	 *   corresponding domain methods.
	 * - `'manual'` — operator delivers offline.
	 *
	 * **Acknowledge** (the `acknowledge` parameter, default `true`)
	 * Every spin is finalised by a follow-up acknowledge step that
	 * marks the win delivered. By default the SDK sends that
	 * acknowledge and AWAITS it, so `playMiniGame` resolves only after
	 * the win is finalised server-side. Keep the default unless you
	 * have a specific reason not to.
	 *
	 * Pass `acknowledge: false` to skip that automatic step.
	 * `playMiniGame` then resolves as soon as the spin result is known,
	 * without waiting for the win to be marked delivered. You finalise
	 * it later by calling {@link miniGameWinAcknowledgeRequest} with the
	 * `request_id` returned on this result.
	 *
	 * What `acknowledge: false` defers:
	 * - For STANDARD prizes the value is credited when the spin is
	 *   finalised — by your later acknowledge or, failing that, by the
	 *   server-side fallback below — so opting out delays the balance
	 *   change by at most that fallback window. The `is_claimed` flag in
	 *   {@link getMiniGamesHistory} flips on the same finalisation.
	 * - For operator-configured "explicit claim" prizes the credit is
	 *   deferred until your explicit acknowledge — the fallback does not
	 *   cover them.
	 *
	 * While the spin is un-finalised it can also be finalised as LOST —
	 * prize discarded back to the pool — via
	 * {@link miniGameWinAcknowledgeRequest} with `{ lose: true }`.
	 *
	 * A server-side fallback auto-acknowledges ordinary un-acknowledged
	 * spins after a short delay (about 1–3 minutes), so an ordinary
	 * prize is never lost even without consumer action. "Explicit
	 * claim" prizes are excluded from that fallback — if you use
	 * `acknowledge: false` for one, you MUST acknowledge it explicitly
	 * or its prize is never credited.
	 *
	 * **Idempotency**: NOT idempotent. A double-click sends two
	 * spins and deducts the buy-in twice. The SDK does NOT guard
	 * against rapid clicks at the public API level — guard the call
	 * site with an in-flight flag. The server enforces a per-user
	 * per-template lock that serialises concurrent requests, so two
	 * simultaneous calls won't be processed in parallel, but they
	 * will both be processed sequentially (i.e. both deduct).
	 *
	 * **Refresh after success (and after failure)**
	 * The SDK automatically refreshes the templates cache on every
	 * spin response and fires any `onUpdate` callback registered via
	 * {@link getMiniGames} or this method. After `err_code === 0`, the
	 * affected template's `spin_count` / `jackpot_current` /
	 * `next_available_spin_ts` reflect the new state on the
	 * refreshed array.
	 *
	 * **Side effects** (on `err_code === 0`)
	 * - Buy-in deducted at spin time (points / gems / diamonds / spin
	 *   tickets — depending on `saw_buyin_type`), already applied by the
	 *   time the call resolves. Balance updates flow via the
	 *   user-properties channel (observe via {@link getUserProfile}).
	 * - Prize value credited per the prize's type (see "Prize handling"
	 *   above) when the spin is finalised — with the default
	 *   auto-acknowledge that happens before the call resolves;
	 *   "explicit claim" prizes are credited only by an explicit
	 *   acknowledge.
	 * - The play is recorded server-side for analytics / reporting.
	 *
	 * **UI guidance**: see [UI Guide — `playMiniGame`](../../docs/ui/minigames/UIGuide_playMiniGame.md).
	 *
	 * **Visitor mode**: not supported. Visitor sessions trying to
	 * spin receive `SAW_VISITOR_STOP_SPIN_REQUEST (-40001)`.
	 *
	 * @param template_id        The mini-game template ID (from
	 *                           `TMiniGameTemplate.id`).
	 * @param params             Optional options bag.
	 * @param params.onUpdate    Pass a callback to subscribe to
	 *                           subsequent template refreshes (same
	 *                           channel as {@link getMiniGames}).
	 * @param params.acknowledge Whether the SDK automatically sends and
	 *                           awaits the win acknowledge after the
	 *                           spin. Defaults to `true` (recommended).
	 *                           Set `false` to finalise the win yourself
	 *                           via {@link miniGameWinAcknowledgeRequest}
	 *                           — see "Acknowledge" above for the
	 *                           request-id caveat.
	 * @returns `{ err_code, err_message, prize_id }` — success when
	 *          `err_code === 0`. `prize_id` is always populated; look
	 *          it up in `template.prizes` to interpret the prize.
	 *
	 * @example
	 * ```ts
	 * const games = await window._smartico.api.getMiniGames({
	 *   onUpdate: (refreshed) => console.log('[smartico] templates refreshed — re-render lobby', refreshed),
	 * });
	 * const game = games.find(g => g.id === templateId);
	 *
	 * if (!game) {
	 *   console.log('[smartico] template not in current list — refresh getMiniGames');
	 *   return;
	 * }
	 * if (game.saw_buyin_type === 'spins' && (game.spin_count ?? 0) === 0) {
	 *   console.log('[smartico] no spins available — disable Play button, show "No spins" message');
	 *   return;
	 * }
	 *
	 * console.log('[smartico] play starting — set in-flight flag, start game animation (wheel spin / scratch / lootbox open / etc.)');
	 * const r = await window._smartico.api.playMiniGame(game.id);
	 * console.log('[smartico] play response received');
	 *
	 * if (r.err_code === 0) {
	 *   const prize = game.prizes.find(p => p.id === r.prize_id);
	 *   if (prize?.prize_type === 'no-prize') {
	 *     console.log('[smartico] user lost — animate to the no-prize slot and show "Better luck next time" modal');
	 *   } else {
	 *     console.log('[smartico] user won — animate to prize', prize?.name,
	 *       '— show acknowledge modal per template.acknowledge_type;',
	 *       'getMiniGames onUpdate fires shortly with refreshed spin_count / jackpot');
	 *   }
	 * } else if (r.err_code === 40004) {
	 *   console.error('[smartico] max spins reached — show countdown to next available spin (use playMiniGameBatch for first_spin_in_period if needed)');
	 * } else if (r.err_code === -40001) {
	 *   console.log('[smartico] visitor stopped — silently end the game, no prize modal');
	 * } else {
	 *   console.error('[smartico] play failed — show generic error with this message:', r.err_message);
	 * }
	 * ```
	 *
	 * @example
	 * Manual finalisation (`acknowledge: false`) — e.g. an explicit
	 * "Claim" CTA, a decline/forfeit flow, or finalising on your own
	 * schedule:
	 * ```ts
	 * const r = await window._smartico.api.playMiniGame(game.id, { acknowledge: false });
	 * if (r.err_code === 0) {
	 *   // Spin resolved but not yet finalised — the prize is not credited
	 *   // yet. Your acknowledge below credits it (for standard prizes the
	 *   // server-side fallback would eventually do the same).
	 *   console.log('[smartico] prize won — show the result / Claim CTA, then finalise');
	 *
	 *   // On the user's Claim click, finalise with the request_id from the result.
	 *   await window._smartico.api.miniGameWinAcknowledgeRequest(r.request_id);
	 *   console.log('[smartico] win finalised — refresh getUserProfile / getMiniGames to reflect it');
	 *
	 *   // Or, if the game flow ends in the player declining / losing the
	 *   // drawn prize, finalise the spin as lost instead — the prize is
	 *   // not credited and returns to the prize pool:
	 *   // await window._smartico.api.miniGameWinAcknowledgeRequest(r.request_id, { lose: true });
	 * }
	 * ```
	 */
	public async playMiniGame(
		template_id: number,
		{ onUpdate, acknowledge = true }: { onUpdate?: (data: TMiniGameTemplate[]) => void, acknowledge?: boolean } = {},
	): Promise<TMiniGamePlayResult> {
		if (typeof onUpdate === 'function') {
			this.onUpdateCallback.set(onUpdateContextKey.Saw, onUpdate);
		}

		const r = await this.api.sawSpinRequest(this.userExtId, template_id);
		if (acknowledge) {
			await this.api.doAcknowledgeRequest(this.userExtId, r.request_id);
		}
		const o: TMiniGamePlayResult = {
			err_code: r.errCode,
			err_message: r.errMsg,
			prize_id: r.saw_prize_id,
			request_id: r.request_id,
		};

		return o;
	}

	/**
	 * Manually acknowledges a mini-game spin — marks the win delivered
	 * server-side, or (with `lose: true`) finalises it as lost and
	 * returns the prize to the pool. Most consumers do NOT need this:
	 * {@link playMiniGame} acknowledges by default (`acknowledge: true`)
	 * and {@link playMiniGameBatch} acknowledges automatically. Call this
	 * directly only when you took ownership of the acknowledge step or
	 * need to recover a lost one.
	 *
	 * @remarks
	 * **When to call**
	 * - **Primary — after `playMiniGame(..., { acknowledge: false })`.**
	 *   You opted out of the automatic acknowledge to finalise the win
	 *   on your own schedule (e.g. on a user "Claim" tap). Pass the
	 *   `request_id` from that call's result here when ready. This is
	 *   REQUIRED for operator-configured "explicit claim" prizes — they
	 *   are not covered by the server-side fallback, so without this
	 *   call their prize is never credited.
	 * - **Recovery — a lost acknowledge.** {@link playMiniGameBatch}
	 *   acknowledges on a fire-and-forget basis; if one is lost (network
	 *   drop) the spin shows `is_claimed: false` in
	 *   {@link getMiniGamesHistory}. Pass that row's `client_request_id`
	 *   to deliver it.
	 *
	 * The `request_id` on a {@link playMiniGame} result and the
	 * `client_request_id` on a {@link getMiniGamesHistory} row are the
	 * same correlation id — this method accepts either.
	 *
	 * **Finalising as lost (`lose: true`)**
	 * Pass `{ lose: true }` to finalise the spin as LOST instead of won:
	 * the prize is NOT credited and is returned to the game's prize pool
	 * (available again for other players), and the spin fires the
	 * mini-game "lose" engagement event instead of the win one. On the
	 * next {@link getMiniGamesHistory} fetch the row shows `is_claimed:
	 * true` with no prize attached. Use this for game mechanics where the
	 * player can decline or forfeit the drawn prize — e.g. a
	 * gamble/discard step, or a client-driven game where the user's final
	 * action decides whether the pre-drawn prize is actually won (the
	 * default Smartico UI does this for the Voyager game: failing the
	 * star-collection run finalises the spin as lost). When configured,
	 * the prize's `aknowledge_message_lose` is the operator's result copy
	 * for this case — show it instead of `aknowledge_message`. It only
	 * works on a spin that is not yet finalised, so it requires playing
	 * with `acknowledge: false` and calling promptly — once the automatic
	 * acknowledge or the server-side fallback (below) has finalised the
	 * spin, `lose: true` is a no-op and the prize stays credited.
	 * ("Explicit claim" prizes are exempt from the fallback, so for them
	 * there is no time pressure.)
	 *
	 * **Idempotency**: safe. Acknowledging a spin that is already
	 * finalised — by you, by the automatic acknowledge, or by the
	 * fallback — is a no-op with no double credit. Acknowledging a
	 * failed spin's id is likewise a no-op.
	 *
	 * **Server-side fallback**
	 * Even if you never call this, a server-side job finalises ordinary
	 * un-acknowledged spins automatically after a short delay (about 1–3
	 * minutes), flipping `is_claimed` to `true` on the next
	 * {@link getMiniGamesHistory} fetch. "Explicit claim" prizes are the
	 * exception — excluded from the fallback, they require an explicit
	 * call here.
	 *
	 * **Side effects** (first successful call for an un-acknowledged spin)
	 * - Default (win): the prize value is credited on this call — this is
	 *   the finalisation step that credits standard and "explicit claim"
	 *   prizes alike (see {@link playMiniGame} "Prize handling").
	 * - With `lose: true`: no credit; the prize returns to the prize pool
	 *   and the "lose" engagement event fires.
	 * - Either way the spin's `is_claimed` flips to `true` on the next
	 *   {@link getMiniGamesHistory} fetch.
	 *
	 * **UI guidance**: see [UI Guide — `miniGameWinAcknowledgeRequest`](../../docs/ui/minigames/UIGuide_miniGameWinAcknowledgeRequest.md).
	 *
	 * **Visitor mode**: not supported.
	 *
	 * @param request_id  Correlation id of the spin to finalise: the
	 *                    `request_id` from a {@link playMiniGame} result
	 *                    (played with `acknowledge: false`), or the
	 *                    `client_request_id` of a
	 *                    {@link getMiniGamesHistory} row.
	 * @param options.lose  Optional. When `true`, finalises the spin as
	 *                      lost — the prize is not credited and returns
	 *                      to the prize pool (see "Finalising as lost").
	 *                      Omit (or pass `false`) to deliver the win.
	 *
	 * @example
	 * ```ts
	 * // Primary — finalise a win you played with acknowledge: false.
	 * const r = await window._smartico.api.playMiniGame(templateId, { acknowledge: false });
	 * if (r.err_code === 0) {
	 *   console.log('[smartico] show the prize / Claim CTA; on Claim, finalise the win');
	 *   await window._smartico.api.miniGameWinAcknowledgeRequest(r.request_id);
	 * }
	 *
	 * // Decline / forfeit — finalise the same spin as lost instead:
	 * // the prize is not credited and goes back to the prize pool.
	 * await window._smartico.api.miniGameWinAcknowledgeRequest(r.request_id, { lose: true });
	 *
	 * // Recovery — re-acknowledge any spins a batch acknowledge missed.
	 * const history = await window._smartico.api.getMiniGamesHistory({ limit: 20 });
	 * for (const row of history.filter(h => !h.is_claimed)) {
	 *   console.log('[smartico] re-acknowledging stale spin', row.client_request_id);
	 *   await window._smartico.api.miniGameWinAcknowledgeRequest(row.client_request_id);
	 * }
	 * ```
	 */
	public async miniGameWinAcknowledgeRequest(request_id: string, { lose }: { lose?: boolean } = {}) {
		return this.api.doAcknowledgeRequest(this.userExtId, request_id, lose);
	}

	/**
	 * Plays a mini-game template `spin_count` times in one round-trip.
	 * Returns an array of per-spin results — each independent, each
	 * with its own error code. Like {@link playMiniGame}, the SDK
	 * auto-acknowledges every result on a fire-and-forget basis.
	 *
	 * Use this when a UI offers "spin N times" affordances
	 * (multi-spin buttons, lootbox open-N flows). The server processes
	 * each spin independently — there is no atomicity / rollback if
	 * one fails.
	 *
	 * @remarks
	 * **Result shape note** — `TMiniGamePlayBatchResult` uses
	 * `errCode` / `errMessage` (camelCase) — DIFFERENT from
	 * {@link TMiniGamePlayResult} which uses `err_code` / `err_message`
	 * (snake_case). Branch on the camelCase keys when reading batch
	 * results.
	 *
	 * **Per-spin independence**
	 * The server iterates the requested spins and calls the prize
	 * engine once per entry. If spin #2 fails with `SAW_NO_SPINS`,
	 * spin #3 is still attempted — the server does NOT stop on first
	 * error and does NOT roll back successful spins. Each
	 * `results[i].errCode` is independent.
	 *
	 * Practical implication: if the user has 3 spins available and
	 * requests 5, expect results 0-2 with `errCode === 0` and results
	 * 3-4 with `errCode === SAW_NO_SPINS`.
	 *
	 * **Error codes**
	 * Per-result `errCode` is from {@link SAWSpinErrorCode}. See
	 * {@link playMiniGame} for the full table; the same codes apply
	 * per spin.
	 *
	 * **`first_spin_in_period` field**
	 * Populated on results where `errCode === SAW_FAILED_MAX_SPINS_REACHED`
	 * (40004). The value is the epoch-ms timestamp of the user's
	 * first spin in the current cooldown period. Compute the
	 * countdown as:
	 * `template.max_spins_period_ms - (Date.now() - first_spin_in_period)`.
	 *
	 * **`jackpot_amount` field**
	 * Populated on results where the won prize is a jackpot
	 * (`prize_type === 'jackpot'`). The amount the user just claimed
	 * from the template's jackpot accumulator.
	 *
	 * **Auto-acknowledge**
	 * The SDK fires a batch-acknowledge for all `request_id`s after
	 * the batch response lands — fire-and-forget. Same recovery
	 * semantics as {@link playMiniGame}: lost acknowledgements
	 * become recoverable via {@link miniGameWinAcknowledgeRequest}
	 * per row, and a server-side fallback job auto-acknowledges
	 * stale spins every ~60 seconds.
	 *
	 * **Idempotency**: NOT idempotent. A double-click sends two
	 * batches. Guard the call site with an in-flight flag.
	 *
	 * **Refresh after success (and after failure)**
	 * Same as {@link playMiniGame} — the templates cache refreshes
	 * and any `onUpdate` callback registered via {@link getMiniGames}
	 * fires with the updated `spin_count` / `jackpot_current`.
	 *
	 * **Side effects** (per-spin, on `errCode === 0`)
	 * Same as {@link playMiniGame} — buy-in deducted, prize value
	 * credited per prize type.
	 *
	 * **UI guidance**: see [UI Guide — `playMiniGameBatch`](../../docs/ui/minigames/UIGuide_playMiniGameBatch.md).
	 *
	 * **Visitor mode**: not supported.
	 *
	 * @param template_id  The mini-game template ID.
	 * @param spin_count   Number of spins to play. The server attempts
	 *                     all `spin_count` spins — partial successes
	 *                     are normal when the user runs out of
	 *                     balance / spins mid-batch.
	 * @param params       Optional. Pass an `onUpdate` callback to
	 *                     subscribe to subsequent template refreshes.
	 * @returns `TMiniGamePlayBatchResult[]` — one entry per requested
	 *          spin, in request order. Note the camelCase `errCode` /
	 *          `errMessage` keys (see "Result shape note" above).
	 *
	 * @example
	 * ```ts
	 * const game = (await window._smartico.api.getMiniGames()).find(g => g.id === templateId);
	 * if (!game) return;
	 *
	 * console.log('[smartico] batch play starting — set in-flight flag, animate the chosen N spins sequentially in UI');
	 * const results = await window._smartico.api.playMiniGameBatch(game.id, 5);
	 * console.log('[smartico] batch response received — clear in-flight flag');
	 *
	 * for (const [i, r] of results.entries()) {
	 *   if (r.errCode === 0) {
	 *     const prize = game.prizes.find(p => p.id === r.saw_prize_id);
	 *     console.log('[smartico] spin', i, 'won:', prize?.name,
	 *       r.jackpot_amount ? '(jackpot: ' + r.jackpot_amount + ')' : '');
	 *   } else if (r.errCode === 40004) {
	 *     const msTillNext = game.max_spins_period_ms! - (Date.now() - (r.first_spin_in_period ?? 0));
	 *     console.log('[smartico] spin', i, 'capped — ' + Math.ceil(msTillNext / 1000) + ' s until next allowed');
	 *   } else {
	 *     console.error('[smartico] spin', i, 'failed —', r.errCode, r.errMessage);
	 *   }
	 * }
	 * ```
	 */
	public async playMiniGameBatch(
		template_id: number,
		spin_count: number,
		{ onUpdate }: { onUpdate?: (data: TMiniGameTemplate[]) => void } = {},
	): Promise<TMiniGamePlayBatchResult[]> {
		if (typeof onUpdate === 'function') {
			this.onUpdateCallback.set(onUpdateContextKey.Saw, onUpdate);
		}

		const response = await this.api.sawSpinBatchRequest(this.userExtId, template_id, spin_count);

		const request_ids = response.results.map((result) => result.request_id);
		this.api.doAcknowledgeBatchRequest(this.userExtId, request_ids);

		const o: TMiniGamePlayBatchResult[] = response.results.map((result) => ({
			errCode: result.errCode,
			errMessage: result.errMsg,
			saw_prize_id: result.saw_prize_id,
			jackpot_amount: result.jackpot_amount,
			first_spin_in_period: result.first_spin_in_period,
		}));

		return o;
	}

	protected async updateOnSpin(data: SAWSpinsCountPush) {
		const templates: TMiniGameTemplate[] = await OCache.use(
			onUpdateContextKey.Saw,
			ECacheContext.WSAPI,
			() => this.api.sawGetTemplatesT(this.userExtId),
			CACHE_DATA_SEC,
		);
		const index = templates.findIndex((t) => t.id === data.saw_template_id);
		if (index === -1) {
			return;
		}
		templates[index].spin_count = data.spin_count;
		this.updateEntity(onUpdateContextKey.Saw, templates);
	}

	protected async reloadMiniGameTemplate() {
		const updatedTemplates = await this.api.sawGetTemplatesT(this.userExtId);
		this.updateEntity(onUpdateContextKey.Saw, updatedTemplates);
	}
}
