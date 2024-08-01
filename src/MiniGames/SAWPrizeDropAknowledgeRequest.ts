import { ProtocolMessage } from '../Base/ProtocolMessage';

export interface SAWPrizeDropAknowledgeRequest extends ProtocolMessage {
	request_id: string; // guid
	pending_message_id: number;
	claim_required: boolean;
}
