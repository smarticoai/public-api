# Interface: LeaderBoardUserT

LeaderBoardUserT describes one participant row on a leaderboard.

## Properties

### public\_username

> **public\_username**: `string`

Display username (operator-defined alias).

***

### avatar\_url

> **avatar\_url**: `string`

Resolved CDN URL for the participant's avatar.

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

`true` when this row is the current authenticated user.
