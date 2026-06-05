# Interface: LeaderBoardUserT

LeaderBoardUserT describes one participant row on a leaderboard.

## Properties

### public\_username

> **public\_username**: `string`

Display username (operator-defined alias).

***

### avatar\_url

> **avatar\_url**: `string`

Resolved CDN URL for the participant's avatar. May be empty when the
participant has no custom avatar — fall back to a level-based default
using `level_id`.

***

### level\_id

> **level\_id**: `number`

The participant's level id — use it to resolve a level-based default
avatar when `avatar_url` is empty.

***

### position

> **position**: `number`

Rank in the leaderboard (DENSE_RANK over all participants).
`-1` on the `me` entry signals "unranked / outside the window".

***

### points

> **points**: `number`

Participant's points for this period.

***

### is\_me

> **is\_me**: `boolean`

`true` when this row is the current authenticated user. Always `true`
on the `me` entry.
