# markAllInboxMessagesAsRead — API (InboxMarkMessageAction)

> Marks ALL of the user's inbox messages as read in one server round-trip — typically wired to a "Mark all as read" CTA in the inbox header.
> Import: `import { InboxMarkMessageAction } from '@smartico/public-api'`
> Search terms: markAllInboxMessagesAsRead, inbox, InboxMarkMessageAction, err_code, err_message

## Signature
```ts
_smartico.api.markAllInboxMessagesAsRead(): Promise<InboxMarkMessageAction>
```

## Parameters
_None._

## Returns — `Promise<InboxMarkMessageAction>`
`InboxMarkMessageAction`:
- `err_code` (number) — Error code. `0` = success. See the calling method's TSDoc for the full error semantics (server returns generic codes; the five inbox mutations share the same shape).
- `err_message` (string) — Optional server-side error message. Present only on non-zero `err_code`; may be empty even then.

## Behavioral contract
**Race condition note**: a new message arriving server-side
between the call and its processing remains unread (the
server's mark-all operation is a snapshot in time). Subsequent
`getInboxMessages` calls show the new message as unread.

**Refresh after success**
Same as `markInboxMessageAsRead` — `getInboxMessages`
`onUpdate` does NOT fire automatically, but the unread-count
channel does (the badge will drop to 0, or to the count of any
new messages that arrived during processing).

**Idempotency**: safe. A second call on an already-all-read
inbox returns `err_code === 0` with no-op effect.

**Side effects** (on success)
- Every unread message flipped to read.
- `core_inbox_unread_count` drops to 0 (or near 0 if races).

**UI guidance**: included in the
[UI Guide — `markInboxMessageAsRead`](../../docs/ui/inbox/UIGuide_markInboxMessageAsRead.md)
(Bulk variant section).

**Visitor mode**: not supported.

## Example
```ts
console.log('[smartico] mark-all-read starting — set in-flight flag on the "Mark all read" button, show loading dots');
const r = await window._smartico.api.markAllInboxMessagesAsRead();
console.log('[smartico] mark-all-read response — clear in-flight flag');
if (r.err_code === 0) {
  console.log('[smartico] all messages marked read — optimistically flip every local read indicator; badge auto-drops via user-properties channel');
} else {
  console.error('[smartico] mark-all failed — surface a non-blocking error:', r.err_message);
}
```

### Example response (REAL shape)
```json
{
  "err_code": 0,
  "err_message": ""
}
```

## Errors
**Error codes** (in `err_code`)
- `0` — success; all currently-unread messages flipped to read.
- other non-zero — server error. Surface `err_message` if any.

## Related
- `markInboxMessageAsRead`
