import { ProtocolMessage } from '../Base/ProtocolMessage';

export interface JackpotsOptoutRequest extends ProtocolMessage {
	jp_template_id: number;
}
