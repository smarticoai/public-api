# Interface: TInboxMessageBody

## Properties

### title

> **title**: `string`

Message title

***

### preview\_body

> **preview\_body**: `string`

Short preview body of the message

***

### icon

> **icon**: `string`

Message icon, 128x128px

***

### action

> **action**: `string`

The action that should be performed when user clicks on the message.
Can be URL or deep link, e.g. 'dp:deposit'. The most safe to execute CTA is to pass it to _smartico.dp(cta_action);
The 'dp' function will handle the CTA and will execute it in the most safe way.
If the message has a rich html body - the action will always be 'dp:inbox' which will open the inbox widget when triggered.

***

### html\_body?

> `optional` **html\_body?**: `string`

Rich HTML body of the message.

***

### buttons?

> `optional` **buttons?**: `object`[]

Optional additional buttons to show in the message, available only if message has rich HTML body. Max count - 2.

#### action

> **action**: `string`

The action that should be performed when user clicks on the button. The logic is the same as for message actions

#### text

> **text**: `string`

Button text

***

### custom\_data?

> `optional` **custom\_data?**: `string`

The custom data of the inbox message defined by operator. Can be a JSON object, string or number
