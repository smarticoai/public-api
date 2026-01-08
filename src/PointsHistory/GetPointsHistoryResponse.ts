import { ProtocolResponse } from '../Base/ProtocolResponse';
import { PointsHistoryLog } from './PointsHistoryLog';
import { TPointsHistoryLog } from '../WSAPI/WSAPITypes';
import { UserBalanceType } from './UserBalanceType';

export interface GetPointsHistoryResponse extends ProtocolResponse {
	logHistory: PointsHistoryLog[];
}

export const PointsHistoryTransform = (items: PointsHistoryLog[]): TPointsHistoryLog[] => {
	if (!items) return [];
	
	return items.map((item: any): TPointsHistoryLog => ({
		create_date: item.create_date,
		user_ext_id: item.user_ext_id,
		crm_brand_id: item.crm_brand_id,
		type: item.type ?? UserBalanceType.Points,
		amount: item.points_collected ?? item.amount,
		balance: item.user_points_balance ?? item.balance,
		total_ever: item.user_points_ever ?? 0,
		source_type_id: item.source_type_id,
	}));
};

