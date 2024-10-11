import { ProtocolResponse } from '../Base/ProtocolResponse';

export interface GetAchievementsUserInfoResponse extends ProtocolResponse {
	level_counter_1?: number;
	level_counter_2?: number;
	points_balance: number;
    points_ever: number;
    current_level: number;
    points_board_period_type_1: number;
    points_board_period_type_2: number;
    points_board_period_type_3: number;
}
