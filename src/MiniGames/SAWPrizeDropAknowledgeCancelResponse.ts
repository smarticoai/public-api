import { ProtocolMessage } from '../Base/ProtocolMessage';

export interface SAWPrizeDropAknowledgeCancelResponse extends ProtocolMessage {
	request_id: string; // guid
}
