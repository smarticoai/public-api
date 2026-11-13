import { ChatErrorCode } from '../Chat/ChatErrorCode';
import {
	ChatEnsureResult,
	ChatMembersResult,
	ChatOlderResult,
	ChatReportReason,
	ChatResult,
	ChatRoom,
	ChatRoomView,
	ChatSendResult,
	ChatStatus,
	ChatStreamEventName,
	ChatTarget,
} from '../Chat/ChatTypes';
import { WSAPIInbox } from './WSAPIInbox';

/**
 * Social Chat: rooms where the players of a site talk to each other in real time.
 *
 * The SDK keeps one chat store per page and one live connection per browser tab, whatever number of UI parts
 * read it. Each read method answers the current data and, when you pass `onUpdate`, calls it again with the
 * **full new data** on every change, so a UI only re-renders from what it receives.
 *
 * Rules shared by every chat method:
 * - **No method throws.** Each one resolves with an `err_code` from {@link ChatErrorCode} (`0` = success).
 * - **Several subscribers are allowed.** Unlike the other `onUpdate` callbacks of the SDK, a chat `onUpdate`
 *   does not replace the previous one: two widgets can follow the same list. Remove one with
 *   {@link chatUnsubscribe}.
 * - **The connection follows the subscribers.** It opens with the first call that needs live data and closes
 *   30 seconds after the last subscriber left, so a closed chat holds no connection.
 * - **Chat can be switched off.** When chat is not enabled for the site, or no player is identified, every
 *   method answers `CHAT_DISABLED` / `NOT_IDENTIFIED` at once, without a network call.
 * - **Visitor mode**: not supported.
 *
 * @group Chat
 */
export class WSAPIChat extends WSAPIInbox {
	/**
	 * Returns the state of the chat connection and the current player, and optionally follows its changes.
	 * Use it for the "Reconnecting…" line and the "Chat is not available" state of a chat UI.
	 *
	 * @remarks
	 * **States**
	 *
	 * | `state` | Meaning | What the UI shows |
	 * |---|---|---|
	 * | `idle` | Nothing is open yet, or the chat was closed. | Nothing. |
	 * | `connecting` | The first connection is being made. | A loading state. |
	 * | `online` | Live. | The chat. |
	 * | `retrying` | The connection was lost; the SDK tries again by itself with growing pauses. | "Reconnecting…" over the chat; keep the messages on screen. |
	 * | `polling` | The network does not let a live connection through; the SDK asks for news every few seconds. | The chat; messages can arrive a few seconds late. |
	 * | `stopped` | The SDK will not try again by itself. | "Chat is not available", by `err_code` / `bye`. |
	 *
	 * **Why the chat stopped** — read `err_code` and `bye`:
	 * - `err_code` `CHAT_DISABLED`: chat is switched off for the site.
	 * - `err_code` `NOT_IDENTIFIED`, `BAD_HASH`, `HASH_EXPIRED`: the player could not be identified; the page
	 *   must identify the player again.
	 * - `bye` `too_many`: the chat is open in too many tabs of this player and this tab was the oldest. Offer a
	 *   "Use the chat here" action that calls any chat read method again.
	 *
	 * A stopped chat starts again with the next call of {@link chatGetRooms} or {@link chatOpenRoom}.
	 *
	 * **`me`** carries the player's public name and the mute state: when `muted_till` is in the future, show
	 * `mute_note` and the end time instead of the composer in every room.
	 *
	 * This method never opens a connection by itself, and a status subscriber alone does not keep one open.
	 *
	 * **UI guidance**: see [UI Guide — `chatGetStatus`](../../docs/ui/chat/UIGuide_chatGetStatus.md).
	 *
	 * @param params          Optional subscription bag.
	 * @param params.onUpdate Callback invoked with the new status on every change of the state, of the stop
	 *                        reason, or of the player's mute.
	 *
	 * @returns The current {@link ChatStatus}. `me`, `features` and `limits` are `null` until the first
	 *          connection.
	 *
	 * @example
	 * ```ts
	 * const status = window._smartico.api.chatGetStatus({
	 *   onUpdate: (s) => {
	 *     if (s.state === 'retrying') console.log('[smartico] chat lost the connection — show "Reconnecting…" and keep the messages');
	 *     if (s.state === 'stopped') console.log('[smartico] chat stopped — show "Chat is not available"; reason:', s.err_code, s.bye);
	 *     if (s.me?.muted_till > Date.now()) console.log('[smartico] the player is muted — replace the composer with:', s.me.mute_note);
	 *   },
	 * });
	 * console.log('[smartico] chat state now:', status.state);
	 * ```
	 */
	public chatGetStatus({ onUpdate }: { onUpdate?: (status: ChatStatus) => void } = {}): ChatStatus {
		return this.api.chat().getStatus(onUpdate);
	}

	/**
	 * Returns the chat rooms the current player can see, in the order the site set, and optionally follows the
	 * list. Opens the chat session and the live connection when they are not open yet.
	 *
	 * @remarks
	 * **Subscription model (`onUpdate`)**
	 * The callback receives the FULL list (never a patch) whenever a room appears or disappears, or the summary
	 * of a room changes: its last message, `unread_count`, `online_count`, the player's role, the pinned text.
	 * For a room that is not open the summary is refreshed at most once per 3 seconds.
	 *
	 * **What a room carries**: see {@link ChatRoom}. `unread_count` is capped at 99 — show "99+".
	 * `can_write` is `false` when the player may only read (a news room, a read-only or banned player, a muted
	 * player). A banned player keeps the room in the list with `my_note`; its messages are hidden.
	 *
	 * **Errors**: the method answers an empty array when chat is not available, or when the service cannot be
	 * reached (state `retrying`; the SDK keeps reconnecting). Read the reason with {@link chatGetStatus}. An
	 * `onUpdate` passed meanwhile stays registered and gets the list once chat works.
	 *
	 * **Idempotency / Side effects**: read-only. The first call opens one session and one live connection for
	 * the tab; later calls reuse them.
	 *
	 * **UI guidance**: see [UI Guide — `chatGetRooms`](../../docs/ui/chat/UIGuide_chatGetRooms.md).
	 *
	 * @param params          Optional subscription bag.
	 * @param params.onUpdate Callback invoked with the full refreshed room list on every change.
	 *
	 * @returns Promise resolving to the room list; empty when the player sees no room or chat is not available.
	 *
	 * @example
	 * ```ts
	 * const rooms = await window._smartico.api.chatGetRooms({
	 *   onUpdate: (list) => {
	 *     console.log('[smartico] room list changed — re-render it from this array:', list.map((r) => `${r.name} (${r.unread_count} unread, ${r.online_count} online)`));
	 *   },
	 * });
	 * console.log('[smartico] rooms to render:', rooms.length, '— show "No rooms for you yet" when it is 0');
	 * ```
	 */
	public chatGetRooms({ onUpdate }: { onUpdate?: (rooms: ChatRoom[]) => void } = {}): Promise<ChatRoom[]> {
		return this.api.chat().getRooms(onUpdate);
	}

	/**
	 * Opens a room for this tab: tells the service that the tab shows the room, loads its newest messages and
	 * follows everything that happens in it.
	 *
	 * @remarks
	 * **One open room per tab.** Full messages and the online list flow only for the room that is open;
	 * opening another room moves the tab there. Call {@link chatCloseRoom} when the user goes back to the list.
	 *
	 * **Subscription model (`onUpdate`)**
	 * The callback receives the FULL {@link ChatRoomView} on every new, removed or restored message, on a
	 * change of the online list, and on a change of the room itself (role, pinned text). `messages` is a new
	 * array each time, oldest first; an item that changed is a new object, so rendering by reference works.
	 *
	 * **What is in `messages`**
	 * - Stored messages, each with its `id`. A removed message stays in place with `status: 'removed'` and an
	 *   empty text — render "Message removed".
	 * - The player's own messages that are on their way: `pending: true`, `id: 0`, keyed by `client_msg_id`.
	 * - Messages that could not be sent: `failed` holds the code. See {@link chatSendMessage}.
	 *
	 * **Paging**: the first answer holds up to 50 newest messages. `more_before: true` means older ones exist —
	 * load them with {@link chatLoadOlder}. The SDK keeps the newest 300 messages of a room.
	 *
	 * **After a lost connection** the SDK brings the room up to date by itself; `onUpdate` then fires with the
	 * complete list, with no doubles and no gaps.
	 *
	 * **Errors** (`err_code`)
	 *
	 * | Code | Meaning | What the UI does |
	 * |---|---|---|
	 * | `ROOM_NOT_FOUND` | The room does not exist any more, or was closed while open (then it comes through `onUpdate`). | Show the room list. |
	 * | `NO_ACCESS` | The player may not see this room. | Show the room list. |
	 * | `CHAT_DISABLED`, `NOT_IDENTIFIED` | Chat is not available. | "Chat is not available". |
	 * | `NETWORK` | The service did not answer. | "No connection", with a retry. |
	 *
	 * A banned player gets `err_code` `0`, `room.my_role === 'banned'`, the moderator's text in `room.my_note`
	 * and no messages.
	 *
	 * **UI guidance**: see [UI Guide — `chatOpenRoom`](../../docs/ui/chat/UIGuide_chatOpenRoom.md).
	 *
	 * @param params          The room and an optional subscription.
	 * @param params.room_id  Id of the room, from {@link chatGetRooms} or {@link chatEnsureRoom}.
	 * @param params.onUpdate Callback invoked with the full room view on every change.
	 *
	 * @returns Promise resolving to the {@link ChatRoomView}: the room, its messages, `more_before` and who is
	 *          online.
	 *
	 * @example
	 * ```ts
	 * const view = await window._smartico.api.chatOpenRoom({
	 *   room_id: 12,
	 *   onUpdate: (v) => {
	 *     if (v.err_code !== 0) return console.log('[smartico] the room was closed — go back to the room list');
	 *     console.log('[smartico] re-render the room:', v.messages.length, 'messages,', v.online.count, 'online');
	 *   },
	 * });
	 * if (view.err_code !== 0) {
	 *   console.error('[smartico] the room cannot be opened, code', view.err_code, '— show the room list');
	 * } else if (!view.room.can_write) {
	 *   console.log('[smartico] replace the composer with the reason:', view.room.my_note);
	 * }
	 * ```
	 */
	public chatOpenRoom({ room_id, onUpdate }: { room_id: number; onUpdate?: (view: ChatRoomView) => void }): Promise<ChatRoomView> {
		return this.api.chat().openRoom(room_id, onUpdate);
	}

	/**
	 * Closes the room for this tab: the tab is back on the room list. The `onUpdate` callbacks registered for
	 * the room with {@link chatOpenRoom} are removed; the room keeps its place in the list and its summary keeps
	 * coming through {@link chatGetRooms}.
	 *
	 * @remarks
	 * Call it when the user leaves the room view. The messages already loaded stay in the SDK, so opening the
	 * room again is fast and only loads what is new.
	 *
	 * **Idempotency / Side effects**: safe to call for a room that is not open.
	 *
	 * @param params         The room.
	 * @param params.room_id Id of the room to close.
	 *
	 * @example
	 * ```ts
	 * window._smartico.api.chatCloseRoom({ room_id: 12 });
	 * console.log('[smartico] room closed for this tab — show the room list');
	 * ```
	 */
	public chatCloseRoom({ room_id }: { room_id: number }): void {
		this.api.chat().closeRoom(room_id);
	}

	/**
	 * Loads one more page of older messages of an open room. The longer list comes through the `onUpdate` of
	 * {@link chatOpenRoom}; this method only says whether still older messages exist.
	 *
	 * @remarks
	 * Call it when the user scrolls to the top of the room and `more_before` is `true`. Keep the scroll
	 * position: the new messages are added before the first one on screen.
	 *
	 * The SDK keeps the newest 300 messages of a room. Older ones loaded with this method can be dropped again
	 * when many new messages arrive; `more_before` is then `true` again and they can be loaded once more.
	 *
	 * **Errors**: `ROOM_NOT_FOUND` when the room is not open in this tab; `BANNED` when the player was banned
	 * meanwhile; `NETWORK` when the service did not answer.
	 *
	 * @param params         The room and the page size.
	 * @param params.room_id Id of a room opened with {@link chatOpenRoom}.
	 * @param params.limit   Messages to load, 1–100. Defaults to 50.
	 *
	 * @returns Promise resolving to `{ err_code, more_before }`.
	 *
	 * @example
	 * ```ts
	 * const r = await window._smartico.api.chatLoadOlder({ room_id: 12 });
	 * console.log('[smartico] older messages arrived through onUpdate; show "Load older" again:', r.more_before);
	 * ```
	 */
	public chatLoadOlder({ room_id, limit }: { room_id: number; limit?: number }): Promise<ChatOlderResult> {
		return this.api.chat().loadOlder(room_id, limit);
	}

	/**
	 * Sends a message to a room.
	 *
	 * @remarks
	 * **What happens**
	 * 1. The message appears at once in the room's `messages` with `pending: true` (through the `onUpdate` of
	 *    {@link chatOpenRoom}), so the UI needs no optimistic code of its own.
	 * 2. When the service has stored it, the pending copy is replaced by the stored message.
	 * 3. When it was refused, the copy stays in the list with `failed` set to the code. It is removed by the
	 *    next call of `chatSendMessage` for the room — call it again with the same text for a "Retry" action.
	 *
	 * Check the text against `limits.max_len` from {@link chatGetStatus} before sending, and leave
	 * `limits.min_interval_ms` between two messages.
	 *
	 * **Errors** (`err_code`)
	 *
	 * | Code | Meaning | What the UI does |
	 * |---|---|---|
	 * | `RATE_LIMITED` | The player writes too fast. | Wait `retry_after_ms`, then allow a retry. |
	 * | `TOO_LONG` | Longer than `limits.max_len`. | Show the limit. |
	 * | `EMPTY` | No text. | Nothing. |
	 * | `FILTERED` | The message was refused by a content filter. | Tell the player it was not sent. |
	 * | `READ_ONLY` | The player can only read this room. | Show `err_message` in place of the composer. |
	 * | `BANNED` | The player is banned in this room. | Show `err_message`, hide the messages. |
	 * | `MUTED` | The player is muted in every room. | Show `err_message` and `me.muted_till`. |
	 * | `ROOM_NOT_FOUND`, `NO_ACCESS` | The room is gone or closed to the player. | Show the room list. |
	 * | `NETWORK` | The service did not answer. | "No connection", with a retry. |
	 *
	 * **Idempotency**: a retry made by the SDK itself never creates a second message. A new call of this
	 * method is a new message.
	 *
	 * **UI guidance**: see [UI Guide — `chatSendMessage`](../../docs/ui/chat/UIGuide_chatSendMessage.md).
	 *
	 * @param params         The room and the text.
	 * @param params.room_id Id of the room.
	 * @param params.text    The message text.
	 *
	 * @returns Promise resolving to `{ err_code, err_message, message, retry_after_ms? }`. `message` is the
	 *          stored message, or `null` when it was not stored.
	 *
	 * @example
	 * ```ts
	 * const r = await window._smartico.api.chatSendMessage({ room_id: 12, text: 'Good luck everyone!' });
	 * if (r.err_code === 0) {
	 *   console.log('[smartico] message stored with id', r.message?.id, '— it is already in the room view');
	 * } else if (r.retry_after_ms) {
	 *   console.log('[smartico] too fast — enable "Retry" in', r.retry_after_ms, 'ms');
	 * } else {
	 *   console.error('[smartico] message not sent, code', r.err_code, '— show under the failed message:', r.err_message);
	 * }
	 * ```
	 */
	public chatSendMessage({ room_id, text }: { room_id: number; text: string }): Promise<ChatSendResult> {
		return this.api.chat().send(room_id, text);
	}

	/**
	 * Tells the service that the player has read the room up to a message. The unread count of the room drops
	 * in every tab of the player, through the `onUpdate` of {@link chatGetRooms}.
	 *
	 * @remarks
	 * Call it when the newest message of the open room is visible and the browser tab is visible. It is safe to
	 * call on every new message: the SDK sends at most one request per room in 2 seconds, always with the
	 * highest id it was given, and ignores an id that is not above the current marker.
	 *
	 * **Fire-and-forget**: there is nothing to await and no error to handle; the marker only moves forward.
	 *
	 * @param params            The room and the message.
	 * @param params.room_id    Id of the room.
	 * @param params.message_id Id of the newest message the player has seen.
	 *
	 * @example
	 * ```ts
	 * const newest = view.messages.filter((m) => m.id > 0).pop();
	 * if (newest && document.visibilityState === 'visible') {
	 *   window._smartico.api.chatMarkRead({ room_id: view.room.room_id, message_id: newest.id });
	 *   console.log('[smartico] read marker moved to', newest.id, '— the unread badge of the room drops by itself');
	 * }
	 * ```
	 */
	public chatMarkRead({ room_id, message_id }: { room_id: number; message_id: number }): void {
		this.api.chat().markRead(room_id, message_id);
	}

	/**
	 * Finds the room for a target and makes sure the player is in it. Use it before {@link chatOpenRoom} when
	 * you do not have a room id: a room opened by a key from the page (created on first use), or the room of a
	 * tournament, a clan or a raffle.
	 *
	 * @remarks
	 * **Targets** ({@link ChatTarget})
	 * - `{ room_id }` — a room of the list; answered from the list.
	 * - `{ room_key, name, image_url?, pinned?, active_till?, segment_id?, sig? }` — a room the page names
	 *   itself, for example one per match. The first player who asks for a key creates the room with that name;
	 *   later calls with the same key answer the same room and do not change it. The key is 1–64 characters
	 *   from `A-Z a-z 0-9 _ . : / -`.
	 * - `{ source_type, source_id }` — the room of a tournament, clan or raffle, when the site has one.
	 *
	 * **Errors** (`err_code`)
	 *
	 * | Code | Meaning |
	 * |---|---|
	 * | `ROOM_NOT_FOUND` | No such room, or no room for that tournament / clan / raffle. |
	 * | `NO_ACCESS` | The player may not see the room. |
	 * | `ROOM_LIMIT` | The site reached its limit of rooms. |
	 * | `BAD_SIGNATURE` | The signature of a keyed room is wrong or expired. |
	 * | `NOT_ENABLED` | Rooms created from the page, or private chats, are switched off for the site. |
	 * | `BAD_REQUEST` | A field is missing or wrong; `err_message` names it. |
	 *
	 * **Idempotency**: safe to repeat.
	 *
	 * @param target The room to find; see the list above.
	 *
	 * @returns Promise resolving to `{ err_code, err_message, room }`; `room` is `null` on an error.
	 *
	 * @example
	 * ```ts
	 * const r = await window._smartico.api.chatEnsureRoom({ room_key: 'sport/123', name: 'Arsenal – Chelsea' });
	 * if (r.err_code === 0) {
	 *   console.log('[smartico] room ready — open it with chatOpenRoom, room_id', r.room.room_id);
	 * } else {
	 *   console.error('[smartico] no room for this match, code', r.err_code, '— show the room list');
	 * }
	 * ```
	 */
	public chatEnsureRoom(target: ChatTarget): Promise<ChatEnsureResult> {
		return this.api.chat().ensure(target);
	}

	/**
	 * Returns one page of the members of a room, online players first. The answer is not cached and not
	 * followed: call it again to refresh an open members panel.
	 *
	 * @remarks
	 * For the green dots next to message authors you do not need this method: `online.uids` of
	 * {@link chatOpenRoom} already lists the authors and viewers who are online.
	 *
	 * **Errors**: `ROOM_NOT_FOUND`, `NO_ACCESS`, `BANNED`, `NETWORK`.
	 *
	 * @param params             The room and the page.
	 * @param params.room_id     Id of the room.
	 * @param params.online_only `true` to list only the players who are online in chat now.
	 * @param params.offset      Members to skip. Defaults to `0`.
	 * @param params.limit       Page size, 1–100. Defaults to 50.
	 *
	 * @returns Promise resolving to `{ err_code, members, more }`; `more` is `true` when another page exists.
	 *
	 * @example
	 * ```ts
	 * const r = await window._smartico.api.chatGetMembers({ room_id: 12, online_only: true });
	 * console.log('[smartico] members panel:', r.members.map((m) => m.name), '— show "Load more":', r.more);
	 * ```
	 */
	public chatGetMembers({
		room_id,
		online_only,
		offset,
		limit,
	}: {
		room_id: number;
		online_only?: boolean;
		offset?: number;
		limit?: number;
	}): Promise<ChatMembersResult> {
		return this.api.chat().getMembers(room_id, online_only, offset, limit);
	}

	/**
	 * Reports a message to the moderators of the site.
	 *
	 * @remarks
	 * Offer it in the menu of a message: the player picks a reason and may add a comment. Show a confirmation
	 * inside the chat on success. The message itself does not change for anybody.
	 *
	 * **Errors**: `BAD_REQUEST` when the message is not in the room or the reason is unknown; `ROOM_NOT_FOUND`,
	 * `NO_ACCESS`, `BANNED`, `NETWORK`.
	 *
	 * @param params            What is reported and why.
	 * @param params.room_id    Id of the room.
	 * @param params.message_id Id of the message.
	 * @param params.reason     `'spam'`, `'abuse'`, `'scam'` or `'other'`.
	 * @param params.comment    Optional text of the player, up to 500 characters.
	 *
	 * @returns Promise resolving to `{ err_code, err_message }`.
	 *
	 * @example
	 * ```ts
	 * const r = await window._smartico.api.chatReportMessage({ room_id: 12, message_id: 345, reason: 'spam' });
	 * console.log(r.err_code === 0 ? '[smartico] report sent — show "Thank you, the moderators will look at it"' : '[smartico] report failed, code ' + r.err_code);
	 * ```
	 */
	public chatReportMessage({
		room_id,
		message_id,
		reason,
		comment,
	}: {
		room_id: number;
		message_id: number;
		reason: ChatReportReason;
		comment?: string;
	}): Promise<ChatResult> {
		return this.api.chat().report(room_id, message_id, reason, comment);
	}

	/**
	 * Subscribes to every event of the live chat connection as it arrives, for anything the chat store does
	 * not model. Most UIs do not need it: {@link chatGetRooms} and {@link chatOpenRoom} already deliver ready
	 * data.
	 *
	 * @remarks
	 * The callback gets the event name and its data, also for events this version of the SDK does not know.
	 * Known names: `hello`, `room`, `room_gone`, `msg`, `msg_update`, `me`, `presence`, `bye`.
	 *
	 * A subscriber keeps the connection open, like an `onUpdate` of the room list. While the SDK is in the
	 * `polling` state no events arrive.
	 *
	 * @param cb Callback invoked as `(name, data)` for every event.
	 *
	 * @returns A function that removes the callback.
	 *
	 * @example
	 * ```ts
	 * const off = window._smartico.api.chatOnEvent((name, data) => {
	 *   console.log('[smartico] chat event', name, data);
	 * });
	 * // later
	 * off();
	 * ```
	 */
	public chatOnEvent(cb: (name: ChatStreamEventName | string, data: any) => void): () => void {
		return this.api.chat().onEvent(cb);
	}

	/**
	 * Removes a callback that was passed as `onUpdate` to any chat method or to {@link chatOnEvent}, from every
	 * place it was registered.
	 *
	 * @remarks
	 * Call it when the UI part that owns the callback goes away. When the last subscriber is gone the SDK
	 * closes the live connection after 30 seconds.
	 *
	 * @param fn The same function object that was registered.
	 *
	 * @example
	 * ```ts
	 * const onRooms = (rooms) => console.log('[smartico] rooms:', rooms.length);
	 * await window._smartico.api.chatGetRooms({ onUpdate: onRooms });
	 * // when the list is removed from the page
	 * window._smartico.api.chatUnsubscribe(onRooms);
	 * ```
	 */
	public chatUnsubscribe(fn: (...args: any[]) => void): void {
		this.api.chat().unsubscribe(fn);
	}

	/**
	 * Closes the live chat connection at once and removes every chat subscription. What was loaded stays in
	 * the SDK until the player changes, so opening the chat again is fast.
	 *
	 * @remarks
	 * A chat window calls it about a minute after it was closed and not opened again, so a closed chat holds no
	 * connection. Calling any chat read method afterwards opens the chat again.
	 *
	 * @example
	 * ```ts
	 * window._smartico.api.chatClose();
	 * console.log('[smartico] chat connection closed — nothing is followed any more');
	 * ```
	 */
	public chatClose(): void {
		this.api.chat().close();
	}

	/**
	 * Reserved for private chats between two players. Not available yet: always answers `NOT_ENABLED`, without
	 * a network call.
	 *
	 * @param params     The other player.
	 * @param params.uid Public id of the other player (`uid` of a message author).
	 *
	 * @returns Promise resolving to `{ err_code: NOT_ENABLED, room: null }` (`CHAT_DISABLED` / `NOT_IDENTIFIED` when chat is not available at all).
	 */
	public chatStartDirect(params: { uid: string }): Promise<ChatEnsureResult> {
		return Promise.resolve({ err_code: this.chatReserved(), room: null });
	}

	/**
	 * Reserved for private chats: blocks or unblocks another player. Not available yet: always answers
	 * `NOT_ENABLED`, without a network call.
	 *
	 * @param params         The other player and the new state.
	 * @param params.uid     Public id of the other player.
	 * @param params.blocked `true` to block, `false` to unblock.
	 *
	 * @returns Promise resolving to `{ err_code: NOT_ENABLED }`.
	 */
	public chatBlockUser(params: { uid: string; blocked: boolean }): Promise<ChatResult> {
		return Promise.resolve({ err_code: this.chatReserved() });
	}

	/**
	 * Reserved for private chats: lets the player switch incoming private chats on or off. Not available yet:
	 * always answers `NOT_ENABLED`, without a network call.
	 *
	 * @param params         The new state.
	 * @param params.enabled `true` to accept private chats.
	 *
	 * @returns Promise resolving to `{ err_code: NOT_ENABLED }`.
	 */
	public chatSetDirectIncoming(params: { enabled: boolean }): Promise<ChatResult> {
		return Promise.resolve({ err_code: this.chatReserved() });
	}

	/** @hidden What a reserved method answers: the reason chat is not available, else NOT_ENABLED. */
	private chatReserved(): ChatErrorCode {
		return this.api.chat().gate() || ChatErrorCode.NOT_ENABLED;
	}

	/** @hidden The player was identified again or logged out: the chat of another player must not stay. */
	protected chatReset(): void {
		this.api.chat().reset();
	}
}
