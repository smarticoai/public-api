# Interface: QuizEventMeta

QuizEventMeta describes metadata for a quiz-type event (custom question with answer options)

## Extended by

- [`GamePickEventMeta`](GamePickEventMeta.md)

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

***

### question\_image?

> `optional` **question\_image?**: `string`

URL of an image associated with the question

***

### result?

> `optional` **result?**: [`QuizAnswersValueType`](../enumerations/QuizAnswersValueType.md)

Correct answer value after resolution

***

### custom\_question

> **custom\_question**: `string`

Custom question text displayed to the user
