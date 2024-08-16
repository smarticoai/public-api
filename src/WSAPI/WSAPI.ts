import { ClassId } from '../Base/ClassId';
import { CoreUtils } from '../Core';
import { MiniGamePrizeTypeName, SAWDoSpinResponse, SAWSpinErrorCode, SAWSpinsCountPush } from '../MiniGames';
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
	UserLevelExtraCountersT,TBonus,
	TClaimBonusResult
} from './WSAPITypes';
import { LeaderBoardPeriodType } from '../Leaderboard';
import {
	JackpotDetails,
	JackpotPot,
	JackpotWinPush,
	JackpotsOptinResponse,
	JackpotsOptoutRequest,
	JackpotsOptoutResponse,
} from '../Jackpots';

/** @hidden */
const CACHE_DATA_SEC = 30;

const JACKPOT_TEMPLATE_CACHE_SEC = 30;
const JACKPOT_POT_CACHE_SEC = 1;

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
			on(ClassId.SAW_SHOW_SPIN_PUSH, () => this.updateOnAddSpin());
			on(ClassId.SAW_DO_SPIN_RESPONSE, (data: SAWDoSpinResponse) =>
				on(ClassId.SAW_AKNOWLEDGE_RESPONSE, () => this.updateOnPrizeWin(data)),
			);
			on(ClassId.MISSION_OPTIN_RESPONSE, () => this.updateMissionsOnOptIn());
			on(ClassId.TOURNAMENT_REGISTER_RESPONSE, () => this.updateTournamentsOnRegistration());
			on(ClassId.CLIENT_ENGAGEMENT_EVENT_NEW, () => this.updateInboxMessages());
			on(ClassId.LOGOUT_RESPONSE, () => OCache.clearContext(ECacheContext.WSAPI));
			on(ClassId.IDENTIFY_RESPONSE, () => OCache.clearContext(ECacheContext.WSAPI));
			on(ClassId.JP_WIN_PUSH, (data: JackpotWinPush) => this.jackpotClearCache());
			on(ClassId.JP_OPTOUT_RESPONSE, (data: JackpotsOptoutRequest) => this.jackpotClearCache());
			on(ClassId.JP_OPTIN_RESPONSE, (data: JackpotsOptinResponse) => this.jackpotClearCache());
		}
	}

	/** Returns information about current user
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.getUserProfile().then((result) => {
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
	 *
	 * **Visitor mode: not supported**
	 */
	public async getBonuses(): Promise<TBonus[]> {
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
	 */

	public async getStoreItems(): Promise<TStoreItem[]> {
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
			() => this.api.getCustomSectionsT(null),
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
	 * Plays the specified by template_id mini-game on behalf of user and returns prize_id or err_code
	 *
	 * **Visitor mode: not supported**
	 */
	public async playMiniGame(template_id: number): Promise<TMiniGamePlayResult> {
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
	 * The maximum number of messages per request is limited to 20. An indicator "onlyFavorite" can be passed to get only messages marked as favorites.
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
		onUpdate,
	}: { from?: number; to?: number; onlyFavorite?: boolean; onUpdate?: (data: TInboxMessage[]) => void } = {}): Promise<
		TInboxMessage[]
	> {
		if (onUpdate) {
			this.onUpdateCallback.set(onUpdateContextKey.InboxMessages, onUpdate);
		}

		return await this.api.getInboxMessagesT(null, from, to, onlyFavorite);
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

	private async updateOnAddSpin() {
		const payload = await this.api.sawGetTemplatesT(null);
		this.updateEntity(onUpdateContextKey.Saw, payload);
	}

	private async updateOnPrizeWin(data: SAWDoSpinResponse) {
		if (data.errCode === SAWSpinErrorCode.SAW_OK) {
			const templates: TMiniGameTemplate[] = await OCache.use(
				onUpdateContextKey.Saw,
				ECacheContext.WSAPI,
				() => this.api.sawGetTemplatesT(null),
				CACHE_DATA_SEC,
			);
			const template: TMiniGameTemplate = templates.find((t) => t.prizes.find((p) => p.id === data.saw_prize_id));
			const prizeType = template.prizes.find((p) => p.id === data.saw_prize_id)?.prize_type;

			if (
				template.jackpot_add_on_attempt ||
				template.spin_count === 1 ||
				prizeType === MiniGamePrizeTypeName.JACKPOT ||
				prizeType === MiniGamePrizeTypeName.SPIN
			) {
				const updatedTemplates = await this.api.sawGetTemplatesT(null);
				this.updateEntity(onUpdateContextKey.Saw, updatedTemplates);
			}
		}
	}

	private async updateMissionsOnOptIn() {
		const payload = await this.api.missionsGetItemsT(null);
		this.updateEntity(onUpdateContextKey.Missions, payload);
	}

	private async updateTournamentsOnRegistration() {
		const payload = await this.api.tournamentsGetLobbyT(null);
		this.updateEntity(onUpdateContextKey.TournamentList, payload);
	}

	private async updateInboxMessages() {
		const payload = await this.api.getInboxMessagesT(null);
		this.updateEntity(onUpdateContextKey.InboxMessages, payload);
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
}
