import { ProtocolResponse } from '../Base/ProtocolResponse';
import { AchRelatedGame } from '../Base/AchRelatedGame';

export interface GetJackpotEligibleGamesResponse extends ProtocolResponse {
	eligible_games: AchRelatedGame[];
    jp_template_id: number;
}

export interface TGetJackpotEligibleGamesResponse {
	eligible_games: AchRelatedGame[];
    jp_template_id: number;
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
}
