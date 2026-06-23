# Interface: TInboxMessage

TInboxMessage is the lightweight envelope returned by
`_smartico.api.getInboxMessages()`. Fetch the rich body (title,
preview, icon, html_body, buttons) separately via
`_smartico.api.getInboxMessageBody(message_guid)`.

## Properties

### message\_guid

> **message\_guid**: `string`

Unique identifier of the message. Pass to `getInboxMessageBody`
and the mark / favorite / delete mutations.

***

### sent\_date

> **sent\_date**: `string`

Date-time the message was sent, as a `"dd/MM/yyyy HH:mm:ss"` string
(server local — NOT ISO-8601, so `new Date(sent_date)` will not parse it).

***

### read

> **read**: `boolean`

`true` when the message has been marked read.

***

### favorite

> **favorite**: `boolean`

`true` when the message has been starred (favorited).

***

### category\_id?

> `optional` **category\_id?**: [`InboxCategories`](../enumerations/InboxCategories.md)

Operator-assigned category ([InboxCategories](../enumerations/InboxCategories.md)).

***

### expire\_on\_dt?

> `optional` **expire\_on\_dt?**: `number`

Expiry timestamp as Unix-ms epoch. Server filters out expired
messages from list responses — consumers rarely see this set
unless the expiry is upcoming.
