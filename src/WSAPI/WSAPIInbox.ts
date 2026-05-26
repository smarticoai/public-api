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
import { WSAPILeaderBoard } from './WSAPILeaderBoard';

/** @group Inbox */
export class WSAPIInbox extends WSAPILeaderBoard {
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
	 * @param params - Event parameters
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
	 * @param params - Event parameters
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

	protected async updateInboxUnreadCount(count: number) {
		this.updateEntity(onUpdateContextKey.InboxUnreadCount, count);
	}

	protected async updateInboxMessages() {
		const payload = await this.api.getInboxMessagesT(this.userExtId);
		this.updateEntity(onUpdateContextKey.InboxMessages, payload);
	}
}
