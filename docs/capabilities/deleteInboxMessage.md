# deleteInboxMessage — API (InboxMarkMessageAction)

> Soft-deletes a single inbox message.
> Import: `import { InboxMarkMessageAction } from '@smartico/public-api'`
> Search terms: deleteInboxMessage, inbox, InboxMarkMessageAction

## Signature
```ts
_smartico.api.deleteInboxMessage(messageGuid: string): Promise<InboxMarkMessageAction>
```

## Parameters
- `messageGuid` — The `message_guid` from a `TInboxMessage`.

## Returns — `Promise<InboxMarkMessageAction>`
`InboxMarkMessageAction` (shape from the type — capture a response into `_responses/` for a real example):
- `err_code` (number) — Error code. `0` = success. See the calling method's TSDoc for the full error semantics (server returns generic codes; the five inbox mutations share the same shape).
- `err_message` (string) — Optional server-side error message. Present only on non-zero `err_code`; may be empty even then.

## Behavioral contract
**Refresh after success**
The SDK does NOT auto-refresh `getInboxMessages`. Drop the
deleted message from your local list, or re-call
`getInboxMessages` to reload. If the deleted message was unread,
the unread count drops automatically via the user-properties
channel.

**Idempotency**: safe. A second call on an already-deleted
`messageGuid` returns `err_code === 0` (server treats it as a
no-op — already-deleted messages are filtered out).

**Side effects** (on success)
- Server-side `is_deleted` flag set to true.
- If the message was unread, `core_inbox_unread_count`
 decrements via the user-properties channel.

**UI guidance**: see [UI Guide — `deleteInboxMessage`](../../docs/ui/inbox/UIGuide_deleteInboxMessage.md).

**Visitor mode**: not supported.

## Example
```ts
// Swipe-to-delete on mobile; trash-icon click on desktop.
console.log('[smartico] delete starting — animate the row out of the list (slide left/right by 100%)');
const r = await window._smartico.api.deleteInboxMessage(message.message_guid);
if (r.err_code === 0) {
  console.log('[smartico] deleted — drop the message from the local list, fire a brief "Message deleted" toast (no undo affordance — there is no undelete via the SDK)');
} else {
  console.error('[smartico] delete failed — animate the row back into place and show a non-blocking error:', r.err_message);
}
```

## Errors
**Error codes** (in `err_code`)
- `0` — success; the message is now deleted from the user's
 view.
- other non-zero — server error. Surface `err_message` if any.

## Related
- `getInboxMessages`
