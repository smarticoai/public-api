# UI Guide — `deleteInboxMessage` (and `deleteAllInboxMessages`)

## Overview
- Soft-deletes inbox messages. Two variants:
  - **Single**: `deleteInboxMessage(messageGuid)` — drop one message.
  - **Bulk**: `deleteAllInboxMessages()` — drop every message
    globally.
- Both return `{ err_code, err_message }`. `err_code === 0` =
  success.
- **No undelete via the SDK** — deletion is server-recorded but
  the user cannot recover the message. Recovery requires operator
  intervention.
- Both are idempotent at the server.

## When to call

**Single**: from a delete affordance per row:

| Trigger | Platform | Notes |
|---|---|---|
| Trash icon click (hover-visible) | Desktop | |
| Swipe past threshold (~75 px) | Mobile | Left or right swipe, with CSS `translateX(±100%)` |
| Delete button in detail panel | Desktop full-page | When the message is open in the right-side panel |

**No confirm dialog** for the single-message delete — the action
is fast and the user's intent is explicit (they clicked / swiped).

**Bulk**: typically in a header overflow menu under "Delete all
messages". **Surface a confirm dialog** for the bulk variant —
this is destructive at scale and there is no undo.

```ts
// Single — swipe handler
const onDelete = async (msg: TInboxMessage) => {
  // Optimistic: drop from local list immediately.
  removeFromLocalList(msg.message_guid);

  const r = await window._smartico.api.deleteInboxMessage(msg.message_guid);
  if (r.err_code !== 0) {
    // Revert.
    restoreToLocalList(msg);
    console.error('[smartico] delete failed, restored:', r.err_message);
  } else {
    console.log('[smartico] message deleted — show "Message deleted" toast (no undo affordance)');
  }
};

// Bulk — after confirm dialog
const onDeleteAll = async () => {
  const previousMessages = messages;
  setMessages([]);

  const r = await window._smartico.api.deleteAllInboxMessages();
  if (r.err_code !== 0) {
    setMessages(previousMessages);
    console.error('[smartico] delete-all failed, restored:', r.err_message);
  } else {
    console.log('[smartico] all messages deleted — inbox cleared, badge auto-drops to 0');
  }
};
```

## Loading state

- **Single**: skip the explicit loading state — the row animates
  out (slide ~300 ms) and the perceived feedback is the row
  disappearing.
- **Bulk**: show loading dots on the "Delete all" button while
  pending; disable the button to prevent double-clicks.

## Optimistic update

Recommended for both variants:

- **Single**: drop the row from local state before the call.
  Revert by re-adding it at the same index if the call fails.
- **Bulk**: replace `messages` with `[]` immediately. Revert by
  restoring the snapshot if the call fails.

The risk of a revert is low — the server is idempotent and the
soft-delete operation rarely fails outside of transport issues.

## Refresh behavior

- `getInboxMessages` `onUpdate` does NOT fire on delete — the SDK
  doesn't auto-refresh the list.
- The unread badge auto-updates via the user-properties channel
  (any deleted unread messages drop from the count).
- For bulk delete, the badge drops to 0 (or near 0 if a new
  message arrived mid-operation).

## Idempotency

Both variants are idempotent at the server:

- `deleteInboxMessage(alreadyDeletedGuid)` → returns
  `err_code === 0`. Already-deleted messages are filtered out
  server-side, so the server sees no work to do.
- `deleteAllInboxMessages()` on an empty inbox → returns
  `err_code === 0`. No-op.

## No undo

There is **no undelete path via the SDK**. The default Smartico
UI does NOT offer an undo affordance after delete. If your
product surface needs an undo pattern, implement it
client-side using an optimistic deferred call: stash the row in
local state, show a "Message deleted [Undo]" toast for ~5 s,
and only fire `deleteInboxMessage` when the toast dismisses.

## Error handling

| `err_code` | Action |
|---|---|
| `0` (success) | Drop locally; show "Message deleted" toast (single) or "All messages deleted" toast (bulk). |
| Other non-zero | Revert local state (restore row(s)); show non-blocking error toast with `err_message`. Allow retry. |

## Animations / transitions

- **Single delete (swipe)**: row slides off-screen
  (`translateX: ±100%`, 300 ms ease-out), then collapses height
  (200 ms).
- **Single delete (click)**: row collapses height + fades opacity
  (200 ms each).
- **Bulk delete**: list fades to empty state animation.

## Mobile vs desktop

- **Trigger**: mobile = swipe (left or right past threshold);
  desktop = hover-visible trash icon.
- **RTL**: swipe direction flips with `direction: rtl` —
  `translateX(+100%)` becomes the swipe-left animation.
- **Bulk delete UI**: mobile = in the overflow menu;
  desktop = inline in the inbox header (still behind a confirm
  dialog).
