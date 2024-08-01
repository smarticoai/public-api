import { ProtocolMessage } from '../Base/ProtocolMessage';

export interface MarkInboxMessageDeletedRequest extends ProtocolMessage {
	engagement_uid?: string;
	all_deleted?: boolean;
}
