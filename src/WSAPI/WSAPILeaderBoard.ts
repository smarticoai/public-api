import { ECacheContext, OCache } from '../OCache';
import {
	LeaderBoardDetailsT,
} from './WSAPITypes';
import { LeaderBoardPeriodType } from '../Leaderboard';
import {
	CACHE_DATA_SEC,
	onUpdateContextKey,
} from './WSAPIBase';
import { WSAPIGamePick } from './WSAPIGamePick';

/** @group LeaderBoard */
export class WSAPILeaderBoard extends WSAPIGamePick {
	/**
	 * Returns the leaderboard for the current type (default is Daily). If getPreviousPeriod is passed as true, a leaderboard for the previous period for the current type will be returned.
	 * For example, if the type is Weekly and getPreviousPeriod is true, a leaderboard for the previous week will be returned.
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.getLeaderBoard(1).then((result) => {
	 *     console.log(result);
	 * });
	 * ```
	 *
	 * **Example in the Visitor mode**:
	 * ```
	 * _smartico.vapi('EN').getLeaderBoard(1).then((result) => {
	 *    console.log(result);
	 * });
	 * ```
	 */
	public async getLeaderBoard(periodType: LeaderBoardPeriodType, getPreviousPeriod?: boolean): Promise<LeaderBoardDetailsT> {
		return OCache.use(
			onUpdateContextKey.LeaderBoards,
			ECacheContext.WSAPI,
			() => this.api.leaderboardsGetT(this.userExtId, periodType, getPreviousPeriod),
			CACHE_DATA_SEC,
		);
	}
}
