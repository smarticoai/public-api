# Class: WSAPILeaderBoard
## Methods

### getLeaderBoard()

> **getLeaderBoard**(`periodType`, `getPreviousPeriod?`): `Promise`\<[`LeaderBoardDetailsT`](../interfaces/LeaderBoardDetailsT.md)\>

Returns the operator-configured standalone leaderboard for the
given period type — top-20 ranked entries, the current user's
own entry (when authenticated), and the configured prize table.
Use this to power a leaderboard page with daily / weekly /
monthly tabs.

The leaderboard for each period type is configured separately by
the operator. A label may have any combination of DAILY, WEEKLY,
and MONTHLY boards configured (or none).

#### Parameters

##### periodType

[`LeaderBoardPeriodType`](../enumerations/LeaderBoardPeriodType.md)

The board's period type
                          ([LeaderBoardPeriodType](../enumerations/LeaderBoardPeriodType.md)).
                          Selects which pre-configured board to
                          fetch; the board itself is bound to one
                          period by the operator.

##### getPreviousPeriod?

`boolean`

When `true`, returns the most recent
                          finalized snapshot for that period type
                          (e.g. last week's results). Defaults to
                          `false` (current in-progress period).

#### Returns

`Promise`\<[`LeaderBoardDetailsT`](../interfaces/LeaderBoardDetailsT.md)\>

Promise resolving to `LeaderBoardDetailsT`.
                          **At runtime, may resolve to `undefined`**
                          when no board is configured for the
                          requested period type — guard against it.

#### Remarks

**Return value note** — the runtime may return `undefined` if no
board is configured for the requested `periodType`, despite the
static return type being `Promise<LeaderBoardDetailsT>`. Defend
against that case in consumer code.

**Preconditions**
Pass a `periodType` from [LeaderBoardPeriodType](../enumerations/LeaderBoardPeriodType.md)
(`DAILY = 1`, `WEEKLY = 2`, `MONTHLY = 3`). Pass
`getPreviousPeriod: true` to fetch the most-recently-ended
period's snapshot (yesterday's results, last week's results,
last month's results) instead of the current live period. The
SDK only exposes one period back — older snapshots are not
reachable through this method.

**Top-20 cap**
The server hard-caps `users[]` at 20 entries, ordered by
`position` ASC. Position values are server-computed (DENSE_RANK
over all participants); the truncation at 20 is for transport
size only — `position` may exceed 20 elsewhere.

**The `me` field**
Always populated for authenticated users (even when they have
zero points in the period). `me.position === -1` is the signal
that the user is active but ranked outside the top 20 (or has no
activity yet). `me` is `undefined` for visitor-mode sessions.

**Rewards are points only**
`rewards[].points` are gamification points credited to the user's
balance when the period finalizes. The leaderboard never awards
gems, diamonds, store items, or bonuses. The first element of
the array is the prize for place 1, the second for place 2, and
so on. The array length is the number of paid places.

**Cache TTL**
The SDK caches each response for 30 seconds. 

**Period boundaries**
The server finalizes each period on a server-configurable
schedule: DAILY at midnight + operator-defined offset; WEEKLY
at the start of Monday; MONTHLY on the 1st of each month. At
finalization, the server distributes the configured `rewards[]`
points to the top placeholders and resets the live board. After
finalization, `getLeaderBoard(periodType, false)` returns the
NEW (empty) period's board; call with
`getPreviousPeriod: true` to see the just-ended standings.

**Refresh model**
- One-shot fetch (no subscription).
- No push event refreshes the cache; finalization at the period
  boundary is NOT pushed to the client.
- Poll manually if the consumer needs near-live state during an
  in-progress period.

**Idempotency / Side effects**: safe. Read-only.

**UI guidance**: see [UI Guide — `getLeaderBoard`](../_media/UIGuide_getLeaderBoard.md).

**Visitor mode**: supported. The same shape is returned, scoped
to the brand's public leaderboard. `me` is `undefined` for
visitors.

#### Example

```ts
import { LeaderBoardPeriodType } from '@smartico/public-api';

const board = await window._smartico.api.getLeaderBoard(LeaderBoardPeriodType.WEEKLY);

if (!board) {
  console.log('[smartico] no weekly board configured for this label — hide the leaderboard surface');
  return;
}

console.log('[smartico] render leaderboard tab —', board.name, '—', board.users.length, 'ranked entries (top 20 max)');

// Render prize table.
for (const reward of board.rewards) {
  console.log('[smartico] prize row — place', reward.place, '→', reward.points, 'points');
}

// "Me" panel — sticky row showing the current user's rank.
if (board.me) {
  if (board.me.position === -1) {
    console.log('[smartico] user is unranked — show "You are unranked, earn points to enter the leaderboard"');
  } else if (board.me.position > 20) {
    console.log('[smartico] user is ranked', board.me.position, 'but outside the visible top-20 — show sticky "me" row with', board.me.points, 'points');
  } else {
    console.log('[smartico] user is in the top 20 at position', board.me.position, '— highlight their row in the main list');
  }
}

// Switch to previous period view — cached separately from the current period.
const prev = await window._smartico.api.getLeaderBoard(LeaderBoardPeriodType.WEEKLY, true);
console.log('[smartico] previous-week standings — render with greyed-out "ended" treatment:', prev?.users.length, 'finalists');

// Visitor-mode equivalent — me is always undefined.
// const visitorBoard = await window._smartico.vapi('EN').getLeaderBoard(LeaderBoardPeriodType.DAILY);
```

***
