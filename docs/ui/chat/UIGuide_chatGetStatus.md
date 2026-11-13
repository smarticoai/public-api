# UI Guide — `chatGetStatus`

## Overview
- Answers the state of the chat connection, why it stopped (when it did), the current player (`me`) and the
  site's limits. Synchronous: it returns at once and never opens a connection.
- Pass `onUpdate` once when the chat UI mounts; it fires on every change of the state, of the stop reason and
  of the player's mute.
- Use it for three things: the connection line, the "Chat is not available" screen, and the muted composer.

## The connection line

| `state` | Show |
|---|---|
| `idle` | Nothing. |
| `connecting` | A loading state in place of the room list. |
| `online` | The chat, no line. |
| `retrying` | A thin "Reconnecting…" line above the content. Keep the rooms and messages on screen: the SDK brings them up to date after it reconnects. |
| `polling` | The chat, no line. Messages can arrive a few seconds late; sending works as usual. |
| `stopped` | The "Chat is not available" screen below. |

Do not build your own retry timer. The SDK retries by itself with growing pauses (1, 2, 5, 10, 30 seconds) and
moves to `polling` when the network does not let a live connection through.

## "Chat is not available"

Shown only for `state === 'stopped'`. Pick the text from `bye` first, then `err_code`:

| Reason | Text | Action |
|---|---|---|
| `bye === 'too_many'` | "The chat is open in another tab." | A "Use the chat here" button that calls `chatGetRooms()` again. |
| `err_code` `CHAT_DISABLED` | "Chat is not available." | None. |
| `err_code` `NOT_IDENTIFIED`, `BAD_HASH`, `HASH_EXPIRED` | "Log in to use the chat." | None; the chat works again after the page identifies the player. |
| anything else | "Chat is not available." | A "Try again" button that calls `chatGetRooms()` again. |

A stopped chat never comes back by itself. It starts again with the next call of `chatGetRooms` or
`chatOpenRoom`, so tie that call to a player action, not to a timer.

## The muted composer

`me.muted_till` is a time in milliseconds, or `null`. While it is in the future the player cannot write in any
room: replace the composer of every room with `me.mute_note` (or a default text) and the end time. The status
`onUpdate` fires when the mute starts and when it ends, also in the `polling` state.

```ts
const render = (s) => {
  const muted = s.me && s.me.muted_till && s.me.muted_till > Date.now();
  console.log('[smartico] composer:', muted ? `muted till ${new Date(s.me.muted_till).toLocaleTimeString()} — ${s.me.mute_note || 'You are muted'}` : 'enabled');
};
render(window._smartico.api.chatGetStatus({ onUpdate: render }));
```

## Limits

`limits.max_len` is the longest message, `limits.min_interval_ms` the shortest time between two messages of the
player. Both are `null` until the first connection. Show a length counter from `max_len` and keep the send
button disabled for `min_interval_ms` after a send.

## Cleanup

Remove the callback with `chatUnsubscribe(fn)` when the UI unmounts. A status subscriber alone does not keep the
connection open.
