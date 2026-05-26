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
import { WSAPIBase } from './WSAPIBase';

/** @group User */
export class WSAPIUser extends WSAPIBase {
	/** Returns all the levels available to the current user
	 * **Example**:
	 * ```
	 * _smartico.api.getLevels().then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 * **Example in the Visitor mode**:
	 * ```
	 * _smartico.vapi('EN').getLevels().then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 */
	public async getLevels(): Promise<TLevel[]> {
		return OCache.use(onUpdateContextKey.Levels, ECacheContext.WSAPI, () => this.api.levelsGetT(this.userExtId), CACHE_DATA_SEC);
	}

	/**
	 * Returns the current level of the user with extended information including ordinal position and progress.
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.getCurrentLevel().then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 * **Visitor mode: not supported**
	 */
	public async getCurrentLevel(): Promise<TLevelCurrent> {
		return OCache.use(onUpdateContextKey.CurrentLevel, ECacheContext.WSAPI, () => this.api.getLevelCurrent(this.userExtId), CACHE_DATA_SEC);
	}

	/**
	 * Returns the extra counters for the current user level.
	 * These are counters that are configured for each Smartico client separately by request.
	 * For example 1st counter could be total wagering amount, 2nd counter could be total deposit amount, etc.
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.getUserLevelExtraCounters().then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 * **Visitor mode: not supported**
	 */
	public async getUserLevelExtraCounters(): Promise<UserLevelExtraCountersT> {
		return OCache.use(
			onUpdateContextKey.LevelExtraCounters,
			ECacheContext.WSAPI,
			() => this.api.getUserGamificationInfoT(this.userExtId),
			CACHE_DATA_SEC,
		);
	}
}
