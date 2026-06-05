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
	 * and MONTHLY boards configured (or none). To discover which boards
	 * exist before loading any standings, call {@link getLeaderBoards}
	 * (metadata only) and drive the tab selector from its `period_type_id`s.
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
	 * period's snapshot (yesterday's / last week's / last month's
	 * results) instead of the current live period. To reach older
	 * snapshots, pass a number instead of a boolean: `1` = previous
	 * period, `2` = the one before that, and so on (`0` / `false` =
	 * current). Use the snapshot's `create_date` / `version_id` to label
	 * which historical run a previous-period board is. How far back
	 * snapshots are retained is operator-configured.
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
	 * **Cache TTL**
	 * The SDK caches each response for 30 seconds. 
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
	 * @param getPreviousPeriod  Which period to fetch. `false` (default)
	 *                           = current in-progress period; `true` =
	 *                           the most recent finalized snapshot; a
	 *                           number `n` = the n-th previous snapshot
	 *                           (`1` = previous, `2` = the one before, …).
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
	 * // Switch to previous period view — cached separately from the current period.
	 * const prev = await window._smartico.api.getLeaderBoard(LeaderBoardPeriodType.WEEKLY, true);
	 * console.log('[smartico] previous-week standings — render with greyed-out "ended" treatment:', prev?.users.length, 'finalists');
	 *
	 * // Visitor-mode equivalent — me is always undefined.
	 * // const visitorBoard = await window._smartico.vapi('EN').getLeaderBoard(LeaderBoardPeriodType.DAILY);
	 * ```
	 */
	public async getLeaderBoard(periodType: LeaderBoardPeriodType, getPreviousPeriod?: boolean | number): Promise<LeaderBoardDetailsT> {
		// Resolve the snapshot offset: false/omitted → 0 (current), true → 1
		// (previous), or an explicit number for older snapshots.
		const offset = typeof getPreviousPeriod === 'number' ? getPreviousPeriod : getPreviousPeriod ? 1 : 0;
		// Cache per (periodType, offset) so switching tabs or period within the
		// TTL doesn't return a colliding board.
		const cacheKey = `${onUpdateContextKey.LeaderBoards}:${periodType}:${offset}`;
		return OCache.use(
			cacheKey,
			ECacheContext.WSAPI,
			() => this.api.leaderboardsGetT(this.userExtId, periodType, offset),
			CACHE_DATA_SEC,
		);
	}

	/**
	 * Returns the list of leaderboards the operator has configured for this
	 * label — **metadata only, without participants**. Use it to discover
	 * which boards exist (and their period types) so you can render the
	 * board/tab selector, then load a specific board's standings on demand
	 * with {@link getLeaderBoard}.
	 *
	 * This is the lightweight discovery counterpart to {@link getLeaderBoard}:
	 * it issues one round-trip that returns every board's identity, name,
	 * description, rules, `period_type_id`, and prize table, but **not** the
	 * ranked players. Fetching the full standings for one board (the top-20
	 * `users[]` and the caller's own `me` entry) is what {@link getLeaderBoard}
	 * does per period.
	 *
	 * @remarks
	 * **Returned shape**
	 * An array of `LeaderBoardDetailsT`, one per configured board, ordered by
	 * `period_type_id` ascending (DAILY, WEEKLY, MONTHLY, …). On every entry
	 * `users` is an empty array and `me` is `undefined` — this call never
	 * carries participant data. Read `period_type_id` from each entry and pass
	 * it to {@link getLeaderBoard} to load that board's standings.
	 *
	 * **Empty result**
	 * Resolves to an empty array when the label has no leaderboards configured
	 * — treat that as "hide the leaderboard surface".
	 *
	 * **Cache TTL**
	 * Cached for 30 seconds under a dedicated key (independent of
	 * {@link getLeaderBoard}'s per-period cache). Repeated calls within the
	 * window return the cached list without a round-trip.
	 *
	 * **Refresh model**: one-shot fetch — no subscription, no push. Board
	 * configuration changes surface on the next cache miss.
	 *
	 * **Idempotency / Side effects**: safe. Read-only.
	 *
	 * **Visitor mode**: supported. Returns the brand's public board list.
	 *
	 * @returns Promise resolving to the array of configured boards
	 *          (metadata only). Empty array when none are configured.
	 *
	 * @example
	 * ```ts
	 * const boards = await window._smartico.api.getLeaderBoards();
	 *
	 * if (boards.length === 0) {
	 *   console.log('[smartico] no leaderboards configured — hide the leaderboard surface');
	 *   return;
	 * }
	 *
	 * // Render one tab per board from the lightweight list (no players yet).
	 * console.log('[smartico] render leaderboard tabs:', boards.map(b => b.name));
	 *
	 * // When the user opens a tab, load that board's standings on demand.
	 * const first = boards[0];
	 * const full = await window._smartico.api.getLeaderBoard(first.period_type_id);
	 * console.log('[smartico] loaded standings for', first.name, '—', full?.users.length ?? 0, 'players');
	 * ```
	 */
	public async getLeaderBoards(): Promise<LeaderBoardDetailsT[]> {
		return OCache.use(
			`${onUpdateContextKey.LeaderBoards}:list`,
			ECacheContext.WSAPI,
			() => this.api.leaderboardsGetListT(this.userExtId),
			CACHE_DATA_SEC,
		);
	}
}
