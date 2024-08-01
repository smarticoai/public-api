import { ProtocolMessage } from '.././Base/ProtocolMessage';

export interface SAWDoAknowledgeRequest extends ProtocolMessage {
	request_id: string; // guid
}
