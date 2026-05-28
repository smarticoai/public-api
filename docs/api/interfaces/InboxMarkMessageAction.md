# Interface: InboxMarkMessageAction

InboxMarkMessageAction is the response of the five inbox mutation
methods (`markInboxMessageAsRead`, `markAllInboxMessagesAsRead`,
`markUnmarkInboxMessageAsFavorite`, `deleteInboxMessage`,
`deleteAllInboxMessages`).

## Properties

### err\_code

> **err\_code**: `number`

Error code. `0` = success. See the calling method's TSDoc for
the full error semantics (server returns generic codes; the
five inbox mutations share the same shape).

***

### err\_message

> **err\_message**: `string`

Optional server-side error message. Present only on non-zero
`err_code`; may be empty even then.
