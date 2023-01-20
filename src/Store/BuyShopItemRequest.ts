import { ProtocolMessage } from "../Base/ProtocolMessage";

export interface BuyShopItemRequest extends ProtocolMessage {
    itemId: number;
}
