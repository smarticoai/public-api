import { PointChangeSourceType } from './PointChangeSourceType';
import { UserBalanceType } from './UserBalanceType';
import {
	ActivityLogActivities,
	activityTypeIdToBalanceType,
	isWalletActivityTypeId,
} from './ActivityLogActivities';
import { ActivityLogMeta, ActivityLogPublicMeta } from './ActivityLogMeta';
import { TActivityLogEntry } from '../WSAPI/WSAPITypes';

const POINTS_COLLECTED_SENTINEL = -1;

const parseCreateDate = (raw: unknown): number => {
	if (raw === undefined || raw === null) {
		return 0;
	}
	if (typeof raw === 'number') {
		return raw;
	}
	if (typeof raw === 'object' && raw !== null) {
		if ('seconds' in raw) {
			return Number((raw as { seconds: number }).seconds);
		}
		if ('epochSecond' in raw) {
			return Number((raw as { epochSecond: number }).epochSecond);
		}
	}
	if (typeof raw === 'string') {
		const ms = Date.parse(raw);
		if (!Number.isNaN(ms)) {
			return Math.floor(ms / 1000);
		}
	}
	return 0;
};

const readWireNumber = (log: Record<string, unknown>, ...keys: string[]): number | undefined => {
	for (const key of keys) {
		const value = log[key];
		if (value !== undefined && value !== null && value !== '') {
			return Number(value);
		}
	}
	return undefined;
};

const normalizeWireLog = (raw: Record<string, unknown>): Record<string, unknown> => {
	const log: Record<string, unknown> = { ...raw };
	const explicitTypeId = readWireNumber(log, 'type_id');
	if (explicitTypeId !== undefined) {
		log.type_id = explicitTypeId;
	} else {
		const wireType = readWireNumber(log, 'type');
		if (wireType !== undefined && wireType > UserBalanceType.Diamonds) {
			log.type_id = wireType;
		}
	}
	if (log.context_value_1 === undefined && log.ctx_1 !== undefined) {
		log.context_value_1 = log.ctx_1;
	}
	if (log.context_value_meta === undefined && log.ctx_meta !== undefined) {
		log.context_value_meta = log.ctx_meta;
	}
	if (log.source_reference_id === undefined && log.source_ref_id !== undefined) {
		log.source_reference_id = log.source_ref_id;
	}
	if (log.source_entity_id === undefined && log.source_root_id !== undefined) {
		log.source_entity_id = log.source_root_id;
	}
	return log;
};

const isActivityLogWireEntry = (log: Record<string, unknown>): boolean => {
	if (log.is_activity_log === true) {
		return true;
	}
	if (log.label_id !== undefined && log.label_id !== null) {
		return true;
	}
	if (log.ctx_meta !== undefined || log.context_value_meta !== undefined) {
		return true;
	}
	if (log.ctx_1 !== undefined || log.context_value_1 !== undefined) {
		return true;
	}
	if (log.user_id !== undefined && log.user_id !== null) {
		return true;
	}
	const wireTypeId = readWireNumber(log, 'type_id');
	return wireTypeId !== undefined && wireTypeId > UserBalanceType.Diamonds;
};

const readWireBalanceType = (log: Record<string, unknown>): UserBalanceType | undefined => {
	const balanceType = readWireNumber(log, 'type');
	if (balanceType === UserBalanceType.Gems || balanceType === UserBalanceType.Diamonds) {
		return balanceType;
	}
	return undefined;
};

const hasGemsOrDiamondsWalletFields = (log: Record<string, unknown>): boolean =>
	log.amount !== undefined
	|| log.balance !== undefined
	|| readWireNumber(log, 'amount', 'collected_amount') !== undefined
	|| readWireNumber(log, 'balance', 'user_balance') !== undefined;

const isGemsOrDiamondsWalletWireEntry = (log: Record<string, unknown>): boolean => {
	const balanceType = readWireBalanceType(log);
	return balanceType !== undefined && hasGemsOrDiamondsWalletFields(log);
};

const resolveWalletAmount = (log: Record<string, unknown>, isPoints: boolean): number => {
	const pointsCollected = readWireNumber(log, 'points_collected');
	if (isPoints && pointsCollected !== undefined && pointsCollected !== POINTS_COLLECTED_SENTINEL) {
		return pointsCollected;
	}
	if (isPoints) {
		const amount = readWireNumber(log, 'amount', 'collected_amount');
		return amount === undefined ? 0 : amount;
	}
	const amount = readWireNumber(log, 'amount', 'collected_amount');
	return amount === undefined ? 0 : amount;
};

const resolveWalletBalance = (log: Record<string, unknown>, isPoints: boolean): number => {
	if (isPoints) {
		const balance = readWireNumber(log, 'balance', 'user_points_balance', 'user_balance');
		return balance === undefined ? 0 : balance;
	}
	const balance = readWireNumber(log, 'balance', 'user_balance');
	return balance === undefined ? 0 : balance;
};

const resolveSourceTypeId = (log: Record<string, unknown>): PointChangeSourceType => {
	const sourceTypeId = readWireNumber(log, 'source_type_id', 'entity_type_id');
	return (sourceTypeId === undefined ? 0 : sourceTypeId) as PointChangeSourceType;
};

const parseMeta = (contextValueMeta: unknown): ActivityLogMeta | undefined => {
	if (!contextValueMeta) {
		return undefined;
	}
	let meta: ActivityLogMeta | undefined;
	if (typeof contextValueMeta === 'object') {
		meta = contextValueMeta as ActivityLogMeta;
	} else if (typeof contextValueMeta === 'string') {
		try {
			meta = JSON.parse(contextValueMeta) as ActivityLogMeta;
		} catch {
			return undefined;
		}
	}
	if (!meta) {
		return undefined;
	}
	const nested = meta.public_meta ?? meta.public_map;
	const pickImage = (src?: ActivityLogMeta | ActivityLogPublicMeta): string | undefined =>
		src?.image_url ?? src?.image ?? src?.url ?? src?.avatar_url ?? src?.icon_url ?? src?.avatar_id;
	if (nested) {
		return {
			...meta,
			name: meta.name ?? nested.name,
			image_url: pickImage(meta) ?? pickImage(nested),
			position: meta.position ?? nested.position ?? meta.score,
		};
	}
	const topImage = pickImage(meta);
	if (topImage && meta.image_url === undefined) {
		return { ...meta, image_url: topImage, position: meta.position ?? meta.score };
	}
	if (meta.score !== undefined && meta.position === undefined) {
		return { ...meta, position: meta.score };
	}
	return meta;
};

const isLegacyPointsEntry = (log: Record<string, unknown>): boolean => {
	if (isActivityLogWireEntry(log)) {
		return false;
	}
	const pointsCollected = readWireNumber(log, 'points_collected');
	return pointsCollected !== undefined && pointsCollected !== POINTS_COLLECTED_SENTINEL;
};

const isLegacyGemsDiamondsEntry = (log: Record<string, unknown>): boolean => {
	if (isActivityLogWireEntry(log)) {
		return false;
	}
	const balanceType = readWireNumber(log, 'type');
	return (balanceType === UserBalanceType.Gems || balanceType === UserBalanceType.Diamonds)
		&& log.amount !== undefined;
};

const isV2Entry = (log: Record<string, unknown>): boolean =>
	isActivityLogWireEntry(log) || (log.type_id !== undefined && log.type_id !== null);

const resolveSourceEntityName = (log: Record<string, unknown>, meta: ActivityLogMeta | undefined): string | undefined => {
	const fromWire = log.source_entity_name ?? log.source_public_name;
	if (typeof fromWire === 'string' && fromWire.length > 0) {
		return fromWire;
	}
	if (meta?.name) {
		return meta.name;
	}
	return undefined;
};

const buildEntryKey = (log: Record<string, unknown>, index: number): string =>
	[
		parseCreateDate(log.create_date),
		log.type_id ?? log.type ?? 'legacy',
		log.source_type_id ?? '',
		log.source_entity_id ?? log.source_root_id ?? '',
		log.context_value_1 ?? log.ctx_1 ?? '',
		index,
	].join('-');

const mapLegacyPointsEntry = (log: Record<string, unknown>, index: number): TActivityLogEntry => ({
	entry_key: buildEntryKey(log, index),
	create_date: parseCreateDate(log.create_date),
	user_ext_id: String(log.user_ext_id ?? ''),
	crm_brand_id: Number(log.crm_brand_id ?? 0),
	type: UserBalanceType.Points,
	amount: resolveWalletAmount(log, true),
	balance: resolveWalletBalance(log, true),
	total_ever: readWireNumber(log, 'user_points_ever', 'collected_ever'),
	context_value_1: readWireNumber(log, 'context_value_1', 'ctx_1'),
	source_type_id: resolveSourceTypeId(log),
	activity_type_id: ActivityLogActivities.Points,
	is_wallet_entry: true,
});

const mapLegacyGemsDiamondsEntry = (log: Record<string, unknown>, index: number): TActivityLogEntry => {
	const wireType = readWireNumber(log, 'type') as UserBalanceType;
	const activityTypeId = wireType === UserBalanceType.Gems
		? ActivityLogActivities.Gems
		: ActivityLogActivities.Diamonds;
	return {
		entry_key: buildEntryKey(log, index),
		create_date: parseCreateDate(log.create_date),
		user_ext_id: String(log.user_ext_id ?? ''),
		crm_brand_id: Number(log.crm_brand_id ?? 0),
		type: activityTypeIdToBalanceType(activityTypeId),
		amount: resolveWalletAmount(log, false),
		balance: resolveWalletBalance(log, false),
		context_value_1: readWireNumber(log, 'context_value_1', 'ctx_1'),
		source_type_id: resolveSourceTypeId(log),
		activity_type_id: activityTypeId,
		is_wallet_entry: true,
	};
};

const mapV2Entry = (log: Record<string, unknown>, index: number): TActivityLogEntry | null => {
	const typeId = readWireNumber(log, 'type_id');
	const contextValue1 = readWireNumber(log, 'context_value_1', 'ctx_1');

	const meta = parseMeta(log.context_value_meta);
	const sourceEntityName = resolveSourceEntityName(log, meta);
	const sourceEntityId = readWireNumber(log, 'source_entity_id', 'source_root_id');
	const sourceReferenceId = readWireNumber(log, 'source_reference_id', 'source_ref_id');
	const sourceRootId = readWireNumber(log, 'source_root_id');
	const gemsOrDiamondsWallet = isGemsOrDiamondsWalletWireEntry(log);
	const isWalletEntry = (typeId !== undefined && isWalletActivityTypeId(typeId)) || gemsOrDiamondsWallet;

	const base = {
		entry_key: buildEntryKey(log, index),
		create_date: parseCreateDate(log.create_date),
		user_ext_id: String(log.user_ext_id ?? ''),
		crm_brand_id: Number(log.crm_brand_id ?? 0),
		source_type_id: resolveSourceTypeId(log),
		activity_type_id: typeId as ActivityLogActivities,
		context_value_1: contextValue1,
		meta,
		source_entity_name: sourceEntityName,
		source_entity_id: sourceEntityId && sourceEntityId > 0 ? sourceEntityId : undefined,
		source_reference_id: sourceReferenceId && sourceReferenceId > 0 ? sourceReferenceId : undefined,
		source_root_id: sourceRootId && sourceRootId > 0 ? sourceRootId : undefined,
	};

	if (isWalletEntry) {
		const wireBalanceType = readWireBalanceType(log);
		const balanceType = wireBalanceType ?? (typeId !== undefined ? activityTypeIdToBalanceType(typeId as ActivityLogActivities) : UserBalanceType.Points);
		const walletActivityTypeId = typeId !== undefined && isWalletActivityTypeId(typeId)
			? typeId
			: balanceType === UserBalanceType.Gems
				? ActivityLogActivities.Gems
				: balanceType === UserBalanceType.Diamonds
					? ActivityLogActivities.Diamonds
					: ActivityLogActivities.Points;
		const isPoints = balanceType === UserBalanceType.Points;
		const totalEver = isPoints
			? readWireNumber(log, 'user_points_ever', 'collected_ever')
				?? (meta?.user_points_ever !== undefined ? Number(meta.user_points_ever) : undefined)
			: undefined;
		return {
			...base,
			activity_type_id: walletActivityTypeId as ActivityLogActivities,
			type: balanceType,
			amount: resolveWalletAmount(log, isPoints),
			balance: resolveWalletBalance(log, isPoints),
			total_ever: totalEver === POINTS_COLLECTED_SENTINEL ? undefined : totalEver,
			is_wallet_entry: true,
		};
	}

	return {
		...base,
		type: UserBalanceType.Points,
		amount: 0,
		balance: 0,
		is_wallet_entry: false,
		is_level_entry: typeId === ActivityLogActivities.LevelChanged,
	};
};

const mapWireEntry = (log: Record<string, unknown>, index: number): TActivityLogEntry | null => {
	const normalized = normalizeWireLog(log);
	if (isLegacyPointsEntry(normalized)) {
		return mapLegacyPointsEntry(normalized, index);
	}
	if (isLegacyGemsDiamondsEntry(normalized)) {
		return mapLegacyGemsDiamondsEntry(normalized, index);
	}
	if (isV2Entry(normalized)) {
		return mapV2Entry(normalized, index);
	}
	return null;
};

export const mapActivityLogHistory = (logHistory: unknown[]): TActivityLogEntry[] => {
	const entries: TActivityLogEntry[] = [];
	(logHistory || []).forEach((raw, index) => {
		const mapped = mapWireEntry(raw as Record<string, unknown>, index);
		if (mapped) {
			entries.push(mapped);
		}
	});
	return entries;
};

export const resolveWalletDisplayType = (entry: TActivityLogEntry): UserBalanceType => {
	switch (entry.activity_type_id) {
		case ActivityLogActivities.Gems:
			return UserBalanceType.Gems;
		case ActivityLogActivities.Diamonds:
			return UserBalanceType.Diamonds;
		case ActivityLogActivities.Points:
			return UserBalanceType.Points;
	}
	switch (Number(entry.type)) {
		case UserBalanceType.Gems:
			return UserBalanceType.Gems;
		case UserBalanceType.Diamonds:
			return UserBalanceType.Diamonds;
		default:
			return UserBalanceType.Points;
	}
};
