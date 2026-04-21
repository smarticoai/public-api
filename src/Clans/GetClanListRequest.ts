import { ProtocolMessage } from '../Base/ProtocolMessage';

export interface GetClanListRequest extends ProtocolMessage {
	force_language?: string;
}
