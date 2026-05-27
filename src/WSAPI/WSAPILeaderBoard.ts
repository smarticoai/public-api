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
	 * Returns the operator-configured standalone leaderboard for the
	 * given period type — top-20 ranked entries, the current user's
	 * own entry (when authenticated), and the configured prize table.
	 * Use this to power a leaderboard page with daily / weekly /
	 * monthly tabs.
	 *
	 * The leaderboard for each period type is configured separately by
	 * the operator. A label may have any combination of DAILY, WEEKLY,
	 * and MONTHLY boards configured (or none).
	 *
	 * @remarks
	 * **Return value note** — the runtime may return `undefined` if no
	 * board is configured for the requested `periodType`, despite the
	 * static return type being `Promise<LeaderBoardDetailsT>`. Defend
	 * against that case in consumer code.
	 *
	 * **Preconditions**
	 * Pass a `periodType` from {@link LeaderBoardPeriodType}
	 * (`DAILY = 1`, `WEEKLY = 2`, `MONTHLY = 3`). Pass
	 * `getPreviousPeriod: true` to fetch the most-recently-ended
	 * period's snapshot (yesterday's results, last week's results,
	 * last month's results) instead of the current live period. The
	 * SDK only exposes one period back — older snapshots are not
	 * reachable through this method.
	 *
	 * **Top-20 cap**
	 * The server hard-caps `users[]` at 20 entries, ordered by
	 * `position` ASC. Position values are server-computed (DENSE_RANK
	 * over all participants); the truncation at 20 is for transport
	 * size only — `position` may exceed 20 elsewhere.
	 *
	 * **The `me` field**
	 * Always populated for authenticated users (even when they have
	 * zero points in the period). `me.position === -1` is the signal
	 * that the user is active but ranked outside the top 20 (or has no
	 * activity yet). `me` is `undefined` for visitor-mode sessions.
	 *
	 * **Rewards are points only**
	 * `rewards[].points` are gamification points credited to the user's
	 * balance when the period finalizes. The leaderboard never awards
	 * gems, diamonds, store items, or bonuses. The first element of
	 * the array is the prize for place 1, the second for place 2, and
	 * so on. The array length is the number of paid places.
	 *
	 * **Cache TTL — single shared key (known limitation)**
	 * The SDK caches the response for 30 seconds under a SINGLE shared
	 * key — calling `getLeaderBoard(DAILY)` followed by
	 * `getLeaderBoard(WEEKLY)` within the same 30 s window returns the
	 * cached DAILY result for the WEEKLY call. Same applies to
	 * switching `getPreviousPeriod`. To force a fresh fetch when
	 * switching periods or current/previous, call
	 * `_smartico.api.clearCaches()` before the second call, or simply
	 * wait out the TTL.
	 *
	 * **Period boundaries**
	 * The server finalizes each period on a server-configurable
	 * schedule: DAILY at midnight + operator-defined offset; WEEKLY
	 * at the start of Monday; MONTHLY on the 1st of each month. At
	 * finalization, the server distributes the configured `rewards[]`
	 * points to the top placeholders and resets the live board. After
	 * finalization, `getLeaderBoard(periodType, false)` returns the
	 * NEW (empty) period's board; call with
	 * `getPreviousPeriod: true` to see the just-ended standings.
	 *
	 * **Refresh model**
	 * - One-shot fetch (no subscription).
	 * - No push event refreshes the cache; finalization at the period
	 *   boundary is NOT pushed to the client.
	 * - Poll manually if the consumer needs near-live state during an
	 *   in-progress period.
	 *
	 * **Idempotency / Side effects**: safe. Read-only.
	 *
	 * **UI guidance**: see [UI Guide — `getLeaderBoard`](../../docs/ui/leaderboard/UIGuide_getLeaderBoard.md).
	 *
	 * **Visitor mode**: supported. The same shape is returned, scoped
	 * to the brand's public leaderboard. `me` is `undefined` for
	 * visitors.
	 *
	 * @param periodType         The board's period type
	 *                           ({@link LeaderBoardPeriodType}).
	 *                           Selects which pre-configured board to
	 *                           fetch; the board itself is bound to one
	 *                           period by the operator.
	 * @param getPreviousPeriod  When `true`, returns the most recent
	 *                           finalized snapshot for that period type
	 *                           (e.g. last week's results). Defaults to
	 *                           `false` (current in-progress period).
	 * @returns                  Promise resolving to `LeaderBoardDetailsT`.
	 *                           **At runtime, may resolve to `undefined`**
	 *                           when no board is configured for the
	 *                           requested period type — guard against it.
	 *
	 * @example
	 * ```ts
	 * import { LeaderBoardPeriodType } from '@smartico/public-api';
	 *
	 * const board = await window._smartico.api.getLeaderBoard(LeaderBoardPeriodType.WEEKLY);
	 *
	 * if (!board) {
	 *   console.log('[smartico] no weekly board configured for this label — hide the leaderboard surface');
	 *   return;
	 * }
	 *
	 * console.log('[smartico] render leaderboard tab —', board.name, '—', board.users.length, 'ranked entries (top 20 max)');
	 *
	 * // Render prize table.
	 * for (const reward of board.rewards) {
	 *   console.log('[smartico] prize row — place', reward.place, '→', reward.points, 'points');
	 * }
	 *
	 * // "Me" panel — sticky row showing the current user's rank.
	 * if (board.me) {
	 *   if (board.me.position === -1) {
	 *     console.log('[smartico] user is unranked — show "You are unranked, earn points to enter the leaderboard"');
	 *   } else if (board.me.position > 20) {
	 *     console.log('[smartico] user is ranked', board.me.position, 'but outside the visible top-20 — show sticky "me" row with', board.me.points, 'points');
	 *   } else {
	 *     console.log('[smartico] user is in the top 20 at position', board.me.position, '— highlight their row in the main list');
	 *   }
	 * }
	 *
	 * // Switch to previous period view — but bust the cache first to avoid the shared-key collision.
	 * await window._smartico.api.clearCaches();
	 * const prev = await window._smartico.api.getLeaderBoard(LeaderBoardPeriodType.WEEKLY, true);
	 * console.log('[smartico] previous-week standings — render with greyed-out "ended" treatment:', prev?.users.length, 'finalists');
	 *
	 * // Visitor-mode equivalent — me is always undefined.
	 * // const visitorBoard = await window._smartico.vapi('EN').getLeaderBoard(LeaderBoardPeriodType.DAILY);
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
