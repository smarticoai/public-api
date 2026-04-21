# Interface: TAvatarPrompt

TAvatarPrompt describes an AI style prompt available for avatar customization.
Fields from the raw `public_meta` object are flattened to the top level.

## Properties

### prompt\_id

> **prompt\_id**: `number`

Unique identifier of the AI customization prompt

***

### name

> **name**: `string`

Display name of the prompt style, e.g. "Cartoon", "Watercolor" (from public_meta)

***

### icon\_url

> **icon\_url**: `string`

Full CDN URL of the prompt style icon image (from public_meta)

***

### cost\_currency\_type\_id

> **cost\_currency\_type\_id**: `number`

Currency type used to pay for this customization (0=points, 1=gems, 2=diamonds)

***

### cost\_value

> **cost\_value**: `number`

Cost amount in the given currency
