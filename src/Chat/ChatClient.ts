import { IntUtils } from '../IntUtils';
import { ChatErrorCode as E } from './ChatErrorCode';
import {
	ChatConnectionState,
	ChatEnsureResult,
	ChatFeatures,
	ChatLimits,
	ChatMe,
	ChatMembersResult,
	ChatMessage,
	ChatOlderResult,
	ChatReportReason,
	ChatResult,
	ChatRoom,
	ChatRoomView,
	ChatSendResult,
	ChatSessionResponse,
	ChatStatus,
	ChatTarget,
} from './ChatTypes';

/** What the chat needs to know about the page and the player. Read again for every session. */
export interface ChatIdentity {
	/** `CHAT_API_URL` of the label. */
	api_url: string;
	/** `CHAT_ENABLED` of the label. */
	enabled: boolean;
	label_key: string;
	brand_key?: string | null;
	user_ext_id: string;
	user_hash?: string | null;
	lang?: string;
}

/** How a stream ended; the input of {@link ChatClient.nextStep}. */
export interface ChatStreamEnd {
	/** The stream got its `hello`. */
	hello: boolean;
	/** Milliseconds the stream lived after its `hello`. */
	lived: number;
	/** Reason of the `bye` event, when the service closed the stream itself. */
	bye: string | null;
	/** HTTP status of the stream request; 0 when there was no answer. */
	status: number;
	/** `err_code` of a refused stream request. */
	code: number | null;
	/** No `hello` came in time. */
	timedOut: boolean;
}

/** What happens after a stream ended. */
export type ChatStep =
	| { do: 'stop'; code: E; bye?: string }
	| { do: 'poll'; misses?: number }
	| { do: 'retry'; renew: boolean; atOnce: boolean; misses?: number };

type Fn = (...args: any[]) => void;
type Page = { messages: ChatMessage[]; more: boolean };

interface Held {
	/** Stored messages, oldest first. */
	m: ChatMessage[];
	/** Messages of this tab that are not stored yet, or failed. */
	p: ChatMessage[];
	more: boolean;
	rev: number;
	online: string[];
	/** The player is banned in the room: no messages. */
	hidden?: boolean;
	paging?: boolean;
}

// Every number that makes the client wait, repeat or give up; each loop below is bounded by one of them.
const PAGE = 50;
/** Messages kept per room; older ones are dropped and paged in again on demand. */
const ROOM_MAX = 300;
/** No `hello` in this time: the stream does not get through. */
const HELLO_MS = 10000;
/** This many streams without a `hello` in a row: polling. */
const MISSES_TO_POLL = 2;
/** Pauses between two reconnects, seconds; the last one repeats. Each is ±20 %. */
const RETRY_SEC = [1, 2, 5, 10, 30];
/** A stream that lived this long after its `hello` was healthy: the pauses start from the first one again. */
const STABLE_MS = 30000;
const POLL_ROOMS_MS = 30000;
const POLL_MSGS_MS = 5000;
/** While polling, the stream is tried again this often. */
const POLL_STREAM_MS = 300000;
/** Pages asked for when catching up; further behind, the room is loaded anew. */
const PAGES_MAX = 20;
/** A stream that sends this much without ending an event is broken. */
const FRAME_MAX = 1 << 20;
/** The stream closes this long after the last subscriber left. */
const IDLE_MS = 30000;
/** The session is renewed this long before the token ends. */
const RENEW_MS = 300000;
/** At most one read marker per room in this time. */
const READ_MS = 2000;

// local names for the codes used below: they minify to one letter, the enum object lookups do not
const { OK, NETWORK, CHAT_DISABLED, NOT_IDENTIFIED, TOKEN_EXPIRED, ROOM_NOT_FOUND, NO_ACCESS, BANNED, NOT_ENABLED, INTERNAL } = E;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const last = (h: Held) => (h.m.length ? h.m[h.m.length - 1].id : 0);
const no = <T>(code: E, rest: T): T & ChatResult => ({ err_code: code, ...rest });
/** Store data handed out is a deep copy, as OCache answers: what a consumer changes never reaches the store. */
const copy = <T>(x: T): T => (x ? JSON.parse(JSON.stringify(x)) : x);

/**
 * The chat of one page: the session, the stream, and the store every chat UI on the page reads.
 * It knows nothing about the rest of the SDK, so it runs in a test with a fake `fetch`.
 * No method throws: each one resolves with an `err_code`.
 *
 * @hidden
 */
export class ChatClient {
	private token: string | null = null;
	/** The player the store belongs to. */
	private who: string | null = null;
	private me: ChatMe | null = null;
	private limits: ChatLimits | null = null;
	private features: ChatFeatures | null = null;
	private state: ChatConnectionState = 'idle';
	private err = OK;
	/** Why the last try to connect failed; `0` again once the room list comes. A call that waited for the list answers it. */
	private down = OK;
	/** The last reconnect went at once after a young stream: the next one waits for a pause until a stream stays up. */
	private quick = false;
	private declare bye: string | undefined;
	private rooms = new Map<number, ChatRoom>();
	private held = new Map<number, Held>();
	private focus: number | null = null;
	private streamId: string | null = null;

	private onStatus = new Set<Fn>();
	private onRooms = new Set<Fn>();
	private onRoom = new Map<number, Set<Fn>>();
	private onEvt = new Set<Fn>();

	/** Grows whenever the connection is dropped: what an older stream or timer still does is ignored. */
	private gen = 0;
	private declare ac: AbortController | null;
	private timers: any[] = [];
	private retry = 0;
	private misses = 0;
	private declare idleT: any;
	private declare renewT: any;
	private declare sess: Promise<E> | null;
	/** Resolves when the room list is known, or the chat stopped. */
	private declare up: Promise<void>;
	private declare upDone: () => void;
	private reads = new Map<number, { want: number; at: number; t?: any }>();

	constructor(
		private identity: () => ChatIdentity | null,
		private log: { warn: Fn } = console,
		private f: typeof fetch = (input, init) => fetch(input, init),
	) {}

	/**
	 * The one place that says what happens after a stream ended. It reads only its arguments.
	 * `stop`: nothing more until the player acts. `poll`: timers only. `retry`: a new stream after a pause;
	 * without a pause when the service closed the stream on purpose (`rotate`, `token_expired`), but after a
	 * young stream only once until a stream stays up, so a service that keeps closing or refusing streams is
	 * never asked in a tight loop. A refused token gets a new session; a player the service does not know stops
	 * the chat there.
	 */
	public static nextStep(end: ChatStreamEnd, was: { polling: boolean; misses: number; quick?: boolean }): ChatStep {
		if (end.bye === 'chat_disabled' || end.code === CHAT_DISABLED) return { do: 'stop', code: CHAT_DISABLED, bye: end.bye || undefined };
		if (end.bye === 'too_many') return { do: 'stop', code: OK, bye: end.bye };
		// accepted by something, and no `hello` came through: a proxy that holds the stream back
		if (!end.hello && (end.timedOut || end.status === 200)) {
			const misses = was.misses + 1;
			return misses >= MISSES_TO_POLL || was.polling ? { do: 'poll', misses } : { do: 'retry', renew: false, atOnce: false, misses };
		}
		if (was.polling) return { do: 'poll' };
		const expired = end.bye === 'token_expired';
		return {
			do: 'retry',
			renew: expired || end.code === TOKEN_EXPIRED || end.status === 401,
			atOnce: end.hello && (expired || end.bye === 'rotate') && (end.lived >= STABLE_MS || !was.quick),
		};
	}

	/** `0` when chat can work for the current player; else the code every method answers, without a network call. */
	public gate(): E {
		const id = this.identity();
		return !id || !id.enabled || !id.api_url ? CHAT_DISABLED : id.user_ext_id ? OK : NOT_IDENTIFIED;
	}

	public getStatus(cb?: Fn): ChatStatus {
		if (cb) this.onStatus.add(cb);
		return this.status();
	}

	public async getRooms(cb?: Fn): Promise<ChatRoom[]> {
		// kept while the gate is closed: the subscriber gets the list once chat can work (see reset)
		if (cb) this.onRooms.add(cb);
		if (this.gate()) return [];
		await this.live();
		return this.list();
	}

	public async openRoom(id: number, cb?: Fn): Promise<ChatRoomView> {
		const g = this.gate();
		if (g) return this.view(id, g);
		await this.live();
		let r = this.rooms.get(id);
		if (!r && !this.err && !this.down) {
			// Not in the list this tab holds: the room may be new (its `room` event is on the way), or it is not
			// for this player. Only the service knows which, so it is asked instead of answering "not found".
			const x = await this.call<{ rooms: ChatRoom[]; me?: ChatMe }>('GET', '/rooms');
			if (!x.err_code) {
				if (x.me) this.me = x.me;
				await this.setRooms(x.rooms);
				r = this.rooms.get(id);
			}
			if (!r) {
				const why = x.err_code ? x : await this.call<Page>('GET', `/rooms/${id}/messages?limit=1`);
				return this.view(id, why.err_code || ROOM_NOT_FOUND);
			}
		}
		if (!r) return this.view(id, this.err || this.down || ROOM_NOT_FOUND);
		if (cb) (this.onRoom.get(id) || this.onRoom.set(id, new Set()).get(id)!).add(cb);
		this.idle();
		this.focus = id;
		// focus before the load: a message posted between the two then arrives as an event
		await this.sendFocus();
		let e = OK;
		if (this.held.has(id)) await this.sync(r, true);
		else e = await this.load(r);
		// a banned player keeps the room and its note; only the messages are hidden
		return this.view(id, e === BANNED ? OK : e);
	}

	public closeRoom(id: number): void {
		this.onRoom.delete(id);
		if (this.focus === id) {
			this.focus = null;
			this.sendFocus();
		}
		this.idle();
	}

	public async loadOlder(id: number, limit?: number): Promise<ChatOlderResult> {
		const h = this.held.get(id);
		if (!h) return no(this.gate() || ROOM_NOT_FOUND, { more_before: false });
		if (!h.m.length || !h.more) return no(OK, { more_before: false });
		const x = await this.call<Page>('GET', `/rooms/${id}/messages?before=${h.m[0].id}&limit=${limit || PAGE}`);
		if (!x.err_code && this.held.get(id) === h) {
			this.merge(h, x.messages, true);
			h.more = x.more;
			this.emitRoom(id);
		}
		return { err_code: x.err_code, err_message: x.err_message, more_before: h.more };
	}

	public async send(id: number, text: string): Promise<ChatSendResult> {
		const g = await this.ready();
		if (g) return no(g, { message: null });
		const h = this.held.get(id);
		const p: ChatMessage = {
			id: 0,
			room_id: id,
			author: this.me,
			text,
			ts: Date.now(),
			kind: 'text',
			status: 'visible',
			client_msg_id: IntUtils.uuid(),
			pending: true,
		};
		if (h) {
			// a new try replaces the copies that failed before
			h.p = h.p.filter((m) => !m.failed).concat(p);
			this.emitRoom(id);
		}
		const x = await this.call<{ message: ChatMessage }>('POST', `/rooms/${id}/messages`, { text, client_msg_id: p.client_msg_id });
		if (h) {
			h.p = h.p.filter((m) => m !== p);
			if (x.err_code) h.p.push({ ...p, pending: false, failed: x.err_code });
			// a test command is carried out, not stored: the answer has no message
			else if (x.message) this.merge(h, [x.message]);
			this.emitRoom(id);
		}
		return { ...x, message: copy(x.message) || null };
	}

	public markRead(id: number, messageId: number): void {
		const r = this.rooms.get(id);
		if (this.gate() || !r || !(messageId > r.last_read_id)) return;
		const s = this.reads.get(id) || this.reads.set(id, { want: 0, at: 0 }).get(id)!;
		s.want = Math.max(s.want, messageId);
		if (s.t) return;
		s.t = setTimeout(async () => {
			s.t = 0;
			s.at = Date.now();
			const want = s.want;
			const x = await this.call<{ unread_count: number }>('POST', `/rooms/${id}/read`, { message_id: want });
			const now = this.rooms.get(id);
			if (!x.err_code && now) {
				this.rooms.set(id, { ...now, last_read_id: Math.max(now.last_read_id, want), unread_count: x.unread_count });
				this.emitRooms();
			}
		}, Math.max(0, s.at + READ_MS - Date.now()));
	}

	public async ensure(t: ChatTarget): Promise<ChatEnsureResult> {
		const g = this.gate();
		if (g) return no(g, { room: null });
		if ('dm' in t) return no(NOT_ENABLED, { room: null });
		if ('room_id' in t) {
			await this.live();
			const r = this.rooms.get(t.room_id);
			return no(r ? OK : this.err || this.down || ROOM_NOT_FOUND, { room: r ? copy(r) : null });
		}
		const e = await this.session();
		if (e) return no(e, { room: null });
		const x = await this.call<{ room: ChatRoom }>('POST', '/rooms/ensure', t);
		if (!x.err_code) {
			this.rooms.set(x.room.room_id, x.room);
			this.emitRooms();
		}
		return { ...x, room: copy(x.room) || null };
	}

	public async getMembers(id: number, onlineOnly?: boolean, offset?: number, limit?: number): Promise<ChatMembersResult> {
		const g = await this.ready();
		if (g) return no(g, { members: [], more: false });
		const x = await this.call<ChatMembersResult>(
			'GET',
			`/rooms/${id}/members?offset=${offset || 0}&limit=${limit || PAGE}${onlineOnly ? '&online=1' : ''}`,
		);
		return { ...x, members: x.members || [], more: !!x.more };
	}

	public async report(roomId: number, messageId: number, reason: ChatReportReason, comment?: string): Promise<ChatResult> {
		const g = await this.ready();
		if (g) return no(g, {});
		return this.call('POST', '/messages/report', { room_id: roomId, message_id: messageId, reason, comment });
	}

	public onEvent(cb: Fn): () => void {
		// kept while the gate is closed, like a room list subscriber
		this.onEvt.add(cb);
		if (!this.gate()) this.go(this.live());
		return () => this.unsubscribe(cb);
	}

	public unsubscribe(fn: Fn): void {
		[this.onStatus, this.onRooms, this.onEvt].forEach((s) => s.delete(fn));
		this.onRoom.forEach((s) => s.delete(fn));
		this.idle();
	}

	/** Closes the stream and drops every subscription. The store is kept until the player changes. */
	public close(): void {
		[this.onStatus, this.onRooms, this.onEvt, this.onRoom].forEach((s) => s.clear());
		this.shut();
	}

	/**
	 * The player was identified again or logged out: nothing of another player stays. Subscribers stay
	 * registered. When chat can work now, the room list and event subscribers get data at once, also those
	 * that came while it could not (no settings or no player yet).
	 */
	public reset(): void {
		const id = this.identity();
		if (this.who && !(id && id.user_ext_id === this.who)) {
			this.shut();
			this.token = this.who = this.me = null;
			this.rooms.clear();
			this.held.clear();
			this.reads.clear();
			this.emitRooms();
		}
		if (!this.gate() && this.state === 'idle' && this.onRooms.size + this.onEvt.size) this.go(this.live());
	}

	// ───────────── session and transport ─────────────

	private base(): string {
		// only called after the gate, which needs an identity
		return this.identity()!.api_url.replace(/\/+$/, '') + '/chat/v1';
	}

	private async call<T = {}>(method: string, path: string, body?: any, again?: boolean): Promise<T & ChatResult> {
		const attempt = async () => {
			const headers: any = body ? { 'Content-Type': 'application/json' } : {};
			if (this.token && path !== '/session') headers.Authorization = 'Bearer ' + this.token;
			const res = await this.f(this.base() + path, { method, headers, body: body && JSON.stringify(body) });
			return { res, json: await res.json().catch((): any => null) };
		};
		const none = (): any => null;
		let got = await attempt().catch(none);
		if (!got) {
			// one more try after a second when there was no answer; sending twice is safe, the message carries its own id
			await sleep(1000);
			got = await attempt().catch(none);
		}
		if (!got) return no(NETWORK, { err_message: 'No connection' }) as any;
		const { res, json } = got;
		if (res.ok) return { ...json, err_code: OK };
		const code: E = json && typeof json.err_code === 'number' ? json.err_code : INTERNAL;
		// an expired token is not the caller's problem: a new session, then the same call once more
		if (code === TOKEN_EXPIRED && path !== '/session' && !again) {
			const e = await this.session(true);
			if (!e) return this.call(method, path, body, true);
		}
		return { err_code: code, err_message: (json && json.err_message) || 'HTTP ' + res.status, retry_after_ms: json && json.retry_after_ms } as any;
	}

	/** The gate, then the session: `0` when a call can be made. */
	private ready(): E | Promise<E> {
		return this.gate() || this.session();
	}

	/** Opens or renews the session; one call at a time. Answers `0` when a token is held. */
	private session(renew?: boolean): Promise<E> {
		if (this.token && !renew) return Promise.resolve(OK);
		return (
			this.sess ||
			(this.sess = (async () => {
				const id = this.identity();
				const x = id
					? await this.call<ChatSessionResponse>('POST', '/session', {
							label_key: id.label_key,
							brand_key: id.brand_key || null,
							user_ext_id: id.user_ext_id,
							user_hash: id.user_hash || null,
							lang: id.lang,
					  })
					: no(CHAT_DISABLED, {} as ChatSessionResponse);
				this.sess = null;
				if (x.err_code) {
					this.token = null;
					return x.err_code;
				}
				this.token = x.token;
				// without an identity there was no call and the code above returned
				this.who = id!.user_ext_id;
				this.me = x.me;
				this.limits = x.limits;
				this.features = x.features;
				clearTimeout(this.renewT);
				// only a chat that is in use keeps its session alive
				this.renewT = setTimeout(
					() => this.state !== 'idle' && this.state !== 'stopped' && this.session(true),
					Math.max(x.expires_in * 1000 - RENEW_MS, 60000),
				);
				return OK;
			})())
		);
	}

	// ───────────── connection ─────────────

	/**
	 * Brings the session and the stream up when they are not. Resolves when the room list is known, the chat
	 * stopped, or a try failed: `down` then says why, and the next try goes on behind the caller.
	 */
	private async live(): Promise<void> {
		clearTimeout(this.idleT);
		if (this.state === 'idle' || this.state === 'stopped') {
			this.down = OK;
			this.up = new Promise((r) => (this.upDone = r));
			this.setState('connecting');
			this.go(this.connect());
		}
		await this.up;
		this.idle();
	}

	private async connect(): Promise<void> {
		this.drop();
		const gen = this.gen;
		const e = await this.ready();
		if (gen !== this.gen) return;
		if (e === NETWORK || e === INTERNAL) this.pause(() => this.connect(), e);
		else if (e) this.halt(e);
		else this.go(this.open());
	}

	private async open(): Promise<void> {
		this.drop();
		const gen = this.gen;
		const ac = (this.ac = new AbortController());
		if (this.state !== 'polling') this.setState('connecting');

		const end = await this.read(ac, gen);
		if (gen !== this.gen) return;
		this.streamId = null;
		// only a stream that stayed up earns short pauses and a young reconnect at once again; a `hello` alone does not
		if (end.hello && end.lived >= STABLE_MS) {
			this.retry = 0;
			this.quick = false;
		}

		const step = ChatClient.nextStep(end, { polling: this.state === 'polling', misses: this.misses, quick: this.quick });
		if (step.do === 'stop') return this.halt(step.code, step.bye);
		if (step.misses !== undefined) this.misses = step.misses;
		if (step.do === 'poll') return this.poll();
		if (step.atOnce && end.lived < STABLE_MS) this.quick = true;
		const again = async () => {
			const e = await (step.renew ? this.session(true) : OK);
			if (gen !== this.gen) return;
			e ? this.halt(e) : this.go(this.open());
		};
		// a held-back stream gets its second try, and a refused token its new session, before a waiting call hears of it
		step.atOnce ? this.go(again()) : this.pause(again, step.renew || step.misses !== undefined ? OK : end.code || NETWORK);
	}

	/** Reads the stream until it ends and reports how it ended; what happens next is decided by nextStep(). */
	private async read(ac: AbortController, gen: number): Promise<ChatStreamEnd> {
		const end: ChatStreamEnd = { hello: false, lived: 0, bye: null, status: 0, code: null, timedOut: false };
		let at = 0;
		const t = setTimeout(() => {
			if (!end.hello) {
				end.timedOut = true;
				ac.abort();
			}
		}, HELLO_MS);
		const onFrame = async (frame: string) => {
			const name = /^event: ?(.*)$/m.exec(frame);
			const data = /^data: ?(.*)$/m.exec(frame);
			let d: any;
			try {
				d = name && data && JSON.parse(data[1]);
			} catch (e) {}
			if (!d || !name) return;
			if (name[1] === 'hello') {
				end.hello = true;
				at = Date.now();
			}
			if (name[1] === 'bye') end.bye = d.reason;
			// one event the store cannot take must not end the stream
			await this.event(name[1], d).catch((e) => this.log.warn('[smartico] chat event failed', name[1], e));
		};
		const run = async () => {
			const res = await this.f(this.base() + '/stream', { headers: { Authorization: 'Bearer ' + this.token }, signal: ac.signal });
			end.status = res.status;
			if (res.status !== 200) {
				const refusal = await res.json().catch((): any => null);
				end.code = refusal && typeof refusal.err_code === 'number' ? refusal.err_code : null;
				return;
			}
			// a 200 without a body throws here, and the stream counts as broken
			const reader = res.body!.getReader();
			const decoder = new TextDecoder();
			let buf = '';
			// ends when the service closes the stream, the client aborts it (read() then rejects), or the stream is broken
			for (let chunk = await reader.read(); !chunk.done && gen === this.gen; chunk = await reader.read()) {
				buf += decoder.decode(chunk.value, { stream: true });
				// each turn takes one event off the buffer
				for (let i = buf.indexOf('\n\n'); i >= 0; i = buf.indexOf('\n\n')) {
					const frame = buf.substring(0, i);
					buf = buf.substring(i + 2);
					await onFrame(frame);
				}
				if (buf.length > FRAME_MAX) throw 0;
			}
		};
		// aborted, or the connection broke: `end` says which
		await run().catch(() => {});
		clearTimeout(t);
		ac.abort();
		end.lived = at ? Date.now() - at : 0;
		return end;
	}

	/** Polling: for a network that does not let the stream through. Only the ordinary calls, on timers. */
	private poll(): void {
		this.drop();
		this.setState('polling');
		const gen = this.gen;
		const rooms = this.once(async () => {
			const x = await this.call<{ rooms: ChatRoom[]; me?: ChatMe }>('GET', '/rooms');
			if (gen !== this.gen) return;
			if (x.err_code === CHAT_DISABLED) return this.halt(x.err_code);
			if (x.err_code) return this.release(x.err_code);
			// the only way a polling client learns its mute
			if (x.me) this.me = x.me;
			await this.setRooms(x.rooms);
			this.emitStatus();
		});
		const msgs = this.once(async () => {
			const id = this.focus;
			if (id === null) return;
			await this.after(id);
			if (gen === this.gen) this.emitRoom(id);
		});
		rooms();
		this.timers.push(setInterval(rooms, POLL_ROOMS_MS), setInterval(msgs, POLL_MSGS_MS));
		this.later(POLL_STREAM_MS, () => this.go(this.open()));
	}

	/** A poll whose answer is slow is not started again: the tick that finds it running is skipped. */
	private once(fn: () => Promise<void>): () => void {
		let busy = false;
		return () => {
			if (busy) return;
			busy = true;
			this.go(fn().then(() => (busy = false), () => (busy = false)));
		};
	}

	/**
	 * Runs `fn` after the next pause: 1, 2, 5, 10, 30 s, then 30 s again and again. With `why` (the try failed),
	 * a call that waits for the room list answers it now instead of waiting through the pauses.
	 */
	private pause(fn: () => void, why: E = OK): void {
		const sec = RETRY_SEC[Math.min(this.retry++, RETRY_SEC.length - 1)];
		this.setState('retrying');
		if (why) this.release(why);
		this.later(sec * 1000 * (0.8 + Math.random() * 0.4), fn);
	}

	/** A try failed: a call that waits for the room list answers `why`; the next try goes on behind it. */
	private release(why: E): void {
		this.down = why;
		if (this.upDone) this.upDone();
	}

	private later(ms: number, fn: () => void): void {
		const gen = this.gen;
		this.timers.push(setTimeout(() => gen === this.gen && fn(), ms));
	}

	/** Ends the stream and every timer of the connection. */
	private drop(): void {
		this.gen++;
		this.timers.forEach((t) => {
			clearTimeout(t);
			clearInterval(t);
		});
		this.timers = [];
		if (this.ac) this.ac.abort();
		this.ac = this.streamId = null;
	}

	/** The service said stop, or the session was refused: nothing more until a new call. */
	private halt(code: E, bye?: string): void {
		this.drop();
		this.err = code;
		this.bye = bye;
		this.setState('stopped');
		if (this.upDone) this.upDone();
	}

	/** Closes the connection of a chat nobody watches. The store stays for a quick reopen. */
	private shut(): void {
		this.drop();
		clearTimeout(this.idleT);
		clearTimeout(this.renewT);
		this.focus = null;
		if (this.upDone) this.upDone();
		if (this.state !== 'idle') this.setState('idle');
	}

	private idle(): void {
		clearTimeout(this.idleT);
		let n = this.onRooms.size + this.onEvt.size;
		this.onRoom.forEach((s) => (n += s.size));
		if (!n && this.state !== 'idle') this.idleT = setTimeout(() => this.shut(), IDLE_MS);
	}

	private go(p: Promise<any>): void {
		p.catch((e) => this.log.warn('[smartico] chat failed', e));
	}

	// ───────────── store ─────────────

	private async event(name: string, d: any): Promise<void> {
		// every event, known or not, for the code that wants the raw stream
		this.emit(this.onEvt, name, copy(d));
		const h = this.held.get(d.room_id);
		switch (name) {
			case 'hello':
				this.streamId = d.stream_id;
				this.me = d.me;
				this.limits = d.limits;
				this.features = d.features;
				this.misses = 0;
				this.setState('online');
				await this.setRooms(d.rooms);
				// a new stream shows the room list until told otherwise
				if (this.focus !== null) this.sendFocus();
				break;
			case 'room':
				this.rooms.set(d.room_id, d);
				await this.sync(d);
				this.emitRooms();
				this.emitRoom(d.room_id);
				break;
			case 'room_gone':
				this.gone(d.room_id);
				break;
			case 'msg':
				if (h) {
					this.merge(h, [d]);
					this.emitRoom(d.room_id);
				}
				break;
			case 'msg_update': {
				const i = h ? h.m.findIndex((m) => m.id === d.id) : -1;
				if (h && i >= 0) {
					h.m[i] = { ...h.m[i], status: d.status, text: d.text };
					this.emitRoom(d.room_id);
				}
				break;
			}
			case 'me':
				this.me = d;
				this.emitStatus();
				break;
			case 'presence': {
				const r = this.rooms.get(d.room_id);
				if (r) this.rooms.set(d.room_id, { ...r, online_count: d.online_count });
				if (h) h.online = d.online;
				this.emitRoom(d.room_id);
				break;
			}
		}
	}

	/** The resync rule: the list is replaced, held rooms catch up by ids, rooms that left the list are dropped. */
	private async setRooms(list: ChatRoom[]): Promise<void> {
		this.down = OK;
		this.rooms = new Map(list.map((r) => [r.room_id, r]));
		for (const id of Array.from(this.held.keys())) {
			const r = this.rooms.get(id);
			if (r) await this.sync(r, true);
			else this.gone(id);
		}
		if (this.focus !== null && !this.rooms.has(this.focus)) this.focus = null;
		this.emitRooms();
		this.onRoom.forEach((_, id) => this.emitRoom(id));
		if (this.upDone) this.upDone();
	}

	/**
	 * Brings a held room up to the summary the service sent. A room that is not shown waits (its `rev` then
	 * differs) until it is opened again or the next `hello`: no request for a room nobody looks at.
	 */
	private async sync(r: ChatRoom, now?: boolean): Promise<void> {
		const h = this.held.get(r.room_id);
		if (!h || (!now && r.room_id !== this.focus)) return;
		if (r.my_role === 'banned') {
			this.held.set(r.room_id, { m: [], p: [], more: false, rev: r.rev, online: [], hidden: true });
		} else if (h.hidden || h.rev !== r.rev) {
			await this.load(r);
		} else if (r.last_message && r.last_message.id > last(h)) {
			await this.after(r.room_id);
		}
	}

	/** Loads the newest messages of a room in place of what is held. */
	private async load(r: ChatRoom): Promise<E> {
		const old = this.held.get(r.room_id);
		// `paging` until the page is in: a summary that comes meanwhile (the focus call brings one) would otherwise
		// find the room empty and catch up from its first message
		const h: Held = { m: [], p: old ? old.p : [], more: false, rev: r.rev, online: old ? old.online : [], paging: true };
		this.held.set(r.room_id, h);
		const x = await this.call<Page>('GET', `/rooms/${r.room_id}/messages?limit=${PAGE}`);
		h.paging = false;
		// events that came meanwhile are already in `h`; merge keeps both
		if (this.held.get(r.room_id) !== h) return OK;
		if (!x.err_code) {
			this.merge(h, x.messages);
			h.more = x.more;
		} else if (x.err_code === BANNED) {
			h.hidden = true;
		} else if (x.err_code === ROOM_NOT_FOUND || x.err_code === NO_ACCESS) {
			this.gone(r.room_id);
		}
		return x.err_code;
	}

	/**
	 * Loads what came after the newest held message. It always ends: a page must bring a newer message to be
	 * followed by another, the pages are counted, and a room is never caught up twice at the same time.
	 */
	private async after(id: number): Promise<void> {
		const h = this.held.get(id);
		if (!h || h.hidden || h.paging) return;
		h.paging = true;
		let ok = true;
		let more = true;
		for (let i = 0; ok && more && i < PAGES_MAX; i++) {
			const from = last(h);
			const x = await this.call<Page>('GET', `/rooms/${id}/messages?after=${from}&limit=${PAGE}`);
			ok = !x.err_code && this.held.get(id) === h;
			if (ok) {
				this.merge(h, x.messages);
				// "more" with nothing newer would ask for the same page for ever
				more = x.more && last(h) > from;
			}
		}
		h.paging = false;
		// still behind after the last page: start again from the newest messages
		const r = this.rooms.get(id);
		if (ok && more && r) await this.load(r);
	}

	/** Adds messages by id, oldest first, without doubles; a stored message replaces its pending copy. */
	private merge(h: Held, list: ChatMessage[], older?: boolean): void {
		for (const m of list) {
			if (m.client_msg_id) h.p = h.p.filter((p) => p.client_msg_id !== m.client_msg_id);
			let i = h.m.length;
			while (i > 0 && h.m[i - 1].id > m.id) i--;
			if (i > 0 && h.m[i - 1].id === m.id) h.m[i - 1] = m;
			else h.m.splice(i, 0, m);
		}
		if (!older && h.m.length > ROOM_MAX) {
			h.m.splice(0, h.m.length - ROOM_MAX);
			h.more = true;
		}
	}

	/** The room closed or the player lost it: its subscribers hear it once and are dropped. */
	private gone(id: number): void {
		this.rooms.delete(id);
		this.held.delete(id);
		this.reads.delete(id);
		if (this.focus === id) this.focus = null;
		this.emit(this.onRoom.get(id), this.view(id, ROOM_NOT_FOUND));
		this.onRoom.delete(id);
		this.emitRooms();
	}

	private sendFocus(): Promise<any> {
		return this.streamId ? this.call('POST', '/stream/focus', { stream_id: this.streamId, room_id: this.focus }) : Promise.resolve();
	}

	// ───────────── what subscribers get: a fresh copy each time ─────────────

	private status(): ChatStatus {
		const g = this.gate();
		return copy({
			state: this.state,
			err_code: g || this.err,
			bye: this.bye,
			me: g ? null : this.me,
			features: this.features,
			limits: this.limits,
		});
	}

	private list(): ChatRoom[] {
		return copy(Array.from(this.rooms.values()).sort((a, b) => a.sort - b.sort || a.room_id - b.room_id));
	}

	private view(id: number, err: E = OK): ChatRoomView {
		const r = this.rooms.get(id);
		const h = this.held.get(id);
		return copy({
			err_code: err,
			room: r || null,
			messages: h ? h.m.concat(h.p) : [],
			more_before: !!h && h.more,
			online: { count: r ? r.online_count : 0, uids: h ? h.online : [] },
		});
	}

	private setState(state: ChatConnectionState): void {
		this.state = state;
		if (state !== 'stopped') {
			this.err = OK;
			this.bye = undefined;
		}
		this.emitStatus();
	}

	private emitStatus(): void {
		this.emit(this.onStatus, this.status());
	}

	private emitRooms(): void {
		this.emit(this.onRooms, this.list());
	}

	private emitRoom(id: number): void {
		this.emit(this.onRoom.get(id), this.view(id));
	}

	/** A callback is consumer code: an error in it must not break the chat. */
	private emit(to: Set<Fn> | undefined, ...args: any[]): void {
		if (to) {
			to.forEach((fn) => {
				try {
					fn(...args);
				} catch (e) {
					this.log.warn('[smartico] chat callback failed', e);
				}
			});
		}
	}
}
