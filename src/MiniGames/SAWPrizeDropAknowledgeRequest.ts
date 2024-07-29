import { ProtocolMessage } from '../Base/ProtocolMessage'

export interface SAWPrizeDropAknowledgeRequest extends ProtocolMessage {
	request_id: string // guid
}
