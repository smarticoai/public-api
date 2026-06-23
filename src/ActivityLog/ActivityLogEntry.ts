import { PointChangeSourceType } from './PointChangeSourceType';
import { UserBalanceType } from './UserBalanceType';
	
export interface PointsLog {
	/** Epoch timestamp in SECONDS (not ms — unlike most SDK timestamps). */
	create_date: number;
	user_ext_id: string;
	crm_brand_id: number;
	points_collected: number;
	user_points_ever: number;
	user_points_balance: number;
	source_type_id: PointChangeSourceType;
}

export interface GemsDiamondsLog {
	/** Epoch timestamp in SECONDS (not ms — unlike most SDK timestamps). */
	create_date: number;
	user_ext_id: string;
	crm_brand_id: number;
	type: UserBalanceType;
	amount: number;
	balance: number;
	source_type_id: PointChangeSourceType;
}

export type ActivityLogEntry = PointsLog | GemsDiamondsLog;

