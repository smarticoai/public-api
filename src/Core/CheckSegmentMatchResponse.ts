import { ProtocolResponse } from '../Base/ProtocolResponse'

export interface CheckSegmentMatchResponse extends ProtocolResponse {
	segments: {
		segment_id: number
		is_matching: boolean
	}[]
}
