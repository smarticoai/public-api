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
import { WSAPIMiniGames } from './WSAPIMiniGames';

/** @group Avatars */
export class WSAPIAvatars extends WSAPIMiniGames {
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
			() => this.api.avatarsGetListT(this.userExtId),
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
			() => this.api.avatarsGetCustomizedT(this.userExtId),
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
			() => this.api.avatarsGetPromptsT(this.userExtId),
			CACHE_DATA_SEC,
		);
	}

	/**
	 * Sets the specified avatar as the active avatar for the current user.
	 * Pass `avatar_url` (the `TAvatarDefinition.url` path or a CDN URL for AI-customized avatars)
	 * and `avatar_real_id` from the avatar catalog.
	 * After a successful call, the avatar list cache is cleared so the next `getAvatarsList()` call reflects `is_in_use`.
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.getAvatarsList().then((avatars) => {
	 *      const avatar = avatars.find((a) => !a.hide_until_achieved || a.is_given);
	 *      if (avatar) {
	 *          _smartico.api.setAvatar({
	 *              avatar_url: avatar.url,
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
}
