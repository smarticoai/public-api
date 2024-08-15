import { BonusStatus } from './BonusStatus';
import { BonusTemplateMetaMap } from './BonusTemplateMetaMap';
import { BonusMetaMap } from './BonusMetaMap';
import { TBonus } from '../WSAPI/WSAPITypes';

export interface Bonus {
	id: number;
	redeemable?: boolean;
	createDate?: string;
	updateDate?: string;
	redeemDate?: string;
	engagementUid?: string;
	labelBonusTemplateId?: number;
	sourceProductRefId?: number;
	sourceProductId?: number;
	userId?: number;
	bonusStatusId?: BonusStatus;
	labelBonusTemplateMetaMap?: BonusTemplateMetaMap;
	bonusMetaMap?: BonusMetaMap;
}

export const BonusItemsTransform = (items: Bonus[]): TBonus[] => {
	return items
		.filter((r) => r.id >= 1)
		.map((r) => {
			const x: TBonus = {

              bonus_id: r.id,
              is_redeemable: r.redeemable,
              create_date: r.createDate,
              update_date: r.updateDate,
              redeem_date: r.redeemDate,
              engagement_uid: r.engagementUid,
              label_bonus_template_id: r.labelBonusTemplateId,
              source_product_ref_id: r.sourceProductRefId,
              source_product_id: r.sourceProductId,
              user_id: r.userId,
              bonus_status_id: r.bonusStatusId,
              label_bonus_template_meta_map: r.labelBonusTemplateMetaMap,
              bonus_meta_map: r.bonusMetaMap

			};


			return x;
		});
};