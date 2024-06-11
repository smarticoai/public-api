import { TStoreItem } from "../WSAPI/WSAPITypes";
import { StoreItem } from "./StoreItem";
import { StoreItemType } from "./StoreItemType";

interface StoreItemPurchased extends StoreItem {
    purchase_ts: number;
    purchase_points_amount: number;
}

export const StoreItemPurchasedTransform = (items: StoreItemPurchased[]): TStoreItem[] => {    
    return items.filter( r => r.id >= 1).map( r => {
        const x: TStoreItem = 
        {
            id: r.id,
            name: r.itemPublicMeta.name,
            price: r.itemPublicMeta.price as any as number, // AA: strange why it's string
            image: r.itemPublicMeta.image_url,
            description: r.itemPublicMeta.description,
            ribbon: r.itemPublicMeta.label_tag === 'custom' ? r.itemPublicMeta.custom_label_tag : r.itemPublicMeta.label_tag,
            limit_message: r.itemPublicMeta.limit_message,
            priority: r.itemPublicMeta.priority,
            related_item_ids: r.itemPublicMeta.related_items,
            hint_text: r.itemPublicMeta.hint_text,

            type: {
                [StoreItemType.Bonus]: 'bonus',
                [StoreItemType.Manual]: 'manual'
            }[r.itemTypeId] as 'bonus' | 'manual',

            can_buy: r.canBuy,
            category_ids: r.categoryIds ?? [],
            pool: r.shopPool,
            purchase_ts: r.purchase_ts,
            purchase_points_amount: r.purchase_points_amount
        }
        return x;
    });

}

export { StoreItemPurchased }