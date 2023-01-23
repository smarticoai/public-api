import { ProtocolMessage } from "../Base/ProtocolMessage";


export interface MarkInboxMessagesAsReadRequest extends ProtocolMessage {
    engagement_uid?: string;
    mark_all?: boolean;
}