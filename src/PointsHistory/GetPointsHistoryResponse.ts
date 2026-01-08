import { ProtocolResponse } from '../Base/ProtocolResponse';
import { PointsHistoryLog } from './PointsHistoryLog';
import { TPointsHistoryLog } from '../WSAPI/WSAPITypes';
import { UserBalanceType } from './UserBalanceType';

export interface GetPointsHistoryResponse extends ProtocolResponse {
	logHistory: PointsHistoryLog[];
}

export const PointsHistoryTransform = (items: PointsHistoryLog[]): TPointsHistoryLog[] => {
	if (!items) {
		return [];
	}

	return items.map((item: any): TPointsHistoryLog => {
		const itemTransformed: Partial<TPointsHistoryLog> = {
			create_date: item.create_date,
			user_ext_id: item.user_ext_id,
			crm_brand_id: item.crm_brand_id,
			source_type_id: item.source_type_id,
		}

		if (item.type === UserBalanceType.Diamonds || item.type === UserBalanceType.Gems) {
			itemTransformed.type = item.type;
			itemTransformed.amount = item.amount;
			itemTransformed.balance = item.balance;
		}

		if (item.type === UserBalanceType.Points) {
			itemTransformed.type = UserBalanceType.Points;
			itemTransformed.amount = item.points_collected;
			itemTransformed.balance = item.user_points_balance;
			itemTransformed.total_ever = item.user_points_ever;
		}

		return itemTransformed as TPointsHistoryLog;
	});
};

