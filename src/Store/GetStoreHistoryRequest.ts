import { ProtocolMessage } from "../Base/ProtocolMessage";

export interface GetStoreHistoryRequest extends ProtocolMessage {
    offset: number;
    limit: number;
}
