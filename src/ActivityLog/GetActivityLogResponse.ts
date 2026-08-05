import { ProtocolResponse } from '../Base/ProtocolResponse';
import { ActivityLogEntry } from './ActivityLogEntry';
import { ActivityLogActivities } from './ActivityLogActivities';
import { TActivityLog } from '../WSAPI/WSAPITypes';
import { UserBalanceType } from './UserBalanceType';

export interface GetActivityLogResponse extends ProtocolResponse {
	logHistory: ActivityLogEntry[];
}

export const ActivityLogTransform = (items: ActivityLogEntry[]): TActivityLog[] => {
	if (!items) {
		return [];
	}

	return items.map((r: any): TActivityLog => {
		// The wire sends the activity kind as `type` (an ActivityLogActivities value).
		// `type_id` is accepted as an alias so an older/newer server spelling still maps.
		const activityTypeId: ActivityLogActivities = r.type_id ?? r.type;
		const isGems = activityTypeId === ActivityLogActivities.Gems;
		const isDiamonds = activityTypeId === ActivityLogActivities.Diamonds;
		const meta = r.ctx_meta ?? r.context_value_meta;

		return {
			create_date: r.create_date?.seconds ?? r.create_date,
			user_ext_id: r.user_ext_id,
			// Sent as a string on the wire.
			crm_brand_id: Number(r.crm_brand_id),
			type: isGems ? UserBalanceType.Gems : isDiamonds ? UserBalanceType.Diamonds : UserBalanceType.Points,
			// `amount` carries the real delta; `points_collected` is a `-1` placeholder on points rows.
			amount: r.amount ?? r.points_collected,
			balance: r.user_points_balance ?? r.balance,
			total_ever: r.user_points_ever,
			source_type_id: r.source_type_id,
			activity_type_id: activityTypeId,
			context_value_1: r.ctx_1 ?? r.context_value_1,
			meta,
			// Entity name travels inside the context meta, not as a top-level field.
			source_entity_name: r.source_entity_name ?? meta?.name,
			source_entity_id: r.source_entity_id,
			source_reference_id: r.source_ref_id ?? r.source_reference_id,
			source_root_id: r.source_root_id,
			is_wallet_entry:
				activityTypeId == null
				|| activityTypeId === ActivityLogActivities.Gems
				|| activityTypeId === ActivityLogActivities.Diamonds
				|| activityTypeId === ActivityLogActivities.Points,
		};
	});
};
