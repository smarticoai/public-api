import {Tournament, TournamentItemsTransform} from "./Tournament";
import {TournamentPlayer} from "./TournamentPlayer";
import { ProtocolResponse } from "../Base/ProtocolResponse";
import { TournamentPrize } from "./TournamentPrize";
import { TTournamentDetailed } from "../WSAPI/WSAPITypes";
import { ActivityTypeLimited } from "src/Core";

export interface GetTournamentInfoResponse extends ProtocolResponse {

    /** tournament info */
    tournamentInfo: {
        /** id of label, not in use */
        labelId: number;
        tournamentLobbyInfo: Tournament;
        /** list of registered users */
        players: TournamentPlayer[];
    },
    /** information about current user position */
    userPosition: TournamentPlayer,
    /** prizes structure */
    prizeStructure?: {
        prizes: TournamentPrize[],
    }
}

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

export const tournamentInfoItemTransform = (t: GetTournamentInfoResponse): TTournamentDetailed => {
    const response: TTournamentDetailed = {
        ...TournamentItemsTransform([t.tournamentInfo.tournamentLobbyInfo])[0],
        players: t.tournamentInfo.players.map( p => ({
            public_username: p.userAltName,
            avatar_url: p.avatar_url,
            position: p.position,
            scores: p.scores,
            is_me: p.isMe,
        })),
    };

    if (t.prizeStructure) {
        response.prizes = t.prizeStructure.prizes.map(p => ({...p, type: tournamentPrizeTypeToPrizeName(p.type)}))
    }

    if (t.userPosition) {
        response.me = {
            public_username: t.userPosition.userAltName,
            avatar_url: t.userPosition.avatar_url,
            position: t.userPosition.position,
            scores: t.userPosition.scores,
        }
    }

    return response;
}


