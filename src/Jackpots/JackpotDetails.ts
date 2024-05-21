import { AchRelatedGame } from "../Base/AchRelatedGame";
import { JackpotContributionType } from "./JackpotContributionType";
import { JackpotPot } from "./JackpotPot";
import { JackpotPublicMeta } from "./JackpotPublicMeta";
import { JackpotType } from "./JackpotType";

interface JackpotDetails {
    jp_template_id: number;
    jp_type_id: JackpotType;
    jp_public_meta: JackpotPublicMeta;
    jp_currency: string;
    related_games?: AchRelatedGame[];
    contribution_type: JackpotContributionType;
    contribution_value: number;
    pot: JackpotPot;
    is_opted_in: boolean;

}

export { JackpotDetails }