import { ProtocolResponse } from '../Base/ProtocolResponse'
import { StoreItem } from './StoreItem'

export interface GetStoreItemsResponse extends ProtocolResponse {
	items: StoreItem[]
}
