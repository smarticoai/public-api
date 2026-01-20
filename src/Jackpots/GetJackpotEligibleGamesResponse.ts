import { ProtocolResponse } from '../Base/ProtocolResponse';
import { AchRelatedGame } from '../Base/AchRelatedGame';

export interface GetJackpotEligibleGamesResponse extends ProtocolResponse {
	eligible_games: AchRelatedGame[];
}

export interface TGetJackpotEligibleGamesResponse {
	eligible_games: JackpotEligibleGame[];
}

export interface JackpotEligibleGame {
    /** ID of the game on Smartico side */
	game_id: number;
    /** ID of the game on operator side */
    ext_game_id: string;
    /** Name of the game */
    name: string;
    /** Link to the game */
    link: string;
    /** Image of the game */
    image: string;
    /** Whether the game is enabled */
    enabled: boolean;
    /** Categories of the game */
    game_categories: string[];
    /** Provider of the game */
    game_provider: string;
    /** The link to the mobile game */
    mobile_spec_link: string;
    /** The priority of the game */
    priority: number;
}

/**
 * @ignore
 */
export const GetJackpotEligibleGamesResponseTransform = ({ eligible_games } : { eligible_games: AchRelatedGame[]}): TGetJackpotEligibleGamesResponse => {
	const games = eligible_games.map((game: AchRelatedGame, i: number) => ({
		game_id: game.ach_game_id,
		ext_game_id: game.ext_game_id,
		name: game.game_public_meta.name,
		link: game.game_public_meta.link,
		image: game.game_public_meta.image,
		enabled: game.game_public_meta.enabled,
		game_categories: game.game_public_meta.game_categories,
		game_provider: game.game_public_meta.game_provider,
		mobile_spec_link: game.game_public_meta.mobile_spec_link,
		priority: i + 1,
	}));

	return { eligible_games: games };
};
