# Class: WSAPIInbox
## Methods

### reportImpressionEvent()

> **reportImpressionEvent**(`params`): `void`

Reports an impression event for an engagement (when engagement content is displayed to the user).
Use this method to track when users view engagement content such as inbox messages, popups.
When using for Inbox cases, you need to use message guid as engagement_uid, and pass 31 as activityType.

**Example**:
```
_smartico.api.reportImpressionEvent({
     engagement_uid: 'abc123-def456',
     activityType: 31 // Inbox
});
```

**Visitor mode: not supported**

#### Parameters

##### params

Event parameters

###### engagement_uid

`string`

Unique identifier for the engagement

###### activityType

`number`

Type of engagement activity (Popup=30, Inbox=31)

#### Returns

`void`

***

### reportClickEvent()

> **reportClickEvent**(`params`): `void`

Reports a click/action event for an engagement (when user interacts with engagement content).
Use this method to track when users click on or interact with engagement content such as inbox messages, popups.
When using for Inbox cases, you need to use message guid as engagement_uid, and pass 31 as activityType, and pass the action/deeplink that was triggered by the user interaction as action.

**Example**:
```
_smartico.api.reportClickEvent({
     engagement_uid: 'abc123-def456',
     activityType: 31 // Inbox
     action: 'dp:gf_missions'
});
```

**Visitor mode: not supported**

#### Parameters

##### params

Event parameters

###### engagement_uid

`string`

Unique identifier for the engagement

###### activityType

`number`

Type of engagement activity (Popup=30, Inbox=31)

###### action?

`string`

Optional action/deeplink that was triggered by the user interaction

#### Returns

`void`

***

### getInboxMessages()

> **getInboxMessages**(`params?`): `Promise`\<[`TInboxMessage`](../interfaces/TInboxMessage.md)[]\>

Returns inbox messages based on the provided parameters. "From" and "to" indicate the range of messages to be fetched.
The maximum number of messages per request is limited to 20. 
An indicator "onlyFavorite" can be passed to get only messages marked as favorites.
An indicator "read_status" can be passed to get only messages marked as read or unread.
You can leave this params empty and by default it will return list of messages ranging from 0 to 20.
This function returns a list of messages without the body of each message.
To get the body of the message you need to call getInboxMessageBody function and pass the message guid contained in each message of this request.
All other action like mark as read, favorite, delete, etc. can be done using this message GUID.
The "onUpdate" callback will be triggered when the user receives a new message. It will provide an updated list of messages, ranging from 0 to 20, to the onUpdate callback function.

**Visitor mode: not supported**

#### Parameters

##### params?

###### from?

`number`

###### to?

`number`

###### onlyFavorite?

`boolean`

###### categoryId?

[`InboxCategories`](../enumerations/InboxCategories.md)

###### read_status?

[`InboxReadStatus`](../enumerations/InboxReadStatus.md)

###### onUpdate?

(`data`) => `void`

#### Returns

`Promise`\<[`TInboxMessage`](../interfaces/TInboxMessage.md)[]\>

***

### getInboxUnreadCount()

> **getInboxUnreadCount**(`params?`): `Promise`\<`number`\>

Returns inbox unread count.

**Visitor mode: not supported**

#### Parameters

##### params?

###### onUpdate?

(`unread_count`) => `void`

#### Returns

`Promise`\<`number`\>

***

### getInboxMessageBody()

> **getInboxMessageBody**(`messageGuid`): `Promise`\<[`TInboxMessageBody`](../interfaces/TInboxMessageBody.md)\>

Returns the message body of the specified message guid.

**Visitor mode: not supported**

#### Parameters

##### messageGuid

`string`

#### Returns

`Promise`\<[`TInboxMessageBody`](../interfaces/TInboxMessageBody.md)\>

***

### markInboxMessageAsRead()

> **markInboxMessageAsRead**(`messageGuid`): `Promise`\<[`InboxMarkMessageAction`](../interfaces/InboxMarkMessageAction.md)\>

Requests to mark inbox message with specified guid as read

**Visitor mode: not supported**

#### Parameters

##### messageGuid

`string`

#### Returns

`Promise`\<[`InboxMarkMessageAction`](../interfaces/InboxMarkMessageAction.md)\>

***

### markAllInboxMessagesAsRead()

> **markAllInboxMessagesAsRead**(): `Promise`\<[`InboxMarkMessageAction`](../interfaces/InboxMarkMessageAction.md)\>

Requests to mark all inbox messages as read

**Visitor mode: not supported**

#### Returns

`Promise`\<[`InboxMarkMessageAction`](../interfaces/InboxMarkMessageAction.md)\>

***

### markUnmarkInboxMessageAsFavorite()

> **markUnmarkInboxMessageAsFavorite**(`messageGuid`, `mark`): `Promise`\<[`InboxMarkMessageAction`](../interfaces/InboxMarkMessageAction.md)\>

Requests to mark inbox message with specified guid as favorite. Pass mark true to add message to favorite and false to remove.

**Visitor mode: not supported**

#### Parameters

##### messageGuid

`string`

##### mark

`boolean`

#### Returns

`Promise`\<[`InboxMarkMessageAction`](../interfaces/InboxMarkMessageAction.md)\>

***

### deleteInboxMessage()

> **deleteInboxMessage**(`messageGuid`): `Promise`\<[`InboxMarkMessageAction`](../interfaces/InboxMarkMessageAction.md)\>

Requests to delete inbox message

**Visitor mode: not supported**

#### Parameters

##### messageGuid

`string`

#### Returns

`Promise`\<[`InboxMarkMessageAction`](../interfaces/InboxMarkMessageAction.md)\>

***

### deleteAllInboxMessages()

> **deleteAllInboxMessages**(): `Promise`\<[`InboxMarkMessageAction`](../interfaces/InboxMarkMessageAction.md)\>

Requests to delete all inbox messages

**Visitor mode: not supported**

#### Returns

`Promise`\<[`InboxMarkMessageAction`](../interfaces/InboxMarkMessageAction.md)\>

***
