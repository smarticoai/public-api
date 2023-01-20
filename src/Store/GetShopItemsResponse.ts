
import { ProtocolResponse } from "../Base/ProtocolResponse";
import { ShopItem } from "./ShopItem";

export interface GetShopItemsResponse extends ProtocolResponse {
    items: ShopItem[];
}
