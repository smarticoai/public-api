import { ProtocolMessage } from '../Base/ProtocolMessage';

export interface GetClanTournamentPlayersRequest extends ProtocolMessage {
	tournament_instance_id: number;
	clan_id: number;
	force_language?: string;
}
