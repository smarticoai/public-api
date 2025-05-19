import { AchRelatedGame } from '../Base/AchRelatedGame';
import { JackpotContributionType } from './JackpotContributionType';
import { JackpotPot } from './JackpotPot';
import { JackpotPublicMeta } from './JackpotPublicMeta';
import { JackpotType } from './JackpotType';

/**
 * JackpotDetails the information about Jackpot template
 * It also includes JackpotPot object that holds the current value of the jackpot
 * Flag is_opted_in indicates if the current user is opted in to the jackpot
 */
interface JackpotDetails {
	/** ID of the jackpot template */
	jp_template_id: number;
	/** Type of jackpot logic */
	jp_type_id: JackpotType;
	/** UI information of jackpot, like name, description, etc. */
	jp_public_meta: JackpotPublicMeta;
	/** Base currency of the jackpot */
	jp_currency: string;
	/** Wallet currency of currently logged in user */
	user_currency: string;
	/** Type of the user contribution to the jackpot */
	contribution_type: JackpotContributionType;
	/** Value of the user contribution. Fixed amount or percentage of bet depending on the contribution type */
	contribution_value: number;
	/** Information of current value of the jackpot */
	pot: JackpotPot;
	/** Indication if the current user is opted in to the jackpot */
	is_opted_in: boolean;
	/** Indicates whether all games are eligible for the jackpot */
	ach_related_game_allow_all: boolean;
	/** The number of users who have opted in to participate in the jackpot */
	registration_count: number;
}

export { JackpotDetails };
