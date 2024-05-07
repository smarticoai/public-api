import {TournamentRegistrationType, TournamentRegistrationTypeGetName} from "./TournamentRegistrationType";
import {TournamentInstanceStatus} from "./TournamentInstanceStatus";
import { TournamentRegistrationStatus, TournamentRegistrationStatusName, TournamentRegistrationStatusNamed } from "./TournamentRegistrationStatus";
import { TournamentType } from "./TournamentType";
import { TournamentPublicMeta } from "./TournamentPublicMeta";
import { TTournament } from "../WSAPI/WSAPITypes";
import { TournamentPlayer, TournamentPrize, TournamentUtils } from ".";
import { IntUtils } from "../IntUtils";
import { AchRelatedGame } from "../Base/AchRelatedGame";

export interface Tournament {

    /** ID of tournament template */
    tournamentId?: number;
    /** ID of tournament instance. Generated every time when tournament based on specific template is scheduled for run */
    tournamentInstanceId?: number;
    /** Type of the tournament. For now only SCHEDULED is support */
    tournamentType?: TournamentType;
    /** Meta information about tournament that should be used to build UI */
    publicMeta?: TournamentPublicMeta;
    /** Cost of registration in the tournament in gamification points */
    buyInAmount?: number;
    /** Not in use */
    prizePool?: number;
    /** The time when tournament is going to start */
    startTime?: string;
    /** The time when tournament is going to finish */
    endTime?: string;
    /** The time when tournament is going to start, epoch */
    startTimeTs?: number;
    /** The time when tournament is going to finish, epoch */
    endTimeTs?: number;    
    /** Number of users registered in the tournament */
    registrationCount?: number;
    /** Not in use */
    totalCount?: number;
    /** Type of registration in the tournament */
    registrationType?: TournamentRegistrationType;
    /** Status of registration in the tournament for current user */
    tournamentRegistrationStatus?: TournamentRegistrationStatus;
    /** Status of tournament instance */
    tournamentInstanceStatus?: TournamentInstanceStatus;
    /** flag indicating if current user is registered in the tournament */
    isUserRegistered?: boolean;
    /** Indicator if tournament allows later registration, when tournament is already started */
    allowLateRegistration?: boolean;
    /** Minimum number of participant for this tournament. If tournament doesnt have enough registrations, it will not start */
    playersMinCount?: number;
    /** Maximum number of participant for this tournament. When reached, new users won't be able to register */
    playersMaxCount?: number;
    /** Tournament duration in millisecnnds */
    durationMs?: number;
     /** prizes structure */
    prizeStructure?: {
        prizes: TournamentPrize[],
    }
    /** Information about current user */
    tournamentPlayer?: TournamentPlayer

    /** List of casino games (or other types of entities) related to the tournament */
    related_games?: AchRelatedGame[];
}


export const TournamentItemsTransform = (items: Tournament[]): TTournament[] => {    

    return items.filter(r => r.tournamentId >= 1).map(r => {
        const x: TTournament = {
            instance_id: r.tournamentInstanceId,
            tournament_id: r.tournamentId,
            name: r.publicMeta.name,
            description: r.publicMeta.description,
            segment_dont_match_message: r.publicMeta.segment_dont_match_message,
            image1: r.publicMeta.image_url,
            image2: r.publicMeta.image_url2,
            prize_pool_short: r.publicMeta.prize_pool_short,
            custom_price_text: r.publicMeta.custom_price_text,
            custom_section_id: r.publicMeta.custom_section_id,
            custom_data: IntUtils.JsonOrText(r.publicMeta.custom_data),
            is_featured: r.publicMeta.featured,
            ribbon: r.publicMeta.label_tag === 'custom' ? r.publicMeta.custom_label_tag : r.publicMeta.label_tag,
            priority: r.publicMeta.position,
            

            start_time: r.startTimeTs,
            end_time: r.endTimeTs,
            registration_count: r.registrationCount,
            is_user_registered: r.isUserRegistered,
            players_min_count: r.playersMinCount,
            players_max_count: r.playersMaxCount,
            registration_status: TournamentRegistrationStatusNamed(r.tournamentRegistrationStatus),

            registration_type: TournamentRegistrationTypeGetName(r.registrationType),
            registration_cost_points: r.buyInAmount,
            duration_ms: r.durationMs,

            is_active: TournamentUtils.isActive(r),
            is_can_register: TournamentUtils.isCanRegister(r),
            is_cancelled: TournamentUtils.isCancelled(r),
            is_finished: TournamentUtils.isFinished(r),
            is_in_progress: TournamentUtils.isInProgress(r),
            is_upcoming: TournamentUtils.isUpcoming(r),

        }

        if (r.prizeStructure) {
            x.prizes = r.prizeStructure.prizes.map(p => TournamentUtils.getPrizeTransformed(p));
        }

        if (r.tournamentPlayer) {
            x.me = TournamentUtils.getPlayerTransformed(r.tournamentPlayer, true)
        }

        return x;
    });


}

