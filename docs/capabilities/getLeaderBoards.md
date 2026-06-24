# getLeaderBoards — API (LeaderBoardDetailsT)

> Returns the list of leaderboards the operator has configured for this label — **metadata only, without participants**.
> Import: `import { LeaderBoardDetailsT } from '@smartico/public-api'`
> Search terms: getLeaderBoards, leaderboard, getLeaderboards, LeaderBoardDetailsT, LeaderBoardPeriodType, LeaderBoardsRewardsT, LeaderBoardUserT

## Signature
```ts
_smartico.api.getLeaderBoards(): Promise<LeaderBoardDetailsT[]>
```

## Parameters
_None._

## Returns — `Promise<LeaderBoardDetailsT[]>`
Array of `LeaderBoardDetailsT`. Each item:
- `board_id` (number) — Stable ID of the leaderboard.
- `name` (string) — Operator-defined display name.
- `description` (string) — Operator-defined description (HTML allowed).
- `rules` (string) — Operator-defined rules / terms (HTML allowed).
- `period_type_id` (LeaderBoardPeriodType) — Period type this board is bound to (`LeaderBoardPeriodType`).
- `version_id` (number) — Snapshot version. `0` for the live current period; a positive value identifies a finalized previous-period snapshot (see `getPreviousPeriod`).
- `create_date` (number) — Snapshot creation timestamp (Unix ms). `0` for the live current period; the finalization time for a previous-period snapshot.
- `rewards` (LeaderBoardsRewardsT[]) — Per-place prize table; the array length is the number of paid places.
  - `place` (number) — Place number (1-based).
  - `points` (number) — Gamification points awarded to the user occupying this place at period finalization.
- `users` (LeaderBoardUserT[]) — Top-20 ranked entries (server-capped), sorted by `position` ASC. Empty when fetched via `getLeaderBoards()` (metadata-only list).
  - `public_username` (string) — Display username (operator-defined alias).
  - `avatar_url` (string) — Resolved CDN URL for the participant's avatar. May be empty when the participant has no custom avatar — fall back to a level-based default using `level_id`.
  - `level_id` (number) — The participant's level id — use it to resolve a level-based default avatar when `avatar_url` is empty.
  - `position` (number) — Rank in the leaderboard (DENSE_RANK over all participants). `-1` on the `me` entry signals "unranked / outside the window".
  - `points` (number) — Participant's points for this period.
  - `is_me` (boolean) — `true` when this row is the current authenticated user. Always `true` on the `me` entry.
- `me` (LeaderBoardUserT) — Current user's own entry. `undefined` for visitor sessions. For authenticated users, `position === -1` means the user is unranked / outside the ranked window.
  - `public_username` (string) — Display username (operator-defined alias).
  - `avatar_url` (string) — Resolved CDN URL for the participant's avatar. May be empty when the participant has no custom avatar — fall back to a level-based default using `level_id`.
  - `level_id` (number) — The participant's level id — use it to resolve a level-based default avatar when `avatar_url` is empty.
  - `position` (number) — Rank in the leaderboard (DENSE_RANK over all participants). `-1` on the `me` entry signals "unranked / outside the window".
  - `points` (number) — Participant's points for this period.
  - `is_me` (boolean) — `true` when this row is the current authenticated user. Always `true` on the `me` entry.

## Behavioral contract
**Returned shape**
An array of `LeaderBoardDetailsT`, one per configured board, ordered by
`period_type_id` ascending (DAILY, WEEKLY, MONTHLY, …). On every entry
`users` is an empty array and `me` is `undefined` — this call never
carries participant data. Read `period_type_id` from each entry and pass
it to `getLeaderBoard` to load that board's standings.

**Empty result**
Resolves to an empty array when the label has no leaderboards configured
— treat that as "hide the leaderboard surface".

**Cache TTL**
Cached for 30 seconds under a dedicated key (independent of
`getLeaderBoard`'s per-period cache). Repeated calls within the
window return the cached list without a round-trip.

**Refresh model**: one-shot fetch — no subscription, no push. Board
configuration changes surface on the next cache miss.

**Idempotency / Side effects**: safe. Read-only.

**Visitor mode**: supported. Returns the brand's public board list.

## Example
```ts
const boards = await window._smartico.api.getLeaderBoards();

if (boards.length === 0) {
  console.log('[smartico] no leaderboards configured — hide the leaderboard surface');
  return;
}

// Render one tab per board from the lightweight list (no players yet).
console.log('[smartico] render leaderboard tabs:', boards.map(b => b.name));

// When the user opens a tab, load that board's standings on demand.
const first = boards[0];
const full = await window._smartico.api.getLeaderBoard(first.period_type_id);
console.log('[smartico] loaded standings for', first.name, '—', full?.users.length ?? 0, 'players');
```

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `getLeaderBoard`
