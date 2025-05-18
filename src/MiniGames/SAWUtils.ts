import { SAWBuyInType } from './SAWBuyInType';
import { SAWTemplate } from './SAWTemplate';

class SAWUtils {
	public static canPlay = (t: SAWTemplate, user_balances: {ach_points_balance: number, ach_gems_balance: number, ach_diamonds_balance: number}): boolean => {
		if (t === null || t === undefined) {
			return false;
		}

		switch (t.saw_buyin_type_id) {
			case SAWBuyInType.Free: {
				return true;
			}
			case SAWBuyInType.Spins: {
				return t.spin_count !== null && t.spin_count > 0;
			}
			case SAWBuyInType.Points:
			case SAWBuyInType.Gems:
			case SAWBuyInType.Diamonds: {
				let balance = user_balances.ach_points_balance;
				if (t.saw_buyin_type_id === SAWBuyInType.Gems) {
					balance = user_balances.ach_gems_balance;
				} else if (t.saw_buyin_type_id === SAWBuyInType.Diamonds) {
					balance = user_balances.ach_diamonds_balance;
				}
				return t.buyin_cost_points <= balance;
			}
			
			default: {
				console.error('MiniGamesUtils.canPlay: Unknwon SAW buyin type ' + t.saw_buyin_type_id);
				return false;
			}
		}
	};
}

export { SAWUtils };
