import { ProtocolMessage } from "../Base/ProtocolMessage";


export interface MarkInboxMessageStarredRequest extends ProtocolMessage {
    engagement_uid: string;
    is_starred?: boolean;
} 