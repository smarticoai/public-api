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
import { WSAPIUser } from './WSAPIUser';

/** @group General */
export class WSAPIGeneral extends WSAPIUser {
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

	public async getCustomSections(): Promise<TUICustomSection[]> {
		return OCache.use(
			onUpdateContextKey.CustomSections,
			ECacheContext.WSAPI,
			() => this.api.customSectionsGetT(this.userExtId),
			CACHE_DATA_SEC,
		);
	}

	/**
	 * Requests translations for the given language. Returns the object including translation key/translation value pairs. All possible translation keys defined in the back office.
	 */
	public async getTranslations(lang_code: string): Promise<TGetTranslations> {
		const r = await this.api.getTranslationsT(this.userExtId, lang_code, []);

		return {
			translations: r.translations,
		};
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

	/**
	 * Returns all the related tournaments and missions for the provided game id for the current user
	 * The provided Game ID should correspond to the ID from the Games Catalog - https://help.smartico.ai/welcome/technical-guides/games-catalog-api
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.getRelatedItemsForGame('gold-slot2').then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 * **Example in the Visitor mode**:
	 * ```
	 * _smartico.vapi('EN').getRelatedItemsForGame('gold-slot2').then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 */
	public async getRelatedItemsForGame(related_game_id: string): Promise<GetRelatedAchTourResponse> {
		const result = await this.api.getRelatedItemsForGame(this.userExtId, related_game_id);
		return result;
	}
}
