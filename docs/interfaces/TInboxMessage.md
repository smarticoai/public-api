# Interface: TInboxMessage

## Properties

### message\_guid

• **message\_guid**: `string`

Uniq identifier of the message. It is needed to request the message body, mark the message as read/deleted/favorite.

___

### sent\_date

• **sent\_date**: `string`

Date when the message was sent

___

### read

• **read**: `boolean`

Indicator if a message is read

___

### favorite

• **favorite**: `boolean`

Indicator if a message is added to favorites

___

### category_id

• **category_id**: `InboxCategories`

Category id per inbox message, can be part of System inboxes, Personal inboxes or General inbox messages
