import { PrizeModifiers } from './PrizeModifiers';
import { SAWAcknowledgeType } from './SAWAcknowledgeType';
import { SAWWinSoundType } from './SAWWinSoundType';

export interface SAWPrizeUI {
	position?: number; // for scratch card defines position of prize in the list
	name: string;
	name_original?: string; // keeps original name, how it came from the servers. This is needed for the Jackpot value replacemenet
	hide_prize_popup: boolean; // if true, prize popup on Prize Drop will not be shown
	aknowledge_message?: string;
	aknowledge_message_lose?: string; // voyager specific
	sectors?: number[];
	acknowledge_type?: SAWAcknowledgeType;
	acknowledge_dp?: string;
	font_size?: number;
	font_size_mobile?: number;
	sound_type?: SAWWinSoundType;
	second_btn?: string
	second_btn_action_title?: string
	acknowledge_dp_additional?: string;
	acknowledge_action_title_additional?: string;
	icon?: string;
	replace_name_with_image?: boolean;
	acknowledge_action_title?: string;
	custom_win_sound?: string;
	out_of_stock_message?: string;
	custom_data?: any;
	prize_modifiers?: PrizeModifiers[]; // treasure hunt specific
	allow_split_decimal?: boolean; // treasure hunt specific
	hide_prize_from_history?: boolean;
	hide_prize_till_won?: boolean;
	requirements_to_get_prize?: string;
}
