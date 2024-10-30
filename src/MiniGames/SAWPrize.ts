import { SAWPrizeType } from './SAWPrizeType';
import { SAWPrizeUI } from './SAWPrizeUI';

export interface SAWPrize {
	saw_prize_id: number;
	saw_prize_ui_definition: SAWPrizeUI;
	prize_value?: number;
	prize_type_id: SAWPrizeType;
	place_from?: number;
	place_to?: number;
	sawUniqueWinId?: string;
	pool?: number;
	pool_initial?: number;
	wins_count?: number;
	weekdays?: number[];
	active_from_ts?: number;
	active_till_ts?: number;
	active_from?: string;
    active_till?: string;
}
