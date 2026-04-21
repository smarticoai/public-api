import { ProtocolMessage } from '../Base/ProtocolMessage';

export interface GetClanTournamentPlayersRequest extends ProtocolMessage {
	tournamentInstanceId: number;
	clanId: number;
	forceLanguage?: string;
}
