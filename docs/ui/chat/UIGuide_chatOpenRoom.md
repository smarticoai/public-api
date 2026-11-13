# UI Guide — `chatOpenRoom`

## Overview
- Opens one room for this tab and answers a `ChatRoomView`: the room, its messages (oldest first),
  `more_before` and who is online.
- `onUpdate` receives the FULL view on every change. Render from it; do not keep a message list of your own.
- One room per tab is open at a time. Call `chatCloseRoom({ room_id })` when the user goes back to the list.

## Layout of the room

1. **Header**: back, `room.name`, `online.count` online, close.
2. **Pinned bar**: `room.pinned`, when not `null`.
3. **Messages**, oldest at the top, the view scrolled to the bottom.
4. **Composer**, or the reason the player cannot write.

## Rendering a message

| Case | How to tell | Render |
|---|---|---|
| Another player's message | `author` set, `author.uid !== me.uid` | Name, green dot when `online.uids` includes `author.uid`, time, text. |
| The player's own message | `author.uid === me.uid` | On the other side, no name. |
| On its way | `pending === true` | Dimmed, "Sending…". Key it by `client_msg_id`: its `id` is `0`. |
| Not sent | `failed` is set | The text with "Not sent" and a retry; see [UI Guide — `chatSendMessage`](./UIGuide_chatSendMessage.md). |
| Removed | `status === 'removed'` | "Message removed" in place of the text; keep the row. |
| System line | `kind === 'system'` | Centred, no author. |
| Operator message | `author === null`, another `kind` | The site's name instead of a player name. |

`me` comes from `chatGetStatus()`. Unknown `kind` values from a newer service: render like `text`.

Use `id` as the list key for stored messages and `client_msg_id` for pending and failed ones. A message that
changed (removed, restored) is a new object, so a reference check is enough to skip unchanged rows.

## The composer

| Condition | Show instead of the composer |
|---|---|
| `room.my_role === 'banned'` | `room.my_note` (or "You are banned in this room"); also hide the messages — the view has none. |
| `room.my_role === 'read_only'` | `room.my_note` (or "You can only read this room"). |
| `me.muted_till` in the future | `me.mute_note` and the end time. |
| `room.can_write === false` otherwise | "Only the site posts here." |

`can_write` already combines all of these; the table only picks the text.

## Scrolling and older messages

- Stick to the bottom only while the user is at the bottom; otherwise show a "New messages" hint.
- When the user reaches the top and `more_before` is `true`, call `chatLoadOlder({ room_id })` and keep the
  scroll position: the older messages are inserted above.
- The SDK keeps the newest 300 messages of a room. In a busy room, messages loaded with `chatLoadOlder` can be
  dropped again; `more_before` turns `true` again.

## Read marker

When the newest stored message is on screen and the browser tab is visible, call
`chatMarkRead({ room_id, message_id })` with its `id`. Calling it on every update is fine: the SDK sends at most
one request per room in 2 seconds.

## Errors and the room going away

- `err_code` `ROOM_NOT_FOUND` or `NO_ACCESS` from the call, or later through `onUpdate` (the view then has
  `room: null`): show the room list. The callback is removed by the SDK; no cleanup needed for it.
- `NETWORK`: "No connection" with a retry of `chatOpenRoom`.
- After a lost connection there is nothing to do: the SDK reloads or catches up the room and calls `onUpdate`
  with the complete list.

## Accessibility

Move the focus into the room on open and keep it inside; close on Esc; announce new messages politely and not
more often than once per few seconds.
