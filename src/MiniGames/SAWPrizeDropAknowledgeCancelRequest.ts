import { ProtocolMessage } from '../Base/ProtocolMessage';

export interface SAWPrizeDropAknowledgeCancelRequest extends ProtocolMessage {
	request_id: string; // guid
	pending_message_id: number;
}
