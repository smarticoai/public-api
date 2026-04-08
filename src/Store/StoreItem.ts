import { AchRelatedGame } from '../Base/AchRelatedGame';
import { IntUtils } from '../IntUtils';
import { TStoreItem } from '../WSAPI/WSAPITypes';
import { StoreItemPublicMeta } from './StoreItemPublicMeta';
import { StoreItemPurchaseType } from './StoreItemPurchaseType';
import { StoreItemType, StoreItemTypeNamed } from './StoreItemType';

export interface StoreItem {
	id: number;
	itemTypeId: StoreItemType;
	itemPublicMeta: StoreItemPublicMeta;
	categoryIds?: number[];
	canBuy?: boolean;
	shopPool: number;
	activeTillDate?: number;
	relatedGames?: AchRelatedGame[];
}

const mapPurchaseType = (purchaseType: StoreItemPurchaseType) => {
	if (purchaseType === StoreItemPurchaseType.Points) {
		return 'points';
	} else if (purchaseType === StoreItemPurchaseType.Gems) {
		return 'gems';
	} else if (purchaseType === StoreItemPurchaseType.Diamonds) {
		return 'diamonds';
	}

	return 'points';
};

export const StoreItemTransform = (items: StoreItem[]): TStoreItem[] => {
	
	return items
		.filter((r) => r.id >= 1)
		.map((r) => {
			const x: TStoreItem = {
				id: r.id,
				name: r.itemPublicMeta.name,
				purchase_type: mapPurchaseType(r.itemPublicMeta.purchase_type),
				price: r.itemPublicMeta.price as any as number, // AA: strange why it's string
				image: r.itemPublicMeta.image_url,
				description: r.itemPublicMeta.description,
				ribbon: r.itemPublicMeta.label_tag === 'custom' ? r.itemPublicMeta.custom_label_tag : r.itemPublicMeta.label_tag,
				limit_message: r.itemPublicMeta.limit_message,
				purchase_limit_message: r.itemPublicMeta.purchase_limit_message,
				priority: r.itemPublicMeta.priority ?? 0,
				related_item_ids: r.itemPublicMeta.related_items,
				hint_text: r.itemPublicMeta.hint_text,
				type: StoreItemTypeNamed(r.itemTypeId),
				can_buy: r.canBuy,
				category_ids: r.categoryIds ?? [],
				pool: r.shopPool,
				custom_data: IntUtils.JsonOrText(r.itemPublicMeta.custom_data),
				active_till_date: r.activeTillDate,
				discounted_price: r.itemPublicMeta.discount_prize,
				discount_price_ribbon: r.itemPublicMeta.discount_prize_ribbon,
				custom_ribbon_image: r.itemPublicMeta.custom_ribbon_image,
				custom_section_id: r.itemPublicMeta.custom_section_id,
				only_in_custom_section: r.itemPublicMeta.only_in_custom_section,
				custom_section_type_id: r.itemPublicMeta.custom_section_type_id,
				...(r.itemPublicMeta.cant_buy_message ? { cant_buy_message: r.itemPublicMeta.cant_buy_message } : {}),
				related_games: (r.relatedGames?.filter((g) => g.game_public_meta.enabled) || []).map((g, i) => ({
					ext_game_id: g.ext_game_id,
					game_public_meta: {
						name: g.game_public_meta.name,
						link: g.game_public_meta.link,
						image: g.game_public_meta.image,
						enabled: g.game_public_meta.enabled,
						game_categories: g.game_public_meta.game_categories,
						game_provider: g.game_public_meta.game_provider,
						mobile_spec_link: g.game_public_meta.mobile_spec_link,
						priority: i + 1,
					},
				})),
			};
			return x;
		});
};
