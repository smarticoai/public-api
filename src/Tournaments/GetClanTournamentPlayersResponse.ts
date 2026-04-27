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
	clan_id: number;
	clan_public_meta: { name: string; image_url: string };
	players: ClanTournamentPlayerRaw[];
}

export interface TClanTournamentPlayer {
	userId: number;
	cleanExtUserId: string;
	userAltName: string;
	avatar_id: string;
	avatar_real_id: number;
	avatar_url?: string;
	position: number;
	scores: number;
	isMe: boolean;
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
			userId: p.userId,
			cleanExtUserId: p.cleanExtUserId,
			userAltName: p.userAltName,
			avatar_id: p.avatar_id,
			avatar_real_id: p.avatar_real_id,
			avatar_url: p.avatar_url,
			position: p.position,
			scores: p.scores,
			isMe: p.isMe,
		})),
	};
};
