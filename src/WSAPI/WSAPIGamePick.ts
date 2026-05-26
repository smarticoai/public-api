import { ActivityTypeLimited, CoreUtils } from '../Core';
import { SAWSpinsCountPush } from '../MiniGames';
import { ECacheContext, OCache } from '../OCache';
import {
	InboxMarkMessageAction,
	LeaderBoardDetailsT,
	TAchCategory,
	TBuyStoreItemResult,
	TGetTranslations,
	TInboxMessage,
	TInboxMessageBody,
	TLevel,
	TMiniGamePlayResult,
	TMiniGameTemplate,
	TMissionClaimRewardResult,
	TMissionOptInResult,
	TMissionOrBadge,
	TSegmentCheckResult,
	TStoreCategory,
	TStoreItem,
	TTournament,
	TTournamentDetailed,
	TTournamentRegistrationResult,
	TUICustomSection,
	TUserProfile,
	UserLevelExtraCountersT,
	TBonus,
	TClaimBonusResult,
	TMiniGamePlayBatchResult,
	TSawHistory,
	TRaffle,
	TRaffleDraw,
	TRaffleDrawRun,
	TransformedRaffleClaimPrizeResponse,
	TLevelCurrent,
	TActivityLog,
	TRaffleOptinResponse,
	TClans,
	TClanInfo,
	TClanJoinResult,
	TClanTournamentPlayers,
	GamesApiResponse,
	GamePickRound,
	GamePickRoundBoard,
	GamePickUserInfo,
	GamePickGameInfo,
	GamePickRequestParams,
	GamePickRoundRequestParams,
	TAvatarDefinition,
	TAvatarCustomized,
	TAvatarPrompt,
	TSetAvatarResult,
} from './WSAPITypes';
import { LeaderBoardPeriodType } from '../Leaderboard';
import {
	JackpotDetails,
	JackpotPot,
	JackpotWinPush,
	JackpotWinnerHistory,
	JackpotsOptinResponse,
	JackpotsOptoutRequest,
	JackpotsOptoutResponse,
} from '../Jackpots';
import { GetRelatedAchTourResponse } from '../Missions/GetRelatedAchTourResponse';
import { InboxCategories } from '../Inbox/InboxCategories';
import {
	drawRunHistoryTransform,
	raffleClaimPrizeResponseTransform,
} from '../Raffle';
import { IntUtils } from '../IntUtils';
import { TGetJackpotEligibleGamesResponse } from '../Jackpots/GetJackpotEligibleGamesResponse';
import { InboxReadStatus } from '../Inbox/InboxReadStatus';
import {
	CACHE_DATA_SEC,
	JACKPOT_TEMPLATE_CACHE_SEC,
	JACKPOT_POT_CACHE_SEC,
	JACKPOT_WINNERS_CACHE_SEC,
	JACKPOT_ELIGIBLE_GAMES_CACHE_SEC,
	onUpdateContextKey,
} from './WSAPIBase';
import { WSAPIAvatars } from './WSAPIAvatars';

/** @group GamePick */
export class WSAPIGamePick extends WSAPIAvatars {
	/**
	 * Returns the active rounds for the specified MatchX or Quiz game.
	 * Each round includes its events (matches/questions) along with the current user's selections and scores.
	 *
	 * @param props.saw_template_id - The ID of the MatchX or Quiz game template
	 *
	 * **Response** `GamesApiResponse<GamePickRound[]>`:
	 * - `errCode` - 0 on success
	 * - `data` - Array of rounds, each containing:
	 *   - `round_id`, `round_name` - Round identifier and display name
	 *   - `open_date`, `last_bet_date` - Timestamps (ms) for round open and betting deadline
	 *   - `is_active_now`, `is_resolved` - Round state flags
	 *   - `round_status_id` - Round status: -1 (active), 2 (no more bets), 3 (all events resolved), 4 (round resolved)
	 *   - `score_full_win`, `score_part_win`, `score_lost` - Scoring rules per prediction outcome
	 *   - `user_score` - Current user's total score in this round
	 *   - `user_placed_bet` - Whether the user has submitted predictions
	 *   - `has_open_for_bet_events` - Whether there are events still open for betting
	 *   - `events[]` - Array of events with `gp_event_id`, `market_type_id`, `event_meta` (team names, images, sport), `match_date`, `is_open_for_bets`, `odds_details`, and user selection fields
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.gamePickGetActiveRounds({
	 *      saw_template_id: 1083,
	 * }).then((result) => {
	 *      console.log(result.data); // GamePickRound[]
	 *      result.data.forEach(round => {
	 *          console.log(round.round_name, round.events.length);
	 *      });
	 * });
	 * ```
	 *
	 * **Visitor mode: not supported**
	 */
	public async gamePickGetActiveRounds(props: GamePickRequestParams): Promise<GamesApiResponse<GamePickRound[]>> {
		if (!props.saw_template_id) {
			throw new Error('saw_template_id is required');
		}
		return this.api.gpGetActiveRounds(props.saw_template_id);
	}

	/**
	 * Returns a single active round for the specified MatchX or Quiz game.
	 * The round includes full event details with the current user's selections.
	 *
	 * @param props.saw_template_id - The ID of the MatchX or Quiz game template
	 * @param props.round_id - The specific round to retrieve
	 *
	 * **Response** `GamesApiResponse<GamePickRound>`:
	 * - `errCode` - 0 on success
	 * - `data` - Single round object with the same structure as in `gamePickGetActiveRounds`,
	 *   including `events[]` with full event details, user selections, and resolution info
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.gamePickGetActiveRound({
	 *      saw_template_id: 1083,
	 *      round_id: 31652,
	 * }).then((result) => {
	 *      console.log(result.data.round_name, result.data.events.length);
	 *      console.log(result.data.user_score, result.data.user_placed_bet);
	 * });
	 * ```
	 *
	 * **Visitor mode: not supported**
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
	 * Returns the history of all rounds (including resolved ones) for the specified MatchX or Quiz game.
	 * Each round contains full event details with results and the current user's predictions.
	 *
	 * @param props.saw_template_id - The ID of the MatchX or Quiz game template
	 *
	 * **Response** `GamesApiResponse<GamePickRound[]>`:
	 * - `errCode` - 0 on success
	 * - `data` - Array of rounds ordered by `round_row_id` descending (newest first).
	 *   Each round has the same structure as in `gamePickGetActiveRounds`, including resolved events
	 *   with `resolution_type_id` (0=None, 2=Lost, 3=PartialWin, 4=FullWin) and `resolution_score`
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.gamePickGetHistory({
	 *      saw_template_id: 1083,
	 * }).then((result) => {
	 *      result.data.forEach(round => {
	 *          console.log(round.round_name, 'Score:', round.user_score, 'Resolved:', round.is_resolved);
	 *      });
	 * });
	 * ```
	 *
	 * **Visitor mode: not supported**
	 */
	public async gamePickGetHistory(props: GamePickRequestParams): Promise<GamesApiResponse<GamePickRound[]>> {
		if (!props.saw_template_id) {
			throw new Error('saw_template_id is required');
		}
		return this.api.gpGetGamesHistory(props.saw_template_id);
	}

	/**
	 * Returns the leaderboard for a specific round within a MatchX or Quiz game.
	 * Use `round_id = -1` (AllRoundsGameBoardID) to get the season/overall leaderboard across all rounds.
	 *
	 * @param props.saw_template_id - The ID of the MatchX or Quiz game template
	 * @param props.round_id - The round to get the leaderboard for. Use -1 for overall/seasonal leaderboard
	 *
	 * **Response** `GamesApiResponse<GamePickRoundBoard>`:
	 * - `errCode` - 0 on success
	 * - `data` - Leaderboard object containing:
	 *   - Round base fields (`round_id`, `round_name`, `open_date`, `last_bet_date`, etc.)
	 *   - `users[]` - Ranked list of players, each with:
	 *     - `ext_user_id`, `int_user_id` - User identifiers
	 *     - `public_username`, `avatar_url` - Display info (usernames may be masked based on label settings)
	 *     - `gp_position` - Leaderboard rank (null if not yet ranked)
	 *     - `resolution_score` - Total score in this round
	 *     - `full_wins_count`, `part_wins_count`, `lost_count` - Prediction outcome counts
	 *   - `my_user` - Current user's entry (same fields as above), or null if user hasn't participated
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.gamePickGetBoard({
	 *      saw_template_id: 1083,
	 *      round_id: 31652,
	 * }).then((result) => {
	 *      console.log('Top players:', result.data.users);
	 *      console.log('My position:', result.data.my_user?.gp_position);
	 * });
	 * ```
	 *
	 * **Visitor mode: not supported**
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
	 * Submits score predictions for a round in a MatchX game.
	 * Sends the round object with user selections for all events at once.
	 * Each event must include `team1_user_selection` and `team2_user_selection` representing predicted scores.
	 * If the user hasn't placed bets before, one game attempt (spin) will be consumed.
	 * Predictions can be edited until each match starts (if `allow_edit_answers` is enabled on the round).
	 *
	 * @param props.saw_template_id - The ID of the MatchX game template
	 * @param props.round - Round object containing `round_id` and `events[]`. Typically obtained from `gamePickGetActiveRound`
	 *   and modified with user predictions. Each event needs: `gp_event_id`, `team1_user_selection`, `team2_user_selection`
	 *
	 * **Response** `GamesApiResponse<GamePickRound>`:
	 * - `errCode` - 0 on success. Non-zero codes indicate errors (e.g. not enough points/attempts)
	 * - `data` - Updated round with all events reflecting the submitted selections.
	 *   `user_placed_bet` will be `true`, `has_not_submitted_changes` will be `false`
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.gamePickGetActiveRound({
	 *      saw_template_id: 1190,
	 *      round_id: 38665,
	 * }).then((roundData) => {
	 *      const round = roundData.data;
	 *      round.events = round.events.map(e => ({
	 *          gp_event_id: e.gp_event_id,
	 *          team1_user_selection: 1,
	 *          team2_user_selection: 0,
	 *      }));
	 *      _smartico.api.gamePickSubmitSelection({
	 *          saw_template_id: 1190,
	 *          round: round,
	 *      }).then((result) => {
	 *          console.log(result.data.user_placed_bet); // true
	 *      });
	 * });
	 * ```
	 *
	 * **Visitor mode: not supported**
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
	 * Submits answers for a round in a Quiz game.
	 * Sends the round object with user answers for all events at once.
	 * Each event must include `user_selection` with the answer value (e.g. '1', '2', 'x', 'yes', 'no' — depending on the market type).
	 * If the user hasn't placed bets before, one game attempt (spin) will be consumed.
	 * Answers can be edited until each match starts (if `allow_edit_answers` is enabled on the round).
	 *
	 * @param props.saw_template_id - The ID of the Quiz game template
	 * @param props.round - Round object containing `round_id` and `events[]`. Typically obtained from `gamePickGetActiveRound`
	 *   and modified with user answers. Each event needs: `gp_event_id`, `user_selection`
	 *
	 * **Response** `GamesApiResponse<GamePickRound>`:
	 * - `errCode` - 0 on success. Non-zero codes indicate errors (e.g. not enough points/attempts)
	 * - `data` - Updated round with all events reflecting the submitted answers.
	 *   `user_placed_bet` will be `true`, `has_not_submitted_changes` will be `false`
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.gamePickGetActiveRound({
	 *      saw_template_id: 1183,
	 *      round_id: 37974,
	 * }).then((roundData) => {
	 *      const round = roundData.data;
	 *      round.events = round.events.map(e => ({
	 *          gp_event_id: e.gp_event_id,
	 *          user_selection: 'x',
	 *      }));
	 *      _smartico.api.gamePickSubmitSelectionQuiz({
	 *          saw_template_id: 1183,
	 *          round: round,
	 *      }).then((result) => {
	 *          console.log(result.data.user_placed_bet); // true
	 *      });
	 * });
	 * ```
	 *
	 * **Visitor mode: not supported**
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
	 * Returns the current user's profile information within the specified MatchX or Quiz game.
	 * The user record is synced from the Smartico platform into the games DB (synced every 1 minute).
	 * If the user doesn't exist in the games DB yet, it will be created automatically on first call.
	 *
	 * @param props.saw_template_id - The ID of the MatchX or Quiz game template
	 *
	 * **Response** `GamesApiResponse<GamePickUserInfo>`:
	 * - `errCode` - 0 on success
	 * - `data`:
	 *   - `ext_user_id` - External user ID (Smartico internal numeric ID)
	 *   - `int_user_id` - Internal user ID within the games system
	 *   - `public_username` - Display name
	 *   - `avatar_url` - User's avatar image URL
	 *   - `last_wallet_sync_time` - Last time the user's balance was synced from Smartico
	 *   - `ach_points_balance` - User's current points balance
	 *   - `ach_gems_balance` - User's current gems balance
	 *   - `ach_diamonds_balance` - User's current diamonds balance
	 *   - `pubic_username_set` - Whether the user has set a custom username
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.gamePickGetUserInfo({
	 *      saw_template_id: 1083,
	 * }).then((result) => {
	 *      console.log(result.data.public_username, result.data.ach_points_balance);
	 * });
	 * ```
	 *
	 * **Visitor mode: not supported**
	 */
	public async gamePickGetUserInfo(props: GamePickRequestParams): Promise<GamesApiResponse<GamePickUserInfo>> {
		if (!props.saw_template_id) {
			throw new Error('saw_template_id is required');
		}
		return this.api.gpGetUserInfo(props.saw_template_id);
	}

	/**
	 * Returns the game configuration and the list of all rounds for the specified MatchX or Quiz game.
	 * Includes the SAW template definition, label settings, and round metadata (without events).
	 *
	 * @param props.saw_template_id - The ID of the MatchX or Quiz game template
	 *
	 * **Response** `GamesApiResponse<GamePickGameInfo>`:
	 * - `errCode` - 0 on success
	 * - `data`:
	 *   - `sawTemplate` - Game template configuration including:
	 *     - `saw_template_id`, `saw_game_type_id` (6 = MatchX/Quiz)
	 *     - `saw_template_ui_definition` - UI settings (name, ranking options, ask_for_username, etc.)
	 *     - `saw_buyin_type_id` - Cost type (1=Free, 2=Points, 3=Gems, 4=Diamonds, 5=Spins)
	 *     - `buyin_cost_points` - Cost per attempt
	 *     - `spin_count` - Available attempts for the current user
	 *   - `allRounds[]` - List of all rounds (metadata only, no events), each with:
	 *     - `round_id`, `round_name`, `round_description`
	 *     - `open_date`, `last_bet_date` - Timestamps (ms)
	 *     - `is_active_now`, `is_resolved`, `round_status_id`
	 *   - `labelInfo` - Label/brand configuration and settings
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.gamePickGetGameInfo({
	 *      saw_template_id: 1189,
	 * }).then((result) => {
	 *      console.log(result.data.sawTemplate.saw_template_ui_definition.name);
	 *      console.log('Rounds:', result.data.allRounds.length);
	 *      console.log('Buy-in type:', result.data.sawTemplate.saw_buyin_type_id);
	 * });
	 * ```
	 *
	 * **Visitor mode: not supported**
	 */
	public async gamePickGetGameInfo(props: GamePickRequestParams): Promise<GamesApiResponse<GamePickGameInfo>> {
		if (!props.saw_template_id) {
			throw new Error('saw_template_id is required');
		}
		return this.api.gpGetGameInfo(props.saw_template_id);
	}

	/**
	 * Returns round data with events and picks for a specific user (identified by their internal user ID).
	 * Useful for viewing another user's predictions from the leaderboard.
	 * The `int_user_id` can be obtained from the `gamePickGetBoard` response (`users[].int_user_id`).
	 *
	 * @param props.saw_template_id - The ID of the MatchX or Quiz game template
	 * @param props.round_id - The round to get info for
	 * @param props.int_user_id - Internal user ID of the player whose predictions to view (from leaderboard data)
	 *
	 * **Response** `GamesApiResponse<GamePickRound>`:
	 * - `errCode` - 0 on success
	 * - `data` - Round object with the target user's selections.
	 *   Same structure as `gamePickGetActiveRound`, but `user_selection`/`team1_user_selection`/`team2_user_selection`
	 *   fields on events reflect the specified user's picks instead of the current user's.
	 *   Events also include `resolution_type_id` (0=None, 2=Lost, 3=PartialWin, 4=FullWin) showing how each prediction was scored
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.gamePickGetRoundInfoForUser({
	 *      saw_template_id: 1083,
	 *      round_id: 31652,
	 *      int_user_id: 65653810,
	 * }).then((result) => {
	 *      result.data.events.forEach(e => {
	 *          console.log(e.event_meta.team1_name, 'vs', e.event_meta.team2_name, '→', e.user_selection);
	 *      });
	 * });
	 * ```
	 *
	 * **Visitor mode: not supported**
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
