import {Tournament} from "./Tournament";
import {TournamentPlayer} from "./TournamentPlayer";
import { ProtocolResponse } from "../Base/ProtocolResponse";
import { TournamentPrize } from "./TournamentPrize";

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



