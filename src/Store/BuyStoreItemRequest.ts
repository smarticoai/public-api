import { ProtocolMessage } from '../Base/ProtocolMessage';

export interface BuyStoreItemRequest extends ProtocolMessage {
	itemId: number;
}
