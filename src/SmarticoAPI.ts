import { ClassId } from './Base/ClassId';
import { ProtocolRequest } from './Base/ProtocolRequest';
import { ProtocolResponse } from './Base/ProtocolResponse';
import { SAWGetTemplatesResponse } from './MiniGames/SAWGetTemplatesResponse';
import { SAWGetTemplatesRequest } from './MiniGames/SAWGetTemplatesRequest';
import { IntUtils } from './IntUtils';
import { ILogger } from './ILogger';
import {
	SAWDoAknowledgeRequest,
	SAWDoAknowledgeResponse,
	SAWDoSpinRequest,
	SAWDoSpinResponse,
	SAWHistoryTransform,
	SAWPrizesHistory,
	SAWSpinErrorCode,
	SAWTemplatesTransform,
	SAWWinningHistoryRequest,
	SAWWinningHistoryResponse,
} from './MiniGames';
import { ECacheContext, OCache } from './OCache';
import {
	CoreUtils,
	GetTranslationsRequest,
	GetTranslationsResponse,
	PublicLabelSettings,
	ResponseIdentify,
	TranslationArea,
} from './Core';
import { GetLabelInfoResponse } from './Core/GetLabelInfoResponse';
import { GetLabelInfoRequest } from './Core/GetLabelInfoRequest';
import {
	GetInboxMessagesRequest,
	GetInboxMessagesResponse,
	InboxMessageBody,
	InboxMessageBodyTransform,
	InboxMessagesTransform,
	InboxReadStatus,
	MarkInboxMessageDeletedRequest,
	MarkInboxMessageDeletedResponse,
	MarkInboxMessageReadRequest,
	MarkInboxMessageReadResponse,
	MarkInboxMessageStarredRequest,
	MarkInboxMessageStarredResponse,
} from './Inbox';
import {
	BuyStoreItemRequest,
	BuyStoreItemResponse,
	GetCategoriesStoreResponse,
	GetStoreHistoryRequest,
	GetStoreHistoryResponse,
	GetStoreItemsResponse,
	StoreCategoryTransform,
	StoreItemPurchasedTransform,
	StoreItemTransform,
} from './Store';
import {
	AchCategoryTransform,
	AchClaimPrizeRequest,
	AchClaimPrizeResponse,
	AchievementOptinRequest,
	AchievementOptinResponse,
	AchievementType,
	GetAchCategoriesResponse,
	GetAchievementMapRequest,
	GetAchievementMapResponse,
	UserAchievementTransform,
} from './Missions';
import {
	GetTournamentInfoRequest,
	GetTournamentInfoResponse,
	GetTournamentsRequest,
	GetTournamentsResponse,
	TournamentItemsTransform,
	TournamentRegisterRequest,
	TournamentRegisterResponse,
	tournamentInfoItemTransform,
} from './Tournaments';
import { GetLeaderBoardsRequest, GetLeaderBoardsResponse, LeaderBoardDetails, LeaderBoardPeriodType } from './Leaderboard';
import { GetLevelMapResponse, GetLevelMapResponseTransform } from './Level';
import { WSAPI } from './WSAPI/WSAPI';
import {
	TInboxMessage,
	TInboxMessageBody,
	TLevel,
	TMiniGameTemplate,
	TMissionOrBadge,
	TStoreCategory,
	TAchCategory,
	TStoreItem,
	TTournament,
	TTournamentDetailed,
	LeaderBoardDetailsT,
	UserLevelExtraCountersT,
	TSegmentCheckResult,
	TUICustomSection,
	TBonus,
	TRaffle,
	TLevelCurrent,
} from './WSAPI/WSAPITypes';
import { getLeaderBoardTransform } from './Leaderboard/LeaderBoards';
import { GetAchievementsUserInfoResponse } from './Core/GetAchievementsUserInfoResponse';
import { CheckSegmentMatchResponse } from './Core/CheckSegmentMatchResponse';
import { CheckSegmentMatchRequest } from './Core/CheckSegmentMatchRequest';
import {
	GetJackpotsPotsRequest,
	GetJackpotsPotsResponse,
	GetJackpotsRequest,
	GetJackpotsResponse,
	JackpotsOptinRequest,
	JackpotsOptinResponse,
	JackpotsOptoutRequest,
	JackpotsOptoutResponse,
} from './Jackpots';
import { GetCustomSectionsRequest, GetCustomSectionsResponse, UICustomSectionTransform } from './CustomSections';
import { BonusItemsTransform, ClaimBonusRequest, ClaimBonusResponse, GetBonusesResponse } from './Bonuses';
import { GetBonusesRequest } from './Bonuses/GetBonusesRequest';
import { SAWDoSpinBatchResponse } from './MiniGames/SAWDoSpinBatchResponse';
import { SAWDoSpinBatchRequest } from './MiniGames/SAWDoSpinBatchRequest';
import { SAWDoAcknowledgeBatchRequest } from './MiniGames/SAWDoAcknowledgeBatchRequest';
import { SAWDoAcknowledgeBatchResponse } from './MiniGames/SAWDoAcknowledgeBatchResponse';
import { GetRelatedAchTourRequest } from './Missions/GetRelatedAchTourRequest';
import { GetRelatedAchTourResponse } from './Missions/GetRelatedAchTourResponse';
import { GetRafflesResponse, raffleTransform } from './Raffle/GetRafflesResponse';
import { GetRafflesRequest } from './Raffle/GetRafflesRequest';
import { InboxCategories } from './Inbox/InboxCategories';
import { GetDrawRunRequest, GetDrawRunResponse, GetRaffleDrawRunsHistoryRequest, GetRaffleDrawRunsHistoryResponse, RaffleClaimPrizeRequest, RaffleClaimPrizeResponse } from './Raffle';
import { GetJackpotWinnersResponse, GetJackpotWinnersResponseTransform, JackpotWinnerHistory } from './Jackpots/GetJackpotWinnersResponse';
import { GetJackpotWinnersRequest } from './Jackpots/GetJackpotWinnersRequest';
import { GetJackpotEligibleGamesRequest } from './Jackpots/GetJackpotEligibleGamesRequest';
import { GetJackpotEligibleGamesResponse, GetJackpotEligibleGamesResponseTransform, JackpotEligibleGame, TGetJackpotEligibleGamesResponse } from './Jackpots/GetJackpotEligibleGamesResponse';

const PUBLIC_API_URL = 'https://papi{ENV_ID}.smartico.ai/services/public';
const C_SOCKET_PROD = 'wss://api{ENV_ID}.smartico.ai/websocket/services';
const AVATAR_DOMAIN = 'https://img{ENV_ID}.smr.vc';
const DEFAULT_LANG_EN = 'EN';

interface Tracker {
	label_api_key: string;
	userPublicProps: any;
	on: (callBackKey: ClassId, func: (data: any) => void) => void;
	getLabelSetting: (key: PublicLabelSettings) => any;
	triggerExternalCallBack: (callBackKey: string, payload: any) => void;
}
interface IOptions {
	logger?: ILogger;
	logCIDs?: ClassId[];
	logHTTPTiming?: boolean;
	tracker?: Tracker;
}

type MessageSender = (message: any, publicApuUrl?: string, expectCID?: ClassId) => Promise<any>;

class SmarticoAPI {
	private publicUrl: string;
	private wsUrl: string;
	private inboxCdnUrl: string;
	private partnerUrl: string;
	public avatarDomain: string;

	private logger: ILogger;
	private logCIDs: ClassId[];
	private logHTTPTiming: boolean;
	public tracker?: Tracker;

	public constructor(
		private label_api_key: string,
		private brand_api_key: string,
		private messageSender: MessageSender,
		options: IOptions = {},
	) {
		this.logger = options.logger || (console as any);

		if (this.logger.always === undefined) {
			this.logger.always = this.logger.info;
		}

		this.logCIDs = options.logCIDs || [];
		this.logHTTPTiming = options.logHTTPTiming || false;
		this.tracker = options.tracker;

		this.publicUrl = SmarticoAPI.getPublicUrl(label_api_key);
		this.wsUrl = SmarticoAPI.getPublicWsUrl(label_api_key);

		this.avatarDomain = SmarticoAPI.getAvatarUrl(label_api_key || options.tracker?.label_api_key);

		this.label_api_key = SmarticoAPI.getCleanLabelApiKey(label_api_key);
	}

	public static getEnvDnsSuffix(label_api_key: string): string {
		let ENV_ID = label_api_key.length === 38 ? label_api_key.substring(37, 38) : '';

		if (ENV_ID === '1' || ENV_ID === '2') {
			ENV_ID = '';
		}
		return ENV_ID;
	}

	public static replaceSmrDomainsWithCloudfront<T>(value: string | {[key: string]: any}): T {
		if (!value) {
			return value as T;
		}

		const domains = {
			'img.smr.vc': 'd1am61onjxtys8.cloudfront.net',
			'img3.smr.vc': 'd3dubbodzd2q05.cloudfront.net',
			'img4.smr.vc': 'dvm0p9vsezqr2.cloudfront.net',
			'img5.smr.vc': 'd3gen1ksvxhac8.cloudfront.net',
			'img6.smr.vc': 'db1kmyg7iufeo.cloudfront.net',
			'img7.smr.vc': 'd36om2g86xefo6.cloudfront.net',
			'img8.smr.vc': 'd2zme31v54n5pb.cloudfront.net',

			'static.smr.vc': 'dtt380pweilws.cloudfront.net',
			'static3.smr.vc': 'd1qt8ake8g4imn.cloudfront.net',
			'static4.smr.vc': 'd146b4m7rkvjkw.cloudfront.net',
			'static5.smr.vc': 'd3l7suk1kl9rwh.cloudfront.net',
			'static6.smr.vc': 'd121pfj16xdfcq.cloudfront.net',
			'static7.smr.vc': 'd21deilz814qgl.cloudfront.net',
			'static8.smr.vc': 'd1uffsroxjy2ku.cloudfront.net',
		}

		const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

		let replacedValue = typeof value === 'string' ? value : JSON.stringify(value);

		for (const [oldDomain, newDomain] of Object.entries(domains)) {
			replacedValue = replacedValue.replace(new RegExp(escapeRegExp(oldDomain), 'g'), newDomain);
		}

		try {
			return typeof value === 'string' ? replacedValue as T : JSON.parse(replacedValue)
		} catch (err) {
			return value as T;
		}
	}

	public static getEnvId(label_api_key: string): number {
		return label_api_key.length === 38 ? parseInt(label_api_key.substring(37, 38), 10) : 2;
	}

	public static getCleanLabelApiKey(label_api_key: string): string {
		return label_api_key.substring(0, 36);
	}

	public static getPublicUrl(label_api_key: string): string {
		return PUBLIC_API_URL.replace('{ENV_ID}', SmarticoAPI.getEnvDnsSuffix(label_api_key));
	}

	public static getPublicWsUrl(label_api_key: string): string {
		return C_SOCKET_PROD.replace('{ENV_ID}', SmarticoAPI.getEnvDnsSuffix(label_api_key));
	}

	public static getAvatarUrl(label_api_key: string): string {
		const envId = SmarticoAPI.getEnvDnsSuffix(label_api_key);
		const avatarUrl = AVATAR_DOMAIN.replace('{ENV_ID}', SmarticoAPI.getEnvDnsSuffix(label_api_key));
		return SmarticoAPI.replaceSmrDomainsWithCloudfront(avatarUrl);
	}

	private async send<T>(message: any, expectCID?: ClassId, force_language?: string): Promise<T> {
		if (this.logCIDs.includes(message.cid)) {
			this.logger.info('REQ', message);
		}

		if (force_language) {
			message.force_language = force_language;
		}

		let result: any;

		try {
			const timeStart = new Date().getTime();
			result = await this.messageSender(message, this.publicUrl, expectCID);

			if (result.errCode && result.errSetup) {
				throw new Error(result.errMessage);
			}

			result = SmarticoAPI.replaceSmrDomainsWithCloudfront(result);
			const timeEnd = new Date().getTime();

			if (this.logHTTPTiming) {
				this.logger.always('HTTP time, ms:' + (timeEnd - timeStart));
			}
		} catch (e) {
			this.logger.warn(`Failed to make request to smartico channel, L2. ${e.message}`, {
				url: this.publicUrl,
				request: message,
				error: e.message,
			});
			throw new Error(`Failed to make request to smartico channel, L2 L1. ${e.message}`);
		}

		if (this.logCIDs.includes(message.cid)) {
			this.logger.info('RES', result);
		}

		if (expectCID) {
			if (Array.isArray(result)) {
				for (const str of result as string[]) {
					const obj: ProtocolResponse = JSON.parse(str);
					if (this.logCIDs.includes(obj.cid)) {
						this.logger.info('RES', result);
					}
					if (obj.cid === expectCID) {
						return obj as any;
					}
				}
				this.logger.error(`Cant find proper response in array, expected CID ${expectCID}`, {
					request: message,
					response: result,
				});
			} else {
				return result;
			}
		} else {
			if (Array.isArray(result)) {
				if (result.length === 1) {
					const obj = JSON.parse(result[0]);
					if (this.logCIDs.includes(obj.cid)) {
						this.logger.info('RES', result);
					}
					return obj;
				} else {
					this.logger.error('Expected one response, but got array', { request: message, response: result });
				}
			}
			return result;
		}
	}

	private buildMessage<TRequest, TResponse>(user_ext_id: string, cid: ClassId, payload: Partial<TRequest> = {}): TResponse {
		const message: ProtocolRequest = {
			// AA: in fact we need api and brand keys and ext_user_id only in the context of HTTP
			// its not needed in WebSocket and can be deleted
			api_key: this.label_api_key,
			brand_key: this.brand_api_key,
			ext_user_id: user_ext_id,
			cid,
			uuid: IntUtils.uuid(),
			ts: new Date().getTime(),
			...payload,
		};

		if (message.ext_user_id === undefined || message.ext_user_id === null) {
			delete message.ext_user_id;
		}

		if (message.brand_key === undefined || message.brand_key === null) {
			delete message.brand_key;
		}

		return message as any;
	}

	public async coreReportCustomEvent(user_ext_id: string, eventType: string, payload: any = {}): Promise<any> {
		const eventMessage = this.buildMessage<any, any>(user_ext_id, ClassId.EVENT, {
			eventType,
			payload,
		});

		const eventResponse = await this.send<any>(eventMessage, ClassId.EVENT_RESPONSE);
		return eventResponse;
	}

	public async coreGetTranslations(
		user_ext_id: string,
		lang_code: string,
		areas: TranslationArea[],
		cacheSec: number = 60,
	): Promise<GetTranslationsResponse> {
		if (lang_code === undefined || lang_code === null || (lang_code.trim && lang_code.trim() === '')) {
			lang_code = DEFAULT_LANG_EN;
		}

		const response = await OCache.use<GetTranslationsResponse>(
			`${lang_code}-${this.label_api_key}-${this.brand_api_key}`,
			ECacheContext.Translations,
			async () => {
				const tsBaseRQ = this.buildMessage<GetTranslationsRequest, GetTranslationsResponse>(
					user_ext_id,
					ClassId.GET_TRANSLATIONS_REQUEST,
					{
						lang_code: DEFAULT_LANG_EN,
						hash_code: null,
						areas,
					},
				);

				const trBase = await this.send<GetTranslationsResponse>(tsBaseRQ, ClassId.GET_TRANSLATIONS_RESPONSE);

				if (lang_code !== DEFAULT_LANG_EN) {
					const trUserRQ = this.buildMessage<GetTranslationsRequest, GetTranslationsResponse>(
						user_ext_id,
						ClassId.GET_TRANSLATIONS_REQUEST,
						{
							lang_code,
							hash_code: null,
							areas,
						},
					);

					const trUser = await this.send<GetTranslationsResponse>(trUserRQ, ClassId.GET_TRANSLATIONS_RESPONSE);

					Object.keys(trUser?.translations ?? {}).forEach((k) => {
						trBase.translations[k] = trUser.translations[k];
					});
				}

				return trBase;
			},
			cacheSec,
		);

		return response;
	}

	public async coreIdentifyLabel(user_ext_id: string, cacheSec: number = 60): Promise<GetLabelInfoResponse> {
		return OCache.use<GetLabelInfoResponse>(
			`${this.label_api_key} - ${this.brand_api_key}`,
			ECacheContext.LabelInfo,
			async () => {
				const message = this.buildMessage<GetLabelInfoRequest, GetLabelInfoResponse>(user_ext_id, ClassId.INIT);

				return this.send<GetLabelInfoResponse>(message, ClassId.INIT_RESPONSE);
			},
			cacheSec,
		);
	}

	public async coreIdentifyUser(user_ext_id: string): Promise<ResponseIdentify> {
		const message = this.buildMessage<any, ResponseIdentify>(user_ext_id, ClassId.IDENTIFY, {
			request_id: IntUtils.uuid(), // AA: do we need request_id?
		});

		const r = await this.send<ResponseIdentify>(message, ClassId.IDENTIFY_RESPONSE);

		r.avatar_id = CoreUtils.avatarUrl(r.avatar_id, this.avatarDomain);

		return r;
	}

	public async coreChangeUsername(
		user_ext_id: string,
		public_username_custom: string,
	): Promise<{ public_username_custom: string }> {
		const message = this.buildMessage<any, any>(user_ext_id, ClassId.CLIENT_SET_CUSTOM_USERNAME_REQUEST, {
			public_username_custom,
		});

		return await this.send(message, ClassId.CLIENT_SET_CUSTOM_USERNAME_RESPONSE);
	}

	public async coreCheckSegments(user_ext_id: string, segment_id: number[]): Promise<TSegmentCheckResult[]> {
		const message = this.buildMessage<CheckSegmentMatchRequest, any>(user_ext_id, ClassId.CHECK_SEGMENT_MATCH_REQUEST, {
			segment_id,
		});

		const results = await this.send<CheckSegmentMatchResponse>(message, ClassId.CHECK_SEGMENT_MATCH_RESPONSE);

		return results.segments || [];
	}

	public async jackpotGet(
		user_ext_id: string,
		filter?: { related_game_id?: string; jp_template_id?: number },
		force_language?: string,
	): Promise<GetJackpotsResponse> {
		const message = this.buildMessage<GetJackpotsRequest, GetJackpotsResponse>(
			user_ext_id,
			ClassId.JP_GET_JACKPOTS_REQUEST,
			filter,
		);
		return await this.send<GetJackpotsResponse>(message, ClassId.JP_GET_JACKPOTS_RESPONSE, force_language);
	}

	public async potGet(user_ext_id: string, filter: { jp_template_ids: number[] }): Promise<GetJackpotsPotsResponse> {
		const message = this.buildMessage<GetJackpotsPotsRequest, GetJackpotsPotsResponse>(
			user_ext_id,
			ClassId.JP_GET_LATEST_POTS_REQUEST,
			filter,
		);
		return await this.send<GetJackpotsPotsResponse>(message, ClassId.JP_GET_LATEST_POTS_RESPONSE);
	}

	public async jackpotOptIn(user_ext_id: string, payload: { jp_template_id: number }): Promise<JackpotsOptinResponse> {
		const message = this.buildMessage<JackpotsOptinRequest, JackpotsOptinResponse>(
			user_ext_id,
			ClassId.JP_OPTIN_REQUEST,
			payload,
		);
		return await this.send<JackpotsOptinResponse>(message, ClassId.JP_OPTIN_RESPONSE);
	}

	public async jackpotOptOut(user_ext_id: string, payload: { jp_template_id: number }): Promise<JackpotsOptoutResponse> {
		const message = this.buildMessage<JackpotsOptoutRequest, JackpotsOptoutResponse>(
			user_ext_id,
			ClassId.JP_OPTOUT_REQUEST,
			payload,
		);
		return await this.send<JackpotsOptoutResponse>(message, ClassId.JP_OPTOUT_RESPONSE);
	}

	public async getJackpotWinners(user_ext_id: string, limit: number = 20, offset: number = 0, jp_template_id: number ): Promise<GetJackpotWinnersResponse> {
		const message = this.buildMessage<GetJackpotWinnersRequest, GetJackpotWinnersResponse>(
			user_ext_id,
			ClassId.JP_GET_WINNERS_REQUEST,
			{
				limit,
				offset,
				jp_template_id,
			},
		);
		return await this.send<GetJackpotWinnersResponse>(message, ClassId.JP_GET_WINNERS_RESPONSE);
	}

	public async getJackpotWinnersT(user_ext_id: string, limit: number = 20, offset: number = 0, jp_template_id: number ): Promise<JackpotWinnerHistory[]> {
		return GetJackpotWinnersResponseTransform((await this.getJackpotWinners(user_ext_id, limit, offset, jp_template_id)).winners);
	}

	public async getJackpotEligibleGames(user_ext_id: string, { jp_template_id } : { jp_template_id: number }): Promise<GetJackpotEligibleGamesResponse> {
		const message = this.buildMessage<GetJackpotEligibleGamesRequest, GetJackpotEligibleGamesResponse>(
			user_ext_id,
			ClassId.JP_GET_ELIGIBLE_GAMES_REQUEST,
			{ jp_template_id },
		);

		return await this.send<GetJackpotEligibleGamesResponse>(message, ClassId.JP_GET_ELIGIBLE_GAMES_RESPONSE);;
	}

	public async getJackpotEligibleGamesT(user_ext_id: string, { jp_template_id } : { jp_template_id: number }): Promise<TGetJackpotEligibleGamesResponse> {
		return GetJackpotEligibleGamesResponseTransform(await this.getJackpotEligibleGames(user_ext_id, { jp_template_id }));
	}

	public async sawGetTemplates(
		user_ext_id: string,
		force_language?: string,
		is_visitor_mode: boolean = false,
	): Promise<SAWGetTemplatesResponse> {
		const message = this.buildMessage<SAWGetTemplatesRequest, SAWGetTemplatesResponse>(
			user_ext_id,
			ClassId.SAW_GET_SPINS_REQUEST,
			{ is_visitor_mode },
		);

		const response = await this.send<SAWGetTemplatesResponse>(message, ClassId.SAW_GET_SPINS_RESPONSE, force_language);

		if (response && response.templates) {
			response.templates.forEach((t) => {
				if (t.jackpot_current !== undefined && t.jackpot_current !== null) {
					const jackpotValue =
						t.jackpot_current +
						(t.saw_template_ui_definition?.jackpot_symbol ? ' ' + t.saw_template_ui_definition?.jackpot_symbol : '');
					t.saw_template_ui_definition.name = IntUtils.replaceAll(
						t.saw_template_ui_definition.name,
						'{{jackpot}}',
						jackpotValue,
					);
					t.saw_template_ui_definition.description = IntUtils.replaceAll(
						t.saw_template_ui_definition.description,
						'{{jackpot}}',
						jackpotValue,
					);
					t.saw_template_ui_definition.promo_text = IntUtils.replaceAll(
						t.saw_template_ui_definition.promo_text,
						'{{jackpot}}',
						jackpotValue,
					);
					t.prizes.forEach((p) => {
						p.saw_prize_ui_definition.name = IntUtils.replaceAll(
							p.saw_prize_ui_definition.name,
							'{{jackpot}}',
							jackpotValue,
						);
						p.saw_prize_ui_definition.aknowledge_message = IntUtils.replaceAll(
							p.saw_prize_ui_definition.aknowledge_message,
							'{{jackpot}}',
							jackpotValue,
						);
					});
				}
			});
		}

		return response;
	}

	public async sawGetTemplatesT(user_ext_id: string): Promise<TMiniGameTemplate[]> {
		return SAWTemplatesTransform((await this.sawGetTemplates(user_ext_id)).templates);
	}

	public async doAcknowledgeRequest(user_ext_id: string, request_id: string): Promise<SAWDoAknowledgeResponse> {
		const message = this.buildMessage<SAWDoAknowledgeRequest, SAWDoAknowledgeResponse>(
			user_ext_id,
			ClassId.SAW_AKNOWLEDGE_REQUEST,
			{
				request_id,
			},
		);

		return await this.send<SAWDoAknowledgeResponse>(message, ClassId.SAW_AKNOWLEDGE_RESPONSE);
	}

	public async sawSpinRequest(user_ext_id: string, saw_template_id: number, round_id?: number): Promise<SAWDoSpinResponse> {
		if (!saw_template_id) {
			throw new Error('Missing template id');
		}

		const request_id = IntUtils.uuid();

		const message = this.buildMessage<SAWDoSpinRequest, SAWDoSpinResponse>(user_ext_id, ClassId.SAW_DO_SPIN_REQUEST, {
			saw_template_id,
			request_id,
		});

		const spinAttemptResponse = await this.send<SAWDoSpinResponse>(message, ClassId.SAW_DO_SPIN_RESPONSE);

		// to simulate fail
		// response.errCode = SAWSpinErrorCode.SAW_NO_SPINS;

		const status: string =
			{
				[SAWSpinErrorCode.SAW_OK]: 'OK',
				[SAWSpinErrorCode.SAW_NO_SPINS]: 'NO SPINS AVAILABLE',
				[SAWSpinErrorCode.SAW_PRIZE_POOL_EMPTY]: 'PRIZE POOL IS EMPTY',
				[SAWSpinErrorCode.SAW_NOT_ENOUGH_POINTS]: 'NOT ENOUGH POINTS',
				[SAWSpinErrorCode.SAW_FAILED_MAX_SPINS_REACHED]: 'MAX SPIN ATTEMPTS REACHED',
				[SAWSpinErrorCode.SAW_TEMPLATE_NOT_ACTIVE]: "MINIGAME IS NOT IN ACTIVE PERIOD",
				[SAWSpinErrorCode.SAW_NOT_IN_SEGMENT]: "USER IS NOT IN SEGMENT",
				[SAWSpinErrorCode.SAW_NO_BALANCE_GEMS]: "NOT ENOUGH GEMS",
				[SAWSpinErrorCode.SAW_NO_BALANCE_DIAMONDS]: "NOT ENOUGH DIAMONDS",
			}[spinAttemptResponse.errCode] || 'OTHER';

		await this.coreReportCustomEvent(user_ext_id, 'minigame_attempt', {
			saw_template_id,
			status,
			round_id,
		});

		return { ...spinAttemptResponse, request_id };
	}


	public async doAcknowledgeBatchRequest(user_ext_id: string, request_ids: string[]): Promise<SAWDoAcknowledgeBatchResponse> {
		const message = this.buildMessage<SAWDoAcknowledgeBatchRequest, SAWDoAcknowledgeBatchResponse>(
			user_ext_id,
			ClassId.SAW_AKNOWLEDGE_REQUEST,
			{
				request_ids,
			},
		);

		return await this.send<SAWDoAcknowledgeBatchResponse>(message, ClassId.SAW_AKNOWLEDGE_BATCH_RESPONSE);
	}

	public async sawSpinBatchRequest(user_ext_id: string, saw_template_id: number, spins_count: number): Promise<SAWDoSpinBatchResponse> {

		const spins = [];
		for (let i = 0; i < spins_count; i++) {
			const request_id = IntUtils.uuid();
			spins.push({ request_id, saw_template_id })
		}

		const message = this.buildMessage<SAWDoSpinBatchRequest, SAWDoSpinBatchResponse>(user_ext_id, ClassId.SAW_DO_SPIN_BATCH_REQUEST, { spins });
		const spinAttemptResponse = await this.send<SAWDoSpinBatchResponse>(message, ClassId.SAW_DO_SPIN_BATCH_RESPONSE);

		// If one response is 'OK' we consider that whole result is 'OK'
		const result = spinAttemptResponse.results.find((res) => res.errCode === 0);

		let status = 'OK';
		if (!result) {
			status = 'BATCH FAIL';
		}

		await this.coreReportCustomEvent(user_ext_id, 'minigame_attempt', {
			saw_template_id,
			status,
			spins_count,
		});

		return { ...spinAttemptResponse };
	}

	public async getSawWinningHistory(user_ext_id: string, limit: number = 20, offset: number = 0, saw_template_id: number): Promise<SAWWinningHistoryResponse> {
		const message = this.buildMessage<SAWWinningHistoryRequest, SAWWinningHistoryResponse>(user_ext_id, ClassId.GET_SAW_HISTORY_REQUEST, {
			limit, offset, saw_template_id
		})

		return await this.send<SAWWinningHistoryResponse>(message, ClassId.GET_SAW_HISTORY_RESPONSE);
	}

	public async getSawWinningHistoryT(user_ext_id: string, limit?: number, offset?: number, saw_template_id?: number): Promise<SAWPrizesHistory[]> {
		return SAWHistoryTransform((await this.getSawWinningHistory(user_ext_id, limit, offset, saw_template_id)).prizes);
	}
	
	public async missionOptIn(user_ext_id: string, mission_id: number) {
		if (!mission_id) {
			throw new Error('Missing mission id');
		}
		const message = this.buildMessage<AchievementOptinRequest, AchievementOptinResponse>(
			user_ext_id,
			ClassId.MISSION_OPTIN_REQUEST,
			{
				achievementId: mission_id,
			},
		);

		const res = await this.send<AchievementOptinResponse>(message, ClassId.MISSION_OPTIN_RESPONSE);

		return res;
	}

	public async missionClaimPrize(user_ext_id: string, mission_id: number, ach_completed_id: number) {
		if (!mission_id) {
			throw new Error('Missing mission id');
		}

		const message = this.buildMessage<AchClaimPrizeRequest, AchClaimPrizeResponse>(
			user_ext_id,
			ClassId.ACHIEVEMENT_CLAIM_PRIZE_REQUEST,
			{
				ach_id: mission_id,
				ach_completed_id: ach_completed_id,
			},
		);

		const res = await this.send<AchClaimPrizeResponse>(message, ClassId.ACHIEVEMENT_CLAIM_PRIZE_RESPONSE);

		return res;
	}

	public async registerInTournament(user_ext_id: string, tournamentInstanceId: number) {
		if (!tournamentInstanceId) {
			throw new Error('Missing tournament instance id');
		}
		const message = this.buildMessage<TournamentRegisterRequest, TournamentRegisterResponse>(
			user_ext_id,
			ClassId.TOURNAMENT_REGISTER_REQUEST,
			{
				tournamentInstanceId,
			},
		);

		const res = await this.send<TournamentRegisterResponse>(message, ClassId.TOURNAMENT_REGISTER_RESPONSE);

		return res;
	}

	public async buyStoreItem(user_ext_id: string, itemId: number) {
		if (!itemId) {
			throw new Error('Missing store item id');
		}
		const message = this.buildMessage<BuyStoreItemRequest, BuyStoreItemResponse>(user_ext_id, ClassId.BUY_SHOP_ITEM_REQUEST, {
			itemId,
		});

		const res = await this.send<BuyStoreItemResponse>(message, ClassId.BUY_SHOP_ITEM_RESPONSE);

		return res;
	}

	public async inboxGetMessages(
		user_ext_id: string,
		limit: number = 10,
		offset: number = 0,
	): Promise<GetInboxMessagesResponse> {
		const message = this.buildMessage<GetInboxMessagesRequest, GetInboxMessagesResponse>(
			user_ext_id,
			ClassId.GET_INBOX_MESSAGES_REQUEST,
			{
				limit,
				offset,
			},
		);

		return await this.send<GetInboxMessagesResponse>(message, ClassId.GET_INBOX_MESSAGES_RESPONSE);
	}

	public async storeGetItems(user_ext_id: string, force_language?: string): Promise<GetStoreItemsResponse> {
		const message = this.buildMessage<any, GetStoreItemsResponse>(user_ext_id, ClassId.GET_SHOP_ITEMS_REQUEST);
		return await this.send<GetStoreItemsResponse>(message, ClassId.GET_SHOP_ITEMS_RESPONSE, force_language);
	}

	public async storeGetItemsT(user_ext_id: string): Promise<TStoreItem[]> {
		return StoreItemTransform((await this.storeGetItems(user_ext_id)).items);
	}

	public async storeGetCategories(user_ext_id: string, force_language?: string): Promise<GetCategoriesStoreResponse> {
		const message = this.buildMessage<any, GetCategoriesStoreResponse>(user_ext_id, ClassId.GET_SHOP_CATEGORIES_REQUEST);
		return await this.send<GetCategoriesStoreResponse>(message, ClassId.GET_SHOP_CATEGORIES_RESPONSE, force_language);
	}

	public async storeGetCategoriesT(user_ext_id: string): Promise<TStoreCategory[]> {
		return StoreCategoryTransform((await this.storeGetCategories(user_ext_id)).categories);
	}

	public async storeGetPurchasedItems(
		user_ext_id: string,
		limit: number = 20,
		offset: number = 0,
	): Promise<GetStoreHistoryResponse> {
		const message = this.buildMessage<GetStoreHistoryRequest, GetStoreHistoryResponse>(
			user_ext_id,
			ClassId.ACH_SHOP_ITEM_HISTORY_REQUEST,
			{
				limit,
				offset,
			},
		);

		return await this.send<GetStoreHistoryResponse>(message, ClassId.ACH_SHOP_ITEM_HISTORY_RESPONSE);
	}

	public async storeGetPurchasedItemsT(user_ext_id: string, limit?: number, offset?: number): Promise<TStoreItem[]> {
		return StoreItemPurchasedTransform((await this.storeGetPurchasedItems(user_ext_id, limit, offset)).items);
	}

	public async missionsGetItems(user_ext_id: string, force_language?: string): Promise<GetAchievementMapResponse> {
		const message = this.buildMessage<GetAchievementMapRequest, GetAchievementMapResponse>(
			user_ext_id,
			ClassId.GET_ACHIEVEMENT_MAP_REQUEST,
		);
		const response = await this.send<GetAchievementMapResponse>(
			message,
			ClassId.GET_ACHIEVEMENT_MAP_RESPONSE,
			force_language,
		);
		// we need to clone response to avoid changing original object,for cases when its called together with badgesGetItems (e.g. in Promise.all)
		const responseClone = { ...response };

		if (responseClone.achievements) {
			responseClone.achievements = responseClone.achievements.filter((a) => a.ach_type_id === AchievementType.Mission);
		}
		return responseClone;
	}

	public async missionsGetItemsT(user_ext_id: string): Promise<TMissionOrBadge[]> {
		return UserAchievementTransform((await this.missionsGetItems(user_ext_id)).achievements);
	}

	public async getUserGamificationInfo(user_ext_id: string): Promise<GetAchievementsUserInfoResponse> {
		const message = this.buildMessage<GetAchievementMapRequest, GetAchievementsUserInfoResponse>(
			user_ext_id,
			ClassId.GET_ACHIEVEMENT_USER_REQUEST,
		);

		return await this.send<GetAchievementsUserInfoResponse>(message, ClassId.GET_ACHIEVEMENT_USER_RESPONSE);
	}

	public async getUserGamificationInfoT(user_ext_id: string): Promise<UserLevelExtraCountersT> {
		const response = await this.getUserGamificationInfo(user_ext_id);

		return {
			level_counter_1: response.level_counter_1,
			level_counter_2: response.level_counter_2,
		};
	}

	public async achGetCategories(user_ext_id: string, force_language?: string): Promise<GetAchCategoriesResponse> {
		const message = this.buildMessage<any, GetAchCategoriesResponse>(user_ext_id, ClassId.GET_ACH_CATEGORIES_REQUEST);
		return await this.send<GetAchCategoriesResponse>(message, ClassId.GET_ACH_CATEGORIES_RESPONSE, force_language);
	}

	public async achGetCategoriesT(user_ext_id: string): Promise<TAchCategory[]> {
		return AchCategoryTransform((await this.achGetCategories(user_ext_id)).categories);
	}

	public async badgetsGetItems(user_ext_id: string, force_language?: string): Promise<GetAchievementMapResponse> {
		const message = this.buildMessage<GetAchievementMapRequest, GetAchievementMapResponse>(
			user_ext_id,
			ClassId.GET_ACHIEVEMENT_MAP_REQUEST,
		);
		const response = await this.send<GetAchievementMapResponse>(
			message,
			ClassId.GET_ACHIEVEMENT_MAP_RESPONSE,
			force_language,
		);
		// we need to clone response to avoid changing original object,for cases when its called together with missionsGetItems (e.g. in Promise.all)
		const responseClone = { ...response };

		if (responseClone.achievements) {
			responseClone.achievements = responseClone.achievements.filter((a) => a.ach_type_id === AchievementType.Badge);
		}
		return responseClone;
	}

	public async bonusesGetItems(user_ext_id: string, force_language?: string): Promise<GetBonusesResponse> {
		const message = this.buildMessage<GetBonusesRequest, GetBonusesResponse>(
			user_ext_id,
			ClassId.GET_BONUSES_REQUEST,
		);
		const response = await this.send<GetBonusesResponse>(
			message,
			ClassId.GET_BONUSES_RESPONSE,
			force_language,
		);
		
		const responseClone = { ...response };

		return responseClone;
	}
	public async bonusClaimItem(user_ext_id: string, bonus_id: number): Promise<ClaimBonusResponse> {
		const message = this.buildMessage<ClaimBonusRequest, ClaimBonusResponse>(
			user_ext_id,
			ClassId.CLAIM_BONUS_REQUEST,
			{ bonusId: bonus_id }

		);
		const response = await this.send<ClaimBonusResponse>(
			message,
			ClassId.CLAIM_BONUS_RESPONSE,

		);
		
		const responseClone = { ...response };

		return responseClone;
	}

	public async bonusesGetItemsT(user_ext_id: string): Promise<TBonus[]> {
		return BonusItemsTransform((await this.bonusesGetItems(user_ext_id)).bonuses);
	}

	public async badgetsGetItemsT(user_ext_id: string): Promise<TMissionOrBadge[]> {
		return UserAchievementTransform((await this.badgetsGetItems(user_ext_id)).achievements);
	}

	public async tournamentsGetLobby(user_ext_id: string, force_language?: string): Promise<GetTournamentsResponse> {
		const message = this.buildMessage<GetTournamentsRequest, GetTournamentsResponse>(
			user_ext_id,
			ClassId.GET_TOURNAMENT_LOBBY_REQUEST,
		);
		return await this.send<GetTournamentsResponse>(message, ClassId.GET_TOURNAMENT_LOBBY_RESPONSE, force_language);
	}

	public async tournamentsGetLobbyT(user_ext_id: string): Promise<TTournament[]> {
		return TournamentItemsTransform((await this.tournamentsGetLobby(user_ext_id)).tournaments);
	}

	public async tournamentsGetInfo(
		user_ext_id: string,
		tournamentInstanceId: number,
		force_language?: string,
	): Promise<GetTournamentInfoResponse> {
		const message = this.buildMessage<GetTournamentInfoRequest, GetTournamentInfoResponse>(
			user_ext_id,
			ClassId.GET_TOURNAMENT_INFO_REQUEST,
			{
				tournamentInstanceId,
			},
		);
		const response = await this.send<GetTournamentInfoResponse>(
			message,
			ClassId.GET_TOURNAMENT_INFO_RESPONSE,
			force_language,
		);

		if (response.userPosition?.avatar_id) {
			response.userPosition.avatar_url = CoreUtils.avatarUrl(response.userPosition.avatar_id, this.avatarDomain);
		}

		if (response.tournamentInfo?.players?.length) {
			response.tournamentInfo.players.forEach((p) => {
				p.avatar_url = CoreUtils.avatarUrl(p.avatar_id, this.avatarDomain);
			});
		}

		return response;
	}

	public async tournamentsGetInfoT(user_ext_id: string, tournamentInstanceId: number): Promise<TTournamentDetailed> {
		if (!tournamentInstanceId) {
			throw new Error('Missing tournament instance id');
		}
		const response = await this.tournamentsGetInfo(user_ext_id, tournamentInstanceId);
		return tournamentInfoItemTransform(response);
	}

	public async leaderboardGet(
		user_ext_id: string,
		period_type_id?: LeaderBoardPeriodType,
		prevPeriod: boolean = false,
		force_language?: string,
	): Promise<LeaderBoardDetails> {
		const message = this.buildMessage<GetLeaderBoardsRequest, GetLeaderBoardsResponse>(
			user_ext_id,
			ClassId.GET_LEADERS_BOARD_REQUEST,
			{
				period_type_id,
				snapshot_offset: prevPeriod ? 1 : 0,
				include_users: true,
			},
		);

		const response = await this.send<GetLeaderBoardsResponse>(message, ClassId.GET_LEADERS_BOARD_RESPONSE, force_language);

		const boardKey = Object.keys(response.map || {}).find((k) => period_type_id === undefined || k === period_type_id?.toString());

		if (boardKey === undefined) {
			return undefined;
		}

		if (response.map[boardKey]?.userPosition?.avatar_id) {
			response.map[boardKey].userPosition.avatar_url = CoreUtils.avatarUrl(
				response.map[boardKey].userPosition.avatar_id,
				this.avatarDomain,
			);
		}

		if (response.map[boardKey]?.positions?.length) {
			response.map[boardKey].positions.forEach((p) => {
				p.avatar_url = CoreUtils.avatarUrl(p.avatar_id, this.avatarDomain);
			});
		}

		return response.map[boardKey];
	}

	public async leaderboardsGetT(
		user_ext_id: string,
		period_type_id: LeaderBoardPeriodType = LeaderBoardPeriodType.DAILY,
		prevPeriod: boolean = false,
	): Promise<LeaderBoardDetailsT> {
		return getLeaderBoardTransform(await this.leaderboardGet(user_ext_id, period_type_id, prevPeriod));
	}

	public async levelsGet(user_ext_id: string, force_language?: string): Promise<GetLevelMapResponse> {
		const message = this.buildMessage<any, GetLevelMapResponse>(user_ext_id, ClassId.GET_LEVEL_MAP_REQUEST);
		return await this.send<GetLevelMapResponse>(message, ClassId.GET_LEVEL_MAP_RESPONSE, force_language);
	}

	public async levelsGetT(user_ext_id: string): Promise<TLevel[]> {
		return GetLevelMapResponseTransform(await this.levelsGet(user_ext_id));
	}

	public async getLevelCurrent(user_ext_id: string): Promise<TLevelCurrent> {
		const levels = await this.levelsGetT(user_ext_id);
		const userInfo = await this.getUserGamificationInfo(user_ext_id);
		if (!levels || levels.length === 0) return null;

		const sortedLevels = [...levels].sort((a, b) => a.required_points - b.required_points);

		let currentLevelIndex = sortedLevels.findIndex((level) => level.id === userInfo.current_level);

		if (currentLevelIndex === -1) {
			const userPointsEver = userInfo.points_ever ?? 0;
			currentLevelIndex = sortedLevels.findIndex((level, index) => {
				const nextLevel = sortedLevels[index + 1];
				return userPointsEver >= level.required_points && (!nextLevel || userPointsEver < nextLevel.required_points);
			});
			if (currentLevelIndex === -1) {
				currentLevelIndex = sortedLevels.length - 1;
			}
		}

		const currentLevel = sortedLevels[currentLevelIndex];
		const nextLevel = sortedLevels[currentLevelIndex + 1];
		const userPointsEver = userInfo.points_ever ?? 0;
		const progress = nextLevel
			? ((userPointsEver - currentLevel.required_points) / (nextLevel.required_points - currentLevel.required_points)) * 100
			: 100;

		return {
			...currentLevel,
			ordinal_position: currentLevelIndex + 1,
			progress: Math.min(Math.max(progress, 0), 100),
		};
	}

	public async customSectionsGet(user_ext_id: string, force_language?: string): Promise<GetCustomSectionsResponse> {
		const message = this.buildMessage<GetCustomSectionsRequest, GetCustomSectionsResponse>(
			user_ext_id,
			ClassId.GET_CUSTOM_SECTIONS_REQUEST,
		);
		return await this.send<GetCustomSectionsResponse>(message, ClassId.GET_CUSTOM_SECTIONS_RESPONSE, force_language);
	}

	public async customSectionsGetT(user_ext_id: string): Promise<TUICustomSection[]> {
		return UICustomSectionTransform(await this.customSectionsGet(user_ext_id));
	}

	public async getTranslationsT(
		user_ext_id: string,
		lang_code: string,
		areas: TranslationArea[],
		cacheSec: number = 60,
	): Promise<GetTranslationsResponse> {
		return await this.coreGetTranslations(user_ext_id, lang_code, areas, 30);
	}

	public async getInboxMessages(
		user_ext_id: string,
		limit: number = 20,
		offset: number = 0,
		starred_only: boolean,
		category_id?: InboxCategories,
		read_status?: InboxReadStatus,
	): Promise<GetInboxMessagesResponse> {
		const message = this.buildMessage<GetInboxMessagesRequest, GetInboxMessagesResponse>(
			user_ext_id,
			ClassId.GET_INBOX_MESSAGES_REQUEST,
			{
				limit,
				offset,
				starred_only,
				category_id,
				read_status,
			},
		);
		return await this.send<GetInboxMessagesResponse>(message, ClassId.GET_INBOX_MESSAGES_RESPONSE);
	}

	public async getInboxMessagesT(
		user_ext_id: string,
		from: number = 0,
		to: number = 20,
		favoriteOnly: boolean = false,
		categoryId?: InboxCategories,
		read_status?: InboxReadStatus,
	): Promise<TInboxMessage[]> {
		const limit = to - from > 20 ? 20 : to - from;
		const offset = from;

		return InboxMessagesTransform((await this.getInboxMessages(user_ext_id, limit, offset, favoriteOnly, categoryId, read_status)).log);
	}

	public async getInboxUnreadCountT(
		user_ext_id: string,
	): Promise<number> {
		const limit = 1;
		const offset = 0;

		return (await this.getInboxMessages(user_ext_id, limit, offset, false, null)).unread_count;
	}

	public async getInboxMessageBody(messageGuid: string): Promise<InboxMessageBody> {
		const getMessageBody = async (messageGuid: string): Promise<InboxMessageBody> => {
			const inboxCdnUrl = this.tracker.getLabelSetting(PublicLabelSettings.INBOX_PUBLIC_CDN);

			try {
				const url = `${inboxCdnUrl}${messageGuid}.json`;

				const response = await fetch(url, {
					method: 'GET',
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*',
					},
				});
				const data = await response.json();
				return data || {};
			} catch (error) {
				this.logger.error('Error fetching inbox message body:', error);
				return null;
			}
		};

		return await getMessageBody(messageGuid);
	}

	public async getInboxMessageBodyT(messageGuid: string): Promise<TInboxMessageBody> {
		const message = await this.getInboxMessageBody(messageGuid);
		return InboxMessageBodyTransform(message);
	}

	public async markInboxMessageRead(user_ext_id: string, messageGuid: string): Promise<MarkInboxMessageReadResponse> {
		const message = this.buildMessage<MarkInboxMessageReadRequest, MarkInboxMessageReadResponse>(
			user_ext_id,
			ClassId.MARK_INBOX_READ_REQUEST,
			{
				engagement_uid: messageGuid,
			},
		);

		return await this.send<MarkInboxMessageReadResponse>(message, ClassId.MARK_INBOX_READ_RESPONSE);
	}

	public async markAllInboxMessageRead(user_ext_id: string): Promise<MarkInboxMessageReadResponse> {
		const message = this.buildMessage<MarkInboxMessageReadRequest, MarkInboxMessageReadResponse>(
			user_ext_id,
			ClassId.MARK_INBOX_READ_REQUEST,
			{
				all_read: true,
			},
		);

		return await this.send<MarkInboxMessageReadResponse>(message, ClassId.MARK_INBOX_READ_RESPONSE);
	}

	public async markUnmarkInboxMessageAsFavorite(
		user_ext_id: string,
		messageGuid: string,
		mark: boolean,
	): Promise<MarkInboxMessageStarredResponse> {
		const message = this.buildMessage<MarkInboxMessageStarredRequest, MarkInboxMessageStarredResponse>(
			user_ext_id,
			ClassId.MARK_INBOX_STARRED_REQUEST,
			{
				engagement_uid: messageGuid,
				is_starred: mark,
			},
		);

		return await this.send<MarkInboxMessageStarredResponse>(message, ClassId.MARK_INBOX_STARRED_RESPONSE);
	}

	public async deleteInboxMessage(user_ext_id: string, messageGuid: string): Promise<MarkInboxMessageDeletedResponse> {
		const message = this.buildMessage<MarkInboxMessageDeletedRequest, MarkInboxMessageDeletedResponse>(
			user_ext_id,
			ClassId.MARK_INBOX_DELETED_REQUEST,
			{
				engagement_uid: messageGuid,
			},
		);

		return await this.send<MarkInboxMessageDeletedResponse>(message, ClassId.MARK_INBOX_DELETED_RESPONSE);
	}

	public async deleteAllInboxMessages(user_ext_id: string): Promise<MarkInboxMessageDeletedResponse> {
		const message = this.buildMessage<MarkInboxMessageDeletedRequest, MarkInboxMessageDeletedResponse>(
			user_ext_id,
			ClassId.MARK_INBOX_DELETED_REQUEST,
			{
				all_deleted: true,
			},
		);

		return await this.send<MarkInboxMessageDeletedResponse>(message, ClassId.MARK_INBOX_DELETED_RESPONSE);
	}

	public getWSCalls(): WSAPI {
		return new WSAPI(this);
	}

	public async getRelatedItemsForGame(user_ext_id: string, related_game_id: string,): Promise<GetRelatedAchTourResponse> {
		const message = this.buildMessage< GetRelatedAchTourRequest, GetRelatedAchTourResponse>(
			user_ext_id,
			ClassId.GET_RELATED_ACH_N_TOURNAMENTS_REQUEST,
			{
				related_game_id: related_game_id
			}
		);
		
		return await this.send<GetRelatedAchTourResponse>(message, ClassId.GET_RELATED_ACH_N_TOURNAMENTS_RESPONSE);
	}

	public async getRafflesT(user_ext_id: string): Promise<TRaffle[]> {
		return raffleTransform((await this.getRaffles(user_ext_id)).items);
	}

	public async getRaffles(user_ext_id: string): Promise<GetRafflesResponse> {
		const message = this.buildMessage<GetRafflesRequest, GetRafflesResponse>(user_ext_id, ClassId.RAF_GET_RAFFLES_REQUEST);

		return await this.send<GetRafflesResponse>(message, ClassId.RAF_GET_RAFFLES_RESPONSE);
	}

	public async getRaffleDrawRun(user_ext_id: string, payload: { raffle_id: number; run_id: number }): Promise<GetDrawRunResponse> {
		const message = this.buildMessage<GetDrawRunRequest, GetDrawRunResponse>(
			user_ext_id,
			ClassId.RAF_GET_DRAW_RUN_REQUEST,
			payload,
		);

		return await this.send<GetDrawRunResponse>(message, ClassId.RAF_GET_DRAW_RUN_RESPONSE);
	}

	public async getRaffleDrawRunsHistory(
		user_ext_id: string,
		props: { raffle_id: number; draw_id?: number },
	): Promise<GetRaffleDrawRunsHistoryResponse> {
		const message = this.buildMessage<GetRaffleDrawRunsHistoryRequest, GetRaffleDrawRunsHistoryResponse>(
			user_ext_id,
			ClassId.RAF_GET_DRAW_HISTORY_REQUEST,
			props,
		);

		return await this.send<GetRaffleDrawRunsHistoryResponse>(message, ClassId.RAF_GET_DRAW_HISTORY_RESPONSE);
	}

	public async claimRafflePrize(user_ext_id: string, props: { won_id: number }): Promise<RaffleClaimPrizeResponse> {
		const message = this.buildMessage<RaffleClaimPrizeRequest, RaffleClaimPrizeResponse>(
			user_ext_id,
			ClassId.RAF_CLAIM_PRIZE_REQUEST,
			props,
		);

		return await this.send<RaffleClaimPrizeResponse>(message, ClassId.RAF_CLAIM_PRIZE_RESPONSE);

	}
}

export { SmarticoAPI, MessageSender };
