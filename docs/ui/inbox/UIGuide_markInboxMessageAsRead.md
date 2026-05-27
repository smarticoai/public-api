# UI Guide — `markInboxMessageAsRead` (and `markAllInboxMessagesAsRead`)

## Overview
- Action-focused mutation. Two variants:
  - **Single**: `markInboxMessageAsRead(messageGuid)` — flip one
    message's read state.
  - **Bulk**: `markAllInboxMessagesAsRead()` — flip every unread
    message globally.
- Both return `{ err_code, err_message }`. `err_code === 0` = success.
- Both are idempotent — repeated calls on already-read targets
  return `0`.
- Auto-fires the unread-count update through the user-properties
  channel; the inbox badge drops automatically.

## When to call

**Single (auto-mark)**: when the user opens a message detail view.
The default Smartico UI fires this alongside
{@link reportImpressionEvent} inside the message-open handler.

```ts
const onMessageOpen = async (msg: TInboxMessage) => {
  if (!msg.read) {
    await Promise.all([
      window._smartico.api.markInboxMessageAsRead(msg.message_guid),
      Promise.resolve(window._smartico.api.reportImpressionEvent({
        engagement_uid: msg.message_guid,
        activityType: 31,
      })),
    ]);
    console.log('[smartico] message opened — marked read and impression reported in parallel');
  }
};
```

**Bulk (mark all)**: typically wired to a "Mark all as read"
button in the inbox header. Reasonable to skip the in-flight
loading state for this — the operation is fast and the UI updates
are observable immediately.

## Loading state

- **Single**: optional. The mutation is fast enough (server
  round-trip ~100–300 ms) that you can skip a visible loading state
  and rely on optimistic UI.
- **Bulk**: show a brief loading state on the "Mark all" button to
  avoid double-clicks (the button should disable while pending).

## Optimistic update

Recommended for both variants — both are idempotent at the server,
so revert risk is minimal:

```ts
// Single — flip local `read` flag immediately, then call.
const target = { ...msg, read: true };
updateLocalList(target);
const r = await window._smartico.api.markInboxMessageAsRead(msg.message_guid);
if (r.err_code !== 0) {
  // Revert and show error.
  updateLocalList(msg);
  console.error('[smartico] mark-read failed, reverting:', r.err_message);
}
```

```ts
// Bulk — drop all unread dots immediately.
const allRead = messages.map(m => ({ ...m, read: true }));
setMessages(allRead);
const r = await window._smartico.api.markAllInboxMessagesAsRead();
if (r.err_code !== 0) {
  // Revert.
  setMessages(messages);
}
```

## Refresh behavior

- The inbox unread badge auto-updates via the user-properties
  channel — subscribe to
  [`getUserProfile`](../../api/classes/WSAPIUser.md#getuserprofile)'s
  `props_change` and watch `core_inbox_unread_count`, or use
  [`getInboxUnreadCount`](../../api/classes/WSAPIInbox.md#getinboxunreadcount)'s
  `onUpdate`. No need to refresh the count manually.
- The message-list `onUpdate` does NOT fire — the SDK doesn't
  auto-refresh `getInboxMessages` after these mutations. Either
  update local state optimistically (recommended) or re-call
  `getInboxMessages` if you need the server-canonical view.

## Idempotency

Both variants are idempotent at the server:

- `markInboxMessageAsRead(sameGuid)` twice → both calls return
  `err_code === 0`. Already-read state is preserved.
- `markAllInboxMessagesAsRead()` on an empty / all-read inbox →
  returns `err_code === 0`. No-op.

Consumer-side, the bulk operation may race with a new message
arriving server-side between the call and processing. The new
message remains unread. Subsequent `getInboxMessages` calls show
it as unread.

## Error handling

| `err_code` | Action |
|---|---|
| `0` (success) | Hide unread dot(s); update badge automatically via push. |
| Other non-zero | Revert local state if optimistic; show a non-blocking error toast with `err_message`. Allow retry. |

## Animations / transitions

- **Unread dot fade**: 200 ms opacity transition from 1 → 0 on
  mark-read.
- **Bulk mark-all**: stagger the dot fade across rows (~30 ms per
  row) for a sweep effect.

## Mobile vs desktop

- **Auto-mark trigger**: identical (on detail open).
- **Mark-all button**: typically in a header overflow menu on
  mobile; inline in the desktop header.
