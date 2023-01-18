import * as superagent from 'superagent';
import { ClassId } from "./Base/ClassId";
import { ProtocolRequest } from './Base/ProtocolRequest';
import { ProtocolResponse } from './Base/ProtocolResponse';
import { SAWGetTemplatesResponse } from './MiniGames/SAWGetTemplatesResponse';
import { SAWGetTemplatesRequest } from './MiniGames/SAWGetTemplatesRequest';
import { SAWTemplate } from './MiniGames/SAWTemplate';
import { IntUtils } from './IntUtils';
import { ILogger } from './ILogger';
import { SAWBuyInType, SAWBuyInTypeName, SAWGameType, SAWGameTypeName } from './MiniGames';

const PUBLIC_API_URL = 'https://papi{ENV_ID}.smartico.ai/services/public';

interface IOptions {
    logger?: ILogger;
    logCIDs?: ClassId[];
    logHTTPTiming?: boolean;
}


class SmarticoAPI {

    private publicUrl: string;
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
    }    

    private async send<T>(message: any, expectCID?: ClassId): Promise<T> {


        if (this.logCIDs.includes(message.cid)) {
            this.logger.info('REQ', message)
        }


        let result: any;
        
        try {
            const timeStart = new Date().getTime();
            const res = await superagent.post(this.publicUrl).send(message);
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

        return message as any
    }

    public async miniGamesGetTemplates(user_ext_id: string): Promise<SAWGetTemplatesResponse> {

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

    public miniGamesFormatTemplatesForWidget(templates: SAWTemplate[], pointsBalance: number): any[] {

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
                can_play: (
                    r.saw_buyin_type_id === SAWBuyInType.Free
                    || (r.saw_buyin_type_id === SAWBuyInType.Points && r.buyin_cost_points <= pointsBalance)
                    || (r.saw_buyin_type_id === SAWBuyInType.Spins && r.spin_count > 0)
                ), 
                icon: 
                    r.saw_skin_ui_definition?.skin_folder
                    ? r.saw_skin_ui_definition?.skin_folder + '/ico.png'
                    : `https://libs.smartico.ai/gf/images/saw/${r.saw_skin_key}/ico.png`
            }
        ));

    }

}

export { SmarticoAPI }