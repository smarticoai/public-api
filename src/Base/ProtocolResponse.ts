import { ProtocolMessage } from './ProtocolMessage'

export interface ProtocolResponse extends ProtocolMessage {
	errCode?: number
	errMsg?: string
}
