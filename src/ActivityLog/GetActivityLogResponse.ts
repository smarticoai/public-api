import { ProtocolResponse } from '../Base/ProtocolResponse';
import { ActivityLogEntry } from './ActivityLogEntry';
import { mapActivityLogHistory, resolveWalletDisplayType } from './ActivityLogMapper';
import { TActivityLog, TActivityLogEntry } from '../WSAPI/WSAPITypes';

export interface GetActivityLogResponse extends ProtocolResponse {
	logHistory: ActivityLogEntry[];
}

const toTActivityLog = (entry: TActivityLogEntry): TActivityLog => {
	const row: TActivityLog = {
		create_date: entry.create_date,
		user_ext_id: entry.user_ext_id,
		crm_brand_id: entry.crm_brand_id,
		type: resolveWalletDisplayType(entry),
		amount: entry.amount,
		balance: entry.balance,
		source_type_id: entry.source_type_id,
	};
	if (entry.total_ever !== undefined) {
		row.total_ever = entry.total_ever;
	}
	return row;
};

/** Maps wire rows to wallet-only {@link TActivityLog} — legacy consumer contract. */
export const ActivityLogTransform = (items: ActivityLogEntry[] | unknown[]): TActivityLog[] => {
	if (!items) {
		return [];
	}
	return mapActivityLogHistory(items)
		.filter((entry) => entry.is_wallet_entry)
		.map(toTActivityLog);
};

/** Maps wire rows to the full v2 {@link TActivityLogEntry} shape. */
export const ActivityLogV2Transform = (items: ActivityLogEntry[] | unknown[]): TActivityLogEntry[] => {
	if (!items) {
		return [];
	}
	return mapActivityLogHistory(items);
};
