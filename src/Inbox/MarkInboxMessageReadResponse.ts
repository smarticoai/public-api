import { ProtocolMessage } from "../Base/ProtocolMessage";


export interface MarkInboxMessagesAsReadResponse extends ProtocolMessage {
    errCode: number;
}