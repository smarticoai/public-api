# Interface: LeaderBoardSettingsT

LeaderBoardSettingsT carries the operator's privacy configuration for
leaderboard rendering. Every flag means "hide" when `true`.

## Properties

### hide\_avatars

> **hide\_avatars**: `boolean`

When `true`, render leaderboard rows without player avatars.

***

### hide\_levels

> **hide\_levels**: `boolean`

When `true`, render leaderboard rows without player level names.

***

### hide\_other\_points

> **hide\_other\_points**: `boolean`

When `true`, hide the points of every player except the current user.
The current user's own points are always shown, regardless of this flag.
