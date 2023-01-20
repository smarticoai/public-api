import {TournamentRegistrationType} from "./TournamentRegistrationType";
import {TournamentInstanceStatus} from "./TournamentInstanceStatus";
import { TournamentRegistrationStatus } from "./TournamentRegistrationStatus";
import { TournamentType } from "./TournamentType";
import { TournamentPublicMeta } from "./TournamentPublicMeta";

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
}


