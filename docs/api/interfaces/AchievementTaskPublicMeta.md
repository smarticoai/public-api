# Interface: AchievementTaskPublicMeta

## Properties

### name?

> `optional` **name?**: `string`

***

### display\_progress\_as\_count?

> `optional` **display\_progress\_as\_count?**: `boolean`

***

### stage\_image?

> `optional` **stage\_image?**: `string`

***

### priority?

> `optional` **priority?**: `number`

***

### user\_state\_operations?

> `optional` **user\_state\_operations?**: `object`

#### Index Signature

\[`key`: `string`\]: `object`

***

### prop\_to\_prop\_multiplier?

> `optional` **prop\_to\_prop\_multiplier?**: `number`

Multiplier for a task whose target is relative to the player's recommended deposit or bet amount (target = multiplier × recommended amount). Used to fill the `{{suggested_amount}}` tag in the task texts.
