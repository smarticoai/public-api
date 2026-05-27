import { ECacheContext, OCache } from '../OCache';
import {
	TTournament,
	TTournamentDetailed,
	TTournamentRegistrationResult,
	TClanTournamentPlayers,
} from './WSAPITypes';
import {
	CACHE_DATA_SEC,
	onUpdateContextKey,
} from './WSAPIBase';
import { WSAPIStore } from './WSAPIStore';

/** @group Tournaments */
export class WSAPITournaments extends WSAPIStore {
	public async getTournamentsList({ onUpdate }: { onUpdate?: (data: TTournament[]) => void } = {}): Promise<TTournament[]> {
		if (onUpdate) {
			this.onUpdateCallback.set(onUpdateContextKey.TournamentList, onUpdate);
		}

		return OCache.use(
			onUpdateContextKey.TournamentList,
			ECacheContext.WSAPI,
			() => this.api.tournamentsGetLobbyT(this.userExtId),
			CACHE_DATA_SEC,
		);
	}

	/**
	 * Returns detailed information for a specific tournament instance; the response includes tournament info and the leaderboard of players
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.getTournamentsList().then((result) => {
	 *      if (result.length > 0) {
	 *         _smartico.api.getTournamentInstanceInfo(result[0].instance_id).then((result) => {
	 *             console.log(result);
	 *        });
	 *     }
	 * });
	 * ```
	 *
	 * **Example in the Visitor mode**:
	 * ```
	 * _smartico.vapi('EN').getTournamentsList().then((result) => {
	 *      if (result.length > 0) {
	 *         _smartico.vapi('EN').getTournamentInstanceInfo(result[0].instance_id).then((result) => {
	 *             console.log(result);
	 *        });
	 *     }
	 * });
	 * ```
	 */
	public async getTournamentInstanceInfo(tournamentInstanceId: number): Promise<TTournamentDetailed> {
		return this.api.tournamentsGetInfoT(this.userExtId, tournamentInstanceId);
	}

	/**
	 * Returns the players of a specific clan in a clan-based tournament.
	 *
	 * **Visitor mode: not supported**
	 */
	public async getClanTournamentPlayers(tournamentInstanceId: number, clanId: number): Promise<TClanTournamentPlayers> {
		return this.api.clanTournamentGetPlayers(this.userExtId, tournamentInstanceId, clanId);
	}

	/**
	 * Requests registration for the specified tournament instance. Returns the err_code.
	 *
	 * **Visitor mode: not supported**
	 */
	public async registerInTournament(tournamentInstanceId: number): Promise<TTournamentRegistrationResult> {
		const r = await this.api.registerInTournament(this.userExtId, tournamentInstanceId);

		const o: TTournamentRegistrationResult = {
			err_code: r.errCode,
			err_message: r.errMsg,
		};

		return o;
	}

	protected async updateTournaments() {
		const payload = await this.api.tournamentsGetLobbyT(this.userExtId);
		this.updateEntity(onUpdateContextKey.TournamentList, payload);
	}
}
