import { ProtocolMessage } from '../Base/ProtocolMessage';

export interface MarkInboxMessageStarredResponse extends ProtocolMessage {
	errCode: number;
	errMsg?: string;
}
