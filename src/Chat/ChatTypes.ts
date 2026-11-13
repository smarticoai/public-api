import { ChatErrorCode } from './ChatErrorCode';

/** What a room is: made by the operator, an operator-only news room, the room of a tournament / clan / raffle, a room opened by a key, or a private chat (reserved). */
export type ChatRoomKind = 'custom' | 'announcement' | 'tournament' | 'clan' | 'raffle' | 'keyed' | 'dm';

/** The player's role in a room. */
export type ChatRole = 'admin' | 'member' | 'read_only' | 'banned';

/** Reason of a message report. */
export type ChatReportReason = 'spam' | 'abuse' | 'scam' | 'other';

/** A player as other players see them. */
export interface ChatUser {
	/** Opaque id of the player, stable for this site. Never the operator's player id. */
	uid: string;
	/** Public name, already masked by the site's rule. */
	name: string;
	/** Avatar image, or null. */
	avatar_url: string | null;
}

/** One chat message. */
export interface ChatMessage {
	/** Grows within a room; the key for paging. */
	id: number;
	room_id: number;
	/** Null for a system or operator message. */
	author: ChatUser | null;
	/** Already filtered; empty when the message was removed. */
	text: string;
	/** Server time, milliseconds. */
	ts: number;
	kind: 'text' | 'system' | 'announcement' | 'prize_share';
	status: 'visible' | 'removed';
	/** Echo of the id the sender's tab gave the message, so it can match its pending copy. Use it as the key of a pending message: its `id` is `0`. */
	client_msg_id?: string;
	/** Data specific to `kind` (for example a shared prize), passed through as is. */
	extra?: object;
	/** Set by the SDK only: the message is shown but not confirmed by the service yet. */
	pending?: boolean;
	/** Set by the SDK only: sending failed with this code. */
	failed?: ChatErrorCode;
}

/** One room as the current player sees it. */
export interface ChatRoom {
	room_id: number;
	kind: ChatRoomKind;
	name: string;
	image_url: string | null;
	/** Pinned text shown on top of the room, or null. */
	pinned: string | null;
	/** Key of a keyed room. */
	room_key?: string;
	/** The tournament, clan or raffle an automatic room belongs to. */
	source?: { type: 'tournament' | 'clan' | 'raffle'; id: number };
	/** The other player of a private chat (reserved). */
	peer?: ChatUser;
	my_role: ChatRole;
	/** The moderator's text for a read-only or banned player, or null. */
	my_note: string | null;
	/** Role, mute and the room's write mode in one flag. */
	can_write: boolean;
	/** Players who view this room now. */
	online_count: number;
	/** Capped at 99. */
	unread_count: number;
	last_read_id: number;
	last_message: ChatMessage | null;
	/** Grows on every moderation change (removal, restore, clean). */
	rev: number;
	/** When the room closes, milliseconds, or null. */
	active_till: number | null;
	/** Order of the room in the list. */
	sort: number;
}

/** The current player. */
export interface ChatMe extends ChatUser {
	/** End of a mute in every room, milliseconds, or null. */
	muted_till: number | null;
	/** The moderator's text for the mute, or null. */
	mute_note: string | null;
}

/** A player in a room's member list. */
export interface ChatMember extends ChatUser {
	role: ChatRole;
	online: boolean;
}

/** Limits the UI should apply before sending. */
export interface ChatLimits {
	/** Longest allowed message, characters. */
	max_len: number;
	/** Shortest time between two messages of one player, milliseconds. */
	min_interval_ms: number;
}

/** Features switched on for this site. */
export interface ChatFeatures {
	/** Private chats. */
	dm: boolean;
	/** Rooms created from the page by a key. */
	frontend_rooms: boolean;
}

/** The room a caller wants: by id, by key (created on first use), or the room of a tournament / clan / raffle. */
export type ChatTarget =
	| { room_id: number }
	| { room_key: string; name: string; image_url?: string; segment_id?: number; pinned?: string; active_till?: number; sig?: string }
	| { source_type: 'tournament' | 'clan' | 'raffle'; source_id: number }
	/** Reserved for private chats. */
	| { dm: string };

/** Base of every chat answer. */
export interface ChatResult {
	err_code: ChatErrorCode;
	err_message?: string;
	/** With `RATE_LIMITED`: how long to wait, milliseconds. */
	retry_after_ms?: number;
}

/** Events of the chat stream: event name → data. */
export interface ChatStreamEvents {
	/** First event of every stream; the full state. */
	hello: { stream_id: string; server_time: number; me: ChatMe; rooms: ChatRoom[]; limits: ChatLimits; features: ChatFeatures };
	/** A room appeared or its summary changed. */
	room: ChatRoom;
	/** A room closed, or the player lost access to it. */
	room_gone: { room_id: number; reason: string };
	/** A new message in the room this tab shows. */
	msg: ChatMessage;
	/** A message in the shown room was removed or restored. */
	msg_update: { room_id: number; id: number; status: 'visible' | 'removed'; text: string };
	/** The player's mute changed. */
	me: ChatMe;
	/** Who is online in the shown room. */
	presence: { room_id: number; online_count: number; online: string[] };
	/** The service closes the stream. */
	bye: { reason: 'rotate' | 'too_many' | 'token_expired' | 'chat_disabled' };
}

export type ChatStreamEventName = keyof ChatStreamEvents;

/** Request of the session call. */
export interface ChatSessionRequest {
	label_key: string;
	brand_key?: string | null;
	user_ext_id: string;
	user_hash?: string | null;
	lang?: string;
}

/** Answer of the session call. */
export interface ChatSessionResponse {
	token: string;
	/** Lifetime of the token, seconds. */
	expires_in: number;
	me: ChatMe;
	features: ChatFeatures;
	limits: ChatLimits;
}

/** Connection state of the chat in this tab. */
export type ChatConnectionState = 'idle' | 'connecting' | 'online' | 'retrying' | 'polling' | 'stopped';

/** Answer of `chatGetStatus`. */
export interface ChatStatus {
	state: ChatConnectionState;
	/** Why the chat is `stopped`; `0` otherwise. */
	err_code: ChatErrorCode;
	/** Set when the service itself closed the chat: `too_many` (the chat is open in too many tabs) or `chat_disabled`. */
	bye?: string;
	me: ChatMe | null;
	features: ChatFeatures | null;
	limits: ChatLimits | null;
}

/** Answer of `chatOpenRoom`, and the data its `onUpdate` receives. */
export interface ChatRoomView extends ChatResult {
	room: ChatRoom | null;
	/** Oldest first. */
	messages: ChatMessage[];
	/** There are older messages to load with `chatLoadOlder`. */
	more_before: boolean;
	online: { count: number; uids: string[] };
}

/** Answer of `chatSendMessage`. */
export interface ChatSendResult extends ChatResult {
	/** The stored message; null when sending failed. */
	message: ChatMessage | null;
}

/** Answer of `chatEnsureRoom`. */
export interface ChatEnsureResult extends ChatResult {
	room: ChatRoom | null;
}

/** Answer of `chatLoadOlder`. */
export interface ChatOlderResult extends ChatResult {
	/** There are still older messages to load. */
	more_before: boolean;
}

/** Answer of `chatGetMembers`. */
export interface ChatMembersResult extends ChatResult {
	/** Online players first. */
	members: ChatMember[];
	/** There are more members after this page. */
	more: boolean;
}

/** State of the chat window, kept by the page script. */
export interface ChatUiState {
	open: boolean;
	target: ChatTarget | null;
	/** Grows on every open. */
	seq: number;
}

/** `window._smartico.chat`: opens and closes the chat window. The chat data methods are on `_smartico.api`. */
export interface SmarticoChatUi {
	open(target?: ChatTarget): void;
	close(): void;
	getState(): ChatUiState;
	/** Returns a function that removes the callback. */
	onStateChange(cb: (state: ChatUiState) => void): () => void;
}
