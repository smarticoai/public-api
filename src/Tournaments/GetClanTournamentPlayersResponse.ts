import { ProtocolResponse } from '../Base/ProtocolResponse';
import { TClanTournamentPlayers } from '../WSAPI/WSAPITypes';

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

// Consumer-facing types live in WSAPITypes.ts (`TClanTournamentPlayers`) — the
// single source documented + emitted to docs. This transform maps the raw wire
// shape onto it; do not re-declare a parallel result/player type here.
export const clanTournamentPlayersTransform = (response: GetClanTournamentPlayersResponse): TClanTournamentPlayers => {
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
