import { ClassId } from "./Base/ClassId";
import { ProtocolRequest } from './Base/ProtocolRequest';
import { ProtocolResponse } from './Base/ProtocolResponse';
import { SAWGetTemplatesResponse } from './MiniGames/SAWGetTemplatesResponse';
import { SAWGetTemplatesRequest } from './MiniGames/SAWGetTemplatesRequest';
import { IntUtils } from './IntUtils';
import { ILogger } from './ILogger';
import { SAWDoSpinRequest, SAWDoSpinResponse, SAWSpinErrorCode } from './MiniGames';
import { ECacheContext, OCache } from './OCache';
import { CoreUtils, GetTranslationsRequest, GetTranslationsResponse, ResponseIdentify, TranslationArea } from './Core';
import { GetLabelInfoResponse } from './Core/GetLabelInfoResponse';
import { GetLabelInfoRequest } from './Core/GetLabelInfoRequest';
import { GetInboxMessagesRequest, GetInboxMessagesResponse } from './Inbox';
import { GetStoreItemsResponse } from './Store';
import { AchievementType, GetAchievementMapRequest, GetAchievementMapResponse } from './Missions';
import { GetTournamentInfoRequest, GetTournamentInfoResponse, GetTournamentsRequest, GetTournamentsResponse } from './Tournaments';
import { GetLeaderBoardsRequest, GetLeaderBoardsResponse, LeaderBoardDetails, LeaderBoardPeriodType } from "./Leaderboard";
import { GetLevelMapResponse } from "./Level";


const PUBLIC_API_URL = 'https://papi{ENV_ID}.smartico.ai/services/public';
const C_SOCKET_PROD = 'wss://api{ENV_ID}.smartico.ai/websocket/services';
const AVATAR_DOMAIN = 'https://img{ENV_ID}.smr.vc';

interface IOptions {
    logger?: ILogger;
    logCIDs?: ClassId[];
    logHTTPTiming?: boolean;
}

type MessageSender = (message: any, publicApuUrl: string) => Promise<any>;


class SmarticoAPI {

    private publicUrl: string;
    private wsUrl: string;
    private partnerUrl: string;
    private avatarDomain: string;

    private logger: ILogger;
    private logCIDs: ClassId[];
    private logHTTPTiming: boolean;

    public constructor(private label_api_key: string, private brand_api_key: string, private messageSender: MessageSender, options: IOptions = {}) {

        this.logger = options.logger || (console as any);

        if (this.logger.always === undefined) {
            this.logger.always = this.logger.info;
        }

        this.logCIDs = options.logCIDs || [];
        this.logHTTPTiming = options.logHTTPTiming || false;

        this.publicUrl = SmarticoAPI.getPublicUrl(label_api_key);
        this.wsUrl = SmarticoAPI.getPublicWsUrl(label_api_key);

        this.avatarDomain = SmarticoAPI.getAvatarUrl(label_api_key);

        this.label_api_key = SmarticoAPI.getCleanLabelApiKey(label_api_key);

    }

    public static getEnvId(label_api_key: string): string {

        let ENV_ID = label_api_key.length === 38 ? label_api_key.substring(37, 38) : '';
        
        if (ENV_ID === '1' || ENV_ID === '2') {
            ENV_ID = ''
        }
        return ENV_ID;
    }

    public static getCleanLabelApiKey(label_api_key: string): string {
        return label_api_key.substring(0, 36);
    }

    public static getPublicUrl(label_api_key: string): string {
        return PUBLIC_API_URL.replace('{ENV_ID}', SmarticoAPI.getEnvId(label_api_key));    
    }

    public static getPublicWsUrl(label_api_key: string): string {
        return C_SOCKET_PROD.replace('{ENV_ID}', SmarticoAPI.getEnvId(label_api_key));    
    }    

    public static getAvatarUrl(label_api_key: string): string {
        return AVATAR_DOMAIN.replace('{ENV_ID}', SmarticoAPI.getEnvId(label_api_key));    
    }    

    private async send<T>(message: any, expectCID?: ClassId): Promise<T> {


        if (this.logCIDs.includes(message.cid)) {
            this.logger.info('REQ', message)
        }


        let result: any;
        
        try {
            const timeStart = new Date().getTime();
            result = await this.messageSender(message, this.publicUrl);
            const timeEnd = new Date().getTime();

            if (this.logHTTPTiming) {
                this.logger.always('HTTP time, ms:' + (timeEnd - timeStart))
            }

        } catch (e) {
            this.logger.error(`Failed to make request to smartico channel. ${e.message}`, { url: this.publicUrl, request: message, error: e.message });
            throw(new Error(`Failed to make request to smartico channel. ${e.message}`));
        }

        if (this.logCIDs.includes(message.cid)) {
            this.logger.info('RES', result)
        }

        if (expectCID) {
            if (Array.isArray(result)) { 
                for (const str of result as string[]) {
                    const obj: ProtocolResponse = JSON.parse(str);
                    if (this.logCIDs.includes(obj.cid)) {
                        this.logger.info('RES', result)
                    }
                    if (obj.cid === expectCID) {
                        return obj as any;
                    }
                }
                this.logger.error(`Cant find proper response in array, expected CID ${expectCID}`, { request: message, response: result });
            } else {
                return result;
            }    
        } else {
            if (Array.isArray(result)) { 
                if (result.length === 1) {
                    const obj = JSON.parse(result[0]);
                    if (this.logCIDs.includes(obj.cid)) {
                        this.logger.info('RES', result)
                    }                    
                    return obj;
                } else {
                    this.logger.error('Expected one response, but got array', { request: message, response: result });
                }
            }
            return result;
        }
    }

    private buildMessage<TRequest,TResponse>(user_ext_id: string, cid: ClassId, payload: Partial<TRequest> = {}): TResponse {

        const message: ProtocolRequest = {
            api_key: this.label_api_key,
            brand_key: this.brand_api_key,
            ext_user_id: user_ext_id,
            cid,
            uuid: IntUtils.uuid(),
            ts: new Date().getTime(),
            ...payload
        };

        if (message.ext_user_id === undefined || message.ext_user_id === null) {
            delete message.ext_user_id;
        }

        if (message.brand_key === undefined || message.brand_key === null) {
            delete message.brand_key;
        }        

        return message as any
    }

    public async coreReportCustomEvent(user_ext_id: string, eventType: string, payload: any = {}): Promise<any> {
        const eventMessage = this.buildMessage<any, any>(user_ext_id, ClassId.EVENT, {
            eventType,
            payload
        });

        const eventResponse = await this.send<any>(eventMessage, ClassId.EVENT_RESPONSE);
        return eventResponse;
    }

    public async coreGetTranslations(user_ext_id: string, lang_code: string, areas: TranslationArea[], cacheSec: number = 60): Promise<GetTranslationsResponse> {

        const response = await OCache.use<GetTranslationsResponse>(`${lang_code}-${this.label_api_key}-${this.brand_api_key}`, ECacheContext.Translations, async () => {

            const tsBaseRQ = this.buildMessage<GetTranslationsRequest, GetTranslationsResponse>(user_ext_id, ClassId.GET_TRANSLATIONS_REQUEST, {
                lang_code: "EN",
                hash_code: 0,
                areas
            });

            const trBase = await this.send<GetTranslationsResponse>(tsBaseRQ);

            if (lang_code !== "EN") {
                const trUserRQ = this.buildMessage<GetTranslationsRequest, GetTranslationsResponse>(user_ext_id, ClassId.GET_TRANSLATIONS_REQUEST, {
                    lang_code,
                    hash_code: 0,
                    areas
                });  

                const trUser = await this.send<GetTranslationsResponse>(trUserRQ);
                
                Object.keys(trUser.translations).forEach( k => {
                    trBase.translations[k] = trUser.translations[k];
                })
            }

            return trBase;

        }, cacheSec );

        return response;
    }        

    public async coreIdentifyLabel(user_ext_id: string, cacheSec: number = 60): Promise<GetLabelInfoResponse> {
        
        return OCache.use<GetLabelInfoResponse>(`${this.label_api_key} - ${this.brand_api_key}`, ECacheContext.LabelInfo, async () => {

            const message = this.buildMessage<GetLabelInfoResponse, GetLabelInfoRequest>(user_ext_id, ClassId.INIT);

            return this.send<GetLabelInfoResponse>(message, ClassId.INIT_RESPONSE)
            
        }, cacheSec);
        
    }    

    public async coreIdentifyUser(user_ext_id: string): Promise<ResponseIdentify> {

        const message = this.buildMessage<any, ResponseIdentify>(user_ext_id, ClassId.IDENTIFY, {
            request_id: IntUtils.uuid() // AA: do we need request_id?
        });

        const r = await this.send<ResponseIdentify>(message, ClassId.IDENTIFY_RESPONSE);

        r.avatar_id = CoreUtils.avatarUrl(r.avatar_id, this.avatarDomain);

        return r;
    }            

    public async coreChangeUsername(user_ext_id: string, public_username_custom: string): Promise<{ public_username_custom: string }> {
        
        const message = this.buildMessage<any, any>(user_ext_id, ClassId.CLIENT_SET_CUSTOM_USERNAME_REQUEST, {
            public_username_custom
        });
        
        return this.send(message, ClassId.CLIENT_SET_CUSTOM_USERNAME_RESPONSE);
    }

    public async sawGetTemplates(user_ext_id: string, lang?: string, is_visitor_mode: boolean = false): Promise<SAWGetTemplatesResponse> {

        const message = this.buildMessage<SAWGetTemplatesRequest, SAWGetTemplatesResponse>(user_ext_id, ClassId.SAW_GET_SPINS_REQUEST, lang ? { force_language: lang, is_visitor_mode } : { is_visitor_mode });

        const response = await this.send<SAWGetTemplatesResponse>(message);

        if (response && response.templates) {
            response.templates.forEach(t => {
    
                if (t.jackpot_current !== undefined && t.jackpot_current !== null) {
                    const jackpotValue = t.jackpot_current + (t.saw_template_ui_definition?.jackpot_symbol ? ' ' + t.saw_template_ui_definition?.jackpot_symbol : '');
                    t.saw_template_ui_definition.name = IntUtils.replaceAll(t.saw_template_ui_definition.name, '{{jackpot}}', jackpotValue);
                    t.saw_template_ui_definition.description = IntUtils.replaceAll(t.saw_template_ui_definition.description, '{{jackpot}}', jackpotValue);
                    t.saw_template_ui_definition.promo_text = IntUtils.replaceAll(t.saw_template_ui_definition.promo_text, '{{jackpot}}', jackpotValue);
                    t.prizes.forEach(p => {
                        p.saw_prize_ui_definition.name = IntUtils.replaceAll(p.saw_prize_ui_definition.name, '{{jackpot}}', jackpotValue);
                        p.saw_prize_ui_definition.aknowledge_message = IntUtils.replaceAll(p.saw_prize_ui_definition.aknowledge_message, '{{jackpot}}', jackpotValue);
                    })
                }
            });
        }

        return response;

    }

    public async sawSpinRequest(user_ext_id: string, saw_template_id: number, round_id: number): Promise<SAWDoSpinResponse> {

        const message = this.buildMessage<SAWDoSpinRequest, SAWDoSpinResponse>(user_ext_id, ClassId.SAW_DO_SPIN_REQUEST, {
            saw_template_id,
            request_id: IntUtils.uuid()
        });

        const spinAttemptResponse = await this.send<SAWDoSpinResponse>(message, ClassId.SAW_DO_SPIN_RESPONSE);

        // to simulate fail
        // response.errCode = SAWSpinErrorCode.SAW_NO_SPINS;

        const status: string = {
            [SAWSpinErrorCode.SAW_OK]: 'OK',
            [SAWSpinErrorCode.SAW_NO_SPINS]: 'NO SPINS AVAILABLE',
            [SAWSpinErrorCode.SAW_PRIZE_POOL_EMPTY]: 'PRIZE POOL IS EMPTY',
            [SAWSpinErrorCode.SAW_NOT_ENOUGH_POINTS]: 'NOT ENOUGH POINTS',
            [SAWSpinErrorCode.SAW_FAILED_MAX_SPINS_REACHED]: 'MAX SPIN ATTEMPTS REACHED',
        }[spinAttemptResponse.errCode] || 'OTHER';

        await this.coreReportCustomEvent(user_ext_id, 'minigame_attempt', {
            saw_template_id,
            status,
            round_id,
        });

        return spinAttemptResponse;
    }

    public async inboxGetMessages(user_ext_id: string, limit: number = 10, offset: number = 0): Promise<GetInboxMessagesResponse> {

        const message = this.buildMessage<GetInboxMessagesRequest, GetInboxMessagesResponse>(user_ext_id, ClassId.GET_INBOX_MESSAGES_REQUEST, {
            limit,
            offset
        });

        return await this.send<GetInboxMessagesResponse>(message);

    }

    public async storeGetItems(user_ext_id: string): Promise<GetStoreItemsResponse> {

        const message = this.buildMessage<any, GetStoreItemsResponse>(user_ext_id, ClassId.GET_SHOP_ITEMS_REQUEST);
        return await this.send<GetStoreItemsResponse>(message);

    }

    public async missionsGetItems(user_ext_id: string): Promise<GetAchievementMapResponse> {

        const message = this.buildMessage<GetAchievementMapRequest, GetAchievementMapResponse>(user_ext_id, ClassId.GET_ACHIEVEMENT_MAP_REQUEST);
        const response = await this.send<GetAchievementMapResponse>(message);
        if (response.achievements) { 
            response.achievements = response.achievements.filter(a => a.ach_type_id === AchievementType.Mission);
        }
        return response;
    }

    public async badgetsGetItems(user_ext_id: string): Promise<GetAchievementMapResponse> {

        const message = this.buildMessage<GetAchievementMapRequest, GetAchievementMapResponse>(user_ext_id, ClassId.GET_ACHIEVEMENT_MAP_REQUEST);
        const response = await this.send<GetAchievementMapResponse>(message);
        if (response.achievements) { 
            response.achievements = response.achievements.filter(a => a.ach_type_id === AchievementType.Badge);
        }
        return response;
    }    

    public async tournamentsGetLobby(user_ext_id: string): Promise<GetTournamentsResponse> {

        const message = this.buildMessage<GetTournamentsRequest, GetTournamentsResponse>(user_ext_id, ClassId.GET_TOURNAMENT_LOBBY_REQUEST);
        return await this.send<GetTournamentsResponse>(message);

    }

    public async tournamentsGetInfo(user_ext_id: string, tournamentInstanceId: number): Promise<GetTournamentInfoResponse> {

        const message = this.buildMessage<GetTournamentInfoRequest, GetTournamentInfoResponse>(user_ext_id, ClassId.GET_TOURNAMENT_INFO_REQUEST, 
            {
                tournamentInstanceId
            }
        );
        const response = await this.send<GetTournamentInfoResponse>(message);
        
        if (response.userPosition?.avatar_id) {
            response.userPosition.avatar_url = CoreUtils.avatarUrl(response.userPosition.avatar_id, this.avatarDomain);
        }

        if (response.tournamentInfo.players?.length) {
            response.tournamentInfo.players.forEach(p => {
                p.avatar_url = CoreUtils.avatarUrl(p.avatar_id, this.avatarDomain);
            });
        }

        return response;

    }

    public async leaderboardGet(user_ext_id: string, period_type_id?: LeaderBoardPeriodType, prevPeriod: boolean = false): Promise<LeaderBoardDetails> {

        const message = this.buildMessage<GetLeaderBoardsRequest, GetLeaderBoardsResponse>(user_ext_id, ClassId.GET_LEADERS_BOARD_REQUEST, 
            {
                period_type_id,
                snapshot_offset: prevPeriod ? 1 : 0,
                include_users: true
            }
        );

        const response = await this.send<GetLeaderBoardsResponse>(message);



        const boardKey =  Object.keys(response.map).find( k => period_type_id === undefined || k === period_type_id?.toString());

        if (boardKey === undefined) {
            return undefined;
        }

        if (response.map[boardKey]?.userPosition?.avatar_id) {
            response.map[boardKey].userPosition.avatar_url = CoreUtils.avatarUrl(response.map[boardKey].userPosition.avatar_id, this.avatarDomain);
        }

        if (response.map[boardKey]?.positions?.length) {
            response.map[boardKey].positions.forEach(p => {
                p.avatar_url = CoreUtils.avatarUrl(p.avatar_id, this.avatarDomain);
            });
            
        }
        
        return response.map[boardKey];

    }

    public async levelsGet(user_ext_id: string): Promise<GetLevelMapResponse> {
        const message = this.buildMessage<any, GetLevelMapResponse>(user_ext_id, ClassId.GET_LEVEL_MAP_REQUEST);
        return await this.send<GetLevelMapResponse>(message);
    }

}

export { SmarticoAPI, MessageSender }