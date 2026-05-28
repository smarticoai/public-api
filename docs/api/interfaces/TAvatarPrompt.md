# Interface: TAvatarPrompt

One AI style prompt for avatar customization. Returned by `getAvatarPrompts()`.
Fields from the raw `public_meta` object are flattened to the top level.

## Properties

### prompt\_id

> **prompt\_id**: `number`

Stable numeric identifier of the prompt.

***

### name

> **name**: `string`

Display name of the style, e.g. "Cartoon", "Watercolor".

***

### icon\_url

> **icon\_url**: `string`

Absolute CDN URL of the prompt's preview icon.

***

### cost\_currency\_type\_id

> **cost\_currency\_type\_id**: `number`

Currency used to pay for the customization. `0` = points, `1` = gems, `2` = diamonds.

***

### cost\_value

> **cost\_value**: `number`

Cost amount in the currency named by `cost_currency_type_id`.
