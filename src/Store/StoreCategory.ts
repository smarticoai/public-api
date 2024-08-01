import { TStoreCategory } from '../WSAPI/WSAPITypes';
import { StoreCategoryPublicMeta } from './StoreCategoryPublicMeta';

export interface StoreCategory {
	id?: number;
	publicMeta?: StoreCategoryPublicMeta;
}

export const StoreCategoryTransform = (items: StoreCategory[]): TStoreCategory[] => {
	return items.map((r) => {
		const x: TStoreCategory = {
			id: r.id,
			name: r.publicMeta?.name,
			order: r.publicMeta?.order,
		};
		return x;
	});
};
