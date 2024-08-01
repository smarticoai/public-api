import { TStoreItem } from '../WSAPI/WSAPITypes';
import { StoreItemPublicMeta } from './StoreItemPublicMeta';
import { StoreItemType, StoreItemTypeNamed } from './StoreItemType';

export interface StoreItem {
	id: number;
	itemTypeId: StoreItemType;
	itemPublicMeta: StoreItemPublicMeta;
	categoryIds?: number[];
	canBuy?: boolean;
	shopPool: number;
}

export const StoreItemTransform = (items: StoreItem[]): TStoreItem[] => {
	return items
		.filter((r) => r.id >= 1)
		.map((r) => {
			const x: TStoreItem = {
				id: r.id,
				name: r.itemPublicMeta.name,
				price: r.itemPublicMeta.price as any as number, // AA: strange why it's string
				image: r.itemPublicMeta.image_url,
				description: r.itemPublicMeta.description,
				ribbon: r.itemPublicMeta.label_tag === 'custom' ? r.itemPublicMeta.custom_label_tag : r.itemPublicMeta.label_tag,
				limit_message: r.itemPublicMeta.limit_message,
				priority: r.itemPublicMeta.priority ?? 0,
				related_item_ids: r.itemPublicMeta.related_items,
				hint_text: r.itemPublicMeta.hint_text,
				type: StoreItemTypeNamed(r.itemTypeId),
				can_buy: r.canBuy,
				category_ids: r.categoryIds ?? [],
				pool: r.shopPool,
			};
			return x;
		});
};
