import { ProtocolMessage } from "../Base/ProtocolMessage";
import { StorItemPruchased } from "./StorItemPruchased";

export interface GetStoreHistoryResponse extends ProtocolMessage {
    items: StorItemPruchased[];
    hasMore: boolean;
}
