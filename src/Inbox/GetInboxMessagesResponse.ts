import { ProtocolResponse } from "../Base/ProtocolResponse";
import { InboxMessage } from "./InboxMessage";

export interface GetInboxMessagesResponse extends ProtocolResponse {

    log: InboxMessage[];
}
