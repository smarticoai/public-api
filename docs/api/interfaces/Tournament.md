# Interface: Tournament

## Properties

### tournamentId?

> `optional` **tournamentId?**: `number`

ID of tournament template

***

### tournamentInstanceId?

> `optional` **tournamentInstanceId?**: `number`

ID of tournament instance. Generated every time when tournament based on specific template is scheduled for run

***

### tournamentType?

> `optional` **tournamentType?**: [`TournamentType`](../enumerations/TournamentType.md)

Type of the tournament. For now only SCHEDULED is support

***

### publicMeta?

> `optional` **publicMeta?**: [`TournamentPublicMeta`](TournamentPublicMeta.md)

Meta information about tournament that should be used to build UI

***

### buyInAmount?

> `optional` **buyInAmount?**: `number`

Cost of registration in the tournament in gamification points

***

### prizePool?

> `optional` **prizePool?**: `number`

Not in use

***

### startTime?

> `optional` **startTime?**: `string`

The time when tournament is going to start

***

### endTime?

> `optional` **endTime?**: `string`

The time when tournament is going to finish

***

### startTimeTs?

> `optional` **startTimeTs?**: `number`

The time when tournament is going to start, epoch

***

### endTimeTs?

> `optional` **endTimeTs?**: `number`

The time when tournament is going to finish, epoch

***

### registrationCount?

> `optional` **registrationCount?**: `number`

Number of users registered in the tournament

***

### totalCount?

> `optional` **totalCount?**: `number`

Not in use

***

### registrationType?

> `optional` **registrationType?**: [`TournamentRegistrationType`](../enumerations/TournamentRegistrationType.md)

Type of registration in the tournament

***

### tournamentRegistrationStatus?

> `optional` **tournamentRegistrationStatus?**: [`TournamentRegistrationStatus`](../enumerations/TournamentRegistrationStatus.md)

Status of registration in the tournament for current user

***

### tournamentInstanceStatus?

> `optional` **tournamentInstanceStatus?**: [`TournamentInstanceStatus`](../enumerations/TournamentInstanceStatus.md)

Status of tournament instance

***

### isUserRegistered?

> `optional` **isUserRegistered?**: `boolean`

flag indicating if current user is registered in the tournament

***

### allowLateRegistration?

> `optional` **allowLateRegistration?**: `boolean`

Indicator if tournament allows later registration, when tournament is already started

***

### playersMinCount?

> `optional` **playersMinCount?**: `number`

Minimum number of participant for this tournament. If tournament doesnt have enough registrations, it will not start

***

### playersMaxCount?

> `optional` **playersMaxCount?**: `number`

Maximum number of participant for this tournament. When reached, new users won't be able to register

***

### durationMs?

> `optional` **durationMs?**: `number`

Tournament duration in millisecnnds

***

### prizeStructure?

> `optional` **prizeStructure?**: `object`

prizes structure

#### prizes

> **prizes**: [`TournamentPrize`](TournamentPrize.md)[]

***

### tournamentPlayer?

> `optional` **tournamentPlayer?**: [`TournamentPlayer`](TournamentPlayer.md)

Information about current user

***

### related\_games?

> `optional` **related\_games?**: [`AchRelatedGame`](AchRelatedGame.md)[]

List of casino games (or other types of entities) related to the tournament

***

### minScoreToWin?

> `optional` **minScoreToWin?**: `number`

The minimum amount of score points that the user should get in order to be qualified for the prize

***

### hideLeaderboardsMinScores?

> `optional` **hideLeaderboardsMinScores?**: `boolean`

When enabled, users who don't meet the minimum qualifying score will be hidden from the Leaderboard.

***

### totalScores?

> `optional` **totalScores?**: `number`

Total scores across all participants in the tournament

***

### isClanBased?

> `optional` **isClanBased?**: `boolean`

Indicates if the tournament is clan-based
