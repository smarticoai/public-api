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

export interface GetClanInfoResponse extends ProtocolResponse {
	clan_info: Clan;
	members: ClanMember[];
	entry_fee_currency_type_id: number;
	entry_fee_amount: number;
	/** Cooldown until date string; null if no cooldown active */
	cooldown_until: string | null;
}
