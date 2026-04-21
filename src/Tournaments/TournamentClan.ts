import { ClanPublicMeta } from '../Clans/Clan';

export interface ClanLeaderboardEntry {
	clan_id: number;
	public_meta: ClanPublicMeta;
	position: number;
	total_score: number;
	contributing_members: number;
}

export interface ClanPrizeTier {
	player_place_from: number;
	player_place_to: number;
	pool_amount: number | null;
	distribution_type: number | null;
	activity_type_id: number;
	details_json: Record<string, any>;
	public_meta: ClanPublicMeta | null;
}

export interface ClanPrizeStructureEntry {
	clan_place: number;
	/** 1 = Fixed, 2 = Dynamic */
	prize_type_id: number;
	prize_pool_amount: number | null;
	activity_type_id: number | null;
	details_json: Record<string, any>;
	public_meta: ClanPublicMeta;
	tiers: ClanPrizeTier[];
}
