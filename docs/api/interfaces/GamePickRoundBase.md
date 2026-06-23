# Interface: GamePickRoundBase

GamePickRoundBase describes a game round's metadata (without events or user-specific data)

## Extended by

- [`GamePickRound`](GamePickRound.md)
- [`GamePickRoundBoard`](GamePickRoundBoard.md)

## Properties

### round\_id

> **round\_id**: `number`

Unique round identifier

***

### round\_row\_id

> **round\_row\_id**: `number`

Sequential row ID used for ordering rounds

***

### round\_name

> **round\_name**: `string`

Localized display name of the round

***

### round\_description

> **round\_description**: `string`

Localized description of the round

***

### final\_screen\_cta\_button\_title

> **final\_screen\_cta\_button\_title**: `string`

Label for the CTA button on the final/results screen

***

### final\_screen\_message

> **final\_screen\_message**: `string`

Message displayed on the final/results screen

***

### final\_screen\_image\_desktop

> **final\_screen\_image\_desktop**: `string`

URL of the final screen image (desktop)

***

### final\_screen\_image\_mobile

> **final\_screen\_image\_mobile**: `string`

URL of the final screen image (mobile)

***

### promo\_image

> **promo\_image**: `string`

URL of the promotional image for the round

***

### promo\_text

> **promo\_text**: `string`

Promotional text displayed with the round

***

### open\_date

> **open\_date**: `number`

Timestamp (ms) when the round opens for participation

***

### last\_bet\_date

> **last\_bet\_date**: `number`

Timestamp (ms) of the last moment bets are accepted

***

### resolution\_date

> **resolution\_date**: `number`

Timestamp (ms) when the round is expected to be resolved

***

### score\_full\_win

> **score\_full\_win**: `number`

Points awarded for a fully correct prediction

***

### score\_part\_win

> **score\_part\_win**: `number`

Points awarded for a partially correct prediction

***

### score\_lost

> **score\_lost**: `number`

Points awarded (or deducted) for an incorrect prediction

***

### is\_active\_now

> **is\_active\_now**: `boolean`

Whether the round is currently active for participation

***

### is\_resolved

> **is\_resolved**: `boolean`

Whether the round has been fully resolved and scored

***

### round\_status\_id

> **round\_status\_id**: [`GPRoundStatus`](../enumerations/GPRoundStatus.md)

Current lifecycle status of the round

***

### events\_total

> **events\_total**: `number`

Total number of events in the round

***

### events\_resolved

> **events\_resolved**: `number`

Number of events that have been resolved

***

### score\_type\_id

> **score\_type\_id**: [`GamePickScoreType`](../enumerations/GamePickScoreType.md)

Scoring method used for this round

***

### order\_events

> **order\_events**: [`GameRoundOrderType`](../enumerations/GameRoundOrderType.md)

How events are ordered for display

***

### board\_users\_count

> **board\_users\_count**: `number`

Maximum number of users shown on the leaderboard

***

### hide\_users\_predictions

> **hide\_users\_predictions**: `boolean`

Whether other users' predictions are hidden until resolution

***

### public\_meta

> **public\_meta**: [`GamePickRoundPublicMeta`](GamePickRoundPublicMeta.md)

Public metadata including translations and display settings from the BackOffice

***

### next\_round\_open\_date

> **next\_round\_open\_date**: `number`

Timestamp (ms) when the next round opens, if available

***

### show\_users\_preference

> **show\_users\_preference**: `boolean`

Whether to show aggregated user preference percentages for each outcome
