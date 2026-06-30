# Interface: GamePickEvent

GamePickEvent describes a single event (match or question) within a round, including the user's prediction and resolution

## Properties

### gp\_event\_id

> **gp\_event\_id**: `number`

Unique identifier of the event

***

### event\_resolution\_date

> **event\_resolution\_date**: `string`

ISO 8601 date-time string when the event was resolved; null until resolved.

***

### match\_date

> **match\_date**: `string`

ISO 8601 date-time string of the match/event start time.

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

Per-outcome numbers keyed by the outcome value (`'1'` / `'x'` / `'2'`, `'yes'` / `'no'`, …).
Dual-purpose by event type:
- Sports / MatchX: decimal **betting odds** (e.g. `{ "1": 2.45, "x": 3.26, "2": 3.01 }`).
- Quiz: when the round's `show_users_preference` is `true`, these are aggregated
  **user-preference percentages** — what other users predicted, summing to ~100
  (e.g. `{ "1": 33, "x": 25, "2": 42 }`). Render as the "what others predicted" bar.

#### odd\_value

> **odd\_value**: `object`

##### Index Signature

\[`key`: `string`\]: `number`

***

### question\_image?

> `optional` **question\_image?**: `string`

URL of a question-specific image (quiz events)
