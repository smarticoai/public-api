import { StoreItemPublicMeta } from "./StoreItemPublicMeta";
import { StoreItemType } from "./StoreItemType";

export interface StoreItem {
    id: number;
    itemTypeId: StoreItemType;
    itemPublicMeta: StoreItemPublicMeta;
    categoryIds?: number[];
    canBuy?: boolean;
}
