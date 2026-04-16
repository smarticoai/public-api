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
	TActivityLog,
	TRaffleOptinResponse,
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
	ActivityLog = 'activityLog',
	AvatarsList = 'avatarsList',
	AvatarsCustomized = 'avatarsCustomized',
	AvatarPrompts = 'avatarPrompts',
}

/** @group General API */
export class WSAPI {
	private onUpdateCallback: Map<onUpdateContextKey, (data: any) => void> = new Map();
	private jackpotGetSignature: string = '';
	private userExtId: string = null;

	/** @private */
	constructor(private api: SmarticoAPI, userExtId: string = null) {
		this.userExtId = userExtId;
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
			on(ClassId.RAF_CLAIM_PRIZE_RESPONSE, () => this.updateRaffles());
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
					this.notifyActivityLogUpdate();
				}
			});
			on(ClassId.RAF_OPTIN_RESPONSE, () => this.updateRaffles());
		}
	}

	/** @private */
	// AA: this method is used from the _smartico script to clear cache when the context is changed,
	// e.g. when user is changed or language is changed
	public clearCaches() {
		OCache.clearAll();
	}

	/** Returns information about current user
	 * Pay attention that this method is synchronous and returns the user profile object immediately, not a promise.
	 * **Example**:
	 * ```
	 * var p = _smartico.api.getUserProfile();
	 * console.log(p);
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

	/** Returns all the missions configured for the current user (server-side scoped, not filtered by Widget visibility).
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
			() => this.api.missionsGetItemsT(this.userExtId),
			CACHE_DATA_SEC,
		);
	}

	/**
	 * Returns all the badges available to the current user
	 *
	 * **Visitor mode: not supported**
	 */
	public async getBadges(): Promise<TMissionOrBadge[]> {
		return OCache.use(onUpdateContextKey.Badges, ECacheContext.WSAPI, () => this.api.badgetsGetItemsT(this.userExtId), CACHE_DATA_SEC);
	}

	/**
	 * Returns all the bonuses for the current user
	 * The returned bonuses are cached for 30 seconds. But you can pass the onUpdate callback as a parameter.
	 * Note that each time you call getBonuses with a new onUpdate callback, the old one will be overwritten by the new one.
	 * The onUpdate callback will be called on bonus claimed and the updated bonuses will be passed to it.
	 *
	 * **Visitor mode: not supported**
	 */
	public async getBonuses({ onUpdate }: { onUpdate?: (data: TBonus[]) => void } = {}): Promise<TBonus[]> {
		if (onUpdate) {
			this.onUpdateCallback.set(onUpdateContextKey.Bonuses, onUpdate);
		}

		return OCache.use(onUpdateContextKey.Bonuses, ECacheContext.WSAPI, () => this.api.bonusesGetItemsT(this.userExtId), CACHE_DATA_SEC);
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
		const r = await this.api.bonusClaimItem(this.userExtId, bonus_id);

		const o: TClaimBonusResult = {
			err_code: r.errCode,
			err_message: r.errMsg,
			success: r.success,
		};

		return o;
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

	/**
	 *
	 * Returns all the store items available to the current user
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
			() => this.api.storeGetItemsT(this.userExtId),
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
		const r = await this.api.buyStoreItem(this.userExtId, item_id);

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
			() => this.api.storeGetCategoriesT(this.userExtId),
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
			() => this.api.storeGetPurchasedItemsT(this.userExtId, limit, offset),
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
			() => this.api.achGetCategoriesT(this.userExtId),
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
			() => this.api.customSectionsGetT(this.userExtId),
			CACHE_DATA_SEC,
		);
	}

	/**
	 * Returns the list of mini-games configured for the current user (not filtered by spin availability or Widget visibility).
	 * The returned list of mini-games is cached for 30 seconds. But you can pass the onUpdate callback as a parameter. Note that each time you call getMiniGames with a new onUpdate callback, the old one will be overwritten by the new one.
	 * The onUpdate callback will be called on available spin count change, if mini-game has increasing jackpot per spin or won prize is spin/jackpot and if max count of the available user spins equals one, also if the spins were issued to the user manually in the BO. Updated templates will be passed to onUpdate callback.
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

		return OCache.use(onUpdateContextKey.Saw, ECacheContext.WSAPI, () => this.api.sawGetTemplatesT(this.userExtId), CACHE_DATA_SEC);
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
			() => this.api.getSawWinningHistoryT(this.userExtId, limit, offset, saw_template_id),
			CACHE_DATA_SEC,
		);
	}

	/**
	 * Plays the specified by template_id mini-game on behalf of user and returns prize_id or err_code
	 * After playMiniGame is called, you can call getMiniGames to get the list of mini-games.The returned list of mini-games is cached for 30 seconds. But you can pass the onUpdate callback as a parameter. Note that each time you call playMiniGame with a new onUpdate callback, the old one will be overwritten by the new one.
	 * The onUpdate callback will be called on available spin count change, if mini-game has increasing jackpot per spin or won prize is spin/jackpot and if max count of the available user spins equals one, also if the spins were issued to the user manually in the BO. Updated templates will be passed to onUpdate callback.
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

		const r = await this.api.sawSpinRequest(this.userExtId, template_id);
		this.api.doAcknowledgeRequest(this.userExtId, r.request_id);

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
		return this.api.doAcknowledgeRequest(this.userExtId, request_id);
	}

	/**
	 * Plays the specified by template_id mini-game on behalf of user spin_count times and returns array of the prizes
	 * After playMiniGameBatch is called, you can call getMiniGames to get the list of mini-games. The returned list of mini-games is cached for 30 seconds. But you can pass the onUpdate callback as a parameter. Note that each time you call playMiniGameBatch with a new onUpdate callback, the old one will be overwritten by the new one.
	 * The onUpdate callback will be called on available spin count change, if mini-game has increasing jackpot per spin or won prize is spin/jackpot and if max count of the available user spins equals one, also if the spins were issued to the user manually in the BO. Updated templates will be passed to onUpdate callback.
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
		{ onUpdate }: { onUpdate?: (data: TMiniGameTemplate[]) => void } = {},
	): Promise<TMiniGamePlayBatchResult[]> {
		if (onUpdate) {
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

	/**
	 * Requests an opt-in for the specified mission_id. Returns the err_code.
	 *
	 * **Visitor mode: not supported**
	 */
	public async requestMissionOptIn(mission_id: number): Promise<TMissionOptInResult> {
		const r = await this.api.missionOptIn(this.userExtId, mission_id);

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
		const r = await this.api.missionClaimPrize(this.userExtId, mission_id, ach_completed_id);

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
			() => this.api.tournamentsGetLobbyT(this.userExtId),
			CACHE_DATA_SEC,
		);
	}

	/**
	 * Returns detailed information for a specific tournament instance; the response includes tournament info and the leaderboard of players
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
		return this.api.tournamentsGetInfoT(this.userExtId, tournamentInstanceId);
	}

	/**
	 * Requests registration for the specified tournament instance. Returns the err_code.
	 *
	 * **Visitor mode: not supported**
	 */
	public async registerInTournament(tournamentInstanceId: number): Promise<TTournamentRegistrationResult> {
		const r = await this.api.registerInTournament(this.userExtId, tournamentInstanceId);

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
			() => this.api.leaderboardsGetT(this.userExtId, periodType, getPreviousPeriod),
			CACHE_DATA_SEC,
		);
	}

	/** Returns inbox messages based on the provided parameters. "From" and "to" indicate the range of messages to be fetched.
	 * The maximum number of messages per request is limited to 20. 
	 * An indicator "onlyFavorite" can be passed to get only messages marked as favorites.
	 * An indicator "read_status" can be passed to get only messages marked as read or unread.
	 * You can leave this params empty and by default it will return list of messages ranging from 0 to 20.
	 * This function returns a list of messages without the body of each message.
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
		return await this.api.getInboxMessagesT(this.userExtId, from, to, onlyFavorite, categoryId, read_status);
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
			() => this.api.getInboxUnreadCountT(this.userExtId),
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
		const r = await this.api.markInboxMessageRead(this.userExtId, messageGuid);

		return {
			err_code: r.errCode,
			err_message: r.errMsg,
		};
	}

	/**
	 * Requests to mark all inbox messages as read
	 *
	 * **Visitor mode: not supported**
	 */
	public async markAllInboxMessagesAsRead(): Promise<InboxMarkMessageAction> {
		const r = await this.api.markAllInboxMessageRead(this.userExtId);

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
		const r = await this.api.markUnmarkInboxMessageAsFavorite(this.userExtId, messageGuid, mark);

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
		const r = await this.api.deleteInboxMessage(this.userExtId, messageGuid);

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
		const r = await this.api.deleteAllInboxMessages(this.userExtId);

		return {
			err_code: r.errCode,
			err_message: r.errMsg,
		};
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
		this.api.reportEngagementImpression(this.userExtId, engagement_uid, activityType);
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
	 *      activityType: 31 // Inbox
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
		this.api.reportEngagementAction(this.userExtId, engagement_uid, activityType, action);
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

	/**
	 * Returns the list of avatars available in the catalog for the current user.
	 * The response includes both free avatars and earned/purchased ones.
	 * Avatars with `hide_until_achieved = true` and `is_given = false` should be hidden from the user.
	 * The result is cached for 30 seconds.
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.getAvatarsList().then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 * **Visitor mode: not supported**
	 */
	public async getAvatarsList(): Promise<TAvatarDefinition[]> {
		return OCache.use(
			onUpdateContextKey.AvatarsList,
			ECacheContext.WSAPI,
			async () => {
				const response = await this.api.avatarsGetList(this.userExtId);
				return (response.avatars || []).map((a) => ({
					...a,
					avatar_url: this.api.avatarDomain && a.public_meta?.url
						? (a.public_meta.url.startsWith('http') ? a.public_meta.url : `${this.api.avatarDomain}${a.public_meta.url}`)
						: (a.public_meta?.url || ''),
				}));
			},
			CACHE_DATA_SEC,
		);
	}

	/**
	 * Returns the list of AI-customized avatars for the current user.
	 * Each entry represents a previously generated AI customization for a specific base avatar.
	 * The result is cached for 30 seconds.
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.getAvatarsCustomized().then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 * **Visitor mode: not supported**
	 */
	public async getAvatarsCustomized(): Promise<TAvatarCustomized[]> {
		return OCache.use(
			onUpdateContextKey.AvatarsCustomized,
			ECacheContext.WSAPI,
			async () => {
				const response = await this.api.avatarsGetCustomized(this.userExtId);
				return response.avatars || [];
			},
			CACHE_DATA_SEC,
		);
	}

	/**
	 * Returns the list of AI customization prompts (styles) available for avatar customization.
	 * Each prompt represents a visual style that can be applied to a base avatar.
	 * The result is cached for 30 seconds.
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.getAvatarPrompts().then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 * **Visitor mode: not supported**
	 */
	public async getAvatarPrompts(): Promise<TAvatarPrompt[]> {
		return OCache.use(
			onUpdateContextKey.AvatarPrompts,
			ECacheContext.WSAPI,
			async () => {
				const response = await this.api.avatarsGetPrompts(this.userExtId);
				return response.prompts || [];
			},
			CACHE_DATA_SEC,
		);
	}

	/**
	 * Sets the specified avatar as the active avatar for the current user.
	 * Pass `avatar_url` (the image path from `TAvatarDefinition.public_meta.url` or a CDN URL for AI-customized avatars)
	 * and `avatar_real_id` from the avatar catalog.
	 * After a successful call, the avatar list cache is cleared so the next `getAvatarsList()` call reflects `is_in_use`.
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.getAvatarsList().then((avatars) => {
	 *      const avatar = avatars.find((a) => !a.hide_until_achieved || a.is_given);
	 *      if (avatar) {
	 *          _smartico.api.setAvatar({
	 *              avatar_url: avatar.public_meta.url,
	 *              avatar_real_id: avatar.avatar_real_id,
	 *          }).then((result) => {
	 *              console.log(result);
	 *          });
	 *      }
	 * });
	 * ```
	 *
	 * **Visitor mode: not supported**
	 */
	public async setAvatar(props: { avatar_url: string; avatar_real_id: number }): Promise<TSetAvatarResult> {
		if (!props.avatar_url) {
			throw new Error('avatar_url is required');
		}
		if (!props.avatar_real_id) {
			throw new Error('avatar_real_id is required');
		}

		const r = await this.api.avatarSetAvatar(this.userExtId, props.avatar_url, props.avatar_real_id);

		OCache.clear(ECacheContext.WSAPI, onUpdateContextKey.AvatarsList);
		OCache.clear(ECacheContext.WSAPI, onUpdateContextKey.AvatarsCustomized);

		return {
			err_code: r.errCode ?? 0,
			err_message: r.errMsg,
		};
	}

	private async updateOnSpin(data: SAWSpinsCountPush) {
		const templates: TMiniGameTemplate[] = await OCache.use(
			onUpdateContextKey.Saw,
			ECacheContext.WSAPI,
			() => this.api.sawGetTemplatesT(this.userExtId),
			CACHE_DATA_SEC,
		);
		const index = templates.findIndex((t) => t.id === data.saw_template_id);
		templates[index].spin_count = data.spin_count;
		this.updateEntity(onUpdateContextKey.Saw, templates);
	}

	private async reloadMiniGameTemplate() {
		const updatedTemplates = await this.api.sawGetTemplatesT(this.userExtId);
		this.updateEntity(onUpdateContextKey.Saw, updatedTemplates);
	}

	private async updateMissions() {
		const payload = await this.api.missionsGetItemsT(this.userExtId);
		this.updateEntity(onUpdateContextKey.Missions, payload);
	}

	private async updateBonuses() {
		const payload = await this.api.bonusesGetItemsT(this.userExtId);
		this.updateEntity(onUpdateContextKey.Bonuses, payload);
	}

	private async updateTournaments() {
		const payload = await this.api.tournamentsGetLobbyT(this.userExtId);
		this.updateEntity(onUpdateContextKey.TournamentList, payload);
	}

	private async updateStorePurchasedItems() {
		const payload = await this.api.storeGetPurchasedItemsT(this.userExtId, 20, 0);
		this.updateEntity(onUpdateContextKey.StoreHistory, payload);
	}

	private async updateStoreItems() {
		const payload = await this.api.storeGetItemsT(this.userExtId);
		this.updateEntity(onUpdateContextKey.StoreItems, payload);
	}

	private async updateInboxUnreadCount(count: number) {
		this.updateEntity(onUpdateContextKey.InboxUnreadCount, count);
	}

	private async updateInboxMessages() {
		const payload = await this.api.getInboxMessagesT(this.userExtId);
		this.updateEntity(onUpdateContextKey.InboxMessages, payload);
	}

	private async updateRaffles() {
		const payload = await this.api.getRafflesT(this.userExtId);
		this.updateEntity(onUpdateContextKey.Raffles, payload);
	}

	private async notifyActivityLogUpdate() {
		const startSeconds = Date.now() / 1000 - 600;
		const endSeconds = Date.now() / 1000;
		const payload = await this.api.getActivityLogT(this.userExtId, startSeconds, endSeconds, 0, 50);

		this.updateEntity(onUpdateContextKey.ActivityLog, payload);
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

		return OCache.use(onUpdateContextKey.Raffles, ECacheContext.WSAPI, () => this.api.getRafflesT(this.userExtId), CACHE_DATA_SEC);
	}

	/**
	 * Returns draw run for provided raffle_id and run_id.
	 * You can pass winners_from and winners_to parameters to get a specific range of winners. Default is 0-20.
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

	public async getRaffleDrawRun(props: { raffle_id: number; run_id: number; winners_from?: number; winners_to?: number }): Promise<TRaffleDraw> {
		if (!props.raffle_id || !props.run_id) {
			throw new Error('both raffle_id and run_id are required');
		}

		return await this.api.getRaffleDrawRunT(this.userExtId, props.raffle_id, props.run_id, props.winners_from, props.winners_to);
	}

	/**
	 * Returns history of draw runs for the provided raffle_id and draw_id, if the draw_id is not provided will return history of all the draws for the provided raffle_id
	 *
	 *
	 * **Example**:
	 * 
	 * ```javascript
	 * _smartico.api.getRaffleDrawRunsHistory({ raffle_id: 156, draw_id: 432 }).then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 * **Example in the Visitor mode**:
	 * 
	 * ```javascript
	 * _smartico.vapi('EN').getRaffleDrawRunsHistory({ raffle_id: 156, draw_id: 432 }).then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 */

	public async getRaffleDrawRunsHistory(props: { raffle_id: number; draw_id?: number }): Promise<TRaffleDrawRun[]> {
		
		const res = await this.api.getRaffleDrawRunsHistory(this.userExtId, props);

		if (!props.raffle_id) {
			throw new Error('raffle_id is required');
		}

		return drawRunHistoryTransform(res);
	}

	/**
	 * Returns `err_code` and `err_message` after the call; `err_code` 0 means the request succeeded.
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

		const res = await this.api.claimRafflePrize(this.userExtId, { won_id: props.won_id });
		return raffleClaimPrizeResponseTransform(res);
	}

	/**
	 * Requests an opt-in for the specified raffle. Returns the err_code.
	 *
	 * **Visitor mode: not supported**
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
}
