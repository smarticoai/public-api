import { ProtocolMessage } from '.././Base/ProtocolMessage'

export interface SAWSpinsCountPush extends ProtocolMessage {
	saw_template_id: number
	spin_count: number
}
