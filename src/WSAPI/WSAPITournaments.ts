import { ECacheContext, OCache } from '../OCache';
import {
	TTournament,
	TTournamentDetailed,
	TTournamentRegistrationResult,
	TClanTournamentPlayers,
} from './WSAPITypes';
import {
	CACHE_DATA_SEC,
	onUpdateContextKey,
} from './WSAPIBase';
import { WSAPIStore } from './WSAPIStore';

/** @group Tournaments */
export class WSAPITournaments extends WSAPIStore {
	/**
	 * Returns the list of tournaments currently visible to the user, scoped
	 * server-side to what the user's segments qualify them to see. Optionally
	 * subscribes to live updates via `onUpdate`: the callback is invoked with
	 * the full refreshed list whenever the user registers in a tournament.
	 *
	 * The returned list is the canonical source of truth for tournament
	 * lobby state (`is_user_registered`, `registration_status`,
	 * `is_in_progress`, `is_can_register`, etc.). Consumers should NOT
	 * mutate it optimistically — always wait for the `onUpdate` callback
	 * (or a fresh fetch after the 30 s cache window) to observe new state.
	 *
	 * @remarks
	 * **Subscription model (`onUpdate`)**
	 * The callback receives the FULL refreshed list (never a diff/patch).
	 * Each subsequent call to `getTournamentsList({ onUpdate })` REPLACES
	 * the prior callback — only one active subscriber at a time. Pass
	 * `onUpdate: undefined` (or omit it) to keep the prior callback in
	 * place; the callback is never auto-cleared.
	 *
	 * **Update triggers** — the callback fires when:
	 *
	 * 1. `registerInTournament(...)` resolves on this connection (any
	 *    `err_code`). The refreshed list reflects the new
	 *    `is_user_registered` / `registration_status` /
	 *    `registration_count` on the affected tournament.
	 *
	 * Does NOT fire for: tournament lifecycle transitions (start, finish,
	 * cancellation), score updates, other users' registrations, or
	 * operator-side BO edits. Those changes surface only on the next
	 * cache miss (after the 30 s TTL) — poll manually if your UI needs
	 * sub-30s lifecycle freshness.
	 *
	 * **Server-side filtering** (what's excluded before the SDK sees it)
	 * The server filters by visibility segment and entry segment, removes
	 * tournaments past their post-finish display window, and excludes
	 * tournaments not yet published. SDK consumers receive only items
	 * the user is eligible to see; no client-side gating is required.
	 *
	 * **Reading state from the returned item**
	 * Drive list bucketing and CTA labels from the SDK-computed booleans
	 * (`is_active`, `is_can_register`, `is_cancelled`, `is_finished`,
	 * `is_in_progress`, `is_upcoming`), NOT from raw `start_time` /
	 * `end_time` comparisons — the booleans encode the canonical
	 * lifecycle states and already reflect server-side rules around
	 * qualifying scores and late registration. `is_user_registered` is
	 * independent of `is_can_register` — a registered user has
	 * `is_user_registered: true` and `is_can_register: false`. The `me`
	 * block (if present) carries the user's own leaderboard position and
	 * score; it's undefined for unregistered users, users without any
	 * recorded score, and visitor-mode sessions. The `prize_pool_short`
	 * field carries the operator-supplied summary string ("$10,000",
	 * "Mixed prizes") for compact card rendering; the full per-place
	 * `prizes[]` breakdown is also populated here but is typically
	 * rendered only in the detail view via
	 * {@link getTournamentInstanceInfo}.
	 *
	 * **Cross-references**
	 * Tournaments with `is_clan_based: true` group participants by clan —
	 * see {@link getClanTournamentPlayers} for fetching the players list
	 * of a specific clan within a clan tournament. The detailed lobby
	 * view (with full player leaderboard and prize structure) comes from
	 * {@link getTournamentInstanceInfo}. Tournaments with
	 * `custom_section_id` belong to an operator-defined custom section
	 * (resolve metadata via `getCustomSections()`).
	 *
	 * **Cache TTL**: the SDK caches the response for 30 seconds. Cache is
	 * fully cleared on login / logout.
	 *
	 * **Idempotency**: safe. Read-only. Repeated calls within the cache
	 * window return a deep-cloned cached array without a network
	 * round-trip.
	 *
	 * **Side effects**: none — pure metadata read.
	 *
	 * **UI guidance**: see [UI Guide — `getTournamentsList`](../../docs/ui/tournaments/UIGuide_getTournamentsList.md).
	 *
	 * **Visitor mode**: supported. The same shape is returned, scoped to
	 * the brand's public tournament list. Per-user fields (`me`,
	 * `is_user_registered`, `registration_status`) are not meaningful.
	 * The `onUpdate` callback is accepted but never fires (registration
	 * mutations are not supported in visitor mode).
	 *
	 * @param params              Optional. Omit to fetch without subscribing.
	 * @param params.onUpdate     Callback invoked with the full refreshed
	 *                            tournament list after every
	 *                            {@link registerInTournament} round-trip on
	 *                            this connection. Each call overwrites the
	 *                            prior callback. Never fires in visitor mode.
	 * @returns                   Promise resolving to the array of
	 *                            tournaments visible to the user. Empty
	 *                            array if no tournaments are visible.
	 *
	 * @example
	 * ```ts
	 * const tournaments = await window._smartico.api.getTournamentsList({
	 *   onUpdate: (refreshed) => {
	 *     console.log('[smartico] tournament list refreshed — re-render the lobby UI from this array, do not merge with prior state:', refreshed);
	 *     const justRegistered = refreshed.filter(t => t.is_user_registered);
	 *     console.log('[smartico] user is now registered in these tournaments:', justRegistered.map(t => t.name));
	 *   },
	 * });
	 *
	 * // Bucket items by lifecycle state for a tabbed UI.
	 * const live = tournaments.filter(t => t.is_in_progress);
	 * const upcoming = tournaments
	 *   .filter(t => t.is_upcoming && !t.is_user_registered)
	 *   .sort((a, b) => a.start_time - b.start_time);
	 * const mine = tournaments.filter(t => t.is_user_registered);
	 * const finished = tournaments.filter(t => t.is_finished);
	 *
	 * console.log('[smartico] render lobby tabs with these counts: live=', live.length,
	 *   'upcoming=', upcoming.length, 'mine=', mine.length, 'finished=', finished.length);
	 *
	 * // Featured tournament: pin to position 0 of the Overview/Top tabs.
	 * const featured = tournaments.find(t => t.is_featured && !t.is_cancelled);
	 * if (featured) {
	 *   console.log('[smartico] featured tournament — pin to position 0 of the Overview tab:', featured.name);
	 * }
	 *
	 * // Visitor mode: onUpdate accepted but never fires; re-poll if needed.
	 * // const visitorList = await window._smartico.vapi('EN').getTournamentsList();
	 * ```
	 */
	public async getTournamentsList({ onUpdate }: { onUpdate?: (data: TTournament[]) => void } = {}): Promise<TTournament[]> {
		if (typeof onUpdate === 'function') {
			this.onUpdateCallback.set(onUpdateContextKey.TournamentList, onUpdate);
		}

		return OCache.use(
			onUpdateContextKey.TournamentList,
			ECacheContext.WSAPI,
			() => this.api.tournamentsGetLobbyT(this.userExtId),
			CACHE_DATA_SEC,
		);
	}

	/**
	 * Returns the full detail of a single tournament instance — adds the
	 * player leaderboard, the full prize structure, and (for clan
	 * tournaments) the clan leaderboard and per-clan prize structure on
	 * top of everything already in `TTournament`. Use this to power a
	 * tournament detail / lobby screen after the user picks an item from
	 * {@link getTournamentsList}.
	 *
	 * Live leaderboard updates require manual re-fetching — there is no
	 * subscription model, no push event, and no client-side cache (each
	 * call hits the server). The default Smartico UI polls every 3 seconds
	 * while the detail view is open.
	 *
	 * @remarks
	 * **Preconditions**
	 * Pass a valid `tournamentInstanceId` read from `TTournament.instance_id`
	 * on an item returned by {@link getTournamentsList}. The method works
	 * standalone — calling `getTournamentsList()` first is not required by
	 * the SDK, but is the only stable source of valid IDs.
	 *
	 * **Refresh model**
	 * - **No subscription.** This is a one-shot promise; call again to
	 *   refresh.
	 * - **No client cache.** Every call sends a network request and
	 *   returns the latest server snapshot. Safe to poll on an interval —
	 *   the default Smartico UI uses 3 s while the detail view is visible.
	 * - **No push event** invalidates or refreshes detail state. Score
	 *   changes, registration count changes, lifecycle transitions — all
	 *   require a fresh `getTournamentInstanceInfo` call.
	 *
	 * **Returned shape — beyond `TTournament`**
	 * `TTournamentDetailed` extends `TTournament` with the following
	 * additional data: a `players[]` leaderboard sorted server-side by
	 * score (only members with at least one recorded score); the user's
	 * own `me` block carrying their rank and score (undefined when not
	 * registered or when the user has no score yet); a full per-place
	 * `prizes[]` array (place range, type, points / gems / diamonds
	 * amounts, image, name); and `related_games[]` if the operator has
	 * associated games with this tournament. For clan tournaments
	 * (`is_clan_based === true`), the response also carries
	 * `clan_leaderboard[]` (ranked clans with `total_score` and
	 * `contributing_members`), `clan_prize_structure[]` (per-clan-place
	 * prize tiers — Fixed vs Dynamic, with ScoreWeighted /
	 * EqualSplit distribution for Dynamic prizes), `user_clan_id` (the
	 * user's own clan), and the advisory `user_position_in_clan` /
	 * `user_score_in_clan` fields.
	 *
	 * **Idempotency**: safe. Read-only. Each call returns the latest
	 * server snapshot.
	 *
	 * **Side effects**: none — pure metadata read.
	 *
	 * **UI guidance**: see [UI Guide — `getTournamentInstanceInfo`](../../docs/ui/tournaments/UIGuide_getTournamentInstanceInfo.md).
	 *
	 * **Visitor mode**: not supported. Use {@link getTournamentsList} for
	 * the public lobby list in visitor mode; the detail endpoint requires
	 * an authenticated session.
	 *
	 * @param tournamentInstanceId  The `instance_id` from a `TTournament`
	 *                              returned by {@link getTournamentsList}.
	 * @returns                     Promise resolving to `TTournamentDetailed`.
	 *                              Rejects if the instance ID is invalid
	 *                              or the user lacks visibility for it.
	 *
	 * @example
	 * ```ts
	 * const tournaments = await window._smartico.api.getTournamentsList();
	 * const tournament = tournaments[0];
	 *
	 * console.log('[smartico] loading detail view for tournament', tournament.instance_id);
	 * const detail = await window._smartico.api.getTournamentInstanceInfo(tournament.instance_id);
	 *
	 * console.log('[smartico] render detail with', detail.players?.length ?? 0,
	 *   'players,', detail.prizes?.length ?? 0, 'prize tiers');
	 *
	 * if (detail.is_clan_based && detail.clan_leaderboard) {
	 *   console.log('[smartico] clan tournament — render clan leaderboard tab with',
	 *     detail.clan_leaderboard.length, 'clans');
	 *   if (detail.user_clan_id != null) {
	 *     console.log('[smartico] user belongs to clan', detail.user_clan_id,
	 *       '— highlight that row in the clan leaderboard');
	 *   }
	 * }
	 *
	 * // Live leaderboard updates — poll every 3 seconds while the detail view is open.
	 * const pollId = setInterval(async () => {
	 *   try {
	 *     const fresh = await window._smartico.api.getTournamentInstanceInfo(tournament.instance_id);
	 *     console.log('[smartico] detail refreshed — re-render player + clan leaderboards from this new snapshot:', fresh);
	 *   } catch (e) {
	 *     console.error('[smartico] tournament detail poll failed — keep showing last snapshot, retry on next tick:', e);
	 *   }
	 * }, 3_000);
	 * // clearInterval(pollId) when the detail view closes.
	 *
	 * if (detail.me) {
	 *   console.log('[smartico] current user is rank', detail.me.position,
	 *     'with', detail.me.scores, 'points — render the sticky "me" panel below the leaderboard');
	 * }
	 * ```
	 */
	public async getTournamentInstanceInfo(tournamentInstanceId: number): Promise<TTournamentDetailed> {
		return this.api.tournamentsGetInfoT(this.userExtId, tournamentInstanceId);
	}

	/**
	 * Returns the ranked players of a specific clan within a clan-based
	 * tournament instance. Used to drill down from the clan-leaderboard
	 * tab on the tournament detail view into a single clan's member
	 * roster.
	 *
	 * The server returns up to roughly 20 players (top-N by score
	 * descending). Server-side ordering is already by `scores` DESC
	 * (equivalent to `position` ASC) — no client-side re-sort is
	 * required.
	 *
	 * @remarks
	 * **Preconditions**
	 * Pass a valid `tournamentInstanceId` (read from `TTournament.instance_id`
	 * returned by {@link getTournamentsList}) and a `clanId` (read from
	 * `TTournamentDetailed.clan_leaderboard[].clan_id` returned by
	 * {@link getTournamentInstanceInfo}). The tournament should be
	 * clan-based (`is_clan_based === true`); calling this against a
	 * non-clan tournament typically returns an empty `players` array.
	 *
	 * **Refresh model**
	 * - **No subscription.** This is a one-shot promise.
	 * - **No client cache.** Every call hits the server.
	 * - **No push event** refreshes the response. Live updates to clan
	 *   member rankings require a fresh call.
	 * - The default Smartico UI fetches this once when the user opens the
	 *   clan-drill-down modal and does NOT refresh while the modal is
	 *   open. If your UI needs live updates, re-call on an interval; the
	 *   clan leaderboard at the parent level (via
	 *   {@link getTournamentInstanceInfo}) does refresh via its own
	 *   polling cadence.
	 *
	 * **Returned shape**
	 * `TClanTournamentPlayers` carries the `tournament_instance_id`
	 * alongside the `players[]` array — each entry has `position`,
	 * `scores`, `public_username`, `clean_ext_user_id`, `avatar_id`,
	 * `avatar_real_id`, the resolved `avatar_url`, `user_id`, and the
	 * `is_me` flag identifying the current user's row. The response does
	 * NOT echo the clan's identity — render the clan header from the
	 * caller-side `ClanLeaderboardEntry` object you passed in.
	 *
	 * **Username display**: prefer `clean_ext_user_id` when set, falling
	 * back to `public_username`. The default Smartico UI uses
	 * `clean_ext_user_id || public_username || ''`.
	 *
	 * **Idempotency**: safe. Read-only. Each call returns the latest
	 * server snapshot.
	 *
	 * **Side effects**: none — pure metadata read.
	 *
	 * **UI guidance**: see [UI Guide — `getClanTournamentPlayers`](../../docs/ui/tournaments/UIGuide_getClanTournamentPlayers.md).
	 *
	 * **Visitor mode**: not supported.
	 *
	 * @param tournamentInstanceId  The tournament `instance_id` from a
	 *                              clan-based `TTournament`.
	 * @param clanId                The clan ID from
	 *                              `TTournamentDetailed.clan_leaderboard[].clan_id`.
	 * @returns                     Promise resolving to
	 *                              `TClanTournamentPlayers`. An invalid
	 *                              ID combination typically yields an
	 *                              empty `players` array; the SDK does
	 *                              not distinguish "no scores yet" from
	 *                              "invalid IDs" — both manifest as an
	 *                              empty list.
	 *
	 * @example
	 * ```ts
	 * const detail = await window._smartico.api.getTournamentInstanceInfo(tournamentInstanceId);
	 * if (!detail.is_clan_based || !detail.clan_leaderboard) {
	 *   console.log('[smartico] not a clan tournament — skip clan drill-down');
	 *   return;
	 * }
	 *
	 * // User clicked a clan row in the leaderboard.
	 * const clickedClan = detail.clan_leaderboard[0];
	 *
	 * console.log('[smartico] opening clan drill-down — show modal skeleton while loading');
	 * const result = await window._smartico.api.getClanTournamentPlayers(
	 *   tournamentInstanceId,
	 *   clickedClan.clan_id,
	 * );
	 *
	 * if (result.players.length === 0) {
	 *   console.log('[smartico] clan has no ranked players yet — render empty state ("No leaders yet")');
	 * } else {
	 *   console.log('[smartico] render clan member rows with .is-me highlight on the current user;',
	 *     result.players.length, 'players ranked');
	 *   const me = result.players.find(p => p.is_me);
	 *   if (me) {
	 *     console.log('[smartico] current user rank in this clan:', me.position, 'score:', me.scores);
	 *   }
	 * }
	 * ```
	 */
	public async getClanTournamentPlayers(tournamentInstanceId: number, clanId: number): Promise<TClanTournamentPlayers> {
		return this.api.clanTournamentGetPlayers(this.userExtId, tournamentInstanceId, clanId);
	}

	/**
	 * Registers the authenticated user in the specified tournament instance.
	 * For tournaments with a buy-in cost, the user's balance is debited
	 * synchronously before the response is returned; for free tournaments
	 * the call is a simple membership add.
	 *
	 * A successful response (`err_code === 0`) means the registration row
	 * exists server-side, the buy-in (if any) has been deducted, and the
	 * SDK has already triggered a refresh of the tournament lobby cache.
	 *
	 * @remarks
	 * **Preconditions**
	 * Read the candidate from {@link getTournamentsList} and gate the call
	 * on `is_can_register === true`. This composite flag already encodes:
	 * not already registered, slot available
	 * (`registration_count < players_max_count`), tournament status is
	 * REGISTER (or STARTED with late-registration enabled), and the
	 * registration type is not AUTO. The SDK forwards the call
	 * unconditionally — calling without satisfying these will return one
	 * of the error codes below.
	 *
	 * For clan tournaments (`is_clan_based === true`), the user must
	 * already belong to a clan before calling. If they don't, prompt them
	 * to pick a clan first via `joinClan`, then call
	 * `registerInTournament` after the clan-join resolves. See "Error
	 * codes" `1010` below for the server-side safety net.
	 *
	 * **Error codes** (in `err_code`, typed as {@link TournamentRegistrationError})
	 * - `0` — success; the registration is persisted, buy-in deducted,
	 *   tournament lobby refresh fires.
	 * - `1010` — `TOURNAMENT_USER_CANNOT_JOIN_WITHOUT_CLAN`: clan-based
	 *   tournament and the user has no clan. Surface the clan-pick flow
	 *   (e.g. open a clan-pick modal driven by `getClans` +
	 *   `joinClan`), then retry registration.
	 * - `30001` — `TOURNAMENT_INSTANCE_NOT_FOUND`: instance ID is invalid
	 *   or the tournament was deleted. Refresh the lobby via
	 *   `getTournamentsList()` and hide the entry from the UI.
	 * - `30002` — `TOURNAMENT_REGISTRATION_NOT_ENOUGH_POINTS`: insufficient
	 *   points balance for a points-cost tournament. Show an
	 *   insufficient-balance UI naming the deficit.
	 * - `30003` — `TOURNAMENT_INSTANCE_NOT_IN_STATE`: tournament is no
	 *   longer in a registerable state (finished, cancelled, finalizing,
	 *   or not yet published with late registration disabled). Refresh
	 *   the lobby; the button should hide.
	 * - `30004` — `TOURNAMENT_ALREADY_REGISTERED`: user is already
	 *   registered. Treat as idempotent success — hide the Register button
	 *   and refresh the lobby. Usually indicates a stale local state
	 *   (e.g. registered from another tab).
	 * - `30005` — `TOURNAMENT_USER_DONT_MATCH_CONDITIONS`: user fails the
	 *   tournament's segment / entry conditions. Prefer
	 *   `tournament.segment_dont_match_message` (operator-supplied) over
	 *   `err_message` when both are available.
	 * - `30006` — `TOURNAMENT_USER_NOT_REGISTERED`: anomalous on a fresh
	 *   register call; usually indicates a server-side race. Treat as a
	 *   generic transient error.
	 * - `30007` — `TOURNAMENT_CANT_CHANGE_REGISTRATION_STATUS`: status
	 *   transition not allowed (e.g. re-registering after a finished /
	 *   cancelled tournament). Show a generic error; do not retry.
	 * - `30008` — `TOURNAMENT_MAX_REGISTRATIONS_REACHED`: the tournament
	 *   filled up between the lobby fetch and the registration click.
	 *   Refresh the lobby — the button will hide on the refreshed item.
	 * - `300010` — insufficient **gems** balance (gems-cost tournament).
	 *   Same UI handling as `30002` but for the gems currency.
	 * - `300011` — insufficient **diamonds** balance (diamonds-cost
	 *   tournament). Same as `300010` but for diamonds. 
	 * - other non-zero — generic server error. Surface `err_message` if any.
	 *
	 * Note: clan-tournament registration can occasionally surface error
	 * codes from the clan-join domain (e.g. `1011` — joined-after-start)
	 * via the same response path. These are members of `JoinClanErrorCode`,
	 * not `TournamentRegistrationError`. Branch on the numeric value.
	 *
	 * **Idempotency**: NOT idempotent. A second call on the same instance
	 * returns `30004` once the first call has succeeded. The SDK does NOT
	 * enforce an in-flight lock. The consumer MUST guard the call site
	 * against double-clicks (set a local "registering" flag on click, clear
	 * it on response).
	 *
	 * **Refresh after success (and after failure)**
	 * The SDK automatically refreshes the tournament lobby cache on every
	 * response (success OR error) and fires any `onUpdate` callback
	 * registered via `getTournamentsList({ onUpdate })`. After
	 * `err_code === 0`, the affected item's `is_user_registered` /
	 * `registration_status` / `registration_count` reflect the new
	 * registered state on the refreshed array. Note that
	 * {@link getTournamentInstanceInfo} is NOT auto-refreshed — if the
	 * detail screen is open, call it again manually.
	 *
	 * The user's balance (points / gems / diamonds) is exposed on the
	 * user-properties channel and updates independently of this call's
	 * response — subscribe to user-property updates separately if your UI
	 * shows the balance.
	 *
	 * **Side effects** (consumer-observable on success)
	 * - Balance debited synchronously by the buy-in amount in the
	 *   tournament's currency (`registration_cost_points`,
	 *   `registration_cost_gems`, or `registration_cost_diamonds`). For
	 *   free tournaments no deduction occurs.
	 * - Server-side analytics events fire downstream
	 *   (`tournament_user_registered` for immediate-registration types;
	 *   `tournament_user_registration_pending` or
	 *   `tournament_registered_pending_qualification` for
	 *   manual-approval / qualification-based types).
	 * - Any operator-configured on-join prizes are distributed (e.g.
	 *   welcome bonus). These surface via the relevant follow-up channels
	 *   (e.g. {@link getBonuses}).
	 *
	 * **UI guidance**: see [UI Guide — `registerInTournament`](../../docs/ui/tournaments/UIGuide_registerInTournament.md).
	 *
	 * **Visitor mode**: not supported. Calling from a visitor session
	 * returns a generic error, not a typed `TournamentRegistrationError`.
	 *
	 * @param tournamentInstanceId  The `instance_id` from `TTournament`
	 *                              (NOT the template `tournament_id`).
	 * @returns `{ err_code, err_message }`; success when `err_code === 0`
	 *          (or `30004` when treated as idempotent no-op).
	 *
	 * @example
	 * ```ts
	 * const tournaments = await window._smartico.api.getTournamentsList({
	 *   onUpdate: (refreshed) => console.log('[smartico] tournament list updated — re-render lobby from this array', refreshed),
	 * });
	 * const tournament = tournaments.find(t => t.instance_id === instanceId);
	 *
	 * if (!tournament) {
	 *   console.log('[smartico] tournament not in current lobby — refresh getTournamentsList and retry');
	 *   return;
	 * }
	 * if (!tournament.is_can_register) {
	 *   console.log('[smartico] tournament not currently registerable — keep CTA disabled');
	 *   return;
	 * }
	 *
	 * // Clan tournament + user has no clan → resolve clan first.
	 * if (tournament.is_clan_based) {
	 *   const userProfile = window._smartico.api.getUserProfile();
	 *   const userClanId = userProfile?.clan_id;
	 *   if (userClanId == null) {
	 *     console.log('[smartico] clan tournament — open the clan-pick modal first; after joinClan resolves, call registerInTournament again');
	 *     return;
	 *   }
	 * }
	 *
	 * console.log('[smartico] registration starting — set in-flight flag, show loading dots on the Join button, keep modal open');
	 * const r = await window._smartico.api.registerInTournament(tournament.instance_id);
	 * console.log('[smartico] registration response received — clear in-flight flag');
	 *
	 * if (r.err_code === 0 || r.err_code === 30004) {
	 *   console.log('[smartico] registered (or was already) — close any modal, show a success toast; getTournamentsList onUpdate above will fire with the refreshed array');
	 * } else if (r.err_code === 1010) {
	 *   console.log('[smartico] clan required — open the clan-pick modal again (this is the server-side safety net for a clan-leave race)');
	 * } else if (r.err_code === 30002) {
	 *   console.error('[smartico] insufficient points — show insufficient-balance UI; deficit:', tournament.registration_cost_points);
	 * } else if (r.err_code === 300010) {
	 *   console.error('[smartico] insufficient gems — show insufficient-balance UI; deficit:', tournament.registration_cost_gems);
	 * } else if (r.err_code === 300011) {
	 *   console.error('[smartico] insufficient diamonds — show insufficient-balance UI; deficit:', tournament.registration_cost_diamonds);
	 * } else if (r.err_code === 30005) {
	 *   console.error('[smartico] segment mismatch — prefer the operator-supplied message:', tournament.segment_dont_match_message || r.err_message);
	 * } else if (r.err_code === 30008) {
	 *   console.error('[smartico] tournament full — auto-refresh will hide the button on the refreshed lobby item');
	 * } else {
	 *   console.error('[smartico] registration failed — show a generic error toast with this message:', r.err_message);
	 * }
	 * ```
	 */
	public async registerInTournament(tournamentInstanceId: number): Promise<TTournamentRegistrationResult> {
		const r = await this.api.registerInTournament(this.userExtId, tournamentInstanceId);

		const o: TTournamentRegistrationResult = {
			err_code: r.errCode,
			err_message: r.errMsg,
		};

		return o;
	}

	protected async updateTournaments() {
		const payload = await this.api.tournamentsGetLobbyT(this.userExtId);
		this.updateEntity(onUpdateContextKey.TournamentList, payload);
	}
}
