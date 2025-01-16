import { PrizeModifiers } from './PrizeModifiers';
import { SAWAcknowledgeType } from './SAWAcknowledgeType';
import { SAWWinSoundType } from './SAWWinSoundType';

export interface SAWPrizeUI {
	position?: number; // for scratch card defines position of prize in the list
	name: string;
	name_original?: string; // keeps original name, how it came from the servers. This is needed for the Jackpot value replacemenet
	aknowledge_message?: string;
	sectors?: number[];
	acknowledge_type?: SAWAcknowledgeType;
	acknowledge_dp?: string;
	font_size?: number;
	font_size_mobile?: number;
	sound_type?: SAWWinSoundType;
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
}
