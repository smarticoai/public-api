import { ActivityTypeLimited } from "../Core";
import { Tournament } from "./Tournament";
import { TournamentInstanceStatus } from "./TournamentInstanceStatus";
import { TournamentPlayer } from "./TournamentPlayer";
import { TournamentPrize } from "./TournamentPrize";
import { TournamentRegistrationStatus } from "./TournamentRegistrationStatus";
import { TournamentRegistrationType } from "./TournamentRegistrationType";

const tournamentPrizeTypeToPrizeName = (type: ActivityTypeLimited) => {
    return {
        [ActivityTypeLimited.DoNothing]: 'TANGIBLE',
        [ActivityTypeLimited.Points]: 'POINTS_ADD',
        [ActivityTypeLimited.DeductPoints]: 'POINTS_DEDUCT',
        [ActivityTypeLimited.ResetPoints]: 'POINTS_RESET',
        [ActivityTypeLimited.MiniGameAttempt]: "MINI_GAME_ATTEMPT",
        [ActivityTypeLimited.Bonus]: 'BONUS',
    }[type]
}

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

    public static getPlayerTransformed = (player: TournamentPlayer, isMe?: boolean) => {
        if (player) {
            const playerTransformed = {
                public_username: player.userAltName,
                avatar_url: player.avatar_url,
                position: player.position,
                scores: player.scores,
                is_me: player.isMe,
            }
            
            if (isMe) {
                delete playerTransformed.is_me;
            }

            return playerTransformed;
        }

        return null;
    }

    public static getPrizeTransformed = (prize: TournamentPrize) => {
        if (prize) {
            return ({...prize, type: tournamentPrizeTypeToPrizeName(prize.type)})
        }

        return null;
    }

}
