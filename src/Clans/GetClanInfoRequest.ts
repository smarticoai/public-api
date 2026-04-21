import { ProtocolMessage } from '../Base/ProtocolMessage';

export interface GetClanInfoRequest extends ProtocolMessage {
	clan_id: number;
	force_language?: string;
}
