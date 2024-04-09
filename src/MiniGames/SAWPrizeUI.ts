import { SAWAcknowledgeType } from "./SAWAcknowledgeType";
import { SAWWinSoundType } from "./SAWWinSoundType";

export interface SAWPrizeUI {
    position?: number; // for scratch card defines position of prize in the list
    name: string;
    aknowledge_message: string;
    sectors: number[];
    acknowledge_type: SAWAcknowledgeType;
    acknowledge_dp?: string;
    font_size?: number;
    sound_type: SAWWinSoundType;    
    icon?: string;
    replace_name_with_image?: boolean;
    acknowledge_action_title?: string;
    custom_win_sound?: string;
}