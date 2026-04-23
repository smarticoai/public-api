import { ProtocolResponse } from '../Base/ProtocolResponse';
import { Clan } from './Clan';

export interface ClanMember {
	user_id: number;
	public_username: string;
	avatar_id: string;
	avatar_real_id: number;
	/** Rank within clan */
	position: number;
	/** Aggregated tournament contribution */
	contribution_score: number;
	is_me?: boolean;
	clean_ext_user_id?: string;
}

export interface ClanInfo extends Clan {
	label_id: number;
	members: ClanMember[];
	/** Cooldown until date string; null if no cooldown active */
	cooldown_until: string | null;
}

export interface GetClanInfoResponse extends ProtocolResponse {
	clanInfo: ClanInfo;
}
