import { ProtocolResponse } from '../Base/ProtocolResponse';
import { ActivityLogEntry } from './ActivityLogEntry';
import { ActivityLogActivities } from './ActivityLogActivities';
import { TActivityLog, TActivityLogEntry } from '../WSAPI/WSAPITypes';
import { UserBalanceType } from './UserBalanceType';

export interface GetActivityLogResponse extends ProtocolResponse {
	logHistory: ActivityLogEntry[];
}

export const ActivityLogTransform = (items: ActivityLogEntry[]): TActivityLog[] => {
	if (!items) {
		return [];
	}

	return items.map((item: any): TActivityLog => {
		const itemTransformed: Partial<TActivityLog> = {
			create_date: item.create_date?.seconds ?? item.create_date,
			user_ext_id: item.user_ext_id,
			crm_brand_id: item.crm_brand_id,
			source_type_id: item.source_type_id,
		};

		item.type = item.type ?? UserBalanceType.Points;

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

		return itemTransformed as TActivityLog;
	});
};

export const ActivityLogV2Transform = (items: any[]): TActivityLogEntry[] => {
	if (!items) {
		return [];
	}

	return items.map((r) => {
		const isGems = r.type_id === ActivityLogActivities.Gems || r.type === UserBalanceType.Gems;
		const isDiamonds = r.type_id === ActivityLogActivities.Diamonds || r.type === UserBalanceType.Diamonds;

		const x: TActivityLogEntry = {
			create_date: r.create_date?.seconds ?? r.create_date,
			user_ext_id: r.user_ext_id,
			crm_brand_id: r.crm_brand_id,
			type: isGems ? UserBalanceType.Gems : isDiamonds ? UserBalanceType.Diamonds : UserBalanceType.Points,
			amount: r.points_collected ?? r.amount,
			balance: r.user_points_balance ?? r.balance,
			total_ever: r.user_points_ever,
			source_type_id: r.source_type_id,
			activity_type_id: r.type_id,
			context_value_1: r.context_value_1,
			meta: r.context_value_meta,
			source_entity_name: r.source_entity_name,
			source_entity_id: r.source_entity_id,
			source_reference_id: r.source_reference_id,
			source_root_id: r.source_root_id,
			is_wallet_entry:
				r.type_id == null
				|| r.type_id === ActivityLogActivities.Gems
				|| r.type_id === ActivityLogActivities.Diamonds
				|| r.type_id === ActivityLogActivities.Points,
		};
		return x;
	});
};
