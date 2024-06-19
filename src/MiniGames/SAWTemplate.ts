import { SAWBuyInType } from "./SAWBuyInType";
import { SAWGameType } from "./SAWGameType";
import { SAWPrize } from "./SAWPrize";
import { SAWTemplateUI } from "./SAWTemplateUI";

export interface SAWTemplate {
    saw_template_id: number;
    saw_game_type_id: SAWGameType;
    saw_template_ui_definition: SAWTemplateUI;

    saw_buyin_type_id: SAWBuyInType;
    buyin_cost_points?: number;
    visibile_when_can_spin: boolean;

    spin_count?: number; // inital count, after that server will push SAWSpinsCountPush

    prizes: SAWPrize[];

    is_visible: boolean;

    jackpot_add_on_attempt: number;
    jackpot_current: number;
    jackpot_guaranteed: number;

    maxActiveSpinsAllowed: number;
    maxSpinsCount: number;
    maxSpinsPediodMs: number;    

    next_available_spin_ts?: number;

    saw_skin_key: string;
    saw_skin_ui_definition: {
        skin_folder: string;
        skin_css: string;
    };    


    // AA: releavnt only in the context of the SAWPrizeDropWinPush
    requires_prize_claim?: boolean;
}
