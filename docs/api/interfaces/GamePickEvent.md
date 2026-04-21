# Interface: GamePickEvent

GamePickEvent describes a single event (match or question) within a round, including the user's prediction and resolution

## Properties

### gp\_event\_id

> **gp\_event\_id**: `number`

Unique identifier of the event

***

### event\_resolution\_date

> **event\_resolution\_date**: `number`

Timestamp (ms) when the event was resolved, null if not yet resolved

***

### match\_date

> **match\_date**: `number`

Timestamp (ms) of the match/event start time

***

### market\_type\_id

> **market\_type\_id**: [`SAWGPMarketType`](../enumerations/SAWGPMarketType.md)

Market type defining the prediction format (e.g. two-team score, quiz question, custom)

***

### event\_meta

> **event\_meta**: [`GamePickEventMeta`](GamePickEventMeta.md)

Event metadata containing team names, images, sport type, and question details

***

### user\_placed\_bet

> **user\_placed\_bet**: `boolean`

Whether the current user has submitted a prediction for this event

***

### team1\_user\_selection?

> `optional` **team1\_user\_selection?**: `number` \| \{ `from`: `number`; `to`: `number`; \}

User's predicted score for team 1 (MatchX only). Can be a number or a range object

***

### team2\_user\_selection?

> `optional` **team2\_user\_selection?**: `number` \| \{ `from`: `number`; `to`: `number`; \}

User's predicted score for team 2 (MatchX only). Can be a number or a range object

***

### user\_selection?

> `optional` **user\_selection?**: [`QuizAnswersValueType`](../enumerations/QuizAnswersValueType.md)

User's selected answer (Quiz only). Value depends on market type (e.g. '1', '2', 'x', 'yes', 'no')

***

### resolution\_type\_id

> **resolution\_type\_id**: [`GamePickResolutionType`](../enumerations/GamePickResolutionType.md)

How the user's prediction was scored after resolution

***

### resolution\_score?

> `optional` **resolution\_score?**: `number`

Points awarded for this event based on prediction accuracy

***

### is\_open\_for\_bets?

> `optional` **is\_open\_for\_bets?**: `boolean`

Whether this event is still accepting predictions

***

### odds\_details?

> `optional` **odds\_details?**: `object`

Betting odds details for the event outcomes

#### odd\_value

> **odd\_value**: `object`

##### Index Signature

\[`key`: `string`\]: `number`

***

### question\_image?

> `optional` **question\_image?**: `string`

URL of a question-specific image (quiz events)
