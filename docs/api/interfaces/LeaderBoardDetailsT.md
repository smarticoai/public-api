# Interface: LeaderBoardDetailsT

LeaderBoardDetailsT describes one period's leaderboard.
Returned by `_smartico.api.getLeaderBoard(periodType, getPreviousPeriod?)`.
May be `undefined` at runtime when no board is configured for the requested period.

## Properties

### board\_id

> **board\_id**: `number`

Stable ID of the leaderboard.

***

### name

> **name**: `string`

Operator-defined display name.

***

### description

> **description**: `string`

Operator-defined description (HTML allowed).

***

### rules

> **rules**: `string`

Operator-defined rules / terms (HTML allowed).

***

### period\_type\_id

> **period\_type\_id**: [`LeaderBoardPeriodType`](../enumerations/LeaderBoardPeriodType.md)

Period type this board is bound to ([LeaderBoardPeriodType](../enumerations/LeaderBoardPeriodType.md)).

***

### version\_id

> **version\_id**: `number`

Snapshot version. `0` for the live current period; a positive value
identifies a finalized previous-period snapshot (see `getPreviousPeriod`).

***

### create\_date

> **create\_date**: `number`

Snapshot creation timestamp (Unix ms). `0` for the live current period;
the finalization time for a previous-period snapshot.

***

### rewards

> **rewards**: [`LeaderBoardsRewardsT`](LeaderBoardsRewardsT.md)[]

Per-place prize table; the array length is the number of paid places.

***

### users

> **users**: [`LeaderBoardUserT`](LeaderBoardUserT.md)[]

Top-20 ranked entries (server-capped), sorted by `position` ASC.
Empty when fetched via `getLeaderBoards()` (metadata-only list).

***

### me?

> `optional` **me?**: [`LeaderBoardUserT`](LeaderBoardUserT.md)

Current user's own entry. `undefined` for visitor sessions.
For authenticated users, `position === -1` means the user is
unranked / outside the ranked window.
