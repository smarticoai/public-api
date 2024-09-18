import { ProtocolMessage } from 'src/SmarticoLib';

export interface SAWDoSpinBatchRequest extends ProtocolMessage {
	spins: Array<{ request_id: string, saw_template_id: number }>;
}
