import { ProtocolMessage } from '../Base/ProtocolMessage'

export interface GetJackpotsPotsRequest extends ProtocolMessage {
	jp_template_ids: number[]
}
