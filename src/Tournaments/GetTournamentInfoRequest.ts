import { ProtocolMessage } from '../Base/ProtocolMessage';

export interface GetTournamentInfoRequest extends ProtocolMessage {
	tournamentInstanceId: number;
}
