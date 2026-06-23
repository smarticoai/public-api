# Interface: GamePickEventMeta

GamePickEventMeta describes metadata for a MatchX or Quiz event, including team info and sport context

## Extends

- [`QuizEventMeta`](QuizEventMeta.md)

## Properties

### answers?

> `optional` **answers?**: `object`[]

List of possible answer options for the quiz question

#### value

> **value**: `string`

Answer identifier value sent on submission

#### text

> **text**: `string`

Localized display text of the answer

#### \_translations

> **\_translations**: `object`

Per-language overrides for the answer text

##### Index Signature

\[`key`: `string`\]: `object`

#### Inherited from

[`QuizEventMeta`](QuizEventMeta.md).[`answers`](QuizEventMeta.md#answers)

***

### question\_image?

> `optional` **question\_image?**: `string`

URL of an image associated with the question

#### Inherited from

[`QuizEventMeta`](QuizEventMeta.md).[`question_image`](QuizEventMeta.md#question_image)

***

### result?

> `optional` **result?**: [`QuizAnswersValueType`](../enumerations/QuizAnswersValueType.md)

Correct answer value after resolution

#### Inherited from

[`QuizEventMeta`](QuizEventMeta.md).[`result`](QuizEventMeta.md#result)

***

### custom\_question

> **custom\_question**: `string`

Custom question text displayed to the user

#### Inherited from

[`QuizEventMeta`](QuizEventMeta.md).[`custom_question`](QuizEventMeta.md#custom_question)

***

### event\_name?

> `optional` **event\_name?**: `string`

Display name of the event/match

***

### team1\_name

> **team1\_name**: `string`

Name of the first team (home)

***

### team1\_image

> **team1\_image**: `string`

URL of the first team's logo image

***

### team2\_name

> **team2\_name**: `string`

Name of the second team (away)

***

### team2\_image

> **team2\_image**: `string`

URL of the second team's logo image

***

### team1\_result?

> `optional` **team1\_result?**: `number`

Actual result score for team 1 after resolution

***

### team2\_result?

> `optional` **team2\_result?**: `number`

Actual result score for team 2 after resolution

***

### sport\_type\_id?

> `optional` **sport\_type\_id?**: `number`

Betradar sport type ID for the event

***

### is\_canceled?

> `optional` **is\_canceled?**: `boolean`

Whether the event has been canceled

***

### auto\_resolve\_enabled?

> `optional` **auto\_resolve\_enabled?**: `boolean`

Whether auto-resolution from live data feed is enabled

***

### auto\_resolve\_date?

> `optional` **auto\_resolve\_date?**: `string`

ISO date string for when auto-resolution is expected

***

### team1\_auto\_result?

> `optional` **team1\_auto\_result?**: `number`

Auto-resolved score for team 1 from live data feed

***

### team2\_auto\_result?

> `optional` **team2\_auto\_result?**: `number`

Auto-resolved score for team 2 from live data feed

***

### auto\_result?

> `optional` **auto\_result?**: `string`

Auto-resolved answer value from live data feed (for quiz events)

***

### \_translations

> **\_translations**: `object`

Per-language overrides for team names, event name, and custom question

#### Index Signature

\[`key`: `string`\]: `object`
