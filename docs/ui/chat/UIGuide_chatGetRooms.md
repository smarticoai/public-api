# UI Guide — `chatGetRooms`

## Overview
- Answers the rooms the player sees, already in the order the site set. No client-side sorting.
- The first call opens the chat (one session, one live connection per tab). Call it when the chat window
  opens, not on page load: a closed chat should hold no connection.
- `onUpdate` receives the FULL list on every change. Re-render the list from it; do not patch.

## Room row

| Element | Field | Notes |
|---|---|---|
| Image | `image_url` | `null` → a placeholder with the first letter of `name`. |
| Name | `name` | One line, ellipsis. |
| Last message | `last_message` | `author.name: text`; "Message removed" when `status === 'removed'`; "No messages yet" when `null`. A banned player gets `null`. |
| Time | `last_message.ts` | Milliseconds. |
| Unread badge | `unread_count` | Hide at `0`; the value is capped at 99 — show "99+" for 99. |
| Online | `online_count` | Players who have this room open now. |
| State | `my_role`, `can_write` | A small "read only" / "banned" mark when the role is not `member`. |

A room is identified by `room_id`. `kind` tells what the room is (`custom`, `announcement`, `tournament`,
`clan`, `raffle`, `keyed`); unknown kinds from a newer service must be shown like `custom`.

## Empty and loading states

- While the promise is pending: a loading state.
- Resolved with an empty array and `chatGetStatus().state === 'online'`: "No rooms for you yet".
- Resolved with an empty array and the state `stopped`: the "Chat is not available" screen
  (see [UI Guide — `chatGetStatus`](./UIGuide_chatGetStatus.md)).

## Update cadence

- The room the tab has open: its summary changes at once with every message.
- Every other room: at most once per 3 seconds. Do not add your own polling.
- A room can disappear (closed by the site, or the player lost access): it is simply missing from the next
  list. If that room was open, its `chatOpenRoom` callback gets `err_code` `ROOM_NOT_FOUND` — go back to the
  list.

## Opening a room from outside the list

For a room the page names itself (one per match, per game) or the room of a tournament, clan or raffle, call
`chatEnsureRoom(target)` first and open the `room_id` it answers. The new room then also appears in this list.

## Cleanup

`chatUnsubscribe(fn)` when the list unmounts. When the last subscriber is gone the connection closes after
30 seconds; reopening within that time costs nothing.
