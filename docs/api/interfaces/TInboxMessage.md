# Interface: TInboxMessage

## Properties

### message\_guid

> **message\_guid**: `string`

Uniq identifier of the message. It is needed to request the message body, mark the message as read/deleted/favorite.

***

### sent\_date

> **sent\_date**: `string`

Date when the message was sent

***

### read

> **read**: `boolean`

Indicator if a message is read

***

### favorite

> **favorite**: `boolean`

Indicator if a message is added to favorites

***

### category\_id?

> `optional` **category\_id?**: [`InboxCategories`](../enumerations/InboxCategories.md)

Category id per inbox message, can be part of System inboxes, Personal inboxes or General inbox messages

***

### expire\_on\_dt?

> `optional` **expire\_on\_dt?**: `number`

The epoch timestamp, with milliseconds, when the message is going to be expired
