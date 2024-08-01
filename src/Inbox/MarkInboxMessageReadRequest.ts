import { ProtocolMessage } from '../Base/ProtocolMessage';

export interface MarkInboxMessageReadRequest extends ProtocolMessage {
	engagement_uid?: string;
	all_read?: boolean;
}
