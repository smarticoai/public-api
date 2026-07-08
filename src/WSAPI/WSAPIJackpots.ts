import { ECacheContext, OCache } from '../OCache';
import {
	JackpotDetails,
	JackpotPot,
	JackpotWinnerHistory,
	JackpotsOptinResponse,
	JackpotsOptoutResponse,
} from '../Jackpots';
import { IntUtils } from '../IntUtils';
import { TGetJackpotEligibleGamesResponse } from '../Jackpots/GetJackpotEligibleGamesResponse';
import {
	JACKPOT_TEMPLATE_CACHE_SEC,
	JACKPOT_POT_CACHE_SEC,
	JACKPOT_WINNERS_CACHE_SEC,
	JACKPOT_ELIGIBLE_GAMES_CACHE_SEC,
	onUpdateContextKey,
} from './WSAPIBase';
import { WSAPIClans } from './WSAPIClans';

/** @group Jackpots */
export class WSAPIJackpots extends WSAPIClans {

	/** @hidden */
	protected jackpotGetSignature: string = '';
	protected async jackpotClearCache() {
		OCache.clear(ECacheContext.WSAPI, onUpdateContextKey.Jackpots);
		OCache.clear(ECacheContext.WSAPI, onUpdateContextKey.Pots);
		// Winners + eligible-games are cached per jp_template_id (composite keys),
		// so a bare clear misses every variant — clear by prefix.
		OCache.clearByPrefix(ECacheContext.WSAPI, onUpdateContextKey.JackpotWinners);
		OCache.clearByPrefix(ECacheContext.WSAPI, onUpdateContextKey.JackpotEligibleGames);
	}

	/**
	 * Returns the user-eligible jackpots active for the label, fused with their live
	 * pot values. Each entry carries the static template (name, description, opt-in
	 * state, eligible games, currency) plus a freshly-fetched `pot` snapshot.
	 *
	 * Designed to be polled at high frequency (every 1 second is fine) — the SDK
	 * splits the response into a 30-second template cache and a 1-second pot-value
	 * cache so consumers can render a live-counting pot amount without hammering
	 * the server for the static template data.
	 *
	 * @remarks
	 * **Preconditions**
	 * - No prerequisite calls.
	 * - Visitor mode supported via `_smartico.vapi(lang).jackpotGet(...)`.
	 *
	 * **Server-side eligibility filtering**
	 * Jackpots are filtered server-side by the user's segments before being
	 * returned. Templates the user is ineligible for never appear in this
	 * response — there is no "locked" state to render. An empty result for a
	 * known-good user typically means none of the configured templates match
	 * the user's segments / level / brand.
	 *
	 * **Filter behavior**
	 * Passing `related_game_id` returns only jackpots linked to that game (from
	 * the operator's games catalog). Passing `jp_template_id` returns just that
	 * single template. With no filter, all active templates the user is
	 * eligible for are returned. Changing the filter between calls flushes both
	 * the template cache and the pot cache.
	 *
	 * **Two-tier cache**
	 * - Template definitions: 30 s cache. Re-fetched on filter change or when
	 *   opt-in / opt-out / a jackpot-win push lands.
	 * - Pot values: 1 s cache. Re-fetched on every call past the 1-second
	 *   window so a 1 Hz poll renders a smoothly counting pot.
	 *
	 * **`jp_public_meta.custom_data`**
	 * Server returns this as a JSON-encoded string; the SDK parses it inline so
	 * consumers always receive either a parsed object or the raw string.
	 *
	 * **Personal vs MultiUser jackpots** (see {@link JackpotType})
	 * - `MultiUser` (1) — shared pot; `registration_count` reflects real opted-in
	 *   user count; temperature transitions fire push events.
	 * - `Personal` (2) — independent per-user pot; `registration_count` is
	 *   always 1; temperature push events are suppressed.
	 *
	 * **Refresh**
	 * - `jp_status_id`, segment changes, and operator template edits surface
	 *   after the 30 s template cache TTL.
	 * - Opt-in / opt-out / jackpot-win push events all clear the template and
	 *   pot caches — the next call re-fetches.
	 *
	 * **Visitor mode**: supported.
	 *
	 * **UI guidance**: see [UI Guide — `jackpotGet`](../../docs/ui/jackpots/UIGuide_jackpotGet.md).
	 *
	 * @param filter                     Optional filter narrowing the result set.
	 * @param filter.related_game_id     Limit to jackpots linked to this game ID
	 *                                    (from the operator's games catalog).
	 * @param filter.jp_template_id      Limit to a single template.
	 * @returns Array of {@link JackpotDetails} — empty if the user is eligible
	 * for no active jackpots.
	 *
	 * @example
	 * ```ts
	 * // Poll every second for live pot counter
	 * setInterval(async () => {
	 *     const jackpots = await window._smartico.api.jackpotGet();
	 *     for (const jp of jackpots) {
	 *         console.log('[smartico] update pot widget for', jp.jp_public_meta.name, '— amount:', jp.pot.current_pot_amount_user_currency, jp.user_currency, '— temperature:', jp.pot.current_pot_temperature);
	 *     }
	 * }, 1000);
	 *
	 * // Filtered fetch for a specific game tile
	 * const linked = await window._smartico.api.jackpotGet({ related_game_id: 'gold-slot2' });
	 * console.log('[smartico] linked jackpots for game:', linked.length);
	 * ```
	 */
	public async jackpotGet(filter?: { related_game_id?: string; jp_template_id?: number }): Promise<JackpotDetails[]> {
		const signature: string = `${filter?.jp_template_id}:${filter?.related_game_id}`;

		if (signature !== this.jackpotGetSignature) {
			this.jackpotGetSignature = signature;
			this.jackpotClearCache();
		}

		let jackpots: JackpotDetails[] = [];
		let pots: JackpotPot[] = [];

		jackpots = await OCache.use<JackpotDetails[]>(
			onUpdateContextKey.Jackpots,
			ECacheContext.WSAPI,
			async () => {
				const _jackpots = await this.api.jackpotGet(this.userExtId, filter);
				if (!_jackpots?.items) {
					return [];
				}
				const _pots = _jackpots.items.map((jp) => jp.pot);

				_jackpots.items.forEach((jp) => {
					jp.jp_public_meta.custom_data = IntUtils.JsonOrText(jp.jp_public_meta.custom_data);
				});

				OCache.set(onUpdateContextKey.Pots, _pots, ECacheContext.WSAPI, JACKPOT_POT_CACHE_SEC);
				return _jackpots.items;
			},
			JACKPOT_TEMPLATE_CACHE_SEC,
		);

		if (jackpots.length > 0) {
			pots = await OCache.use<JackpotPot[]>(
				onUpdateContextKey.Pots,
				ECacheContext.WSAPI,
				async () => {
					const jp_template_ids = jackpots.map((jp) => jp.jp_template_id);
					return (await this.api.potGet(this.userExtId, { jp_template_ids })).items;
				},
				JACKPOT_POT_CACHE_SEC,
			);
		}

		return jackpots.map((jp) => {
			let _jp: JackpotDetails = {
				...jp,
				pot: pots.find((p) => p.jp_template_id === jp.jp_template_id),
			};
			return _jp;
		});
	}

	/**
	 * Opts the authenticated user into a jackpot. From this point on, the user
	 * contributes to the pot (per the template's `contribution_type` and
	 * `contribution_value`) and is eligible to win when the pot explodes.
	 *
	 * On success the SDK clears the jackpot caches — the next
	 * {@link jackpotGet} call returns the updated `is_opted_in: true` and an
	 * incremented `registration_count`.
	 *
	 * @remarks
	 * **Preconditions**
	 * - User must be authenticated. Visitor mode not supported.
	 * - `jp_template_id` is mandatory — the SDK throws synchronously if missing.
	 * - The jackpot must currently be active and the user must be in its
	 *   eligibility segment. Ineligible jackpots are filtered out of
	 *   {@link jackpotGet} entirely, so a card the user sees is opt-in-able.
	 *
	 * **Error handling**
	 * The server returns a non-zero `errCode` with a human-readable `errMsg`
	 * for any failure. Common causes:
	 * - User is in a control group.
	 * - Jackpot template is not active (status changed since the user opened
	 *   the card).
	 * - User is already opted in (the SDK has no client-side guard against a
	 *   double-tap; the server enforces).
	 * - DB race / generic server error.
	 *
	 * The SDK does NOT enumerate distinct numeric codes for each cause — branch
	 * on `errCode === 0` for success and surface `errMsg` as-is for failures.
	 *
	 * **Idempotency / re-opt-in semantics**
	 * - **Already opted in** → returns non-zero `errCode` ("User already opted in").
	 * - **Previously opted in then opted out** → succeeds silently; the server
	 *   re-activates the registration. This is not an error path — a user can
	 *   freely cycle opt-in / opt-out.
	 *
	 * **Refresh after success**
	 * - The SDK clears the template, pot, and winners caches.
	 * - The next {@link jackpotGet} call returns `is_opted_in: true` for this
	 *   template.
	 *
	 * **Side effects**
	 * Fires a `JACKPOT_OPT_IN` engagement event (visible to operator-side
	 * automation rules). Does NOT immediately move points / gems — contributions
	 * happen per-bet via the user's gameplay, not on opt-in.
	 *
	 * **Visitor mode**: not supported.
	 *
	 * **UI guidance**: see [UI Guide — `jackpotOptIn`](../../docs/ui/jackpots/UIGuide_jackpotOptIn.md).
	 *
	 * @param filter.jp_template_id  ID of the jackpot template to join.
	 * @returns {@link JackpotsOptinResponse} — `errCode === 0` on success.
	 *
	 * @example
	 * ```ts
	 * const r = await window._smartico.api.jackpotOptIn({ jp_template_id: 42 });
	 *
	 * if (r.errCode === 0) {
	 *     console.log('[smartico] opted in — refresh jackpot card to show opt-out CTA');
	 * } else {
	 *     console.error('[smartico] opt-in failed — show this message in an error toast:', r.errMsg);
	 * }
	 * ```
	 */
	public async jackpotOptIn(filter: { jp_template_id: number }): Promise<JackpotsOptinResponse> {
		if (!filter.jp_template_id) {
			throw new Error('jp_template_id is required in jackpotOptIn');
		}

		const result = await this.api.jackpotOptIn(this.userExtId, filter);

		return result;
	}

	/**
	 * Opts the authenticated user out of a jackpot. From this point on the user
	 * no longer contributes to the pot and is not eligible to win.
	 *
	 * The user can re-join later via {@link jackpotOptIn} — opt-out is not
	 * permanent.
	 *
	 * @remarks
	 * **Preconditions**
	 * - User must be authenticated. Visitor mode not supported.
	 * - `jp_template_id` is mandatory — the SDK throws synchronously if missing.
	 *
	 * **Error handling**
	 * The server returns a non-zero `errCode` with a human-readable `errMsg` for
	 * any failure. Common causes:
	 * - User has never opted in OR is already opted out — server returns
	 *   non-zero `errCode` for the "already opted out" case. Calling opt-out
	 *   on a jackpot the user has never registered for typically returns
	 *   success (the server finds no registration row to update).
	 * - DB race / generic server error.
	 *
	 * Unlike {@link jackpotOptIn}, opt-out does NOT check the template's status
	 * — the user can opt out of a jackpot that has been deactivated by the
	 * operator.
	 *
	 * **Idempotency**
	 * - First opt-out → success.
	 * - Second opt-out → non-zero `errCode` ("Already opted out").
	 * - Opt-out of a never-joined jackpot → typically succeeds silently
	 *   (no registration row to act on).
	 *
	 * **Refresh after success**
	 * - The SDK clears the template, pot, and winners caches.
	 * - The next {@link jackpotGet} call returns `is_opted_in: false` for this
	 *   template and a decremented `registration_count`.
	 *
	 * **Side effects**
	 * Fires a `JACKPOT_OPT_OUT` engagement event for operator-side automation
	 * rules. The user's existing contributions to the current pot remain in
	 * place — opt-out stops future contributions but does not refund past ones.
	 *
	 * **Visitor mode**: not supported.
	 *
	 * **UI guidance**: see [UI Guide — `jackpotOptOut`](../../docs/ui/jackpots/UIGuide_jackpotOptOut.md).
	 *
	 * @param filter.jp_template_id  ID of the jackpot template to leave.
	 * @returns {@link JackpotsOptoutResponse} — `errCode === 0` on success.
	 *
	 * @example
	 * ```ts
	 * const r = await window._smartico.api.jackpotOptOut({ jp_template_id: 42 });
	 *
	 * if (r.errCode === 0) {
	 *     console.log('[smartico] opted out — refresh jackpot card to show join CTA');
	 * } else {
	 *     console.error('[smartico] opt-out failed — show this message in an error toast:', r.errMsg);
	 * }
	 * ```
	 */
	public async jackpotOptOut(filter: { jp_template_id: number }): Promise<JackpotsOptoutResponse> {
		if (!filter.jp_template_id) {
			throw new Error('jp_template_id is required in jackpotOptOut');
		}

		const result = await this.api.jackpotOptOut(this.userExtId, filter);

		return result;
	}

	/**
	 * Returns past winners of a specific jackpot template, paginated. Use to
	 * power a "Recent winners" panel inside the jackpot detail modal.
	 *
	 * **Important**: respect the `expose_winners_over_api` flag on the jackpot's
	 * {@link JackpotDetails} before calling this method. The server-side handler
	 * does NOT enforce that flag — it is a UI-only gate. Custom UIs that ignore
	 * the flag will display winners the operator intended to keep private.
	 *
	 * @remarks
	 * **Preconditions**
	 * - User must be authenticated. Visitor mode not supported.
	 * - `jp_template_id` is mandatory — the SDK throws synchronously if missing.
	 * - The consumer SHOULD check
	 *   {@link JackpotDetails.expose_winners_over_api} before calling, since
	 *   the server does not enforce it.
	 *
	 * **Pagination**
	 * Server default page size is 20. Pass `limit` and `offset` to paginate
	 * (e.g. infinite-scroll). The wire response carries a `has_more` flag, but
	 * this SDK method returns only the `winners` array — detect end-of-list by
	 * a returned array shorter than `limit`.
	 *
	 * **Currency caveat**
	 * Winner amounts in the response (`winner.winning_amount_jp_currency`) are
	 * in the jackpot's NATIVE currency, NOT the user's wallet currency. If a
	 * user-currency display is needed, the consumer must convert client-side.
	 *
	 * **Refresh**
	 * - The SDK caches each page separately (per `jp_template_id` +
	 *   `limit` + `offset`) for 30 seconds, so paging back and forth is
	 *   served from cache and each page keeps its own fresh copy.
	 * - Caches clear on jackpot-win push events and on opt-in / opt-out.
	 *
	 * **Error handling**
	 * Non-zero `errCode` on control-group users or generic server errors. The
	 * SDK does NOT enumerate distinct codes — branch on `errCode === 0` and
	 * surface `errMsg` on failure.
	 *
	 * **Visitor mode**: not supported.
	 *
	 * **UI guidance**: see [UI Guide — `getJackpotWinners`](../../docs/ui/jackpots/UIGuide_getJackpotWinners.md).
	 *
	 * @returns Array of {@link JackpotWinnerHistory} entries newest-first.
	 *
	 * @example
	 * ```ts
	 * const [jp] = await window._smartico.api.jackpotGet({ jp_template_id: 42 });
	 *
	 * if (!jp || !jp.expose_winners_over_api) {
	 *     console.log('[smartico] winners hidden by operator config — hide the winners tab');
	 *     return;
	 * }
	 *
	 * const winners = await window._smartico.api.getJackpotWinners({
	 *     jp_template_id: 42,
	 *     limit:          20,
	 *     offset:         0,
	 * });
	 * console.log('[smartico] render', winners.length, 'recent winner rows (amounts in', jp.jp_currency + ')');
	 * ```
	 */
	public async getJackpotWinners({
		limit,
		offset,
		jp_template_id,
	}: {
		/** Page size (default 20). */
		limit?: number;
		/** Pagination offset (default 0). */
		offset?: number;
		/** Jackpot template ID (required). */
		jp_template_id?: number;
	}): Promise<JackpotWinnerHistory[]> {
		// Cache per (jp_template_id, limit, offset) so paging or switching
		// jackpot within the TTL doesn't return a colliding winners list.
		const cacheKey = `${onUpdateContextKey.JackpotWinners}${jp_template_id}:${limit}:${offset}`;
		return OCache.use(
			cacheKey,
			ECacheContext.WSAPI,
			() => this.api.getJackpotWinnersT(this.userExtId, limit, offset, jp_template_id),
			JACKPOT_WINNERS_CACHE_SEC,
		);
	}

	/**
	 * Returns the casino games eligible to contribute to a specific jackpot —
	 * the catalog the user must play to grow the pot. Use to power an
	 * "Eligible games" carousel inside the jackpot detail modal.
	 *
	 * **Shortcut**: when the jackpot's
	 * {@link JackpotDetails.ach_related_game_allow_all} flag is `true`, every
	 * game in the operator catalog contributes — there's no point calling this
	 * method (the result would be the full catalog). The default Smartico UI
	 * hides the Eligible Games tab entirely in that case.
	 *
	 * @remarks
	 * **Preconditions**
	 * - No authentication required — works in both identified and visitor mode.
	 * - `jp_template_id` is mandatory.
	 *
	 * **`onUpdate` caveat**
	 * The `onUpdate` callback is accepted to match the SDK's subscription
	 * contract but is NOT auto-invoked by any current server push. It will only
	 * fire if a consumer (or a future SDK version) explicitly pushes an update.
	 * Treat it as a no-op for now.
	 *
	 * **Refresh**
	 * - The SDK caches per `jp_template_id` for 30 seconds.
	 * - Cache does NOT clear on opt-in / opt-out / jackpot-win — eligible-game
	 *   lists rarely change during a session. Wait for the 30 s TTL.
	 *
	 * **Error handling**
	 * Non-zero `errCode` on control-group users or generic server errors.
	 * Branch on `errCode === 0` and surface `errMsg` on failure.
	 *
	 * **Visitor mode**: supported via
	 * `_smartico.vapi(lang).getJackpotEligibleGames(...)`. The eligible-games
	 * list is template-level (which games contribute to the pot) and carries no
	 * per-user fields, so a visitor session receives the same list an identified
	 * user would. The `lang` passed to `_smartico.vapi(lang)` drives the
	 * translation of game names.
	 *
	 * **UI guidance**: see [UI Guide — `getJackpotEligibleGames`](../../docs/ui/jackpots/UIGuide_getJackpotEligibleGames.md).
	 *
	 * @returns {@link TGetJackpotEligibleGamesResponse} —
	 * `{ eligible_games: JackpotEligibleGame[] }`.
	 *
	 * @example
	 * ```ts
	 * const [jp] = await window._smartico.api.jackpotGet({ jp_template_id: 42 });
	 *
	 * if (jp?.ach_related_game_allow_all) {
	 *     console.log('[smartico] all games eligible — hide the eligible-games tab');
	 *     return;
	 * }
	 *
	 * const r = await window._smartico.api.getJackpotEligibleGames({ jp_template_id: 42 });
	 * console.log('[smartico] render', r.eligible_games.length, 'eligible game tiles');
	 *
	 * // Visitor mode — same shape, language driven by the vapi(lang) argument
	 * const visitor = await window._smartico.vapi('EN').getJackpotEligibleGames({ jp_template_id: 42 });
	 * console.log('[smartico] visitor eligible games:', visitor.eligible_games.length);
	 * ```
	 */
	public async getJackpotEligibleGames({ jp_template_id, onUpdate } : {
		/** Jackpot template ID (required). */
		jp_template_id: number,
		/** Optional callback; not auto-invoked today. */
		onUpdate?: () => void,
	}): Promise<TGetJackpotEligibleGamesResponse> {
		if (typeof onUpdate === 'function') {
			this.onUpdateCallback.set(onUpdateContextKey.JackpotEligibleGames, onUpdate);
		}

		return OCache.use(
			onUpdateContextKey.JackpotEligibleGames + jp_template_id,
			ECacheContext.WSAPI,
			() => this.api.getJackpotEligibleGamesT(this.userExtId, { jp_template_id }),
			JACKPOT_ELIGIBLE_GAMES_CACHE_SEC,
		);
	}
}
