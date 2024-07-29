import { SAWBuyInType } from './SAWBuyInType'
import { SAWTemplate } from './SAWTemplate'

class SAWUtils {
	public static canPlay = (t: SAWTemplate, pointsBalance: number): boolean => {
		if (t === null || t === undefined) {
			return false
		}

		switch (t.saw_buyin_type_id) {
			case SAWBuyInType.Free: {
				return true
			}
			case SAWBuyInType.Spins: {
				return t.spin_count !== null && t.spin_count > 0
			}
			case SAWBuyInType.Points: {
				return t.buyin_cost_points <= pointsBalance
			}
			default: {
				console.error('MiniGamesUtils.canPlay: Unknwon SAW buyin type ' + t.saw_buyin_type_id)
				return false
			}
		}
	}
}

export { SAWUtils }
