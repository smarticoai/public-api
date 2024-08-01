import { ProtocolMessage } from '../Base/ProtocolMessage';

export interface SAWPrizeDropAknowledgeResponse extends ProtocolMessage {
	request_id: string; // guid
}
