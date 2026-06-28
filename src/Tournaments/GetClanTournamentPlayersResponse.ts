import { ProtocolResponse } from '../Base/ProtocolResponse';

export interface ClanTournamentPlayerRaw {
	userId: number;
	cleanExtUserId: string;
	userAltName: string;
	avatar_id: string;
	avatar_real_id: number;
	position: number;
	scores: number;
	isMe: boolean;
	registration_status?: number;
	crmBrandId?: number;
	avatar_url?: string;
}

export interface GetClanTournamentPlayersResponse extends ProtocolResponse {
	tournament_instance_id: number;
	players: ClanTournamentPlayerRaw[];
}

export interface TClanTournamentPlayer {
	user_id: number;
	clean_ext_user_id: string;
	public_username: string;
	avatar_id: string;
	avatar_real_id: number;
	avatar_url?: string;
	position: number;
	scores: number;
	is_me: boolean;
}

export interface TClanTournamentPlayersResult {
	tournament_instance_id: number;
	players: TClanTournamentPlayer[];
}

export const clanTournamentPlayersTransform = (response: GetClanTournamentPlayersResponse): TClanTournamentPlayersResult => {
	return {
		tournament_instance_id: response.tournament_instance_id,
		players: (response.players || []).map((p) => ({
			user_id: p.userId,
			clean_ext_user_id: p.cleanExtUserId,
			public_username: p.userAltName,
			avatar_id: p.avatar_id,
			avatar_real_id: p.avatar_real_id,
			avatar_url: p.avatar_url,
			position: p.position,
			scores: p.scores,
			is_me: p.isMe,
		})),
	};
};
