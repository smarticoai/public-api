import { ProtocolMessage } from '../Base/ProtocolMessage';

export interface SAWDoSpinBatchRequest extends ProtocolMessage {
	spins: Array<{ request_id: string, saw_template_id: number }>;
}
