import { ProtocolRequest } from '../Base/ProtocolRequest';

export interface SAWDoAcknowledgeBatchResponse extends ProtocolRequest {
	results: Array<{ request_id: string, errCode: number, errMessage?: string }>;
}