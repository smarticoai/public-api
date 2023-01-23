import { Tournament } from "./Tournament";
import { TournamentInstanceStatus } from "./TournamentInstanceStatus";
import { TournamentRegistrationStatus } from "./TournamentRegistrationStatus";
import { TournamentRegistrationType } from "./TournamentRegistrationType";

export class TournamentUtils {

    public static isCanRegister = (tournament: Tournament): boolean => {
        if (tournament) {
            if (tournament.tournamentRegistrationStatus === TournamentRegistrationStatus.QUALIFIED_PENDING_REGISTRATION) {
                return true;
            }
            return !tournament.isUserRegistered &&
                (tournament.playersMaxCount !== tournament.registrationCount || tournament.playersMaxCount === null || tournament.playersMaxCount === 0) &&
                tournament.registrationType !== TournamentRegistrationType.AUTO &&
                (
                    tournament.tournamentInstanceStatus === TournamentInstanceStatus.REGISTER ||
                    (tournament.tournamentInstanceStatus === TournamentInstanceStatus.STARTED && tournament.allowLateRegistration)
                );
        }
        return false;
    }


    public static isInProgress = (tournament: Tournament): boolean => {
        if (tournament) {
            return tournament.tournamentInstanceStatus === TournamentInstanceStatus.STARTED;
        }
        return false;
    }

    public static isActive = (tournament: Tournament): boolean => {
        if (tournament) {
            return tournament.tournamentInstanceStatus === TournamentInstanceStatus.PUBLISHED ||
            tournament.tournamentInstanceStatus === TournamentInstanceStatus.REGISTER ||
            tournament.tournamentInstanceStatus === TournamentInstanceStatus.STARTED
        }
        return false;
    }

    public static isFinished = (tournament: Tournament): boolean => {
        if (tournament) {
            return tournament.tournamentInstanceStatus === TournamentInstanceStatus.FINISHED
            || tournament.tournamentInstanceStatus === TournamentInstanceStatus.CANCELLED
            || tournament.tournamentInstanceStatus === TournamentInstanceStatus.FINALIZING;
        }
        return false;
    }

    public static isCancelled = (tournament: Tournament): boolean => {
        if (tournament) {
            return tournament.tournamentInstanceStatus === TournamentInstanceStatus.CANCELLED;
        }
        return false;
    }

    public static isUpcoming = (tournament: Tournament): boolean => {
        if (tournament) {
            return tournament.tournamentInstanceStatus === TournamentInstanceStatus.PUBLISHED || tournament.tournamentInstanceStatus === TournamentInstanceStatus.REGISTER;
        }
        return false;
    }

}
