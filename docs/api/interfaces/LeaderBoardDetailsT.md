# Interface: LeaderBoardDetailsT

## Properties

### board\_id

• **board\_id**: `number`

ID of the leaderboard

___

### name

• **name**: `string`

Name of the leaderboard

___

### description

• **description**: `string`

Description of the leaderboard

___

### rules

• **rules**: `string`

Rules of the leaderboard

___

### period\_type\_id

• **period\_type\_id**: [`LeaderBoardPeriodType`](../enums/LeaderBoardPeriodType.md)

Leaderboard period type ID

___

### rewards

• **rewards**: [`LeaderBoardsRewardsT`](LeaderBoardsRewardsT.md)[]

Leaderboard points rewards

___

### users

• **users**: [`LeaderBoardUserT`](LeaderBoardUserT.md)[]

Leaderboard users

___

### me

• `Optional` **me**: [`LeaderBoardUserT`](LeaderBoardUserT.md)

Info about current user in leaderboard
