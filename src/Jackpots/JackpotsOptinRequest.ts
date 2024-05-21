import { ProtocolMessage } from "../Base/ProtocolMessage";


export interface JackpotsOptinRequest extends ProtocolMessage {

    jp_template_id: number;
}