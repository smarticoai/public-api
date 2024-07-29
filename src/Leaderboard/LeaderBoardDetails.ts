import { LeaderBoardPeriodType } from './LeaderBoardPeriodType'
import { LeaderBoardPosition } from './LeaderBoardPosition'
import { LeaderBoardPublicMeta } from './LeaderBoardPublicMeta'

export interface LeaderBoardDetails {
	board_id: number
	period_type_id: LeaderBoardPeriodType
	create_date?: number // 0 for the current
	versiod_id: number // 0 for the current
	reward_points: number[]
	board_public_meta: LeaderBoardPublicMeta
	positions: LeaderBoardPosition[]
	userPosition: LeaderBoardPosition
}
