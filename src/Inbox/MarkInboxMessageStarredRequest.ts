import { ProtocolMessage } from "../Base/ProtocolMessage";


export interface SetMessageIsStarredRequest extends ProtocolMessage {
    engagement_uid: string;
} 