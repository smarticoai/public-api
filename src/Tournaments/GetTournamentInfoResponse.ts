import { Tournament, TournamentItemsTransform } from './Tournament';
import { TournamentPlayer } from './TournamentPlayer';
import { ProtocolResponse } from '../Base/ProtocolResponse';
import { TournamentPrize } from './TournamentPrize';
import { TTournamentDetailed } from '../WSAPI/WSAPITypes';
import { TournamentUtils } from './TournamentUtils';
import { ClanLeaderboardEntry, ClanPrizeStructureEntry } from './TournamentClan';

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
	/** Ranked list of clans in this tournament. Empty/null for non-clan tournaments. */
	clanLeaderboard?: ClanLeaderboardEntry[] | null;
	/**
	 * The clan ID the current user belongs to.
	 * null when the user has no clan or the tournament is not clan-based.
	 * Match against clanLeaderboard[i].clan_id to highlight the user's clan row.
	 */
	userClanId?: number | null;
	/** Per-clan prize structure. Empty/null for non-clan tournaments. */
	clanPrizes?: ClanPrizeStructureEntry[] | null;
}

export const tournamentInfoItemTransform = (t: GetTournamentInfoResponse): TTournamentDetailed => {
	const response: TTournamentDetailed = {
		...TournamentItemsTransform([t.tournamentInfo.tournamentLobbyInfo])[0],
		related_games: (t.tournamentInfo.tournamentLobbyInfo.related_games || []).map((g, i) => ({
			ext_game_id: g.ext_game_id,
			game_public_meta: {
				name: g.game_public_meta.name,
				link: g.game_public_meta.link,
				image: g.game_public_meta.image,
				enabled: g.game_public_meta.enabled,
				game_categories: g.game_public_meta.game_categories,
				game_provider: g.game_public_meta.game_provider,
				mobile_spec_link: g.game_public_meta.mobile_spec_link,
				priority: i + 1,
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

	if (t.tournamentInfo?.tournamentLobbyInfo?.isClanBased) {
		response.is_clan_based = true;
		response.user_clan_id = t.userClanId ?? null;
		response.clan_leaderboard = t.clanLeaderboard
			? t.clanLeaderboard.map((entry) => ({
					clan_id: entry.clan_id,
					public_meta: {
						name: entry.public_meta.name,
						description: entry.public_meta.description,
						image_url: entry.public_meta.image_url,
					},
					position: entry.position,
					total_score: entry.total_score,
					contributing_members: entry.contributing_members,
			  }))
			: null;
		response.clan_prize_structure = t.clanPrizes
			? t.clanPrizes.map((entry) => ({
					clan_place: entry.clan_place,
					prize_type_id: entry.prize_type_id,
					prize_pool_amount: entry.prize_pool_amount,
					activity_type_id: entry.activity_type_id,
					details_json: entry.details_json,
					public_meta: entry.public_meta
						? { name: entry.public_meta.name, description: entry.public_meta.description, image_url: entry.public_meta.image_url }
						: null,
					tiers: (entry.tiers || []).map((tier) => ({
						player_place_from: tier.player_place_from,
						player_place_to: tier.player_place_to,
						pool_amount: tier.pool_amount,
						distribution_type: tier.distribution_type,
						activity_type_id: tier.activity_type_id,
						details_json: tier.details_json,
						public_meta: tier.public_meta
							? { name: tier.public_meta.name, description: tier.public_meta.description, image_url: tier.public_meta.image_url }
							: null,
					})),
			  }))
			: null;
	}

	return response;
};
