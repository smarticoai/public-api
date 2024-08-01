import { ProtocolResponse } from '../Base/ProtocolResponse';
import { StoreCategory } from './StoreCategory';

export interface GetCategoriesStoreResponse extends ProtocolResponse {
	categories: StoreCategory[];
}
