import { ProtocolResponse } from '../Base/ProtocolResponse';
import { Clan } from './Clan';

export interface GetClanListResponse extends ProtocolResponse {
	clans: Clan[];
	/** The clan ID the current user belongs to; null if clanless */
	user_clan_id: number | null;
	/** Cooldown until date string (e.g. "29/03/2026 10:00:00"); null if no cooldown */
	cooldown_until: string | null;
	/** Epoch ms when the current user joined their clan; null if clanless */
	join_date: number | null;
}
