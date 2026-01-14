import { ClassId } from '../Base/ClassId';
import { ActivityTypeLimited, CoreUtils } from '../Core';
import {
	SAWSpinsCountPush,
} from '../MiniGames';
import { ECacheContext, OCache } from '../OCache';
import { SmarticoAPI } from '../SmarticoAPI';
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
	TPointsHistoryLog,
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
	drawRunTransform,
	raffleClaimPrizeResponseTransform,
	RaffleOptinRequest,
	RaffleOptinResponse,
} from '../Raffle';
import { IntUtils } from '../IntUtils';
import { TGetJackpotEligibleGamesResponse } from '../Jackpots/GetJackpotEligibleGamesResponse';
import { InboxReadStatus } from '../Inbox/InboxReadStatus';

/** @hidden */
const CACHE_DATA_SEC = 30;

const JACKPOT_TEMPLATE_CACHE_SEC = 30;
const JACKPOT_POT_CACHE_SEC = 1;
const JACKPOT_WINNERS_CACHE_SEC = 30;
const JACKPOT_ELIGIBLE_GAMES_CACHE_SEC = 30;

/** @hidden */
enum onUpdateContextKey {
	Saw = 'saw',
	Missions = 'missions',
	TournamentList = 'tournamentList',
	InboxMessages = 'inboxMessages',
	Badges = 'badges',
	Levels = 'levels',
	StoreItems = 'storeItems',
	StoreCategories = 'storeCategories',
	AchCategories = 'achCategories',
	LeaderBoards = 'leaderBoards',
	LevelExtraCounters = 'levelExtraCounters',
	Segments = 'segments',
	StoreHistory = 'storeHistory',
	Jackpots = 'jackpots',
	Pots = 'Pots',
	CustomSections = 'customSections',
	Bonuses = 'bonuses',
	SAWHistory = 'sawHistory',
	JackpotWinners = 'jackpotWinners',
	Raffles = 'raffles',
	JackpotEligibleGames = 'jackpotEligibleGames',
	CurrentLevel = 'currentLevel',
	InboxUnreadCount = 'inboxUnreadCount',
	PointsHistory = 'pointsHistory',
}

/** @group General API */
export class WSAPI {
	private onUpdateCallback: Map<onUpdateContextKey, (data: any) => void> = new Map();
	private jackpotGetSignature: string = '';

	/** @private */
	constructor(private api: SmarticoAPI) {
		OCache.clearAll();
		if (this.api.tracker) {
			const on = this.api.tracker.on;

			on(ClassId.SAW_SPINS_COUNT_PUSH, (data: SAWSpinsCountPush) => this.updateOnSpin(data));
			on(ClassId.SAW_SHOW_SPIN_PUSH, () => this.reloadMiniGameTemplate());
			on(ClassId.SAW_AKNOWLEDGE_RESPONSE, () => {
				this.reloadMiniGameTemplate();
				OCache.clear(ECacheContext.WSAPI, onUpdateContextKey.SAWHistory);
			});
			on(ClassId.SAW_DO_SPIN_RESPONSE, () => {
				this.reloadMiniGameTemplate();
				OCache.clear(ECacheContext.WSAPI, onUpdateContextKey.SAWHistory);
			});
			on(ClassId.MISSION_OPTIN_RESPONSE, () => this.updateMissions());
			on(ClassId.ACHIEVEMENT_CLAIM_PRIZE_RESPONSE, () => this.updateMissions());
			on(ClassId.RELOAD_ACHIEVEMENTS_EVENT, () => this.updateMissions());
			on(ClassId.TOURNAMENT_REGISTER_RESPONSE, () => this.updateTournaments());
			on(ClassId.BUY_SHOP_ITEM_RESPONSE, () => {
				this.updateStorePurchasedItems();
				this.updateStoreItems();
			});
			on(ClassId.CLIENT_ENGAGEMENT_EVENT_NEW, () => this.updateInboxMessages());
			on(ClassId.LOGOUT_RESPONSE, () => OCache.clearContext(ECacheContext.WSAPI));
			on(ClassId.IDENTIFY_RESPONSE, () => OCache.clearContext(ECacheContext.WSAPI));
			on(ClassId.JP_WIN_PUSH, (data: JackpotWinPush) => this.jackpotClearCache());
			on(ClassId.JP_OPTOUT_RESPONSE, (data: JackpotsOptoutRequest) => this.jackpotClearCache());
			on(ClassId.JP_OPTIN_RESPONSE, (data: JackpotsOptinResponse) => this.jackpotClearCache());
			on(ClassId.CLAIM_BONUS_RESPONSE, () => this.updateBonuses());
			on(ClassId.SAW_DO_SPIN_BATCH_RESPONSE, () => {
				this.reloadMiniGameTemplate();
				OCache.clear(ECacheContext.WSAPI, onUpdateContextKey.SAWHistory);
			});
			on(ClassId.RAF_CLAIM_PRIZE_RESPONSE, () => {
				this.updateRaffles();
				OCache.clear(ECacheContext.WSAPI, onUpdateContextKey.Raffles);
			});
			on(ClassId.GET_INBOX_MESSAGES_RESPONSE, (res) => {
				if (res.unread_count !== undefined && res.unread_count !== null) {
					this.updateInboxUnreadCount(res.unread_count);
				}
			});
			on(ClassId.CLIENT_PUBLIC_PROPERTIES_CHANGED_EVENT, (data: { props: { core_inbox_unread_count?: number; ach_points_balance?: number; ach_gems_balance?: number; ach_diamonds_balance?: number } }) => {
				if (data?.props?.core_inbox_unread_count !== undefined && data?.props?.core_inbox_unread_count !== null) {
					this.updateInboxUnreadCount(data.props.core_inbox_unread_count);
				}
				if (data?.props?.ach_points_balance !== undefined || data?.props?.ach_gems_balance !== undefined || data?.props?.ach_diamonds_balance !== undefined) {
					this.notifyPointsHistoryUpdate();
				}
			});
		}
	}

	/** @private */
	// AA: this method is used from the _smartico script to clear cache when the context is changed,
	// e.g. when user is changed or language is changed
	public clearCaches() {
		OCache.clearAll();
	}

	/** Returns information about current user
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.getUserProfile(result => {
	 *  console.log(result);
	 * });
	 * ```
	 * **Visitor mode: not supported**
	 * */
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
		const r = await this.api.coreCheckSegments(null, [segment_id]);
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
		return await this.api.coreCheckSegments(null, Array.isArray(segment_ids) ? segment_ids : [segment_ids]);
	}

	/** Returns all the levels available the current user
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
		return OCache.use(onUpdateContextKey.Levels, ECacheContext.WSAPI, () => this.api.levelsGetT(null), CACHE_DATA_SEC);
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
		return OCache.use(onUpdateContextKey.CurrentLevel, ECacheContext.WSAPI, () => this.api.getLevelCurrent(null), CACHE_DATA_SEC);
	}

	/** Returns all the missions available the current user.
	 * The returned missions are cached for 30 seconds. But you can pass the onUpdate callback as a parameter.
	 * Note that each time you call getMissions with a new onUpdate callback, the old one will be overwritten by the new one.
	 * The onUpdate callback will be called on mission OptIn and the updated missions will be passed to it.
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.getMissions().then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 * **Example in the Visitor mode**:
	 * ```
	 * _smartico.vapi('EN').getMissions().then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 */
	public async getMissions({ onUpdate }: { onUpdate?: (data: TMissionOrBadge[]) => void } = {}): Promise<TMissionOrBadge[]> {
		if (onUpdate) {
			this.onUpdateCallback.set(onUpdateContextKey.Missions, onUpdate);
		}

		return OCache.use(
			onUpdateContextKey.Missions,
			ECacheContext.WSAPI,
			() => this.api.missionsGetItemsT(null),
			CACHE_DATA_SEC,
		);
	}

	/**
	 * Returns all the badges available the current user
	 *
	 * **Visitor mode: not supported**
	 */
	public async getBadges(): Promise<TMissionOrBadge[]> {
		return OCache.use(onUpdateContextKey.Badges, ECacheContext.WSAPI, () => this.api.badgetsGetItemsT(null), CACHE_DATA_SEC);
	}

	/**
	 * Returns all the bonuses for the current user
	 * The returned bonuss are cached for 30 seconds. But you can pass the onUpdate callback as a parameter.
	 * Note that each time you call getBonuses with a new onUpdate callback, the old one will be overwritten by the new one.
	 * The onUpdate callback will be called on bonus claimed and the updated bonuses will be passed to it.
	 *
	 * **Visitor mode: not supported**
	 */
	public async getBonuses({ onUpdate }: { onUpdate?: (data: TBonus[]) => void } = {}): Promise<TBonus[]> {
		if (onUpdate) {
			this.onUpdateCallback.set(onUpdateContextKey.Bonuses, onUpdate);
		}

		return OCache.use(onUpdateContextKey.Bonuses, ECacheContext.WSAPI, () => this.api.bonusesGetItemsT(null), CACHE_DATA_SEC);
	}

	/**
	 * Claim the bonus by bonus_id. Returns the err_code in case of success or error.
	 * Note that this method can be used only on integrations where originally failed bonus can be claimed again.
	 * For example, user won a bonus in the mini-game, but Operator rejected this bonus.
	 * This bonus will be available for the user to claim again.
	 *
	 * **Visitor mode: not supported**
	 */
	public async claimBonus(bonus_id: number): Promise<TClaimBonusResult> {
		const r = await this.api.bonusClaimItem(null, bonus_id);

		const o: TClaimBonusResult = {
			err_code: r.errCode,
			err_message: r.errMsg,
			success: r.success,
		};

		return o;
	}

	/**
	 * Returns the extra counters for the current user level.
	 * These are counters that are configured for each Smartico client separatly by request.
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
			() => this.api.getUserGamificationInfoT(null),
			CACHE_DATA_SEC,
		);
	}

	/**
	 *
	 * Returns all the store items available the current user
	 * The returned store items are cached for 30 seconds. But you can pass the onUpdate callback as a parameter.
	 * Note that each time you call getStoreItems with a new onUpdate callback, the old one will be overwritten by the new one.
	 * The onUpdate callback will be called on purchase of the store item.
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.getStoreItems().then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 * **Example in the Visitor mode**:
	 * ```
	 * _smartico.vapi('EN').getStoreItems().then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *  @param params
	 *  @param params.onUpdate - callback function that will be called when the store items are updated
	 */

	public async getStoreItems({ onUpdate }: { onUpdate?: (data: TStoreItem[]) => void } = {}): Promise<TStoreItem[]> {
		if (onUpdate) {
			this.onUpdateCallback.set(onUpdateContextKey.StoreItems, onUpdate);
		}
		return OCache.use(
			onUpdateContextKey.StoreItems,
			ECacheContext.WSAPI,
			() => this.api.storeGetItemsT(null),
			CACHE_DATA_SEC,
		);
	}

	/** Buy the specific shop item by item_id. Returns the err_code in case of success or error.
	 * **Example**:
	 * ```
	 * _smartico.api.buyStoreItem(1).then((result) => {
	 *     console.log(result);
	 * });
	 * ```
	 *
	 * **Visitor mode: not supported**
	 */
	public async buyStoreItem(item_id: number): Promise<TBuyStoreItemResult> {
		const r = await this.api.buyStoreItem(null, item_id);

		const o: TBuyStoreItemResult = {
			err_code: r.errCode,
			err_message: r.errMsg,
		};

		return o;
	}

	/**
	 *
	 * Returns store categories
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.getStoreCategories().then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 * **Example in the Visitor mode**:
	 * ```
	 * _smartico.vapi('EN').getStoreCategories().then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 */
	public async getStoreCategories(): Promise<TStoreCategory[]> {
		return OCache.use(
			onUpdateContextKey.StoreCategories,
			ECacheContext.WSAPI,
			() => this.api.storeGetCategoriesT(null),
			CACHE_DATA_SEC,
		);
	}

	/**
	 * Returns purchased items based on the provided parameters. "Limit" and "offset" indicate the range of items to be fetched.
	 * The maximum number of items per request is limited to 20.
	 * You can leave this params empty and by default it will return list of purchased items ranging from 0 to 20.
	 * The returned store items are cached for 30 seconds. But you can pass the onUpdate callback as a parameter.
	 * Note that each time you call getStorePurchasedItems with a new onUpdate callback, the old one will be overwritten by the new one.
	 * The onUpdate callback will be called on purchase of the store item and the last 20 items will be passed to it.
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.getStorePurchasedItems().then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 * **Visitor mode: not supported**
	 */

	public async getStorePurchasedItems({
		limit,
		offset,
		onUpdate,
	}: { limit?: number; offset?: number; onUpdate?: (data: TStoreItem[]) => void } = {}): Promise<TStoreItem[]> {
		if (onUpdate) {
			this.onUpdateCallback.set(onUpdateContextKey.StoreHistory, onUpdate);
		}
		return OCache.use(
			onUpdateContextKey.StoreHistory,
			ECacheContext.WSAPI,
			() => this.api.storeGetPurchasedItemsT(null, limit, offset),
			CACHE_DATA_SEC,
		);
	}

	/**
	 * Returns missions & badges categories
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.getAchCategories().then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 * **Example in the Visitor mode**:
	 * ```
	 * _smartico.vapi('EN').getAchCategories().then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 * */
	public async getAchCategories(): Promise<TAchCategory[]> {
		return OCache.use(
			onUpdateContextKey.AchCategories,
			ECacheContext.WSAPI,
			() => this.api.achGetCategoriesT(null),
			CACHE_DATA_SEC,
		);
	}

	/**
	 * Returns list of custom sections
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.getCustomSections().then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 * **Example in the Visitor mode**:
	 * ```
	 * _smartico.vapi('EN').getCustomSections().then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 * */
	public async getCustomSections(): Promise<TUICustomSection[]> {
		return OCache.use(
			onUpdateContextKey.CustomSections,
			ECacheContext.WSAPI,
			() => this.api.customSectionsGetT(null),
			CACHE_DATA_SEC,
		);
	}

	/**
	 * Returns the list of mini-games available for user
	 * The returned list of mini-games is cached for 30 seconds. But you can pass the onUpdate callback as a parameter. Note that each time you call getMiniGames with a new onUpdate callback, the old one will be overwritten by the new one.
	 * The onUpdate callback will be called on available spin count change, if mini-game has increasing jackpot per spin or wined prize is spin/jackpot and if max count of the available user spin equal one, also if the spins were issued to the user manually in the BO. Updated templates will be passed to onUpdate callback.
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.getMiniGames().then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 * **Example in the Visitor mode**:
	 * ```
	 * _smartico.vapi('EN').getMiniGames().then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 */
	public async getMiniGames({ onUpdate }: { onUpdate?: (data: TMiniGameTemplate[]) => void } = {}): Promise<
		TMiniGameTemplate[]
	> {
		if (onUpdate) {
			this.onUpdateCallback.set(onUpdateContextKey.Saw, onUpdate);
		}

		return OCache.use(onUpdateContextKey.Saw, ECacheContext.WSAPI, () => this.api.sawGetTemplatesT(null), CACHE_DATA_SEC);
	}

	/**
	 * Returns the list of mini-games based on the provided parameters. "Limit" and "offset" indicate the range of items to be fetched.
	 * The maximum number of items per request is limited to 20.
	 * You can leave this params empty and by default it will return list of mini-games ranging from 0 to 20.
	 * The returned list of mini-games history is cached for 30 seconds.
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.getMiniGamesHistory().then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 * **Visitor mode: not supported**
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
			onUpdateContextKey.SAWHistory,
			ECacheContext.WSAPI,
			() => this.api.getSawWinningHistoryT(null, limit, offset, saw_template_id),
			CACHE_DATA_SEC,
		);
	}

	/**
	 * Plays the specified by template_id mini-game on behalf of user and returns prize_id or err_code
	 * After playMiniGame is called, you can call getMiniGames to get the list of mini-games.The returned list of mini-games is cached for 30 seconds. But you can pass the onUpdate callback as a parameter. Note that each time you call playMiniGame with a new onUpdate callback, the old one will be overwritten by the new one.
	 * The onUpdate callback will be called on available spin count change, if mini-game has increasing jackpot per spin or wined prize is spin/jackpot and if max count of the available user spin equal one, also if the spins were issued to the user manually in the BO. Updated templates will be passed to onUpdate callback.
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.playMiniGame(55).then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 * **Visitor mode: not supported**
	 */
	public async playMiniGame(
		template_id: number,
		{ onUpdate }: { onUpdate?: (data: TMiniGameTemplate[]) => void } = {},
	): Promise<TMiniGamePlayResult> {
		if (onUpdate) {
			this.onUpdateCallback.set(onUpdateContextKey.Saw, onUpdate);
		}

		const r = await this.api.sawSpinRequest(null, template_id);
		this.api.doAcknowledgeRequest(null, r.request_id);

		const o: TMiniGamePlayResult = {
			err_code: r.errCode,
			err_message: r.errMsg,
			prize_id: r.saw_prize_id,
		};

		return o;
	}

	/**
	 * Sends the acknowledge request with specific client_request_id from minigame history in order to claim prize
	 * **Example**:
	 * ```
	 * _smartico.api.miniGameWinAcknowledgeRequest('2a189322-31bb-4119-b943-bx7868ff8dc3').then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 */
	public async miniGameWinAcknowledgeRequest(request_id: string) {
		return this.api.doAcknowledgeRequest(null, request_id);
	}

	/**
	 * Plays the specified by template_id mini-game on behalf of user spin_count times and returns array of the prizes
	 * After playMiniGameBatch is called, you can call getMiniGames to get the list of mini-games. The returned list of mini-games is cached for 30 seconds. But you can pass the onUpdate callback as a parameter. Note that each time you call playMiniGameBatch with a new onUpdate callback, the old one will be overwritten by the new one.
	 * The onUpdate callback will be called on available spin count change, if mini-game has increasing jackpot per spin or wined prize is spin/jackpot and if max count of the available user spin equal one, also if the spins were issued to the user manually in the BO. Updated templates will be passed to onUpdate callback.
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.playMiniGameBatch(55, 10).then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 * **Visitor mode: not supported**
	 */
	public async playMiniGameBatch(
		template_id: number,
		spin_count: number,
		{ onUpdate }: { onUpdate?: (data: TMissionOrBadge[]) => void } = {},
	): Promise<TMiniGamePlayBatchResult[]> {
		if (onUpdate) {
			this.onUpdateCallback.set(onUpdateContextKey.Saw, onUpdate);
		}

		const response = await this.api.sawSpinBatchRequest(null, template_id, spin_count);

		const request_ids = response.results.map((result) => result.request_id);
		this.api.doAcknowledgeBatchRequest(null, request_ids);

		const o: TMiniGamePlayBatchResult[] = response.results.map((result) => ({
			errCode: result.errCode,
			errMessage: result.errMsg,
			saw_prize_id: result.saw_prize_id,
			jackpot_amount: result.jackpot_amount,
			first_spin_in_period: result.first_spin_in_period,
		}));

		return o;
	}

	/**
	 * Requests an opt-in for the specified mission_id. Returns the err_code.
	 *
	 * **Visitor mode: not supported**
	 */
	public async requestMissionOptIn(mission_id: number): Promise<TMissionOptInResult> {
		const r = await this.api.missionOptIn(null, mission_id);

		const o: TMissionOptInResult = {
			err_code: r.errCode,
			err_message: r.errMsg,
		};

		return o;
	}

	/**
	 * Request for claim reward for the specified mission id. Returns the err_code.
	 *
	 * **Visitor mode: not supported**
	 */
	public async requestMissionClaimReward(mission_id: number, ach_completed_id: number): Promise<TMissionClaimRewardResult> {
		const r = await this.api.missionClaimPrize(null, mission_id, ach_completed_id);

		const o: TMissionClaimRewardResult = {
			err_code: r.errCode,
			err_message: r.errMsg,
		};

		return o;
	}

	/** Returns all the active instances of tournaments
	 * The returned list is cached for 30 seconds. But you can pass the onUpdate callback as a parameter. Note that each time you call getTournamentsList with a new onUpdate callback, the old one will be overwritten by the new one.
	 * The onUpdate callback will be called when the user has registered in a tournament. Updated list will be passed to onUpdate callback.
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.getTournamentsList().then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 * **Example in the Visitor mode**:
	 * ```
	 * _smartico.vapi('EN').getTournamentsList().then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 * */
	public async getTournamentsList({ onUpdate }: { onUpdate?: (data: TTournament[]) => void } = {}): Promise<TTournament[]> {
		if (onUpdate) {
			this.onUpdateCallback.set(onUpdateContextKey.TournamentList, onUpdate);
		}

		return OCache.use(
			onUpdateContextKey.TournamentList,
			ECacheContext.WSAPI,
			() => this.api.tournamentsGetLobbyT(null),
			CACHE_DATA_SEC,
		);
	}

	/**
	 * Returns details information of specific tournament instance, the response will include tournament info and the leaderboard of players
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.getTournamentsList().then((result) => {
	 *      if (result.length > 0) {
	 *         _smartico.api.getTournamentInstanceInfo(result[0].instance_id).then((result) => {
	 *             console.log(result);
	 *        });
	 *     }
	 * });
	 * ```
	 *
	 * **Example in the Visitor mode**:
	 * ```
	 * _smartico.vapi('EN').getTournamentsList().then((result) => {
	 *      if (result.length > 0) {
	 *         _smartico.vapi('EN').getTournamentInstanceInfo(result[0].instance_id).then((result) => {
	 *             console.log(result);
	 *        });
	 *     }
	 * });
	 * ```
	 */
	public async getTournamentInstanceInfo(tournamentInstanceId: number): Promise<TTournamentDetailed> {
		return this.api.tournamentsGetInfoT(null, tournamentInstanceId);
	}

	/**
	 * Requests registration for the specified tournament instance. Returns the err_code.
	 *
	 * **Visitor mode: not supported**
	 */
	public async registerInTournament(tournamentInstanceId: number): Promise<TTournamentRegistrationResult> {
		const r = await this.api.registerInTournament(null, tournamentInstanceId);

		const o: TTournamentRegistrationResult = {
			err_code: r.errCode,
			err_message: r.errMsg,
		};

		return o;
	}

	/**
	 * Returns the leaderboard for the current type (default is Daily). If getPreviousPeriod is passed as true, a leaderboard for the previous period for the current type will be returned.
	 * For example, if the type is Weekly and getPreviousPeriod is true, a leaderboard for the previous week will be returned.
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.getLeaderBoard(1).then((result) => {
	 *     console.log(result);
	 * });
	 * ```
	 *
	 * **Example in the Visitor mode**:
	 * ```
	 * _smartico.vapi('EN').getLeaderBoard(1).then((result) => {
	 *    console.log(result);
	 * });
	 * ```
	 */
	public async getLeaderBoard(periodType: LeaderBoardPeriodType, getPreviousPeriod?: boolean): Promise<LeaderBoardDetailsT> {
		return OCache.use(
			onUpdateContextKey.LeaderBoards,
			ECacheContext.WSAPI,
			() => this.api.leaderboardsGetT(null, periodType, getPreviousPeriod),
			CACHE_DATA_SEC,
		);
	}

	/** Returns inbox messages based on the provided parameters. "From" and "to" indicate the range of messages to be fetched.
	 * The maximum number of messages per request is limited to 20. 
	 * An indicator "onlyFavorite" can be passed to get only messages marked as favorites.
	 * An indicator "read_status" can be passed to get only messages marked as read or unread.
	 * You can leave this params empty and by default it will return list of messages ranging from 0 to 20.
	 * This functions return list of messages without the body of the message.
	 * To get the body of the message you need to call getInboxMessageBody function and pass the message guid contained in each message of this request.
	 * All other action like mark as read, favorite, delete, etc. can be done using this message GUID.
	 * The "onUpdate" callback will be triggered when the user receives a new message. It will provide an updated list of messages, ranging from 0 to 20, to the onUpdate callback function.
	 *
	 * **Visitor mode: not supported**
	 *
	 * @param params
	 */
	public async getInboxMessages({
		from,
		to,
		onlyFavorite,
		categoryId,
		read_status,
		onUpdate,
	}: {
		from?: number;
		to?: number;
		onlyFavorite?: boolean;
		categoryId?: InboxCategories;
		read_status?: InboxReadStatus;
		onUpdate?: (data: TInboxMessage[]) => void;
	} = {}): Promise<TInboxMessage[]> {
		if (onUpdate) {
			this.onUpdateCallback.set(onUpdateContextKey.InboxMessages, onUpdate);
		}
		return await this.api.getInboxMessagesT(null, from, to, onlyFavorite, categoryId, read_status);
	}

	/**
	 * Returns inbox unread count.
	 *
	 * **Visitor mode: not supported**
	 * @param params
	 */
	public async getInboxUnreadCount({ onUpdate }: { onUpdate?: (unread_count: number) => void } = {}): Promise<number> {
		if (onUpdate) {
			this.onUpdateCallback.set(onUpdateContextKey.InboxUnreadCount, onUpdate);
		}
		return OCache.use(
			onUpdateContextKey.InboxUnreadCount,
			ECacheContext.WSAPI,
			() => this.api.getInboxUnreadCountT(null),
			CACHE_DATA_SEC,
		);
	}

	/**
	 * Returns the message body of the specified message guid.
	 *
	 * **Visitor mode: not supported**
	 */
	public async getInboxMessageBody(messageGuid: string): Promise<TInboxMessageBody> {
		return await this.api.getInboxMessageBodyT(messageGuid);
	}

	/**
	 * Requests to mark inbox message with specified guid as read
	 *
	 * **Visitor mode: not supported**
	 */
	public async markInboxMessageAsRead(messageGuid: string): Promise<InboxMarkMessageAction> {
		const r = await this.api.markInboxMessageRead(null, messageGuid);

		return {
			err_code: r.errCode,
			err_message: r.errMsg,
		};
	}

	/**
	 * Requests to mark all inbox messages as rea
	 *
	 * **Visitor mode: not supported**
	 */
	public async markAllInboxMessagesAsRead(): Promise<InboxMarkMessageAction> {
		const r = await this.api.markAllInboxMessageRead(null);

		return {
			err_code: r.errCode,
			err_message: r.errMsg,
		};
	}

	/**
	 * Requests to mark inbox message with specified guid as favorite. Pass mark true to add message to favorite and false to remove.
	 *
	 * **Visitor mode: not supported**
	 */
	public async markUnmarkInboxMessageAsFavorite(messageGuid: string, mark: boolean): Promise<InboxMarkMessageAction> {
		const r = await this.api.markUnmarkInboxMessageAsFavorite(null, messageGuid, mark);

		return {
			err_code: r.errCode,
			err_message: r.errMsg,
		};
	}

	/**
	 * Requests to delete inbox message
	 *
	 * **Visitor mode: not supported**
	 */

	public async deleteInboxMessage(messageGuid: string): Promise<InboxMarkMessageAction> {
		const r = await this.api.deleteInboxMessage(null, messageGuid);

		return {
			err_code: r.errCode,
			err_message: r.errMsg,
		};
	}

	/**
	 * Requests to delete all inbox messages
	 *
	 * **Visitor mode: not supported**
	 */

	public async deleteAllInboxMessages(): Promise<InboxMarkMessageAction> {
		const r = await this.api.deleteAllInboxMessages(null);

		return {
			err_code: r.errCode,
			err_message: r.errMsg,
		};
	}

	/**
	 * Requests translations for the given language. Returns the object including translation key/translation value pairs. All possible translation keys defined in the back office.
	 */
	public async getTranslations(lang_code: string): Promise<TGetTranslations> {
		const r = await this.api.getTranslationsT(null, lang_code, []);

		return {
			translations: r.translations,
		};
	}

	/**
	 * Reports an impression event for an engagement (when engagement content is displayed to the user).
	 * Use this method to track when users view engagement content such as inbox messages, popups.
	 * When using for Inbox cases, you need to use message guid as engagement_uid, and pass 31 as activityType.
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.reportImpressionEvent({
	 *      engagement_uid: 'abc123-def456',
	 *      activityType: 31 // Inbox
	 * });
	 * ```
	 *
	 * **Visitor mode: not supported**
	 *
	 * @param params.engagement_uid - Unique identifier for the engagement
	 * @param params.activityType - Type of engagement activity (Popup=30, Inbox=31)
	 */
	public reportImpressionEvent({
		engagement_uid,
		activityType,
	}: {
		engagement_uid: string;
		activityType: ActivityTypeLimited | number;
	}): void {
		this.api.reportEngagementImpression(null, engagement_uid, activityType);
	}

	/**
	 * Reports a click/action event for an engagement (when user interacts with engagement content).
	 * Use this method to track when users click on or interact with engagement content such as inbox messages, popups.
	 * When using for Inbox cases, you need to use message guid as engagement_uid, and pass 31 as activityType, and pass the action/deeplink that was triggered by the user interaction as action.
	 * 
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.reportClickEvent({
	 *      engagement_uid: 'abc123-def456',
	 *      activityType: 31 // Inbox,
	 *      action: 'dp:gf_missions'
	 * });
	 * ```
	 *
	 * **Visitor mode: not supported**
	 *
	 * @param params.engagement_uid - Unique identifier for the engagement
	 * @param params.activityType - Type of engagement activity (Popup=30, Inbox=31)
	 * @param params.action - Optional action/deeplink that was triggered by the user interaction
	 */
	public reportClickEvent({
		engagement_uid,
		activityType,
		action,
	}: {
		engagement_uid: string;
		activityType: ActivityTypeLimited | number;
		action?: string;
	}): void {
		this.api.reportEngagementAction(null, engagement_uid, activityType, action);
	}

	/**
	 * Returns the points history for a user within a specified time range.
	 * The response includes both points changes and gems/diamonds changes.
	 * Each log entry contains information about the change amount, balance, and source.
	 * The returned list is cached for 30 seconds. 
	 * You can pass the onUpdate callback as a parameter, it will be called every time the points history is updated and will provide the updated list of points history logs for the last 10 minutes.
	 *
	 * **Example**:
	 * ```
	 * const startTime = Math.floor(Date.now() / 1000) - 86400 * 30; // 30 days ago
	 * const endTime = Math.floor(Date.now() / 1000); // now
	 *
	 * _smartico.api.getPointsHistory({
	 *      startTimeSeconds: startTime,
	 *      endTimeSeconds: endTime,
	 *      onUpdate: (data) => console.log('Updated:', data)
	 * }).then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 * **Visitor mode: not supported**
	 *
	 * @param params.startTimeSeconds - Start time in seconds (epoch timestamp)
	 * @param params.endTimeSeconds - End time in seconds (epoch timestamp)
	 * @param params.onUpdate - Optional callback function that will be called when the points history is updated
	 */
	public async getPointsHistory({
		startTimeSeconds,
		endTimeSeconds,
		onUpdate,
	}: {
		startTimeSeconds: number;
		endTimeSeconds: number;
		onUpdate?: (data: TPointsHistoryLog[]) => void;
	}): Promise<TPointsHistoryLog[]> {

		if (onUpdate) {
			this.onUpdateCallback.set(onUpdateContextKey.PointsHistory, onUpdate);
		}

		return await OCache.use(
			onUpdateContextKey.PointsHistory,
			ECacheContext.WSAPI,
			() => this.api.getPointsHistoryT(null, startTimeSeconds, endTimeSeconds),
			CACHE_DATA_SEC,
		);
	}

	private async updateOnSpin(data: SAWSpinsCountPush) {
		const templates: TMiniGameTemplate[] = await OCache.use(
			onUpdateContextKey.Saw,
			ECacheContext.WSAPI,
			() => this.api.sawGetTemplatesT(null),
			CACHE_DATA_SEC,
		);
		const index = templates.findIndex((t) => t.id === data.saw_template_id);
		templates[index].spin_count = data.spin_count;
		this.updateEntity(onUpdateContextKey.Saw, templates);
	}

	private async reloadMiniGameTemplate() {
		const updatedTemplates = await this.api.sawGetTemplatesT(null);
		this.updateEntity(onUpdateContextKey.Saw, updatedTemplates);
	}

	private async updateMissions() {
		const payload = await this.api.missionsGetItemsT(null);
		this.updateEntity(onUpdateContextKey.Missions, payload);
	}

	private async updateBonuses() {
		const payload = await this.api.bonusesGetItemsT(null);
		this.updateEntity(onUpdateContextKey.Bonuses, payload);
	}

	private async updateTournaments() {
		const payload = await this.api.tournamentsGetLobbyT(null);
		this.updateEntity(onUpdateContextKey.TournamentList, payload);
	}

	private async updateStorePurchasedItems() {
		const payload = await this.api.storeGetPurchasedItemsT(null, 20, 0);
		this.updateEntity(onUpdateContextKey.StoreHistory, payload);
	}

	private async updateStoreItems() {
		const payload = await this.api.storeGetItemsT(null);
		this.updateEntity(onUpdateContextKey.StoreItems, payload);
	}

	private async updateInboxUnreadCount(count: number) {
		this.updateEntity(onUpdateContextKey.InboxUnreadCount, count);
	}

	private async updateInboxMessages() {
		const payload = await this.api.getInboxMessagesT(null);
		this.updateEntity(onUpdateContextKey.InboxMessages, payload);
	}

	private async updateRaffles() {
		const payload = await this.api.getRafflesT(null);
		this.updateEntity(onUpdateContextKey.Raffles, payload);
	}

	private async notifyPointsHistoryUpdate() {
		const startSeconds = Date.now() / 1000 - 600;
		const endSeconds = Date.now() / 1000;
		const payload = await this.api.getPointsHistoryT(null, startSeconds , endSeconds);

		this.updateEntity(onUpdateContextKey.PointsHistory, payload);
	}

	private async updateEntity(contextKey: onUpdateContextKey, payload: any) {
		OCache.set(contextKey, payload, ECacheContext.WSAPI);

		const onUpdate = this.onUpdateCallback.get(contextKey);
		if (onUpdate) {
			onUpdate(payload);
		}
	}

	private async jackpotClearCache() {
		OCache.clear(ECacheContext.WSAPI, onUpdateContextKey.Jackpots);
		OCache.clear(ECacheContext.WSAPI, onUpdateContextKey.Pots);
		OCache.clear(ECacheContext.WSAPI, onUpdateContextKey.JackpotWinners);
	}

	/** Returns list of Jackpots that are active in the systen and matching to the filter definition.
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
				const _jackpots = await this.api.jackpotGet(null, filter);
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
					return (await this.api.potGet(null, { jp_template_ids })).items;
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

		const result = await this.api.jackpotOptIn(null, filter);

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

		const result = await this.api.jackpotOptOut(null, filter);

		return result;
	}

	/**
	 * Returns the winners of the jackpot with the specified jp_template_id.
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
	 */

	public async getJackpotWinners({
		limit,
		offset,
		jp_template_id,
	} : {
		limit?: number;
		offset?: number;
		jp_template_id?: number;
	}): Promise<JackpotWinnerHistory[]> {
		return OCache.use(
			onUpdateContextKey.JackpotWinners + jp_template_id,
			ECacheContext.WSAPI,
			() => this.api.getJackpotWinnersT(null, limit, offset, jp_template_id),
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
			() => this.api.getJackpotEligibleGamesT(null, { jp_template_id }),
			JACKPOT_ELIGIBLE_GAMES_CACHE_SEC,
		);
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
		const result = await this.api.getRelatedItemsForGame(null, related_game_id);
		return result;
	}

	/**
	 * Returns the list of Raffles available for user
	 * The returned list of Raffles is cached for 30 seconds. But you can pass the onUpdate callback as a parameter. Note that each time you call getRaffles with a new onUpdate callback, the old one will be overwritten by the new one.
	 * The onUpdate callback will be called on claiming prize.  Updated Raffles will be passed to onUpdate callback.
	 *
	 * **Example**:
	 * 
	 * ```
	 * _smartico.api.getRaffles().then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 * **Example in the Visitor mode**:
	 * 
	 * ```
	 * _smartico.vapi('EN').getRaffles().then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 */

	public async getRaffles({ onUpdate }: { onUpdate?: (data: TRaffle[]) => void } = {}): Promise<TRaffle[]> {
		if (onUpdate) {
			this.onUpdateCallback.set(onUpdateContextKey.Raffles, onUpdate);
		}

		return OCache.use(onUpdateContextKey.Raffles, ECacheContext.WSAPI, () => this.api.getRafflesT(null), CACHE_DATA_SEC);
	}

	/**
	 * Returns draw run for provided raffle_id and run_id
	 *
	 *
	 * **Example**:
	 * 
	 * ```javascript
	 * _smartico.api.getRaffleDrawRun({raffle_id: 156, run_id: 145}).then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 * **Example in the Visitor mode**:
	 * 
	 * 
	 * ```javascript
	 * _smartico.vapi('EN').getRaffleDrawRun({ raffle_id: 156, run_id: 145 }).then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 */

	public async getRaffleDrawRun(props: { raffle_id: number; run_id: number }): Promise<TRaffleDraw> {
		const res = await this.api.getRaffleDrawRun(null, props);

		if (!props.raffle_id || !props.run_id) {
			throw new Error('both raffle_id and run_id are required');
		}

		return drawRunTransform(res);
	}

	/**
	 * Returns history of draw runs for the provided raffle_id and draw_id, if the draw_id is not provided will return history of all the draws for the provided raffle_id
	 *
	 *
	 * **Example**:
	 * 
	 * ```javascript
	 * _smartico.api.getRaffleDrawRunHistory({raffle_id:156, draw_id: 432}).then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 * **Example in the Visitor mode**:
	 * 
	 * ```javascript
	 * _smartico.vapi('EN').getRaffleDrawRunHistory({ raffle_id: 156, draw_id: 432 }).then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 */

	public async getRaffleDrawRunsHistory(props: { raffle_id: number; draw_id?: number }): Promise<TRaffleDrawRun[]> {
		const res = await this.api.getRaffleDrawRunsHistory(null, props);

		if (!props.raffle_id) {
			throw new Error('raffle_id is required');
		}

		return drawRunHistoryTransform(res);
	}

	/**
	 * Returns error code, and error Message after calling the function, error message 0 - means that the request was successful
	 *
	 *
	 * **Example**:
	 * 
	 * ```javascript
	 * _smartico.api.claimRafflePrize({won_id:251}).then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 * **Example in the Visitor mode**:
	 * 
	 * ```javascript
	 * _smartico.vapi('EN').claimRafflePrize({ won_id: 251 }).then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 */
	public async claimRafflePrize(props: { won_id: number }): Promise<TransformedRaffleClaimPrizeResponse> {
		if (!props.won_id) {
			throw new Error('won_id is required');
		}

		const res = await this.api.claimRafflePrize(null, { won_id: props.won_id });
		return raffleClaimPrizeResponseTransform(res);
	}

	/**
	 * Returns error code, and error Message after calling the function, error message 0 - means that the request was successful
	 *
	 *
	 * **Example**:
	 * 
	 * ```javascript
	 * _smartico.api.raffleOptin({
	 * 	raffle_id: 295,
	 * 	draw_id: 3444,
	 * 	raffle_run_id: 232323
	 * }).then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 */
	public async raffleOptin(props: RaffleOptinRequest): Promise<RaffleOptinResponse> {
		if (!props.raffle_id) {
			throw new Error('raffle_id is required');
		}
		if (!props.draw_id) {
			throw new Error('draw_id is required');
		}
		if (!props.raffle_run_id) {
			throw new Error('raffle_run_id is required');
		}

		const result = await this.api.raffleOptin(null, props);

		return result;
	}
}
