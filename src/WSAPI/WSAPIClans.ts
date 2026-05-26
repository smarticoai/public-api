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
import { WSAPITournaments } from './WSAPITournaments';

/** @group Clans */
export class WSAPIClans extends WSAPITournaments {
	/**
	 * Returns clans list payload for the current user.
	 * The returned payload is cached for 30 seconds.
	 * If onUpdate is passed, it will be called when clans response is received.
	 *
	 * **Visitor mode: not supported**
	 */
	public async getClans({ onUpdate }: { onUpdate?: (data: TClans) => void } = {}): Promise<TClans> {
		if (onUpdate) {
			this.onUpdateCallback.set(onUpdateContextKey.Clans, onUpdate);
		}

		return OCache.use(
			onUpdateContextKey.Clans,
			ECacheContext.WSAPI,
			() => this.api.clansGetListT(this.userExtId),
			CACHE_DATA_SEC,
		);
	}

	/**
	 * Returns detailed information for a specific clan including its members.
	 *
	 * **Visitor mode: not supported**
	 */
	public async getClanInfo(clanId: number): Promise<TClanInfo> {
		return this.api.clansGetInfoT(this.userExtId, clanId);
	}

	/**
	 * Joins a clan on behalf of the current user.
	 *
	 * **Visitor mode: not supported**
	 */
	public async joinClan(clanId: number): Promise<TClanJoinResult> {
		return this.api.clanJoin(this.userExtId, clanId);
	}

	protected async updateClans() {
		const payload = await this.api.clansGetListT(this.userExtId);
		this.updateEntity(onUpdateContextKey.Clans, payload);
	}
}
