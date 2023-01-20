import { ProtocolMessage } from "../Base/ProtocolMessage";

export interface TournamentRegisterRequest extends ProtocolMessage {

    tournamentInstanceId: number;
}
