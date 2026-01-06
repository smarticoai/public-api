export interface PointsLog {
	create_date: number;
	user_ext_id: string;
	crm_brand_id: number;
	points_collected: number;
	user_points_ever: number;
	user_points_balance: number;
	source_type_id: number;
}

export interface GemsDiamondsLog {
	create_date: number;
	user_ext_id: string;
	crm_brand_id: number;
	type: string;
	amount: number;
	balance: number;
	source_type_id: number;
}

export type PointsHistoryLog = PointsLog | GemsDiamondsLog;

