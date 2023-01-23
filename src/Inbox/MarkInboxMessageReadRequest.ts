import { ProtocolMessage } from "../Base/ProtocolMessage";


export interface MarkInboxMessageReadRequest extends ProtocolMessage {
    engagement_uid?: string;
    mark_all?: boolean;
}