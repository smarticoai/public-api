import { ProtocolMessage } from "../Base/ProtocolMessage";

export interface SAWEventSawPush extends ProtocolMessage {
	pending_message_id: number;
	saw_template_id: number;
}
