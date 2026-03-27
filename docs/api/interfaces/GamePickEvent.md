# Interface: GamePickEvent

GamePickEvent describes a single event (match or question) within a round, including the user's prediction and resolution

## Properties

### gp\_event\_id

• **gp\_event\_id**: `number`

Unique identifier of the event

___

### event\_resolution\_date

• **event\_resolution\_date**: `number`

Timestamp (ms) when the event was resolved, null if not yet resolved

___

### match\_date

• **match\_date**: `number`

Timestamp (ms) of the match/event start time

___

### market\_type\_id

• **market\_type\_id**: [`SAWGPMarketType`](../enums/SAWGPMarketType.md)

Market type defining the prediction format (e.g. two-team score, quiz question, custom)

___

### event\_meta

• **event\_meta**: [`GamePickEventMeta`](GamePickEventMeta.md)

Event metadata containing team names, images, sport type, and question details

___

### user\_placed\_bet

• **user\_placed\_bet**: `boolean`

Whether the current user has submitted a prediction for this event

___

### team1\_user\_selection

• `Optional` **team1\_user\_selection**: `number` \| \{ `from`: `number` ; `to`: `number`  }

User's predicted score for team 1 (MatchX only). Can be a number or a range object

___

### team2\_user\_selection

• `Optional` **team2\_user\_selection**: `number` \| \{ `from`: `number` ; `to`: `number`  }

User's predicted score for team 2 (MatchX only). Can be a number or a range object

___

### user\_selection

• `Optional` **user\_selection**: [`QuizAnswersValueType`](../enums/QuizAnswersValueType.md)

User's selected answer (Quiz only). Value depends on market type (e.g. '1', '2', 'x', 'yes', 'no')

___

### resolution\_type\_id

• **resolution\_type\_id**: [`GamePickResolutionType`](../enums/GamePickResolutionType.md)

How the user's prediction was scored after resolution

___

### resolution\_score

• `Optional` **resolution\_score**: `number`

Points awarded for this event based on prediction accuracy

___

### is\_open\_for\_bets

• `Optional` **is\_open\_for\_bets**: `boolean`

Whether this event is still accepting predictions

___

### odds\_details

• `Optional` **odds\_details**: `Object`

Betting odds details for the event outcomes

#### Type declaration

| Name | Type |
| :------ | :------ |
| `odd_value` | \{ `[key: string]`: `number`;  } |

___

### question\_image

• `Optional` **question\_image**: `string`

URL of a question-specific image (quiz events)
