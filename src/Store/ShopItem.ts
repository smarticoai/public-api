import { ShopItemPublicMeta } from "./ShopItemPublicMeta";
import { ShopItemType } from "./ShopItemType";

export interface ShopItem {
    id: number;
    itemTypeId: ShopItemType;
    itemPublicMeta: ShopItemPublicMeta;
    categoryIds?: number[];
    canBuy?: boolean;
}
