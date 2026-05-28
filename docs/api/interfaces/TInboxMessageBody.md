# Interface: TInboxMessageBody

TInboxMessageBody is the rich body of one inbox message.
Returned by `_smartico.api.getInboxMessageBody(message_guid)`.
Fetched from a CDN (not over WebSocket).

## Properties

### title

> **title**: `string`

Display title.

***

### preview\_body

> **preview\_body**: `string`

Short preview text (typically rendered alongside the title in list items).

***

### icon

> **icon**: `string`

Message icon URL (128×128 px recommended).

***

### action

> **action**: `string`

Click-action — either a deep-link (e.g. `'dp:deposit'`) or a
plain URL. The literal `'dp:inbox'` indicates the message has a
rich `html_body`; for any other value `html_body` and `buttons`
are absent. Pass to `_smartico.dp(action)` for safe execution.

***

### html\_body?

> `optional` **html\_body?**: `string`

Rich HTML body. Populated only when `action === 'dp:inbox'`.

***

### buttons?

> `optional` **buttons?**: `object`[]

Up to 2 additional action buttons. Populated only when
`action === 'dp:inbox'`.

#### action

> **action**: `string`

Button click-action (deep-link or URL).

#### text

> **text**: `string`

Button label.

***

### custom\_data?

> `optional` **custom\_data?**: `string`

Operator-defined custom data. The SDK auto-parses JSON-looking
strings, so at runtime this is `any` despite the `string` type.
