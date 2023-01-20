import * as superagent from 'superagent';
import { ClassId } from "./Base/ClassId";
import { ProtocolRequest } from './Base/ProtocolRequest';
import { ProtocolResponse } from './Base/ProtocolResponse';
import { SAWGetTemplatesResponse } from './MiniGames/SAWGetTemplatesResponse';
import { SAWGetTemplatesRequest } from './MiniGames/SAWGetTemplatesRequest';
import { SAWTemplate } from './MiniGames/SAWTemplate';
import { IntUtils } from './IntUtils';
import { ILogger } from './ILogger';
import { SAWBuyInType, SAWBuyInTypeName, SAWDoSpinRequest, SAWDoSpinResponse, SAWGameType, SAWGameTypeName, SAWSpinErrorCode, SAWUtils } from './MiniGames';
import { ECacheContext, OCache } from './OCache';
import { GetTranslationsRequest, GetTranslationsResponse, ResponseIdentify, TranslationArea } from './Core';
import { GetLabelInfoResponse } from './Core/GetLabelInfoResponse';
import { GetLabelInfoRequest } from './Core/GetLabelInfoRequest';
import { GetInboxMessagesRequest, GetInboxMessagesResponse } from './Inbox';

const PUBLIC_API_URL = 'https://papi{ENV_ID}.smartico.ai/services/public';
const AVATAR_DOMAIN = 'https://img{ENV_ID}.smr.vc';

interface IOptions {
    logger?: ILogger;
    logCIDs?: ClassId[];
    logHTTPTiming?: boolean;
}


class SmarticoAPI {

    private publicUrl: string;
    private avatarDomain: string;


    private logger: ILogger;
    private logCIDs: ClassId[];
    private logHTTPTiming: boolean;

    public constructor(private label_api_key: string, private brand_api_key: string, options: IOptions = {}) {

        this.logger = options.logger || (console as any);

        if (this.logger.always === undefined) {
            this.logger.always = this.logger.info;
        }

        this.logCIDs = options.logCIDs || [];
        this.logHTTPTiming = options.logHTTPTiming || false;

        let ENV_ID = this.label_api_key.length === 38 ? label_api_key.substring(37, 38) : '';
        
        if (ENV_ID === '1' || ENV_ID === '2') {
            ENV_ID = ''
        }
        label_api_key = label_api_key.substring(0, 36);

        this.publicUrl = PUBLIC_API_URL.replace('{ENV_ID}', ENV_ID);    
        this.avatarDomain = AVATAR_DOMAIN.replace('{ENV_ID}', ENV_ID);    
    }    

    private async send<T>(message: any, expectCID?: ClassId): Promise<T> {


        if (this.logCIDs.includes(message.cid)) {
            this.logger.info('REQ', message)
        }


        let result: any;
        
        try {
            const timeStart = new Date().getTime();
            const res = await superagent.post(this.publicUrl).send(message);
            // const res = await superagent.post('http://channel01.int.smartico.ai:81/services/public').send(message);
            const timeEnd = new Date().getTime();

            if (this.logHTTPTiming) {
                this.logger.always('HTTP time, ms:' + (timeEnd - timeStart))
            }
            
            result = JSON.parse(res.text);
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

        if (!(r.avatar_id && r.avatar_id.startsWith('http'))) {
            r.avatar_id = AVATAR_DOMAIN + '/avatar/' + r.avatar_id
        }

        return r;
    }            

    public async coreChangeUsername(user_ext_id: string, public_username_custom: string): Promise<{ public_username_custom: string }> {
        
        const message = this.buildMessage<any, any>(user_ext_id, ClassId.CLIENT_SET_CUSTOM_USERNAME_REQUEST, {
            public_username_custom
        });
        
        return this.send(message, ClassId.CLIENT_SET_CUSTOM_USERNAME_RESPONSE);
    }


    public async sawGetTemplates(user_ext_id: string): Promise<SAWGetTemplatesResponse> {

        const message = this.buildMessage<SAWGetTemplatesResponse, SAWGetTemplatesRequest>(user_ext_id, ClassId.SAW_GET_SPINS_REQUEST);

        const response = await this.send<SAWGetTemplatesResponse>(message);

        if (response && response.templates) {
            response.templates.forEach(t => {
    
                if (t.jackpot_current) {
                    t.saw_template_ui_definition.name = IntUtils.replaceAll(t.saw_template_ui_definition.name, '{{jackpot}}', t.jackpot_current);
                    t.saw_template_ui_definition.description = IntUtils.replaceAll(t.saw_template_ui_definition.description, '{{jackpot}}', t.jackpot_current);
                    t.saw_template_ui_definition.promo_text = IntUtils.replaceAll(t.saw_template_ui_definition.promo_text, '{{jackpot}}', t.jackpot_current);
                    t.prizes.forEach(p => {
                        p.saw_prize_ui_definition.name = IntUtils.replaceAll(p.saw_prize_ui_definition.name, '{{jackpot}}', t.jackpot_current);
                        p.saw_prize_ui_definition.aknowledge_message = IntUtils.replaceAll(p.saw_prize_ui_definition.aknowledge_message, '{{jackpot}}', t.jackpot_current);
                    })
                }
            });   
        }

        return response;

    }

    public async sawFormatTemplatesForWidget(templates: SAWTemplate[], pointsBalance: number): Promise<any[]> {

        return templates.filter( r => r.saw_template_id >= 1).map( r => (
            {
                id: r.saw_template_id,
                name: r.saw_template_ui_definition.name,
                // description: r.saw_template_ui_definition.description,
                game_type: SAWGameTypeName[r.saw_game_type_id] || 'unknown',
                buyin_type: SAWBuyInTypeName[r.saw_buyin_type_id] || 'unknown',
                jackpot: r.jackpot_current,
                spin_count: r.spin_count,
                buyin_cost_points: r.buyin_cost_points,
                can_play: SAWUtils.canPlay(r, pointsBalance), 
                icon: 
                    r.saw_skin_ui_definition?.skin_folder
                    ? r.saw_skin_ui_definition?.skin_folder + '/ico.png'
                    : `https://libs.smartico.ai/gf/images/saw/${r.saw_skin_key}/ico.png`
            }
        ));

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

        const message = this.buildMessage<GetInboxMessagesRequest, GetInboxMessagesResponse>(user_ext_id, ClassId.GET_ACTIVITY_LOG_REQUEST, {
            limit,
            offset
        });

        const response = await this.send<GetInboxMessagesResponse>(message);

        return response;

    }    

}

export { SmarticoAPI }