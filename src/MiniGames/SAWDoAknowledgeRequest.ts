import { ProtocolMessage } from '.././Base/ProtocolMessage';

export interface SAWDoAknowledgeRequest extends ProtocolMessage {
	request_id: string; // guid
	/** When true, finalises the spin as lost: the prize is not credited and is returned to the prize pool. */
	lose?: boolean;
}
