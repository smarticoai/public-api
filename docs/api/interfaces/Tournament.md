# Interface: Tournament

## Properties

### tournamentId

• `Optional` **tournamentId**: `number`

ID of tournament template

___

### tournamentInstanceId

• `Optional` **tournamentInstanceId**: `number`

ID of tournament instance. Generated every time when tournament based on specific template is scheduled for run

___

### tournamentType

• `Optional` **tournamentType**: `TournamentType`

Type of the tournament. For now only SCHEDULED is support

___

### publicMeta

• `Optional` **publicMeta**: `TournamentPublicMeta`

Meta information about tournament that should be used to build UI

___

### buyInAmount

• `Optional` **buyInAmount**: `number`

Cost of registration in the tournament in gamification points

___

### prizePool

• `Optional` **prizePool**: `number`

Not in use

___

### startTime

• `Optional` **startTime**: `string`

The time when tournament is going to start

___

### endTime

• `Optional` **endTime**: `string`

The time when tournament is going to finish

___

### startTimeTs

• `Optional` **startTimeTs**: `number`

The time when tournament is going to start, epoch

___

### endTimeTs

• `Optional` **endTimeTs**: `number`

The time when tournament is going to finish, epoch

___

### registrationCount

• `Optional` **registrationCount**: `number`

Number of users registered in the tournament

___

### totalCount

• `Optional` **totalCount**: `number`

Not in use

___

### registrationType

• `Optional` **registrationType**: [`TournamentRegistrationType`](../enums/TournamentRegistrationType.md)

Type of registration in the tournament

___

### tournamentRegistrationStatus

• `Optional` **tournamentRegistrationStatus**: [`TournamentRegistrationStatus`](../enums/TournamentRegistrationStatus.md)

Status of registration in the tournament for current user

___

### tournamentInstanceStatus

• `Optional` **tournamentInstanceStatus**: `TournamentInstanceStatus`

Status of tournament instance

___

### isUserRegistered

• `Optional` **isUserRegistered**: `boolean`

flag indicating if current user is registered in the tournament

___

### allowLateRegistration

• `Optional` **allowLateRegistration**: `boolean`

Indicator if tournament allows later registration, when tournament is already started

___

### playersMinCount

• `Optional` **playersMinCount**: `number`

Minimum number of participant for this tournament. If tournament doesnt have enough registrations, it will not start

___

### playersMaxCount

• `Optional` **playersMaxCount**: `number`

Maximum number of participant for this tournament. When reached, new users won't be able to register

___

### durationMs

• `Optional` **durationMs**: `number`

Tournament duration in millisecnnds

___

### prizeStructure

• `Optional` **prizeStructure**: `Object`

prizes structure

#### Type declaration

| Name | Type |
| :------ | :------ |
| `prizes` | [`TournamentPrize`](TournamentPrize.md)[] |

___

### tournamentPlayer

• `Optional` **tournamentPlayer**: [`TournamentPlayer`](TournamentPlayer.md)

Information about current user

___

### related\_games

• `Optional` **related\_games**: [`AchRelatedGame`](AchRelatedGame.md)[]

List of casino games (or other types of entities) related to the tournament

___

### minScoreToWin

• `Optional` **minScoreToWin**: `number`

The minimum amount of score points that the user should get in order to be qualified for the prize

___

### hideLeaderboardsMinScores

• `Optional` **hideLeaderboardsMinScores**: `boolean`

When enabled, users who don't meet the minimum qualifying score will be hidden from the Leaderboard.
