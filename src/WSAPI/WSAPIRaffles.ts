import { ECacheContext, OCache } from '../OCache';
import {
	TRaffle,
	TRaffleDraw,
	TRaffleDrawRun,
	TransformedRaffleClaimPrizeResponse,
	TRaffleOptinResponse,
} from './WSAPITypes';
import {
	drawRunHistoryTransform,
	raffleClaimPrizeResponseTransform,
} from '../Raffle';
import {
	CACHE_DATA_SEC,
	onUpdateContextKey,
} from './WSAPIBase';
import { WSAPIJackpots } from './WSAPIJackpots';

/** @group Raffles */
export class WSAPIRaffles extends WSAPIJackpots {
	protected async updateRaffles() {
		const payload = await this.api.getRafflesT(this.userExtId);
		this.updateEntity(onUpdateContextKey.Raffles, payload);
	}

	/**
	 * Returns the list of Raffles available for user
	 * The returned list of Raffles is cached for 30 seconds. But you can pass the onUpdate callback as a parameter. Note that each time you call getRaffles with a new onUpdate callback, the old one will be overwritten by the new one.
	 * The onUpdate callback will be called on claiming prize.  Updated Raffles will be passed to onUpdate callback.
	 *
	 * **Example**:
	 * 
	 * ```
	 * _smartico.api.getRaffles().then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 * **Example in the Visitor mode**:
	 * 
	 * ```
	 * _smartico.vapi('EN').getRaffles().then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 */

	public async getRaffles({ onUpdate }: { onUpdate?: (data: TRaffle[]) => void } = {}): Promise<TRaffle[]> {
		if (onUpdate) {
			this.onUpdateCallback.set(onUpdateContextKey.Raffles, onUpdate);
		}

		return OCache.use(onUpdateContextKey.Raffles, ECacheContext.WSAPI, () => this.api.getRafflesT(this.userExtId), CACHE_DATA_SEC);
	}

	/**
	 * Returns draw run for provided raffle_id and run_id.
	 * You can pass winners_from and winners_to parameters to get a specific range of winners. Default is 0-20.
	 *
	 *
	 * **Example**:
	 * 
	 * ```javascript
	 * _smartico.api.getRaffleDrawRun({raffle_id: 156, run_id: 145}).then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 * **Example in the Visitor mode**:
	 * 
	 * 
	 * ```javascript
	 * _smartico.vapi('EN').getRaffleDrawRun({ raffle_id: 156, run_id: 145 }).then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 */

	public async getRaffleDrawRun(props: { raffle_id: number; run_id: number; winners_from?: number; winners_to?: number }): Promise<TRaffleDraw> {
		if (!props.raffle_id || !props.run_id) {
			throw new Error('both raffle_id and run_id are required');
		}

		return await this.api.getRaffleDrawRunT(this.userExtId, props.raffle_id, props.run_id, props.winners_from, props.winners_to);
	}

	/**
	 * Returns history of draw runs for the provided raffle_id and draw_id, if the draw_id is not provided will return history of all the draws for the provided raffle_id
	 *
	 *
	 * **Example**:
	 * 
	 * ```javascript
	 * _smartico.api.getRaffleDrawRunsHistory({ raffle_id: 156, draw_id: 432 }).then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 * **Example in the Visitor mode**:
	 * 
	 * ```javascript
	 * _smartico.vapi('EN').getRaffleDrawRunsHistory({ raffle_id: 156, draw_id: 432 }).then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 */

	public async getRaffleDrawRunsHistory(props: { raffle_id: number; draw_id?: number }): Promise<TRaffleDrawRun[]> {
		
		const res = await this.api.getRaffleDrawRunsHistory(this.userExtId, props);

		if (!props.raffle_id) {
			throw new Error('raffle_id is required');
		}

		return drawRunHistoryTransform(res);
	}

	/**
	 * Returns `err_code` and `err_message` after the call; `err_code` 0 means the request succeeded.
	 *
	 *
	 * **Example**:
	 * 
	 * ```javascript
	 * _smartico.api.claimRafflePrize({won_id:251}).then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 * **Example in the Visitor mode**:
	 * 
	 * ```javascript
	 * _smartico.vapi('EN').claimRafflePrize({ won_id: 251 }).then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 */
	public async claimRafflePrize(props: { won_id: number }): Promise<TransformedRaffleClaimPrizeResponse> {
		if (!props.won_id) {
			throw new Error('won_id is required');
		}

		const res = await this.api.claimRafflePrize(this.userExtId, { won_id: props.won_id });
		return raffleClaimPrizeResponseTransform(res);
	}

	/**
	 * Requests an opt-in for the specified raffle. Returns the err_code.
	 *
	 * **Visitor mode: not supported**
	 */
	public async requestRaffleOptin(props: { raffle_id: number; draw_id: number; raffle_run_id: number }): Promise<TRaffleOptinResponse> {
		if (!props.raffle_id) {
			throw new Error('raffle_id is required');
		}
		if (!props.draw_id) {
			throw new Error('draw_id is required');
		}
		if (!props.raffle_run_id) {
			throw new Error('raffle_run_id is required');
		}

		const r = await this.api.raffleOptin(this.userExtId, props);

		return {
			err_code: r.errCode,
			err_message: r.errMsg,
		};
	}
}
