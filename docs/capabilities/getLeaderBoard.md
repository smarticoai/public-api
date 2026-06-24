# getLeaderBoard — API (LeaderBoardDetailsT)

> Returns the operator-configured standalone leaderboard for the given period type — top-20 ranked entries, the current user's own entry (when authenticated), and the configured prize table.
> Import: `import { LeaderBoardDetailsT } from '@smartico/public-api'`
> Search terms: getLeaderBoard, leaderboard, LeaderBoardDetailsT, board_id, name, description, rules, period_type_id, version_id, create_date, rewards

## Signature
```ts
_smartico.api.getLeaderBoard(periodType: LeaderBoardPeriodType, getPreviousPeriod?: boolean | number): Promise<LeaderBoardDetailsT>
```

## Parameters
- `periodType` — The board's period type (`LeaderBoardPeriodType`). Selects which pre-configured board to fetch; the board itself is bound to one period by the operator.
- `getPreviousPeriod` — Which period to fetch. `false` (default) = current in-progress period; `true` = the most recent finalized snapshot; a number `n` = the n-th previous snapshot (`1` = previous, `2` = the one before, …).

## Returns — `Promise<LeaderBoardDetailsT>`
- `board_id` (number) — Stable ID of the leaderboard.
- `name` (string) — Operator-defined display name.
- `description` (string) — Operator-defined description (HTML allowed).
- `rules` (string) — Operator-defined rules / terms (HTML allowed).
- `period_type_id` (number) — Period type this board is bound to (`LeaderBoardPeriodType`).
- `version_id` (number) — Snapshot version. `0` for the live current period; a positive value identifies a finalized previous-period snapshot (see `getPreviousPeriod`).
- `create_date` (number) — Snapshot creation timestamp (Unix ms). `0` for the live current period; the finalization time for a previous-period snapshot.
- `rewards` (object[]) — Per-place prize table; the array length is the number of paid places.
  - `place` (number) — Place number (1-based).
  - `points` (number) — Gamification points awarded to the user occupying this place at period finalization.
- `users` (object[]) — Top-20 ranked entries (server-capped), sorted by `position` ASC. Empty when fetched via `getLeaderBoards()` (metadata-only list).
  - `public_username` (string) — Display username (operator-defined alias).
  - `avatar_url` (string) — Resolved CDN URL for the participant's avatar. May be empty when the participant has no custom avatar — fall back to a level-based default using `level_id`.
  - `level_id` (number) — The participant's level id — use it to resolve a level-based default avatar when `avatar_url` is empty.
  - `position` (number) — Rank in the leaderboard (DENSE_RANK over all participants). `-1` on the `me` entry signals "unranked / outside the window".
  - `points` (number) — Participant's points for this period.
  - `is_me` (boolean) — `true` when this row is the current authenticated user. Always `true` on the `me` entry.
- `me` (object) — Current user's own entry. `undefined` for visitor sessions. For authenticated users, `position === -1` means the user is unranked / outside the ranked window.

## Behavioral contract
**Return value note** — the runtime may return `undefined` if no
board is configured for the requested `periodType`, despite the
static return type being `Promise<LeaderBoardDetailsT>`. Defend
against that case in consumer code.

**Preconditions**
Pass a `periodType` from `LeaderBoardPeriodType`(`DAILY = 1`, `WEEKLY = 2`, `MONTHLY = 3`). Pass
`getPreviousPeriod: true` to fetch the most-recently-ended
period's snapshot (yesterday's / last week's / last month's
results) instead of the current live period. To reach older
snapshots, pass a number instead of a boolean: `1` = previous
period, `2` = the one before that, and so on (`0` / `false` =
current). Use the snapshot's `create_date` / `version_id` to label
which historical run a previous-period board is. How far back
snapshots are retained is operator-configured.

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

**UI guidance**: see [UI Guide — `getLeaderBoard`](../../docs/ui/leaderboard/UIGuide_getLeaderBoard.md).

**Visitor mode**: supported. The same shape is returned, scoped
to the brand's public leaderboard. `me` is `undefined` for
visitors.

## Example
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

### Example response (REAL shape)
```json
{
  "board_id": 143,
  "name": "Daily Leaderboard",
  "description": "This <b>Leaderboard</b> is showing the names and current scores of the leading competitors of the day.<br>\nYou can put any text here to describe this Leaderb…",
  "rules": "Leaderboards are the simplest form of tournaments. Easy to set up in 5 minutes or less. Boards only calculate gamification point progress, and award points f…",
  "period_type_id": 1,
  "version_id": 0,
  "create_date": 0,
  "rewards": [
    {
      "place": 1,
      "points": 100
    },
    {
      "place": 2,
      "points": 75
    }
  ],
  "users": [
    {
      "public_username": "Matt*****",
      "avatar_url": "https://cdn.example/avatar/344499363",
      "level_id": 700,
      "position": 1,
      "points": 1525,
      "is_me": false
    },
    {
      "public_username": "Edwa*****",
      "avatar_url": "https://cdn.example/avatar/362451457",
      "level_id": 698,
      "position": 2,
      "points": 380,
      "is_me": false
    }
  ],
  "me": {
    "public_username": "Antonio",
    "avatar_url": "https://cdn.example/avatars/12/00000000-0000-0000-0000-000000000000.png",
    "level_id": 698,
    "position": -1,
    "points": 0,
    "is_me": true
  }
}
```

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `getLeaderBoards`
- `LeaderBoardPeriodType`
