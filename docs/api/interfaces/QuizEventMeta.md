# Interface: QuizEventMeta

QuizEventMeta describes metadata for a quiz-type event (custom question with answer options)

## Hierarchy

- **`QuizEventMeta`**

  ↳ [`GamePickEventMeta`](GamePickEventMeta.md)

## Properties

### answers

• `Optional` **answers**: \{ `value`: `string` ; `text`: `string` ; `_translations`: \{ `[key: string]`: \{ `text`: `string`  };  }  }[]

List of possible answer options for the quiz question

___

### question\_image

• `Optional` **question\_image**: `string`

URL of an image associated with the question

___

### result

• `Optional` **result**: [`QuizAnswersValueType`](../enums/QuizAnswersValueType.md)

Correct answer value after resolution

___

### custom\_question

• **custom\_question**: `string`

Custom question text displayed to the user
