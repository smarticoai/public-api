import { ProtocolResponse } from '../Base/ProtocolResponse';

export interface ClanTournamentPlayerRaw {
	user_id: number;
	public_username: string;
	avatar_id: string;
	avatar_real_id: number;
	position: number;
	scores: number;
	is_me: boolean;
	clean_ext_user_id: string;
	avatar_url?: string;
}

export interface GetClanTournamentPlayersResponse extends ProtocolResponse {
	clan_id: number;
	clan_public_meta: { name: string; image_url: string };
	players: ClanTournamentPlayerRaw[];
}

export interface TClanTournamentPlayer {
	user_id: number;
	public_username: string;
	avatar_id: string;
	avatar_real_id: number;
	avatar_url?: string;
	position: number;
	scores: number;
	is_me: boolean;
	clean_ext_user_id: string;
}

export interface TClanTournamentPlayersResult {
	clan_id: number;
	clan_public_meta: { name: string; image_url: string };
	players: TClanTournamentPlayer[];
}

export const clanTournamentPlayersTransform = (response: GetClanTournamentPlayersResponse): TClanTournamentPlayersResult => {
	return {
		clan_id: response.clan_id,
		clan_public_meta: {
			name: response.clan_public_meta.name,
			image_url: response.clan_public_meta.image_url,
		},
		players: (response.players || []).map((p) => ({
			user_id: p.user_id,
			public_username: p.public_username,
			avatar_id: p.avatar_id,
			avatar_real_id: p.avatar_real_id,
			avatar_url: p.avatar_url,
			position: p.position,
			scores: p.scores,
			is_me: p.is_me,
			clean_ext_user_id: p.clean_ext_user_id,
		})),
	};
};
