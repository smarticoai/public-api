# deleteAllInboxMessages — API (InboxMarkMessageAction)

> Soft-deletes ALL of the user's inbox messages in one server round-trip — typically wired to a "Delete all" CTA in the inbox header (usually behind a confirm dialog given the destructive nature).
> Import: `import { InboxMarkMessageAction } from '@smartico/public-api'`
> Search terms: deleteAllInboxMessages, inbox, InboxMarkMessageAction

## Signature
```ts
_smartico.api.deleteAllInboxMessages(): Promise<InboxMarkMessageAction>
```

## Parameters
_None._

## Returns — `Promise<InboxMarkMessageAction>`
`InboxMarkMessageAction` (shape from the type — capture a response into `_responses/` for a real example):
- `err_code` (number) — Error code. `0` = success. See the calling method's TSDoc for the full error semantics (server returns generic codes; the five inbox mutations share the same shape).
- `err_message` (string) — Optional server-side error message. Present only on non-zero `err_code`; may be empty even then.

## Behavioral contract
**Race condition note**: a new message arriving server-side
between the call and its processing is NOT deleted (the
server's delete-all operation is a snapshot in time). Subsequent
`getInboxMessages` calls show the new message.

**Refresh after success**
Same as `deleteInboxMessage` — `getInboxMessages` `onUpdate`
does not fire automatically. Replace the local list with `[]`
(or re-call `getInboxMessages`). The unread count drops to 0
(or near-0 if races) via the user-properties channel.

**Idempotency**: safe. A second call on an already-empty inbox
returns `err_code === 0` with no-op effect.

**Side effects** (on success)
- Every message flipped to deleted server-side.
- `core_inbox_unread_count` drops to 0.
- There is no SDK undelete path — recovery requires operator
 intervention.

**UI guidance**: included in the
[UI Guide — `deleteInboxMessage`](../../docs/ui/inbox/UIGuide_deleteInboxMessage.md)
(Bulk variant section).

**Visitor mode**: not supported.

## Example
```ts
// After a confirm dialog "Are you sure you want to delete all messages?"
console.log('[smartico] delete-all confirmed — show loading state on the "Delete all" button');
const r = await window._smartico.api.deleteAllInboxMessages();
if (r.err_code === 0) {
  console.log('[smartico] inbox cleared — replace the local list with [], fire a "All messages deleted" toast, badge auto-drops to 0');
} else {
  console.error('[smartico] delete-all failed — show a non-blocking error toast:', r.err_message);
}
```

## Errors
**Error codes** (in `err_code`)
- `0` — success; the entire inbox is now empty from the user's
 view.
- other non-zero — server error. Surface `err_message` if any.

## Related
- `deleteInboxMessage`
