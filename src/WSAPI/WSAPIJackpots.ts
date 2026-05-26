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
import { WSAPIClans } from './WSAPIClans';

/** @group Jackpots */
export class WSAPIJackpots extends WSAPIClans {

	/** @hidden */
	protected jackpotGetSignature: string = '';
	protected async jackpotClearCache() {
		OCache.clear(ECacheContext.WSAPI, onUpdateContextKey.Jackpots);
		OCache.clear(ECacheContext.WSAPI, onUpdateContextKey.Pots);
		OCache.clear(ECacheContext.WSAPI, onUpdateContextKey.JackpotWinners);
	}

	/** Returns list of Jackpots that are active in the system and matching to the filter definition.
	 * If filter is not provided, all active jackpots will be returned.
	 * Filter can be used to get jackpots related to specific game or specific jackpot template.
	 * You can call this method every second in order to get up to date information about current value of the jackpot(s) and present them to the end-users
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.jackpotGet({ related_game_id: 'wooko-slot' }).then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 * **Example in the Visitor mode**:
	 * ```
	 * _smartico.vapi('EN').jackpotGet({ related_game_id: 'wooko-slot' }).then((result) => {
	 *      console.log(result);
	 * });
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
	 * Opt-in currently logged in user to the jackpot with the specified jp_template_id.
	 * You may call jackpotGet method after doing optin to see that user is opted in to the jackpot.
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.jackpotOptIn({ jp_template_id: 123 }).then((result) => {
	 *      console.log('Opted in to the jackpot');
	 * });
	 * ```
	 *
	 * **Visitor mode: not supported**
	 *
	 */
	public async jackpotOptIn(filter: { jp_template_id: number }): Promise<JackpotsOptinResponse> {
		if (!filter.jp_template_id) {
			throw new Error('jp_template_id is required in jackpotOptIn');
		}

		const result = await this.api.jackpotOptIn(this.userExtId, filter);

		return result;
	}

	/**
	 * Opt-out currently logged in user from the jackpot with the specified jp_template_id.
	 * You may call jackpotGet method after doing optout to see that user is not opted in to the jackpot.
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.jackpotOptOut({ jp_template_id: 123 }).then((result) => {
	 *      console.log('Opted out from the jackpot');
	 * });
	 * ```
	 *
	 * **Visitor mode: not supported**
	 *
	 */
	public async jackpotOptOut(filter: { jp_template_id: number }): Promise<JackpotsOptoutResponse> {
		if (!filter.jp_template_id) {
			throw new Error('jp_template_id is required in jackpotOptOut');
		}

		const result = await this.api.jackpotOptOut(this.userExtId, filter);

		return result;
	}

	/**
	 * Returns jackpot winners for the given `jp_template_id` (paginated on the server).
	 * Default page size on the wire is 20; use `limit`, `offset`, and repeated calls to load more.
	 * The full protocol response also includes `has_more`; this method returns only the `winners` array.
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.getJackpotWinners({
	 *      jp_template_id: 123,
	 * }).then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 * **Visitor mode: not supported**
	 *
	 * @param params - Jackpot winners parameters
	 * @param params.jp_template_id - Jackpot template id (required; throws if missing)
	 * @param params.limit - Page size (server default 20 when omitted)
	 * @param params.offset - Offset into the winner list
	 */

	public async getJackpotWinners({
		limit,
		offset,
		jp_template_id,
	}: {
		limit?: number;
		offset?: number;
		jp_template_id?: number;
	}): Promise<JackpotWinnerHistory[]> {
		return OCache.use(
			onUpdateContextKey.JackpotWinners + jp_template_id,
			ECacheContext.WSAPI,
			() => this.api.getJackpotWinnersT(this.userExtId, limit, offset, jp_template_id),
			JACKPOT_WINNERS_CACHE_SEC,
		);
	}

	/**
	 * Returns the eligible games for the jackpot with the specified jp_template_id.
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.getJackpotEligibleGames({ jp_template_id: 123 }).then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 * 
	 * **Visitor mode: not supported**
	 * 
	 */

	public async getJackpotEligibleGames({ jp_template_id, onUpdate } : { jp_template_id: number, onUpdate?: () => void }): Promise<TGetJackpotEligibleGamesResponse> {
		if (onUpdate) {
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
