import { GamePickGameInfo, GamePickRequestParams, GamePickRound, GamePickRoundBoard, GamePickRoundRequestParams, GamePickUserInfo, GamesApiResponse } from '../GamePick';
import { WSAPIAvatars } from './WSAPIAvatars';

/** @group GamePick */
export class WSAPIGamePick extends WSAPIAvatars {
	/**
	 * Returns every open round for a MatchX or Quiz game template, with the full
	 * event list (matches / questions) and the current user's selections per event.
	 *
	 * Use to power the rounds-lobby screen — typically a list of round cards a user
	 * can tap into to make predictions. For a single round, use
	 * {@link gamePickGetActiveRound} (lighter payload when only one round is shown).
	 *
	 * @remarks
	 * **Preconditions**
	 * - User must be authenticated.
	 * - `saw_template_id` must reference a MatchX or Quiz game template. The SDK
	 *   throws synchronously if it's missing.
	 *
	 * **Transport**
	 * Game Pick methods are HTTP REST calls to a separate Game Pick games server
	 * (not the main WebSocket). One consequence: there is no SDK cache and no push
	 * subscription — every call is a fresh server roundtrip.
	 *
	 * **Round status**
	 * Each round's `round_status_id` is a {@link GPRoundStatus} value. Rounds with
	 * status `NoEventsDefined` (1) are filtered out server-side and never appear
	 * here. Other values: `Other` (-1, normally open), `NoMoreBetsAllowed` (2),
	 * `AllEventsResolved_ButNotRound` (3), `RoundResolved` (4 — appears here only
	 * briefly during transition; use {@link gamePickGetHistory} for resolved rounds).
	 *
	 * **Error codes** (in `errCode`)
	 * - `0` — success.
	 * - `100002` — template not found (the `saw_template_id` doesn't reference a
	 *   MatchX/Quiz game).
	 * - `100003` — no open rounds available for this template right now.
	 * - `100000` — auth hash invalid; SDK session needs re-initialization.
	 * - `100004` — generic server error.
	 *
	 * **Refresh**
	 * - No cache; every call is live.
	 * - No push subscription. Poll while the user is on the screen if you need
	 *   live round-status changes (typically every 30–60 s is enough).
	 *
	 * **Visitor mode**: not supported. The SDK throws synchronously on visitor
	 * sessions.
	 *
	 * **UI guidance**: see [UI Guide — `gamePickGetActiveRounds`](../../docs/ui/gamepick/UIGuide_gamePickGetActiveRounds.md).
	 *
	 * @param props.saw_template_id  ID of the MatchX or Quiz game template.
	 * @returns Wrapped {@link GamesApiResponse} of {@link GamePickRound} array.
	 *
	 * @example
	 * ```ts
	 * const r = await window._smartico.api.gamePickGetActiveRounds({ saw_template_id: 1083 });
	 *
	 * if (r.errCode !== 0) {
	 *     console.error('[smartico] active rounds fetch failed — show empty rounds lobby:', r.errMessage);
	 *     return;
	 * }
	 *
	 * for (const round of r.data ?? []) {
	 *     console.log('[smartico] render a round card:', round.round_name, '— events:', round.events.length, 'user has placed bet:', round.user_placed_bet);
	 * }
	 * ```
	 */
	public async gamePickGetActiveRounds(props: GamePickRequestParams): Promise<GamesApiResponse<GamePickRound[]>> {
		if (!props.saw_template_id) {
			throw new Error('saw_template_id is required');
		}
		return this.api.gpGetActiveRounds(props.saw_template_id);
	}

	/**
	 * Returns a single round (events, user selections, scoring rules) for a
	 * MatchX or Quiz game. Use to power the round-detail / prediction-input
	 * screen the user lands on after picking a round from the lobby.
	 *
	 * Same shape as one entry of {@link gamePickGetActiveRounds}; cheaper when the
	 * UI only shows one round at a time.
	 *
	 * @remarks
	 * **Preconditions**
	 * - User must be authenticated. Visitor mode not supported.
	 * - `saw_template_id` and `round_id` are mandatory — the SDK throws if either
	 *   is missing.
	 *
	 * **Error codes** (in `errCode`)
	 * - `0` — success.
	 * - `4` — round / event not found (e.g. round resolved after the last
	 *   `gamePickGetActiveRounds` poll); non-fatal — retry after a fresh active-
	 *   rounds fetch.
	 * - `100002` — template not found.
	 * - `100000` — auth hash invalid.
	 * - `100004` — generic server error.
	 *
	 * **Refresh**
	 * - No cache; every call is live.
	 * - Re-call after {@link gamePickSubmitSelection} or
	 *   {@link gamePickSubmitSelectionQuiz} to surface the persisted predictions.
	 * - Poll while the user is on the prediction screen if event resolution
	 *   updates are needed (typically every 30–60 s).
	 *
	 * **Visitor mode**: not supported.
	 *
	 * **UI guidance**: see [UI Guide — `gamePickGetActiveRound`](../../docs/ui/gamepick/UIGuide_gamePickGetActiveRound.md).
	 *
	 * @param props.saw_template_id  ID of the MatchX or Quiz game template.
	 * @param props.round_id         ID of the round to fetch.
	 * @returns Wrapped {@link GamesApiResponse} of a single {@link GamePickRound}.
	 *
	 * @example
	 * ```ts
	 * const r = await window._smartico.api.gamePickGetActiveRound({
	 *     saw_template_id: 1083,
	 *     round_id:        31652,
	 * });
	 *
	 * if (r.errCode === 0 && r.data) {
	 *     console.log('[smartico] render round detail page —', r.data.round_name, '— user has placed bet:', r.data.user_placed_bet, 'score so far:', r.data.user_score);
	 * } else {
	 *     console.error('[smartico] round fetch failed — bounce back to the lobby and refresh:', r.errMessage);
	 * }
	 * ```
	 */
	public async gamePickGetActiveRound(props: GamePickRoundRequestParams): Promise<GamesApiResponse<GamePickRound>> {
		if (!props.saw_template_id) {
			throw new Error('saw_template_id is required');
		}
		if (!props.round_id) {
			throw new Error('round_id is required');
		}
		return this.api.gpGetActiveRound(props.saw_template_id, props.round_id);
	}

	/**
	 * Returns the full round history (active + resolved) for a MatchX or Quiz game
	 * template, newest-first. Each round carries the user's predictions plus the
	 * server-resolved outcome on each event.
	 *
	 * Use to power a "Past predictions" / history tab. For just the open rounds,
	 * use {@link gamePickGetActiveRounds} (faster — skips resolved data).
	 *
	 * @remarks
	 * **Preconditions**
	 * - User must be authenticated. Visitor mode not supported.
	 *
	 * **Sort order**
	 * Server returns rounds newest-first. No client-side sort needed.
	 *
	 * **Per-event resolution**
	 * Each event in the rounds carries `resolution_type_id` — values are from
	 * {@link GamePickResolutionType}: `None` (0, not yet resolved), `Lost` (2),
	 * `PartialWin` (3), `FullWin` (4). Use these to render result badges on
	 * each event row.
	 *
	 * **Error codes** (in `errCode`)
	 * - `0` — success.
	 * - `100002` — template not found.
	 * - `100000` — auth hash invalid.
	 * - `100004` — generic server error.
	 *
	 * **Refresh**
	 * - No cache.
	 * - No push subscription. Re-call when the user opens the history tab.
	 *
	 * **Visitor mode**: not supported.
	 *
	 * **UI guidance**: see [UI Guide — `gamePickGetHistory`](../../docs/ui/gamepick/UIGuide_gamePickGetHistory.md).
	 *
	 * @param props.saw_template_id  ID of the MatchX or Quiz game template.
	 * @returns Wrapped {@link GamesApiResponse} of {@link GamePickRound} array,
	 * newest-first.
	 *
	 * @example
	 * ```ts
	 * const r = await window._smartico.api.gamePickGetHistory({ saw_template_id: 1083 });
	 *
	 * for (const round of r.data ?? []) {
	 *     console.log('[smartico] history row —', round.round_name, 'score:', round.user_score, 'resolved:', round.is_resolved);
	 * }
	 * ```
	 */
	public async gamePickGetHistory(props: GamePickRequestParams): Promise<GamesApiResponse<GamePickRound[]>> {
		if (!props.saw_template_id) {
			throw new Error('saw_template_id is required');
		}
		return this.api.gpGetGamesHistory(props.saw_template_id);
	}

	/**
	 * Returns the leaderboard for a MatchX or Quiz game round — ranked list of
	 * players plus the current user's entry (`my_user`). Pass `round_id: -1` for
	 * the season / overall leaderboard across every round in the template.
	 *
	 * @remarks
	 * **Preconditions**
	 * - User must be authenticated. Visitor mode not supported.
	 *
	 * **`round_id` semantics**
	 * - Positive `round_id` — per-round leaderboard scoped to that round's events.
	 * - `-1` — season / overall leaderboard aggregating scores across every round
	 *   of the template.
	 *
	 * **`my_user`**
	 * The current user's entry is returned separately from the `users[]` array
	 * — `my_user` may be `null` if the user has never made a prediction on this
	 * round / template. Use it to render the user's rank in a sticky footer or
	 * "you are here" highlight regardless of pagination.
	 *
	 * **Username masking**
	 * `public_username` on other players may be masked / anonymized by operator
	 * label settings. Always pair with `avatar_url` so the user can recognize
	 * themselves in the ranking by avatar even when usernames are hidden.
	 *
	 * **Error codes** (in `errCode`)
	 * - `0` — success.
	 * - `100002` — template not found.
	 * - `100000` — auth hash invalid.
	 * - `100004` — generic server error.
	 *
	 * **Refresh**
	 * - No cache.
	 * - No push subscription. Poll while the leaderboard is visible
	 *   (every 30–60 s) if you want live rank updates after match
	 *   resolution.
	 *
	 * **Visitor mode**: not supported.
	 *
	 * **UI guidance**: see [UI Guide — `gamePickGetBoard`](../../docs/ui/gamepick/UIGuide_gamePickGetBoard.md).
	 *
	 * @param props.saw_template_id  ID of the MatchX or Quiz game template.
	 * @param props.round_id         Round ID, or `-1` for the season leaderboard.
	 * @returns Wrapped {@link GamesApiResponse} of {@link GamePickRoundBoard}.
	 *
	 * @example
	 * ```ts
	 * const r = await window._smartico.api.gamePickGetBoard({
	 *     saw_template_id: 1083,
	 *     round_id:        -1, // season leaderboard
	 * });
	 *
	 * if (r.errCode === 0 && r.data) {
	 *     console.log('[smartico] render leaderboard rows for top', r.data.users.length, 'players');
	 *     if (r.data.my_user) {
	 *         console.log('[smartico] pin "you are rank #' + r.data.my_user.gp_position + '" footer to bottom');
	 *     } else {
	 *         console.log('[smartico] user not ranked — render "Play a round to join the leaderboard" CTA');
	 *     }
	 * }
	 * ```
	 */
	public async gamePickGetBoard(props: GamePickRoundRequestParams): Promise<GamesApiResponse<GamePickRoundBoard>> {
		if (!props.saw_template_id) {
			throw new Error('saw_template_id is required');
		}
		if (!props.round_id) {
			throw new Error('round_id is required');
		}
		return this.api.gpGetGameBoard(props.saw_template_id, props.round_id);
	}

	/**
	 * Submits all score predictions for a round in a MatchX game in one shot.
	 * Each event in the round must carry `team1_user_selection` and
	 * `team2_user_selection` (the predicted scores).
	 *
	 * On the user's FIRST submit for a round, the server charges one buy-in (one
	 * "spin" / one currency deduction based on the template's `saw_buyin_type_id`).
	 * Subsequent edits within the same round are free and only persist changed
	 * selections.
	 *
	 * @remarks
	 * **Preconditions**
	 * - User must be authenticated. Visitor mode not supported.
	 * - `saw_template_id` and `props.round.round_id` are mandatory — SDK throws if
	 *   either is missing.
	 * - Each event passed must include `gp_event_id` and the two
	 *   `team{1,2}_user_selection` fields. Missing events default to "no change".
	 *
	 * **Error codes** (in `errCode`)
	 * - `0` — success; the response `data` is the updated round with
	 *   `user_placed_bet === true` and `has_not_submitted_changes === false`.
	 * - `3` (`NoBetsUpdatedOnSubmit`) — submit produced no changes, OR every event
	 *   is past its `last_bet_date` deadline. The buy-in is NOT consumed; the
	 *   current round is still returned in `data`.
	 * - `4` — round / event not found; refresh state and retry.
	 * - `100002` — template not found.
	 * - `100000` — auth hash invalid.
	 * - `100004` — generic server error.
	 *
	 * Buy-in failures pass through the {@link SAWSpinErrorCode} values on first
	 * submit:
	 * - `40001` — no spins left (when `saw_buyin_type_id` is Spins).
	 * - `40003` — insufficient points.
	 * - `40004` — global max-spins cap hit.
	 * - `40007` — template outside its active date window.
	 * - `40009` — user excluded by segment rule.
	 * - `40011` — insufficient gems.
	 * - `40012` — insufficient diamonds.
	 *
	 * **Idempotency**
	 * Re-submitting identical selections returns `errCode: 3` (no changes); the
	 * buy-in is consumed exactly once per round-per-user. Re-submitting after
	 * `last_bet_date` also returns `errCode: 3` without consuming the buy-in.
	 *
	 * **Side effects**
	 * - First successful submit deducts the buy-in (Points / Gems / Diamonds /
	 *   one Spin) per `saw_buyin_type_id`.
	 * - Records the user's participation against the round and its events
	 *   server-side and reports a prediction event to the operator's activity
	 *   stream.
	 * - Score is awarded after the operator resolves the round
	 *   ({@link GPRoundStatus} = `RoundResolved`).
	 *
	 * **Visitor mode**: not supported.
	 *
	 * **UI guidance**: see [UI Guide — `gamePickSubmitSelection`](../../docs/ui/gamepick/UIGuide_gamePickSubmitSelection.md).
	 *
	 * @param props.saw_template_id  ID of the MatchX game template.
	 * @param props.round            Round object with `round_id` + `events[]`
	 *                                carrying the user's score predictions.
	 * @returns Wrapped {@link GamesApiResponse} with the updated round.
	 *
	 * @example
	 * ```ts
	 * const ar = await window._smartico.api.gamePickGetActiveRound({
	 *     saw_template_id: 1190,
	 *     round_id:        38665,
	 * });
	 * if (ar.errCode !== 0 || !ar.data) {
	 *     console.error('[smartico] could not fetch round to submit — show error and bounce back');
	 *     return;
	 * }
	 *
	 * const round = ar.data;
	 * round.events = round.events.map(e => ({
	 *     gp_event_id:          e.gp_event_id,
	 *     team1_user_selection: 1,
	 *     team2_user_selection: 0,
	 * }));
	 *
	 * const r = await window._smartico.api.gamePickSubmitSelection({
	 *     saw_template_id: 1190,
	 *     round,
	 * });
	 *
	 * switch (r.errCode) {
	 *     case 0:
	 *         console.log('[smartico] predictions saved — show confirmation, refresh leaderboard');
	 *         break;
	 *     case 3:
	 *         console.log('[smartico] nothing changed (or all events closed) — silent no-op');
	 *         break;
	 *     case 40001:
	 *     case 40003:
	 *     case 40011:
	 *     case 40012:
	 *         console.error('[smartico] insufficient balance / spins — show top-up CTA:', r.errMessage);
	 *         break;
	 *     default:
	 *         console.error('[smartico] submit failed — show generic error toast:', r.errMessage);
	 * }
	 * ```
	 */
	public async gamePickSubmitSelection(props: GamePickRequestParams & { round: Partial<GamePickRound> }): Promise<GamesApiResponse<GamePickRound>> {
		if (!props.saw_template_id) {
			throw new Error('saw_template_id is required');
		}
		if (!props.round?.round_id) {
			throw new Error('round is required');
		}
		return this.api.gpSubmitSelection(props.saw_template_id, props.round, false);
	}

	/**
	 * Submits all quiz answers for a round in one shot. Each event in the round
	 * must carry `user_selection` (the answer value — typically `"1"` / `"2"` /
	 * `"x"` for 1×2 markets, `"yes"` / `"no"` for binary markets, or any
	 * operator-defined string for custom markets).
	 *
	 * Same first-submit buy-in behavior as {@link gamePickSubmitSelection} — one
	 * buy-in is charged on the first successful submit; subsequent edits within
	 * the same round are free.
	 *
	 * @remarks
	 * **Preconditions**
	 * - User must be authenticated. Visitor mode not supported.
	 * - `saw_template_id` and `props.round.round_id` are mandatory — SDK throws if
	 *   either is missing.
	 * - Each event must include `gp_event_id` and `user_selection`. Missing
	 *   events default to "no change".
	 *
	 * **Error codes** (in `errCode`)
	 * - `0` — success.
	 * - `3` (`NoBetsUpdatedOnSubmit`) — no changes, OR every event past
	 *   `last_bet_date`. Buy-in NOT consumed; current round returned in `data`.
	 * - `4` — round / event not found.
	 * - `100002` — template not found.
	 * - `100000` — auth hash invalid.
	 * - `100004` — generic server error.
	 *
	 * Buy-in failures use the same {@link SAWSpinErrorCode} pass-through values
	 * as {@link gamePickSubmitSelection} — see that method's TSDoc for the
	 * `40001` / `40003` / `40004` / `40007` / `40009` / `40011` / `40012`
	 * semantics.
	 *
	 * **Idempotency**: identical to {@link gamePickSubmitSelection} — re-submit
	 * returns `errCode: 3` and never double-charges the buy-in.
	 *
	 * **Side effects**: identical to {@link gamePickSubmitSelection} — buy-in
	 * deduction on first submit, participation recorded, score awarded on round
	 * resolution.
	 *
	 * **Visitor mode**: not supported.
	 *
	 * **UI guidance**: see [UI Guide — `gamePickSubmitSelectionQuiz`](../../docs/ui/gamepick/UIGuide_gamePickSubmitSelectionQuiz.md).
	 *
	 * @param props.saw_template_id  ID of the Quiz game template.
	 * @param props.round            Round object with `round_id` + `events[]`
	 *                                carrying the user's answer selections.
	 * @returns Wrapped {@link GamesApiResponse} with the updated round.
	 *
	 * @example
	 * ```ts
	 * const ar = await window._smartico.api.gamePickGetActiveRound({
	 *     saw_template_id: 1183,
	 *     round_id:        37974,
	 * });
	 * if (ar.errCode !== 0 || !ar.data) {
	 *     console.error('[smartico] could not fetch round to submit answers — show error');
	 *     return;
	 * }
	 *
	 * const round = ar.data;
	 * round.events = round.events.map(e => ({
	 *     gp_event_id:    e.gp_event_id,
	 *     user_selection: 'x',
	 * }));
	 *
	 * const r = await window._smartico.api.gamePickSubmitSelectionQuiz({
	 *     saw_template_id: 1183,
	 *     round,
	 * });
	 *
	 * if (r.errCode === 0) {
	 *     console.log('[smartico] quiz answers saved — show confirmation');
	 * } else if (r.errCode === 3) {
	 *     console.log('[smartico] nothing changed — silent no-op');
	 * } else {
	 *     console.error('[smartico] quiz submit failed:', r.errMessage);
	 * }
	 * ```
	 */
	public async gamePickSubmitSelectionQuiz(props: GamePickRequestParams & { round: Partial<GamePickRound> }): Promise<GamesApiResponse<GamePickRound>> {
		if (!props.saw_template_id) {
			throw new Error('saw_template_id is required');
		}
		if (!props.round?.round_id) {
			throw new Error('round is required');
		}
		return this.api.gpSubmitSelection(props.saw_template_id, props.round, true);
	}

	/**
	 * Returns the current user's profile within the Game Pick system — display
	 * name, avatar, balances, and last wallet-sync timestamp. The Game Pick server
	 * maintains its own user record that mirrors the user's Smartico balances; the
	 * mirror is updated at most once per minute, so `last_wallet_sync_time` tells
	 * the consumer how stale the balances on the response are.
	 *
	 * On the user's first call for a given game, the Game Pick server lazily
	 * provisions a user record — so this method doubles as a "register the user
	 * with this game" call.
	 *
	 * @remarks
	 * **Preconditions**
	 * - User must be authenticated. Visitor mode not supported.
	 *
	 * **Balance freshness**
	 * The balances returned here are the cached mirror — at most ~1 minute stale.
	 * For an up-to-the-second view of Points / Gems / Diamonds, read from
	 * {@link getUserProfile} instead. Use this method's balances only for
	 * in-Game-Pick display.
	 *
	 * **Error codes** (in `errCode`)
	 * - `0` — success.
	 * - `100002` — template not found.
	 * - `100000` — auth hash invalid.
	 * - `100004` — generic server error.
	 *
	 * **Refresh**
	 * - No cache. Server-side mirror refreshes at most every 60 s.
	 * - No push subscription.
	 *
	 * **Visitor mode**: not supported.
	 *
	 * **UI guidance**: see [UI Guide — `gamePickGetUserInfo`](../../docs/ui/gamepick/UIGuide_gamePickGetUserInfo.md).
	 *
	 * @param props.saw_template_id  ID of the MatchX or Quiz game template.
	 * @returns Wrapped {@link GamesApiResponse} of {@link GamePickUserInfo}.
	 *
	 * @example
	 * ```ts
	 * const r = await window._smartico.api.gamePickGetUserInfo({ saw_template_id: 1083 });
	 *
	 * if (r.errCode === 0 && r.data) {
	 *     console.log('[smartico] render Game Pick header — name:', r.data.public_username, '— points:', r.data.ach_points_balance, '— synced:', r.data.last_wallet_sync_time);
	 * }
	 * ```
	 */
	public async gamePickGetUserInfo(props: GamePickRequestParams): Promise<GamesApiResponse<GamePickUserInfo>> {
		if (!props.saw_template_id) {
			throw new Error('saw_template_id is required');
		}
		return this.api.gpGetUserInfo(props.saw_template_id);
	}

	/**
	 * Returns the game template configuration plus a metadata listing of every
	 * round (without events). Use to power the game's welcome / lobby screen —
	 * shows the template name, buy-in cost, the user's remaining attempts, and
	 * the full round list.
	 *
	 * The `allRounds[]` here is a lightweight metadata-only view — to render
	 * predictions or leaderboards, call {@link gamePickGetActiveRound} /
	 * {@link gamePickGetActiveRounds} / {@link gamePickGetBoard} for the rounds
	 * the user actually opens.
	 *
	 * @remarks
	 * **Preconditions**
	 * - User must be authenticated. Visitor mode not supported.
	 *
	 * **Buy-in semantics**
	 * The `sawTemplate.saw_buyin_type_id` value determines which currency is
	 * deducted on the user's first prediction in any round:
	 * - Free — no deduction.
	 * - Points — `buyin_cost_points` deducted from the user's points balance.
	 * - Gems — deducted from the user's gems balance.
	 * - Diamonds — deducted from the user's diamonds balance.
	 * - Spins — one spin counted from `spin_count`.
	 *
	 * **Error codes** (in `errCode`)
	 * - `0` — success.
	 * - `100002` — template not found.
	 * - `100000` — auth hash invalid.
	 * - `100004` — generic server error.
	 *
	 * **Refresh**
	 * - No cache.
	 * - No push subscription. Re-call after a successful
	 *   {@link gamePickSubmitSelection} to refresh `spin_count`.
	 *
	 * **Visitor mode**: not supported.
	 *
	 * **UI guidance**: see [UI Guide — `gamePickGetGameInfo`](../../docs/ui/gamepick/UIGuide_gamePickGetGameInfo.md).
	 *
	 * @param props.saw_template_id  ID of the MatchX or Quiz game template.
	 * @returns Wrapped {@link GamesApiResponse} of {@link GamePickGameInfo}.
	 *
	 * @example
	 * ```ts
	 * const r = await window._smartico.api.gamePickGetGameInfo({ saw_template_id: 1189 });
	 *
	 * if (r.errCode === 0 && r.data) {
	 *     console.log('[smartico] render Game Pick lobby — title:', r.data.sawTemplate.saw_template_ui_definition.name);
	 *     console.log('[smartico] rounds available:', r.data.allRounds.length, '— buy-in type:', r.data.sawTemplate.saw_buyin_type_id, 'cost:', r.data.sawTemplate.buyin_cost_points);
	 * }
	 * ```
	 */
	public async gamePickGetGameInfo(props: GamePickRequestParams): Promise<GamesApiResponse<GamePickGameInfo>> {
		if (!props.saw_template_id) {
			throw new Error('saw_template_id is required');
		}
		return this.api.gpGetGameInfo(props.saw_template_id);
	}

	/**
	 * Returns a round with another player's predictions instead of the current
	 * user's. The target player is identified by `int_user_id` (the Game Pick
	 * system's internal user ID, obtained from {@link gamePickGetBoard}'s
	 * `users[].int_user_id`).
	 *
	 * Use to power "view this player's picks" affordances opened from leaderboard
	 * rows — community / social inspection of how a top-ranked user predicted.
	 *
	 * @remarks
	 * **Preconditions**
	 * - User must be authenticated. Visitor mode not supported.
	 * - `saw_template_id`, `round_id`, and `int_user_id` are all mandatory — SDK
	 *   throws synchronously if any is missing.
	 * - `int_user_id` must come from a leaderboard fetch in the same game
	 *   template; it is stable within a template but not portable across
	 *   templates.
	 *
	 * **Shape vs `gamePickGetActiveRound`**
	 * Same {@link GamePickRound} structure, but `user_selection` /
	 * `team1_user_selection` / `team2_user_selection` reflect the TARGET user's
	 * predictions instead of the caller's. Each event still carries its own
	 * `resolution_type_id` (see {@link GamePickResolutionType}) so the UI can
	 * render result badges per pick.
	 *
	 * **Error codes** (in `errCode`)
	 * - `0` — success.
	 * - `4` — round / event / user not found.
	 * - `100002` — template not found.
	 * - `100000` — auth hash invalid.
	 * - `100004` — generic server error.
	 *
	 * **Refresh**
	 * - No cache. Re-call when opening a different leaderboard row's
	 *   "view picks" modal.
	 * - No push subscription.
	 *
	 * **Visitor mode**: not supported.
	 *
	 * **UI guidance**: see [UI Guide — `gamePickGetRoundInfoForUser`](../../docs/ui/gamepick/UIGuide_gamePickGetRoundInfoForUser.md).
	 *
	 * @param props.saw_template_id  ID of the MatchX or Quiz game template.
	 * @param props.round_id         ID of the round to inspect.
	 * @param props.int_user_id      Internal user ID from
	 *                                `gamePickGetBoard.users[].int_user_id`.
	 * @returns Wrapped {@link GamesApiResponse} with the target user's
	 * {@link GamePickRound}.
	 *
	 * @example
	 * ```ts
	 * const board = await window._smartico.api.gamePickGetBoard({
	 *     saw_template_id: 1083, round_id: 31652,
	 * });
	 * const topPlayer = board.data?.users?.[0];
	 * if (!topPlayer) return;
	 *
	 * const r = await window._smartico.api.gamePickGetRoundInfoForUser({
	 *     saw_template_id: 1083,
	 *     round_id:        31652,
	 *     int_user_id:     topPlayer.int_user_id,
	 * });
	 *
	 * if (r.errCode === 0 && r.data) {
	 *     for (const ev of r.data.events) {
	 *         console.log('[smartico] render row —', ev.event_meta.team1_name, 'vs', ev.event_meta.team2_name, '— picked:', ev.user_selection, '— resolution:', ev.resolution_type_id);
	 *     }
	 * }
	 * ```
	 */
	public async gamePickGetRoundInfoForUser(props: GamePickRoundRequestParams & { int_user_id: number }): Promise<GamesApiResponse<GamePickRound>> {
		if (!props.saw_template_id) {
			throw new Error('saw_template_id is required');
		}
		if (!props.round_id) {
			throw new Error('round_id is required');
		}
		if (!props.int_user_id) {
			throw new Error('int_user_id is required');
		}
		return this.api.gpGetRoundInfoForUser(props.saw_template_id, props.round_id, props.int_user_id);
	}
}
