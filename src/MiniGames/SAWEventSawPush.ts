import { ProtocolMessage } from 'src/Base/ProtocolMessage';

export interface SAWEventSawPush extends ProtocolMessage {
	pending_message_id: number;
	saw_template_id: number;
}
