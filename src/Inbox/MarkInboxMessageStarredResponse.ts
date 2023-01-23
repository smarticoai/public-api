import { ProtocolMessage } from "../Base/ProtocolMessage";


export interface SetMessageIsStarredResponse extends ProtocolMessage {
    errCode: number;
}