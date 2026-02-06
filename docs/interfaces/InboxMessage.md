# Interface: InboxMessage

Inbox message object (raw, non-transformed).

## Properties

### createDate

• **createDate**: `string`

Message creation date (ISO string)

___

### body

• **body**: `InboxMessageBody`

Message body containing title, content, action, etc.

___

### engagement\_uid

• **engagement\_uid**: `string`

Unique message identifier (GUID)

___

### is\_read

• **is\_read**: `boolean`

Whether the message has been read

___

### is\_starred

• **is\_starred**: `boolean`

Whether the message is marked as favorite

___

### is\_deleted

• **is\_deleted**: `boolean`

Whether the message is deleted (optional)
