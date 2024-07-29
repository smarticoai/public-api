import { ProtocolMessage } from '../Base/ProtocolMessage'

export interface GetStoreHistoryRequest extends ProtocolMessage {
	limit?: number
	offset?: number
}
