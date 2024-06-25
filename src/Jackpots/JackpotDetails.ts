import { AchRelatedGame } from "../Base/AchRelatedGame";
import { JackpotContributionType } from "./JackpotContributionType";
import { JackpotPot } from "./JackpotPot";
import { JackpotPublicMeta } from "./JackpotPublicMeta";
import { JackpotType } from "./JackpotType";

/**
 * JackpotDetails the information about Jackpot template
 * It also includes JackpotPot object that holds the current value of the jackpot
 * Flag is_opted_in indicates if the current user is opted in to the jackpot
*/
interface JackpotDetails {
    /** ID of the jackpot template */
    jp_template_id: number;
    /** type of jackpot logic */
    jp_type_id: JackpotType;
    /** UI information of jackpot, like name, description, etc. */
    jp_public_meta: JackpotPublicMeta;
    /** base currency of the jackpot */
    jp_currency: string;
    /**  wallet currency of currently logged in user */
    user_currency: string;
    /**  list of related games that are eligible for the jackpot */
    related_games?: AchRelatedGame[];
    /**  type of the user contribution to the jackpot */
    contribution_type: JackpotContributionType;
    /**  value of the user contribution. Fixed amount or percentage of bet depending on the contribution type */
    contribution_value: number;
    /**  information of current value of the jackpot */
    pot: JackpotPot;
    /**  indication if the current user is opted in to the jackpot */
    is_opted_in: boolean;
}

export { JackpotDetails }