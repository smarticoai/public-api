import { TMiniGamePrize, TMiniGameTemplate } from "../WSAPI/WSAPITypes";
import { ProtocolResponse } from "./../Base/ProtocolResponse";
import { SAWBuyInTypeNamed } from "./SAWBuyInType";
import { SAWGameTypeNamed } from "./SAWGameType";
import { MiniGamePrizeTypeName, MiniGamePrizeTypeNamed } from "./SAWPrizeType";
import { SAWTemplate } from "./SAWTemplate";
import { SAWUtils } from "./SAWUtils";


export interface SAWGetTemplatesResponse extends ProtocolResponse {

    templates: SAWTemplate[];
}


export const SAWTemplatesTransform = (items: SAWTemplate[]): TMiniGameTemplate[] => {    
    
    
    return items.map( r => {

        const x: TMiniGameTemplate =  {
            
            id: r.saw_template_id,
            name: r.saw_template_ui_definition.name,
            description: r.saw_template_ui_definition.description,
            thumbnail: 
                r.saw_skin_ui_definition?.skin_folder
                ? r.saw_skin_ui_definition?.skin_folder + '/ico.png'
                : `https://libs.smartico.ai/gf/images/saw/${r.saw_skin_key}/ico.png`
                ,
            over_limit_message: r.saw_template_ui_definition.over_limit_message,
            no_attempts_message: r.saw_template_ui_definition.no_attempts_message,
            jackpot_symbol: r.saw_template_ui_definition.jackpot_symbol,
            saw_game_type: SAWGameTypeNamed[r.saw_game_type_id],
            saw_buyin_type: SAWBuyInTypeNamed[r.saw_buyin_type_id],
            buyin_cost_points: r.buyin_cost_points,
            jackpot_add_on_attempt: r.jackpot_add_on_attempt,
            jackpot_current: r.jackpot_current,
            spin_count: r.spin_count,

            prizes: r.prizes.map( p => {
                const y: TMiniGamePrize = {
                    id: p.saw_prize_id,
                    name: p.saw_prize_ui_definition.name,
                    prize_type: MiniGamePrizeTypeNamed(p.prize_type_id),
                    prize_value: p.prize_value,
                    font_size: p.saw_prize_ui_definition.font_size,
                    icon: p.saw_prize_ui_definition.icon
                }
                return y;
            })
        };
        return x;
    });
}

