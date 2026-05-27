import { ECacheContext, OCache } from '../OCache';
import {
	TBonus,
	TClaimBonusResult,
} from './WSAPITypes';
import {
	CACHE_DATA_SEC,
	onUpdateContextKey,
} from './WSAPIBase';
import { WSAPIMissions } from './WSAPIMissions';

/** @group Bonuses */
export class WSAPIBonuses extends WSAPIMissions {
	/**
	 * Returns all the bonuses for the current user
	 * The returned bonuses are cached for 30 seconds. But you can pass the onUpdate callback as a parameter.
	 * Note that each time you call getBonuses with a new onUpdate callback, the old one will be overwritten by the new one.
	 * The onUpdate callback will be called on bonus claimed and the updated bonuses will be passed to it.
	 *
	 * **Visitor mode: not supported**
	 */
	public async getBonuses({ onUpdate }: { onUpdate?: (data: TBonus[]) => void } = {}): Promise<TBonus[]> {
		if (onUpdate) {
			this.onUpdateCallback.set(onUpdateContextKey.Bonuses, onUpdate);
		}

		return OCache.use(onUpdateContextKey.Bonuses, ECacheContext.WSAPI, () => this.api.bonusesGetItemsT(this.userExtId), CACHE_DATA_SEC);
	}

	/**
	 * Claim the bonus by bonus_id. Returns the err_code in case of success or error.
	 * Note that this method can be used only on integrations where originally failed bonus can be claimed again.
	 * For example, user won a bonus in the mini-game, but Operator rejected this bonus.
	 * This bonus will be available for the user to claim again.
	 *
	 * **Visitor mode: not supported**
	 */
	public async claimBonus(bonus_id: number): Promise<TClaimBonusResult> {
		const r = await this.api.bonusClaimItem(this.userExtId, bonus_id);

		const o: TClaimBonusResult = {
			err_code: r.errCode,
			err_message: r.errMsg,
			success: r.success,
		};

		return o;
	}

	protected async updateBonuses() {
		const payload = await this.api.bonusesGetItemsT(this.userExtId);
		this.updateEntity(onUpdateContextKey.Bonuses, payload);
	}
}
