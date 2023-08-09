import {Tournament, TournamentItemsTransform} from "./Tournament";
import {TournamentPlayer} from "./TournamentPlayer";
import { ProtocolResponse } from "../Base/ProtocolResponse";
import { TournamentPrize } from "./TournamentPrize";
import { TTournamentDetailed } from "../WSAPI/WSAPITypes";

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


