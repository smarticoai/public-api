import { ClanPublicMeta } from '../Clans/Clan';

export interface ClanLeaderboardEntry {
	clanId: number;
	publicMeta: ClanPublicMeta;
	rank: number;
	totalScore: number;
	memberCount: number;
}

export interface ClanPrizeTier {
	player_place_from: number;
	player_place_to: number;
	pool_amount: number | null;
	distribution_type: number | null;
	activity_type_id: number | null;
	details_json: Record<string, any> | null;
	public_meta: ClanPublicMeta | null;
}

export interface ClanPrizeStructureEntry {
	clan_place: number;
	/** 1 = Fixed, 2 = Dynamic */
	prize_type_id: number;
	prize_pool_amount: number | null;
	activity_type_id: number | null;
	details_json: Record<string, any> | null;
	public_meta: ClanPublicMeta | null;
	player_tiers: ClanPrizeTier[] | null;
}
