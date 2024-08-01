import { Tournament, TournamentItemsTransform } from './Tournament';
import { TournamentPlayer } from './TournamentPlayer';
import { ProtocolResponse } from '../Base/ProtocolResponse';
import { TournamentPrize } from './TournamentPrize';
import { TTournamentDetailed } from '../WSAPI/WSAPITypes';
import { TournamentUtils } from './TournamentUtils';

export interface GetTournamentInfoResponse extends ProtocolResponse {
	/** tournament info */
	tournamentInfo: {
		/** id of label, not in use */
		labelId: number;
		tournamentLobbyInfo: Tournament;
		/** list of registered users */
		players: TournamentPlayer[];
	};
	/** information about current user position */
	userPosition: TournamentPlayer;
	/** prizes structure */
	prizeStructure?: {
		prizes: TournamentPrize[];
	};
}

export const tournamentInfoItemTransform = (t: GetTournamentInfoResponse): TTournamentDetailed => {
	const response: TTournamentDetailed = {
		...TournamentItemsTransform([t.tournamentInfo.tournamentLobbyInfo])[0],
		related_games: (t.tournamentInfo.tournamentLobbyInfo.related_games || []).map((g) => ({
			ext_game_id: g.ext_game_id,
			game_public_meta: {
				name: g.game_public_meta.name,
				link: g.game_public_meta.link,
				image: g.game_public_meta.image,
				enabled: g.game_public_meta.enabled,
				game_categories: g.game_public_meta.game_categories,
				game_provider: g.game_public_meta.game_provider,
			},
		})),
		players: t.tournamentInfo.players.map((p) => TournamentUtils.getPlayerTransformed(p)),
	};

	if (t.prizeStructure) {
		response.prizes = t.prizeStructure.prizes.map((p) => TournamentUtils.getPrizeTransformed(p));
	}

	if (t.userPosition) {
		response.me = TournamentUtils.getPlayerTransformed(t.userPosition, true);
	}

	return response;
};
