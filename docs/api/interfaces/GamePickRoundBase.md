# Interface: GamePickRoundBase

GamePickRoundBase describes a game round's metadata (without events or user-specific data)

## Hierarchy

- **`GamePickRoundBase`**

  ↳ [`GamePickRound`](GamePickRound.md)

  ↳ [`GamePickRoundBoard`](GamePickRoundBoard.md)

## Properties

### round\_id

• **round\_id**: `number`

Unique round identifier

___

### round\_row\_id

• **round\_row\_id**: `number`

Sequential row ID used for ordering rounds

___

### round\_name

• **round\_name**: `string`

Localized display name of the round

___

### round\_description

• **round\_description**: `string`

Localized description of the round

___

### final\_screen\_cta\_button\_title

• **final\_screen\_cta\_button\_title**: `string`

Label for the CTA button on the final/results screen

___

### final\_screen\_message

• **final\_screen\_message**: `string`

Message displayed on the final/results screen

___

### final\_screen\_image\_desktop

• **final\_screen\_image\_desktop**: `string`

URL of the final screen image (desktop)

___

### final\_screen\_image\_mobile

• **final\_screen\_image\_mobile**: `string`

URL of the final screen image (mobile)

___

### promo\_image

• **promo\_image**: `string`

URL of the promotional image for the round

___

### promo\_text

• **promo\_text**: `string`

Promotional text displayed with the round

___

### open\_date

• **open\_date**: `number`

Timestamp (ms) when the round opens for participation

___

### last\_bet\_date

• **last\_bet\_date**: `number`

Timestamp (ms) of the last moment bets are accepted

___

### resolution\_date

• **resolution\_date**: `number`

Timestamp (ms) when the round is expected to be resolved

___

### score\_full\_win

• **score\_full\_win**: `number`

Points awarded for a fully correct prediction

___

### score\_part\_win

• **score\_part\_win**: `number`

Points awarded for a partially correct prediction

___

### score\_lost

• **score\_lost**: `number`

Points awarded (or deducted) for an incorrect prediction

___

### is\_active\_now

• **is\_active\_now**: `boolean`

Whether the round is currently active for participation

___

### is\_resolved

• **is\_resolved**: `boolean`

Whether the round has been fully resolved and scored

___

### round\_status\_id

• **round\_status\_id**: [`GPRoundStatus`](../enums/GPRoundStatus.md)

Current lifecycle status of the round

___

### events\_total

• **events\_total**: `number`

Total number of events in the round

___

### events\_resolved

• **events\_resolved**: `number`

Number of events that have been resolved

___

### score\_type\_id

• **score\_type\_id**: [`GamePickScoreType`](../enums/GamePickScoreType.md)

Scoring method used for this round

___

### order\_events

• **order\_events**: [`GameRoundOrderType`](../enums/GameRoundOrderType.md)

How events are ordered for display

___

### board\_users\_count

• **board\_users\_count**: `number`

Maximum number of users shown on the leaderboard

___

### hide\_users\_predictions

• **hide\_users\_predictions**: `boolean`

Whether other users' predictions are hidden until resolution

___

### public\_meta

• **public\_meta**: [`GamePickRoundPublicMeta`](GamePickRoundPublicMeta.md)

Public metadata including translations and display settings from the BackOffice

___

### next\_round\_open\_date

• **next\_round\_open\_date**: `number`

Timestamp (ms) when the next round opens, if available

___

### show\_users\_preference

• **show\_users\_preference**: `boolean`

Whether to show aggregated user preference percentages for each outcome
