import { ProtocolResponse } from '../Base/ProtocolResponse'
import { StoreItemPurchased } from './StoreItemPurchased'

export interface GetStoreHistoryResponse extends ProtocolResponse {
	items: StoreItemPurchased[]
	hasMore?: boolean
}
