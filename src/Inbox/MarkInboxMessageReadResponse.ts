import { ProtocolMessage } from "../Base/ProtocolMessage";


export interface MarkInboxMessageReadResponse extends ProtocolMessage {
    errCode: number;
    errMsg?: string;
}