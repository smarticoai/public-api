import { ProtocolMessage } from "../Base/ProtocolMessage";

export interface MarkInboxMessageDeletedResponse extends ProtocolMessage {
  errCode: number;
}
