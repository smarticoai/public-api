import { ProtocolResponse } from './../Base/ProtocolResponse'
import { SAWSpinErrorCode } from './SAWSpinErrorCode'

export interface SAWDoSpinResponse extends ProtocolResponse {
	errCode: SAWSpinErrorCode
	errMsg?: string
	request_id: string // guid
	saw_prize_id: number
	jackpot_amount?: number // jackpot amount in case user won jackpot type of prize
	first_spin_in_period: number
	visitor_win_uuid?: string
}
