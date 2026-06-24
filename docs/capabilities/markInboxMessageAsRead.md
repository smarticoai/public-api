# markInboxMessageAsRead — API (InboxMarkMessageAction)

> Marks a single inbox message as read.
> Import: `import { InboxMarkMessageAction } from '@smartico/public-api'`
> Search terms: markInboxMessageAsRead, inbox, InboxMarkMessageAction, err_code, err_message

## Signature
```ts
_smartico.api.markInboxMessageAsRead(messageGuid: string): Promise<InboxMarkMessageAction>
```

## Parameters
- `messageGuid` — The `message_guid` from a `TInboxMessage`.

## Returns — `Promise<InboxMarkMessageAction>`
`InboxMarkMessageAction`:
- `err_code` (number) — Error code. `0` = success. See the calling method's TSDoc for the full error semantics (server returns generic codes; the five inbox mutations share the same shape).
- `err_message` (string) — Optional server-side error message. Present only on non-zero `err_code`; may be empty even then.

## Behavioral contract
**Refresh after success**
The SDK does NOT auto-refresh `getInboxMessages` (no
`onUpdate` callback fires after this mutation). The unread-count
channel (`getInboxUnreadCount`, `core_inbox_unread_count`)
DOES auto-update — subscribers to it see the new count
automatically. If your inbox list UI shows the `read` field, you
have two options: re-call `getInboxMessages` after the mutation,
or update the local copy optimistically.

**Idempotency**: safe. Repeated calls return `err_code === 0`.

**Side effects** (on success)
- Server-side `is_read` flag set to true.
- Server-side `core_inbox_unread_count` decremented (if the
 message was previously unread).

**UI guidance**: see [UI Guide — `markInboxMessageAsRead`](../../docs/ui/inbox/UIGuide_markInboxMessageAsRead.md).

**Visitor mode**: not supported.

## Example
```ts
const r = await window._smartico.api.markInboxMessageAsRead(message.message_guid);
if (r.err_code === 0) {
  console.log('[smartico] marked as read — optimistically flip the local read indicator; the inbox badge auto-decrements via the user-properties channel');
} else {
  console.error('[smartico] mark-as-read failed — keep the local state as-is and show a non-blocking error if appropriate:', r.err_message);
}
```

### Example response (REAL shape)
> Where this real payload differs from the typed Returns above (TS interface vs raw wire), the REAL shape is the runtime truth.
```json
{
  "err_code": 0,
  "err_message": ""
}
```

## Errors
**Error codes** (in `err_code`)
- `0` — success; the message is now marked read. Idempotent — a
 second call on the same `messageGuid` also returns `0`.
- other non-zero — server error. Surface `err_message` if any.

## Related
- `getInboxUnreadCount`
- `getUserProfile`
- `getInboxMessages`
