/**
 * Result codes of the chat methods (`err_code`). `0` means success. A chat
 * method never throws: it resolves with one of these codes, plus
 * `err_message` and, for {@link ChatErrorCode.RATE_LIMITED}, `retry_after_ms`.
 */
export enum ChatErrorCode {
	/** Success. */
	OK = 0,
	/** The chat service did not answer after retries. Show "No connection". */
	NETWORK = 1,
	/** Chat is switched off for this site. Answered without a network call. */
	CHAT_DISABLED = 2,
	/** There is no identified player, or the player is unknown. */
	NOT_IDENTIFIED = 3,
	/** The player's identity signature does not match. */
	BAD_HASH = 4,
	/** The player's identity signature has expired; the page must identify the player again. */
	HASH_EXPIRED = 5,
	/** The chat session expired. Handled inside the SDK, which opens a new one. */
	TOKEN_EXPIRED = 6,
	/** The room does not exist any more. Show the room list. */
	ROOM_NOT_FOUND = 7,
	/** The player may not see this room. */
	NO_ACCESS = 8,
	/** The player can read this room but not write. Show `my_note` of the room. */
	READ_ONLY = 9,
	/** The player is banned in this room. Show `my_note` and hide the messages. */
	BANNED = 10,
	/** The player is muted in every room. Show `mute_note` and `muted_till`. */
	MUTED = 11,
	/** The player writes too fast. Wait `retry_after_ms`. */
	RATE_LIMITED = 12,
	/** The message is longer than `limits.max_len`. */
	TOO_LONG = 13,
	/** The message has no text. */
	EMPTY = 14,
	/** The whole message was refused by a content filter. */
	FILTERED = 15,
	/** The site reached its limit of rooms. */
	ROOM_LIMIT = 16,
	/** The signature of a keyed room is wrong or expired. */
	BAD_SIGNATURE = 17,
	/** The feature is switched off for this site (rooms created from the page, private chats). */
	NOT_ENABLED = 18,
	/** A field is missing or wrong; `err_message` names it. */
	BAD_REQUEST = 19,
	/** The chat service failed. Try again later. */
	INTERNAL = 20,
}
