import { AttemptPeriodType } from './AttemptPeriodType';
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
	/** Remaining stock. Present only when the template's `expose_game_stat_on_api` is enabled; always present for MatchX / Quiz games */
	pool?: number;
	/** Initial (configured) stock. Present regardless of `expose_game_stat_on_api` */
	pool_initial?: number;
	/** Times the prize has been won, across all players. Present only when `expose_game_stat_on_api` is enabled */
	wins_count?: number;
	/** ISO weekday numbers (1 = Monday … 7 = Sunday) the prize can be won on; absent = any day. Present only when `expose_game_stat_on_api` is enabled */
	weekdays?: number[];
	/** Prize availability window start (epoch ms), evaluated against `relative_period_timezone`. Present only when `expose_game_stat_on_api` is enabled */
	active_from_ts?: number;
	/** Prize availability window end (epoch ms), evaluated against `relative_period_timezone`. Present only when `expose_game_stat_on_api` is enabled */
	active_till_ts?: number;
	/** Timezone offset in minutes for `weekdays` / active-window evaluation (UTC minus local, as in JS `Date.getTimezoneOffset()`) */
	relative_period_timezone?: number;
	/** When true, the prize stays winnable at `pool` 0 (unlimited stock) */
	is_surcharge?: boolean;
	/** Always `false` in API responses — deleted prizes are excluded server-side */
	is_deleted?: boolean;
	prize_details_json?: {[key: string]: any};
	max_give_period_type_id?: AttemptPeriodType;
}
