import { SAWPrizeType } from './SAWPrizeType'
import { SAWPrizeUI } from './SAWPrizeUI'

export interface SAWPrize {
	saw_prize_id: number
	saw_prize_ui_definition: SAWPrizeUI
	prize_value?: number
	prize_type_id: SAWPrizeType
	place_from?: number
	place_to?: number
	sawUniqueWinId?: string
	pool?: number
	wins_count?: number
}
