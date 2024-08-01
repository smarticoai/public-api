import { ProtocolRequest } from '../Base/ProtocolRequest';

export interface SAWAcknowledgeSpinPushRequest extends ProtocolRequest {
	pending_message_id: number;
	saw_template_id: number;
}
