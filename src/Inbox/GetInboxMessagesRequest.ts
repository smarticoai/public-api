import { ProtocolMessage } from "../Base/ProtocolMessage";

export interface GetInboxMessagesRequest extends ProtocolMessage {

    limit?: number;
    offset?: number;
}
