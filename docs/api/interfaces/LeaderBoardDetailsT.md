# Interface: LeaderBoardDetailsT

## Properties

### board\_id

> **board\_id**: `number`

ID of the leaderboard

***

### name

> **name**: `string`

Name of the leaderboard

***

### description

> **description**: `string`

Description of the leaderboard

***

### rules

> **rules**: `string`

Rules of the leaderboard

***

### period\_type\_id

> **period\_type\_id**: [`LeaderBoardPeriodType`](../enumerations/LeaderBoardPeriodType.md)

Leaderboard period type ID

***

### rewards

> **rewards**: [`LeaderBoardsRewardsT`](LeaderBoardsRewardsT.md)[]

Leaderboard points rewards

***

### users

> **users**: [`LeaderBoardUserT`](LeaderBoardUserT.md)[]

Leaderboard users

***

### me?

> `optional` **me?**: [`LeaderBoardUserT`](LeaderBoardUserT.md)

Info about current user in leaderboard
