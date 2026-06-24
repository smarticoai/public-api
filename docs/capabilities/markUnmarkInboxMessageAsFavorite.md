# markUnmarkInboxMessageAsFavorite — API (InboxMarkMessageAction)

> Toggles a message's favorite (starred) state — pass `mark: true` to favorite, `mark: false` to unfavorite.
> Import: `import { InboxMarkMessageAction } from '@smartico/public-api'`
> Search terms: markUnmarkInboxMessageAsFavorite, inbox, InboxMarkMessageAction, err_code, err_message

## Signature
```ts
_smartico.api.markUnmarkInboxMessageAsFavorite(messageGuid: string, mark: boolean): Promise<InboxMarkMessageAction>
```

## Parameters
- `messageGuid` — The `message_guid` from a `TInboxMessage`.
- `mark` — `true` to favorite, `false` to unfavorite.

## Returns — `Promise<InboxMarkMessageAction>`
`InboxMarkMessageAction`:
- `err_code` (number) — Error code. `0` = success. See the calling method's TSDoc for the full error semantics (server returns generic codes; the five inbox mutations share the same shape).
- `err_message` (string) — Optional server-side error message. Present only on non-zero `err_code`; may be empty even then.

## Behavioral contract
**Refresh after success**
The SDK does NOT auto-refresh `getInboxMessages`. To
reflect the new state in the UI, update the local copy of the
affected `TInboxMessage` (set `favorite` to the new value) or
re-call `getInboxMessages`.

**Idempotency**: safe. `mark: true` on an already-favorite
message returns `err_code === 0` (no-op). Same for `mark: false`
on a non-favorite.

**Side effects** (on success)
- Server-side `is_starred` flag set to the requested value.
- No effect on read state, unread count, or other fields.

**UI guidance**: see [UI Guide — `markUnmarkInboxMessageAsFavorite`](../../docs/ui/inbox/UIGuide_markUnmarkInboxMessageAsFavorite.md).

**Visitor mode**: not supported.

## Example
```ts
// Toggle handler — flip the local state optimistically, then
// call the server, and revert if the call fails.
const target = !message.favorite;
console.log('[smartico] optimistically flip the star to', target, '— it will revert if the server rejects');

const r = await window._smartico.api.markUnmarkInboxMessageAsFavorite(
  message.message_guid,
  target,
);

if (r.err_code === 0) {
  console.log('[smartico] favorite toggled — keep the local state and show a brief "Added to favorites" / "Removed from favorites" toast');
} else {
  console.error('[smartico] favorite toggle failed — revert the local state and show an error toast:', r.err_message);
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
- `0` — success; the message's favorite state flipped to the
 requested value.
- other non-zero — server error. Surface `err_message` if any.

## Related
- `getInboxMessages`
