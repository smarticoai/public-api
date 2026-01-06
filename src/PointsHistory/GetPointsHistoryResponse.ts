import { ProtocolResponse } from '../Base/ProtocolResponse';
import { PointsHistoryLog, PointsLog, GemsDiamondsLog } from './PointsHistoryLog';
import { TPointsHistoryLog, TPointsLog, TGemsDiamondsLog } from '../WSAPI/WSAPITypes';

export interface GetPointsHistoryResponse extends ProtocolResponse {
	logHistory: PointsHistoryLog[];
}

export const isPointsLog = (log: PointsHistoryLog): log is PointsLog => {
	return 'points_collected' in log;
};

export const isGemsDiamondsLog = (log: PointsHistoryLog): log is GemsDiamondsLog => {
	return 'type' in log && 'amount' in log;
};

export const PointsHistoryTransform = (items: PointsHistoryLog[]): TPointsHistoryLog[] => {
	if (!items) return [];
	
	return items.map((item) => {
		if (isPointsLog(item)) {
			const x: TPointsLog = {
				create_date: item.create_date,
				user_ext_id: item.user_ext_id,
				crm_brand_id: item.crm_brand_id,
				points_collected: item.points_collected,
				user_points_ever: item.user_points_ever,
				user_points_balance: item.user_points_balance,
				source_type_id: item.source_type_id,
			};
			return x;
		} else {
			const x: TGemsDiamondsLog = {
				create_date: item.create_date,
				user_ext_id: item.user_ext_id,
				crm_brand_id: item.crm_brand_id,
				type: item.type,
				amount: item.amount,
				balance: item.balance,
				source_type_id: item.source_type_id,
			};
			return x;
		}
	});
};

