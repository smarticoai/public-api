# UI Guide — `chatSendMessage`

## Overview
- Sends one message. The SDK shows it in the room at once as a pending copy, so do not add your own optimistic
  row: just clear the input and call the method.
- The answer is `{ err_code, err_message, message, retry_after_ms? }`. It never throws.

## Before sending

- Trim the text; do not call the method for an empty one.
- Check the length against `limits.max_len` (from `chatGetStatus()`) and show a counter.
- Keep the send button disabled for `limits.min_interval_ms` after a send; the service refuses faster messages.

## The pending and failed copies

The room view (`chatOpenRoom` → `onUpdate`) goes through these steps by itself:

1. `pending: true`, `id: 0` — render dimmed with "Sending…".
2. Stored — the same row with its real `id`, time and text as the service kept them.
3. Or failed — `failed` holds the code; render "Not sent" under the text.

A failed copy stays until the next `chatSendMessage` for that room. A "Retry" button calls the method again with
the same text; the failed copy is then replaced by the new pending one.

## What to do for each code

| `err_code` | UI |
|---|---|
| `RATE_LIMITED` | "You are writing too fast." Enable "Retry" after `retry_after_ms`. |
| `TOO_LONG` | "The message is too long", with `limits.max_len`. |
| `FILTERED` | "The message was not sent." Do not offer a retry of the same text. |
| `READ_ONLY`, `BANNED`, `MUTED` | Show `err_message` in place of the composer; the room view and the status carry the same state. |
| `ROOM_NOT_FOUND`, `NO_ACCESS` | Go back to the room list. |
| `NETWORK` | "No connection." Offer "Retry". The SDK already tried twice. |
| `CHAT_DISABLED`, `NOT_IDENTIFIED` | The "Chat is not available" screen. |

`err_message` is a short English text from the service, good enough to show as a fallback.

## Double sends

The SDK retries a send by itself only when the service did not answer, and such a retry never creates a second
message. A new call of `chatSendMessage` always is a new message, so disable the send button while a call is
pending.

```ts
const r = await window._smartico.api.chatSendMessage({ room_id, text });
if (r.err_code === 0) {
  console.log('[smartico] sent — the stored message replaced the pending row');
} else if (r.retry_after_ms) {
  console.log('[smartico] too fast — enable "Retry" in', r.retry_after_ms, 'ms');
} else {
  console.error('[smartico] not sent — show under the failed row:', r.err_message);
}
```
