import { ProtocolRequest } from '../Base/ProtocolRequest';

export interface SAWDoAcknowledgeBatchRequest extends ProtocolRequest {
	request_ids: string[];
}