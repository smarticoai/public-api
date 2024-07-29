import { ProtocolRequest } from './../Base/ProtocolRequest'

export interface SAWDoSpinRequest extends ProtocolRequest {
	request_id: string // guid
	saw_template_id: number
}
