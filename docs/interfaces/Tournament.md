# Interface: Tournament

Tournament object (raw, non-transformed).

## Properties

### tournamentId

• **tournamentId**: `number`

ID of tournament template

___

### tournamentInstanceId

• **tournamentInstanceId**: `number`

ID of tournament instance. Generated every time when tournament based on specific template is scheduled for run

___

### tournamentType

• **tournamentType**: `number`

Type of the tournament

___

### publicMeta

• **publicMeta**: `TournamentPublicMeta`

Meta information about tournament that should be used to build UI

___

### buyInAmount

• **buyInAmount**: `number`

Cost of registration in the tournament in gamification points

___

### startTime

• **startTime**: `string`

The time when tournament is going to start (ISO string)

___

### endTime

• **endTime**: `string`

The time when tournament is going to finish (ISO string)

___

### startTimeTs

• **startTimeTs**: `number`

The time when tournament is going to start (Unix timestamp)

___

### endTimeTs

• **endTimeTs**: `number`

The time when tournament is going to finish (Unix timestamp)

___

### registrationCount

• **registrationCount**: `number`

Number of users registered in the tournament

___

### registrationType

• **registrationType**: `number`

Type of registration in the tournament

___

### tournamentRegistrationStatus

• **tournamentRegistrationStatus**: `number`

Status of registration in the tournament for current user

___

### tournamentInstanceStatus

• **tournamentInstanceStatus**: `number`

Status of tournament instance

___

### isUserRegistered

• **isUserRegistered**: `boolean`

Flag indicating if current user is registered in the tournament

___

### allowLateRegistration

• **allowLateRegistration**: `boolean`

Indicator if tournament allows later registration when tournament is already started

___

### playersMinCount

• **playersMinCount**: `number`

Minimum number of participants for this tournament

___

### playersMaxCount

• **playersMaxCount**: `number`

Maximum number of participants for this tournament

___

### durationMs

• **durationMs**: `number`

Tournament duration in milliseconds

___

### prizeStructure

• **prizeStructure**: `object`

Prizes structure with array of TournamentPrize objects

___

### tournamentPlayer

• **tournamentPlayer**: `TournamentPlayer`

Information about current user in tournament

___

### related\_games

• **related\_games**: `AchRelatedGame[]`

List of casino games related to the tournament

___

### minScoreToWin

• **minScoreToWin**: `number`

Minimum score points required to qualify for a prize

___

### hideLeaderboardsMinScores

• **hideLeaderboardsMinScores**: `boolean`

When enabled, users who don't meet minimum qualifying score are hidden from Leaderboard
