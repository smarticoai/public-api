import { ProtocolMessage } from ".././Base/ProtocolMessage";

export interface SAWDoAknowledgeResponse extends ProtocolMessage {
    request_id: string; // guid
}