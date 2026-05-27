import { SAWSpinsCountPush } from '../MiniGames';
import { ECacheContext, OCache } from '../OCache';
import {
	TMiniGamePlayResult,
	TMiniGameTemplate,
	TMiniGamePlayBatchResult,
	TSawHistory,
} from './WSAPITypes';
import {
	CACHE_DATA_SEC,
	onUpdateContextKey,
} from './WSAPIBase';
import { WSAPIRaffles } from './WSAPIRaffles';

/** @group MiniGames */
export class WSAPIMiniGames extends WSAPIRaffles {
	/**
	 * Returns the list of mini-games configured for the current user (not filtered by spin availability or Widget visibility).
	 * The returned list of mini-games is cached for 30 seconds. But you can pass the onUpdate callback as a parameter. Note that each time you call getMiniGames with a new onUpdate callback, the old one will be overwritten by the new one.
	 * The onUpdate callback will be called on available spin count change, if mini-game has increasing jackpot per spin or won prize is spin/jackpot and if max count of the available user spins equals one, also if the spins were issued to the user manually in the BO. Updated templates will be passed to onUpdate callback.
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.getMiniGames().then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 * **Example in the Visitor mode**:
	 * ```
	 * _smartico.vapi('EN').getMiniGames().then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 */
	public async getMiniGames({ onUpdate }: { onUpdate?: (data: TMiniGameTemplate[]) => void } = {}): Promise<
		TMiniGameTemplate[]
	> {
		if (onUpdate) {
			this.onUpdateCallback.set(onUpdateContextKey.Saw, onUpdate);
		}

		return OCache.use(onUpdateContextKey.Saw, ECacheContext.WSAPI, () => this.api.sawGetTemplatesT(this.userExtId), CACHE_DATA_SEC);
	}

	/**
	 * Returns the list of mini-games based on the provided parameters. "Limit" and "offset" indicate the range of items to be fetched.
	 * The maximum number of items per request is limited to 20.
	 * You can leave this params empty and by default it will return list of mini-games ranging from 0 to 20.
	 * The returned list of mini-games history is cached for 30 seconds.
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.getMiniGamesHistory().then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 * **Visitor mode: not supported**
	 */

	public async getMiniGamesHistory({
		limit,
		offset,
		saw_template_id,
	}: {
		limit?: number;
		offset?: number;
		saw_template_id?: number;
	}): Promise<TSawHistory[]> {
		return OCache.use(
			onUpdateContextKey.SAWHistory,
			ECacheContext.WSAPI,
			() => this.api.getSawWinningHistoryT(this.userExtId, limit, offset, saw_template_id),
			CACHE_DATA_SEC,
		);
	}

	/**
	 * Plays the specified by template_id mini-game on behalf of user and returns prize_id or err_code
	 * After playMiniGame is called, you can call getMiniGames to get the list of mini-games.The returned list of mini-games is cached for 30 seconds. But you can pass the onUpdate callback as a parameter. Note that each time you call playMiniGame with a new onUpdate callback, the old one will be overwritten by the new one.
	 * The onUpdate callback will be called on available spin count change, if mini-game has increasing jackpot per spin or won prize is spin/jackpot and if max count of the available user spins equals one, also if the spins were issued to the user manually in the BO. Updated templates will be passed to onUpdate callback.
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.playMiniGame(55).then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 * **Visitor mode: not supported**
	 */
	public async playMiniGame(
		template_id: number,
		{ onUpdate }: { onUpdate?: (data: TMiniGameTemplate[]) => void } = {},
	): Promise<TMiniGamePlayResult> {
		if (onUpdate) {
			this.onUpdateCallback.set(onUpdateContextKey.Saw, onUpdate);
		}

		const r = await this.api.sawSpinRequest(this.userExtId, template_id);
		this.api.doAcknowledgeRequest(this.userExtId, r.request_id);

		const o: TMiniGamePlayResult = {
			err_code: r.errCode,
			err_message: r.errMsg,
			prize_id: r.saw_prize_id,
		};

		return o;
	}

	/**
	 * Sends the acknowledge request with specific client_request_id from minigame history in order to claim prize
	 * **Example**:
	 * ```
	 * _smartico.api.miniGameWinAcknowledgeRequest('2a189322-31bb-4119-b943-bx7868ff8dc3').then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 */
	public async miniGameWinAcknowledgeRequest(request_id: string) {
		return this.api.doAcknowledgeRequest(this.userExtId, request_id);
	}

	/**
	 * Plays the specified by template_id mini-game on behalf of user spin_count times and returns array of the prizes
	 * After playMiniGameBatch is called, you can call getMiniGames to get the list of mini-games. The returned list of mini-games is cached for 30 seconds. But you can pass the onUpdate callback as a parameter. Note that each time you call playMiniGameBatch with a new onUpdate callback, the old one will be overwritten by the new one.
	 * The onUpdate callback will be called on available spin count change, if mini-game has increasing jackpot per spin or won prize is spin/jackpot and if max count of the available user spins equals one, also if the spins were issued to the user manually in the BO. Updated templates will be passed to onUpdate callback.
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.playMiniGameBatch(55, 10).then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 * **Visitor mode: not supported**
	 */
	public async playMiniGameBatch(
		template_id: number,
		spin_count: number,
		{ onUpdate }: { onUpdate?: (data: TMiniGameTemplate[]) => void } = {},
	): Promise<TMiniGamePlayBatchResult[]> {
		if (onUpdate) {
			this.onUpdateCallback.set(onUpdateContextKey.Saw, onUpdate);
		}

		const response = await this.api.sawSpinBatchRequest(this.userExtId, template_id, spin_count);

		const request_ids = response.results.map((result) => result.request_id);
		this.api.doAcknowledgeBatchRequest(this.userExtId, request_ids);

		const o: TMiniGamePlayBatchResult[] = response.results.map((result) => ({
			errCode: result.errCode,
			errMessage: result.errMsg,
			saw_prize_id: result.saw_prize_id,
			jackpot_amount: result.jackpot_amount,
			first_spin_in_period: result.first_spin_in_period,
		}));

		return o;
	}

	protected async updateOnSpin(data: SAWSpinsCountPush) {
		const templates: TMiniGameTemplate[] = await OCache.use(
			onUpdateContextKey.Saw,
			ECacheContext.WSAPI,
			() => this.api.sawGetTemplatesT(this.userExtId),
			CACHE_DATA_SEC,
		);
		const index = templates.findIndex((t) => t.id === data.saw_template_id);
		templates[index].spin_count = data.spin_count;
		this.updateEntity(onUpdateContextKey.Saw, templates);
	}

	protected async reloadMiniGameTemplate() {
		const updatedTemplates = await this.api.sawGetTemplatesT(this.userExtId);
		this.updateEntity(onUpdateContextKey.Saw, updatedTemplates);
	}
}
