import { StoreItem } from "./StoreItem";

interface StorItemPruchased extends StoreItem {
    purchase_ts: number;
    purchase_points_amount: number;
}

export { StorItemPruchased }