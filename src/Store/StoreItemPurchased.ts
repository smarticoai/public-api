import { IntUtils } from '../IntUtils';
import { TStoreItem } from '../WSAPI/WSAPITypes';
import { StoreItem } from './StoreItem';
import { StoreItemTypeNamed } from './StoreItemType';

interface StoreItemPurchased extends StoreItem {
	purchase_ts: number;
	purchase_points_amount: number;
	purchased_today?: boolean;
	purchased_this_week?: boolean;
	purchased_this_month?: boolean;
}

export const StoreItemPurchasedTransform = (items: StoreItemPurchased[]): TStoreItem[] => {
	return items
		.filter((r) => r.id >= 1)
		.map((r) => {
			const purchasedToday = r.purchase_ts ? IntUtils.isWithinPeriod(r.purchase_ts, 'today') : false;
			const purchasedThisWeek = r.purchase_ts ? IntUtils.isWithinPeriod(r.purchase_ts, 'thisWeek') : false;
			const purchasedThisMonth = r.purchase_ts ? IntUtils.isWithinPeriod(r.purchase_ts, 'thisMonth') : false;

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
				purchase_ts: r.purchase_ts,
				purchase_points_amount: r.purchase_points_amount,
				purchased_today: purchasedToday,
				purchased_this_week: purchasedThisWeek,
				purchased_this_month: purchasedThisMonth,
				custom_data: r.itemPublicMeta.custom_data
			};

			return x;
		});
};

export { StoreItemPurchased };
