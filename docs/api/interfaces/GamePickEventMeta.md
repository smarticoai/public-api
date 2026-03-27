# Interface: GamePickEventMeta

GamePickEventMeta describes metadata for a MatchX or Quiz event, including team info and sport context

## Hierarchy

- [`QuizEventMeta`](QuizEventMeta.md)

  ↳ **`GamePickEventMeta`**

## Properties

### answers

• `Optional` **answers**: \{ `value`: `string` ; `text`: `string` ; `_translations`: \{ `[key: string]`: \{ `text`: `string`  };  }  }[]

List of possible answer options for the quiz question

#### Inherited from

[QuizEventMeta](QuizEventMeta.md).[answers](QuizEventMeta.md#answers)

___

### question\_image

• `Optional` **question\_image**: `string`

URL of an image associated with the question

#### Inherited from

[QuizEventMeta](QuizEventMeta.md).[question_image](QuizEventMeta.md#question_image)

___

### result

• `Optional` **result**: [`QuizAnswersValueType`](../enums/QuizAnswersValueType.md)

Correct answer value after resolution

#### Inherited from

[QuizEventMeta](QuizEventMeta.md).[result](QuizEventMeta.md#result)

___

### custom\_question

• **custom\_question**: `string`

Custom question text displayed to the user

#### Inherited from

[QuizEventMeta](QuizEventMeta.md).[custom_question](QuizEventMeta.md#custom_question)

___

### event\_name

• `Optional` **event\_name**: `string`

Display name of the event/match

___

### team1\_name

• **team1\_name**: `string`

Name of the first team (home)

___

### team1\_image

• **team1\_image**: `string`

URL of the first team's logo image

___

### team2\_name

• **team2\_name**: `string`

Name of the second team (away)

___

### team2\_image

• **team2\_image**: `string`

URL of the second team's logo image

___

### team1\_result

• `Optional` **team1\_result**: `number`

Actual result score for team 1 after resolution

___

### team2\_result

• `Optional` **team2\_result**: `number`

Actual result score for team 2 after resolution

___

### sport\_type\_id

• `Optional` **sport\_type\_id**: `number`

Betradar sport type ID for the event

___

### is\_canceled

• `Optional` **is\_canceled**: `boolean`

Whether the event has been canceled

___

### auto\_resolve\_enabled

• `Optional` **auto\_resolve\_enabled**: `boolean`

Whether auto-resolution from live data feed is enabled

___

### auto\_resolve\_date

• `Optional` **auto\_resolve\_date**: `string`

ISO date string for when auto-resolution is expected

___

### team1\_auto\_result

• `Optional` **team1\_auto\_result**: `number`

Auto-resolved score for team 1 from live data feed

___

### team2\_auto\_result

• `Optional` **team2\_auto\_result**: `number`

Auto-resolved score for team 2 from live data feed

___

### auto\_result

• `Optional` **auto\_result**: `string`

Auto-resolved answer value from live data feed (for quiz events)

___

### \_translations

• **\_translations**: `Object`

Per-language overrides for team names, event name, and custom question

#### Index signature

▪ [key: `string`]: \{ `team1_name`: `string` ; `team2_name`: `string` ; `event_name`: `string` ; `custom_question`: `string`  }
