/* eslint-disable */
// Unit test of the chat SDK (src/Chat/ChatClient.ts, src/WSAPI/WSAPIChat.ts) against a fake chat service.
// It runs on the built package, with the test runner that comes with Node (20 or newer), no extra dependency:
//
//   npm run build && npm test
//
// `npm test` runs it twice: on the modern build (what the tracker bundles for browsers) and on the cjs build
// (what Node consumers load), because the two are compiled differently. SDK_BUILD=cjs picks the second.
// The fake service below speaks protocol v1 through a fake `fetch`; time is driven by the runner's mock timers.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const sdk = process.env.SDK_BUILD === 'cjs' ? createRequire(import.meta.url)('../dist/index.js') : await import('../dist/index.modern.mjs');
const { ChatClient, ChatErrorCode: E, SmarticoAPI, PublicLabelSettings, ClassId } = sdk;

const enc = new TextEncoder();
const flush = async (n = 8) => {
	for (let i = 0; i < n; i++) await new Promise((r) => setImmediate(r));
};

// ───────────── the fake chat service ─────────────

const room = (id, name, over = {}) => ({
	room_id: id, kind: 'custom', name, image_url: null, pinned: null, my_role: 'member', my_note: null, can_write: true,
	online_count: 0, unread_count: 0, last_read_id: 0, last_message: null, rev: 1, active_till: null, sort: id, ...over,
});
const msg = (roomId, id, text, over = {}) => ({
	id, room_id: roomId, author: { uid: 'u-other', name: 'Other', avatar_url: null }, text, ts: 1000 + id, kind: 'text', status: 'visible', ...over,
});
const answer = (status, body) => ({ status, ok: status >= 200 && status < 300, json: async () => body });

function makeService() {
	const s = {
		calls: [],
		streams: [],
		sessions: 0,
		/** 'hello' (a stream that says hello), 'silent' (accepted, nothing comes: a buffering proxy), or an answer */
		streamMode: 'hello',
		/** answers given once for the next call that matches `METHOD path-regexp` */
		once: [],
		refusedTokens: new Set(),
		me: { uid: 'u-me', name: 'Me', avatar_url: null, muted_till: null, mute_note: null },
		rooms: [room(3, 'Race', { kind: 'tournament' }), room(1, 'General'), room(4, 'News', { kind: 'announcement', can_write: false })],
		msgs: { 1: [msg(1, 1, 'first')], 3: [], 4: [] },
	};
	s.hello = () => ({
		stream_id: 'stream-' + s.streams.length, server_time: Date.now(), me: s.me, rooms: s.rooms,
		limits: { max_len: 300, min_interval_ms: 1500 }, features: { dm: false, frontend_rooms: true },
	});
	s.stream = () => s.streams[s.streams.length - 1];
	s.count = (method, re) => s.calls.filter((c) => c.method === method && re.test(c.path)).length;
	s.failOnce = (method, re, status, body) => s.once.push({ method, re, status, body });

	s.fetch = async (url, init = {}) => {
		const u = new URL(url);
		const path = u.pathname.replace('/chat/v1', '') + u.search;
		const method = init.method || 'GET';
		const body = init.body ? JSON.parse(init.body) : undefined;
		const auth = init.headers && init.headers.Authorization;
		s.calls.push({ method, path, body, auth });
		if (s.down) throw new TypeError('fetch failed');

		const i = s.once.findIndex((o) => o.method === method && o.re.test(path));
		if (i >= 0) {
			const o = s.once.splice(i, 1)[0];
			return answer(o.status, o.body);
		}
		if (path === '/session') {
			s.sessions++;
			return answer(200, { token: 'token-' + s.sessions, expires_in: 7200, me: s.me, features: s.hello().features, limits: s.hello().limits });
		}
		if (auth && s.refusedTokens.has(auth.substring(7))) return answer(401, { err_code: E.TOKEN_EXPIRED, err_message: 'expired' });

		if (path === '/stream') {
			if (typeof s.streamMode === 'object') return answer(s.streamMode.status, s.streamMode.body);
			const queue = [];
			let wake = null;
			let ended = false;
			const st = {
				auth,
				aborted: false,
				push: (event, data) => {
					queue.push(enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
					if (wake) wake();
				},
				raw: (text) => {
					queue.push(enc.encode(text));
					if (wake) wake();
				},
				end: () => {
					ended = true;
					if (wake) wake();
				},
			};
			init.signal.addEventListener('abort', () => {
				st.aborted = true;
				if (wake) wake();
			});
			const read = () =>
				new Promise((resolve, reject) => {
					const look = () => {
						wake = null;
						if (queue.length) return resolve({ done: false, value: queue.shift() });
						if (ended) return resolve({ done: true });
						if (init.signal.aborted) return reject(new Error('aborted'));
						wake = look;
					};
					look();
				});
			s.streams.push(st);
			if (s.streamMode === 'hello') st.push('hello', s.hello());
			return { status: 200, ok: true, body: { getReader: () => ({ read }) } };
		}
		if (path === '/stream/focus') return answer(200, {});
		if (path === '/rooms') return answer(200, { rooms: s.rooms, me: s.me });
		if (path === '/rooms/ensure') {
			const r = room(1001, body.name, { kind: 'keyed', room_key: body.room_key });
			s.rooms.push(r);
			s.msgs[1001] = [];
			return answer(200, { room: r });
		}
		if (path === '/messages/report') return answer(200, {});
		const m = /^\/rooms\/(\d+)\/(messages|read|members)(\?.*)?$/.exec(path);
		const id = Number(m[1]);
		const list = s.msgs[id] || [];
		if (m[2] === 'read') return answer(200, { unread_count: 0 });
		if (m[2] === 'members') return answer(200, { members: [{ ...s.me, role: 'member', online: true }], more: false });
		if (method === 'POST') {
			const stored = msg(id, (list.length ? list[list.length - 1].id : 0) + 1, body.text, { author: s.me, client_msg_id: body.client_msg_id });
			list.push(stored);
			return answer(200, { message: stored });
		}
		const q = u.searchParams;
		const limit = Number(q.get('limit') || 50);
		if (q.has('after')) {
			const from = list.findIndex((x) => x.id > Number(q.get('after')));
			const start = from < 0 ? list.length : from;
			return answer(200, { messages: list.slice(start, start + limit), more: start + limit < list.length });
		}
		const end = q.has('before') ? list.findIndex((x) => x.id >= Number(q.get('before'))) : list.length;
		const stop = end < 0 ? list.length : end;
		const start = Math.max(0, stop - limit);
		return answer(200, { messages: list.slice(start, stop), more: start > 0 });
	};
	return s;
}

const identityOf = (over = {}) => ({
	api_url: 'https://chat.test/', enabled: true, label_key: 'label-key', brand_key: 'brand', user_ext_id: 'player-1', user_hash: 'hash:1', lang: 'EN', ...over,
});

/** A service, a client on it, mock timers and a fixed random (so every pause is its plain value). */
function setup(t, over = {}) {
	t.mock.timers.enable({ apis: ['setTimeout', 'setInterval', 'Date'], now: 1_700_000_000_000 });
	t.mock.method(Math, 'random', () => 0.5);
	const service = makeService();
	const warnings = [];
	const who = { id: identityOf(over) };
	const client = new ChatClient(() => who.id, { warn: (...a) => warnings.push(a) }, service.fetch);
	const tick = async (ms, step = 500) => {
		for (let left = ms; left > 0; left -= step) {
			t.mock.timers.tick(Math.min(step, left));
			await flush();
		}
	};
	return { service, client, warnings, who, tick };
}

// ───────────── the gate ─────────────

test('chat switched off or no player: every method answers at once, without a network call', async (t) => {
	for (const [over, code] of [[{ enabled: false }, E.CHAT_DISABLED], [{ api_url: '' }, E.CHAT_DISABLED], [{ user_ext_id: '' }, E.NOT_IDENTIFIED]]) {
		const { service, client } = setup(t, over);
		assert.deepEqual(await client.getRooms(() => {}), []);
		assert.equal((await client.openRoom(1)).err_code, code);
		assert.equal((await client.send(1, 'hi')).err_code, code);
		assert.equal((await client.ensure({ room_key: 'k', name: 'n' })).err_code, code);
		assert.equal((await client.getMembers(1)).err_code, code);
		assert.equal((await client.report(1, 1, 'spam')).err_code, code);
		assert.equal((await client.loadOlder(1)).err_code, code);
		client.markRead(1, 5);
		client.onEvent(() => {})();
		assert.equal(client.getStatus().err_code, code);
		assert.equal(client.getStatus().state, 'idle');
		assert.equal(service.calls.length, 0, 'no network call');
		t.mock.timers.reset();
		t.mock.restoreAll();
	}
});

test('no identity at all (visitor mode) is the same as chat switched off', async (t) => {
	const { service, client, who } = setup(t);
	who.id = null;
	assert.equal(client.gate(), E.CHAT_DISABLED);
	assert.deepEqual(await client.getRooms(), []);
	assert.equal(service.calls.length, 0);
});

// ───────────── session, hello, the room list ─────────────

test('the first read opens one session and one stream, and answers the rooms in list order', async (t) => {
	const { service, client } = setup(t);
	const statuses = [];
	client.getStatus((s) => statuses.push(s.state));
	const seen = [];
	const rooms = await client.getRooms((list) => seen.push(list));

	assert.deepEqual(rooms.map((r) => r.name), ['General', 'Race', 'News']);
	assert.deepEqual(service.calls[0], {
		method: 'POST', path: '/session', auth: undefined,
		body: { label_key: 'label-key', brand_key: 'brand', user_ext_id: 'player-1', user_hash: 'hash:1', lang: 'EN' },
	});
	assert.equal(service.stream().auth, 'Bearer token-1', 'the token goes in a header, on the stream too');
	assert.deepEqual(statuses, ['connecting', 'connecting', 'online']);
	const status = client.getStatus();
	assert.equal(status.state, 'online');
	assert.equal(status.me.uid, 'u-me');
	assert.equal(status.limits.max_len, 300);

	// a second reader shares the session and the stream
	await client.getRooms(() => {});
	assert.equal(service.sessions, 1);
	assert.equal(service.streams.length, 1);

	// what subscribers get is a fresh copy: changing it does not change the store
	rooms[0].name = 'changed by the UI';
	assert.equal((await client.getRooms())[0].name, 'General');
	assert.ok(seen.length >= 1);
});

test('a refused session stops the chat with the code', async (t) => {
	const { service, client } = setup(t);
	service.failOnce('POST', /^\/session$/, 401, { err_code: E.BAD_HASH, err_message: 'Missing or invalid user_hash' });
	assert.deepEqual(await client.getRooms(), []);
	assert.equal(client.getStatus().state, 'stopped');
	assert.equal(client.getStatus().err_code, E.BAD_HASH);
	assert.equal(service.streams.length, 0);
	// the next call is a new try
	assert.equal((await client.getRooms()).length, 3);
	assert.equal(client.getStatus().state, 'online');
});

// ───────────── an open room ─────────────

test('opening a room: focus first, then the newest messages; events keep the view current', async (t) => {
	const { service, client } = setup(t);
	const views = [];
	const lists = [];
	await client.getRooms((l) => lists.push(l));
	const view = await client.openRoom(1, (v) => views.push(v));

	assert.equal(view.err_code, E.OK);
	assert.equal(view.room.name, 'General');
	assert.deepEqual(view.messages.map((m) => m.text), ['first']);
	assert.equal(view.more_before, false);
	const order = service.calls.map((c) => `${c.method} ${c.path}`);
	assert.ok(order.indexOf('POST /stream/focus') < order.indexOf('GET /rooms/1/messages?limit=50'), 'focus before the load');
	assert.deepEqual(service.calls.find((c) => c.path === '/stream/focus').body, { stream_id: 'stream-1', room_id: 1 });

	// a message of another player
	service.stream().push('msg', msg(1, 2, 'hello'));
	await flush();
	assert.deepEqual(views[views.length - 1].messages.map((m) => m.text), ['first', 'hello']);

	// the same message again (a late answer, a resync) is not shown twice
	service.stream().push('msg', msg(1, 2, 'hello'));
	await flush();
	assert.equal(views[views.length - 1].messages.length, 2);

	// presence and the room summary
	service.stream().push('presence', { room_id: 1, online_count: 2, online: ['u-me', 'u-other'] });
	service.stream().push('room', room(1, 'General', { unread_count: 1, online_count: 2, last_message: msg(1, 2, 'hello') }));
	await flush();
	assert.deepEqual(views[views.length - 1].online, { count: 2, uids: ['u-me', 'u-other'] });
	assert.equal(lists[lists.length - 1].find((r) => r.room_id === 1).unread_count, 1);

	// an event of a newer service reaches chatOnEvent and does not break the store
	const raw = [];
	client.onEvent((name, data) => raw.push([name, data]));
	service.stream().push('reaction', { room_id: 1, id: 2, emoji: 'x' });
	await flush();
	assert.deepEqual(raw, [['reaction', { room_id: 1, id: 2, emoji: 'x' }]]);
	assert.equal(client.getStatus().state, 'online');

	// closing the room: back to the list
	client.closeRoom(1);
	await flush();
	assert.deepEqual(service.calls[service.calls.length - 1].body, { stream_id: 'stream-1', room_id: null });
	const before = views.length;
	service.stream().push('msg', msg(1, 3, 'not followed any more'));
	await flush();
	assert.equal(views.length, before, 'the room callback was removed');
});

test('a room that is not in the list: the service says whether it is new, not for this player, or not there', async (t) => {
	const { service, client } = setup(t);
	await client.getRooms(() => {});

	// made on the service a moment ago; its `room` event has not reached this tab yet
	service.rooms.push(room(7, 'Just made'));
	service.msgs[7] = [msg(7, 1, 'hello')];
	const fresh = await client.openRoom(7);
	assert.equal(fresh.err_code, E.OK);
	assert.equal(fresh.room.name, 'Just made');
	assert.deepEqual(fresh.messages.map((m) => m.text), ['hello']);
	assert.ok((await client.getRooms()).some((r) => r.room_id === 7));

	// exists, but not for this player: the code of the service, not "not found"
	service.failOnce('GET', /^\/rooms\/2\/messages/, 403, { err_code: E.NO_ACCESS, err_message: 'You may not see this room' });
	const closed = await client.openRoom(2);
	assert.equal(closed.err_code, E.NO_ACCESS);
	assert.equal(closed.room, null);

	// does not exist at all
	service.failOnce('GET', /^\/rooms\/99\/messages/, 404, { err_code: E.ROOM_NOT_FOUND, err_message: 'The room does not exist' });
	assert.equal((await client.openRoom(99)).err_code, E.ROOM_NOT_FOUND);
});

test('a room that does not exist, and older pages', async (t) => {
	const { service, client } = setup(t);
	assert.equal((await client.openRoom(99)).err_code, E.ROOM_NOT_FOUND);

	service.msgs[1] = Array.from({ length: 120 }, (_, i) => msg(1, i + 1, 'm' + (i + 1)));
	const views = [];
	const view = await client.openRoom(1, (v) => views.push(v));
	assert.equal(view.messages.length, 50);
	assert.equal(view.messages[0].id, 71);
	assert.equal(view.more_before, true);

	assert.deepEqual(await client.loadOlder(1), { err_code: E.OK, err_message: undefined, more_before: true });
	assert.equal(views[views.length - 1].messages.length, 100);
	assert.equal(views[views.length - 1].messages[0].id, 21);
	assert.equal((await client.loadOlder(1)).more_before, false);
	assert.equal(views[views.length - 1].messages[0].id, 1);
	// nothing older: no call
	const calls = service.calls.length;
	assert.equal((await client.loadOlder(1)).more_before, false);
	assert.equal(service.calls.length, calls);
});

test('a room keeps the newest 300 messages', async (t) => {
	const { service, client } = setup(t);
	const views = [];
	await client.openRoom(1, (v) => views.push(v));
	for (let i = 2; i <= 330; i++) service.stream().push('msg', msg(1, i, 'm' + i));
	await flush(40);
	const view = views[views.length - 1];
	assert.equal(view.messages.length, 300);
	assert.equal(view.messages[0].id, 31);
	assert.equal(view.more_before, true);
});

// ───────────── sending ─────────────

test('send: the message shows as pending at once, then the stored copy takes its place', async (t) => {
	const { service, client } = setup(t);
	const views = [];
	await client.openRoom(1, (v) => views.push(v));
	const r = await client.send(1, 'my text');
	// the first thing the UI saw was the pending copy
	const pending = views.find((v) => v.messages.some((m) => m.pending)).messages.pop();
	assert.equal(pending.pending, true);
	assert.equal(pending.id, 0);
	assert.equal(pending.text, 'my text');
	assert.equal(pending.author.uid, 'u-me');

	assert.equal(r.err_code, E.OK);
	assert.equal(r.message.id, 2);
	assert.equal(service.calls[service.calls.length - 1].body.client_msg_id, pending.client_msg_id);
	const after = views[views.length - 1].messages;
	assert.deepEqual(after.map((m) => [m.id, m.text, !!m.pending]), [[1, 'first', false], [2, 'my text', false]]);

	// the stream then brings the same message: still once
	service.stream().push('msg', r.message);
	await flush();
	assert.equal(views[views.length - 1].messages.length, 2);
});

test('send: the event that arrives before the answer already replaces the pending copy', async (t) => {
	const { service, client } = setup(t);
	const views = [];
	await client.openRoom(1, (v) => views.push(v));
	let release;
	const realFetch = service.fetch;
	const slow = async (url, init) => {
		const res = await realFetch(url, init);
		if (init && init.method === 'POST' && /\/rooms\/1\/messages$/.test(url)) await new Promise((r) => (release = r));
		return res;
	};
	const c2 = new ChatClient(() => identityOf(), { warn() {} }, slow);
	const v2 = [];
	await c2.openRoom(1, (v) => v2.push(v));
	const sending = c2.send(1, 'raced');
	await flush();
	const stored = service.msgs[1][service.msgs[1].length - 1];
	service.stream().push('msg', stored);
	await flush();
	assert.deepEqual(v2[v2.length - 1].messages.map((m) => [m.id, !!m.pending]), [[1, false], [2, false]]);
	release();
	assert.equal((await sending).message.id, 2);
	assert.equal(v2[v2.length - 1].messages.length, 2);
});

test('send: a refusal marks the copy failed with the code; the next send clears it', async (t) => {
	const { service, client } = setup(t);
	const views = [];
	await client.openRoom(1, (v) => views.push(v));
	service.failOnce('POST', /^\/rooms\/1\/messages$/, 429, { err_code: E.RATE_LIMITED, err_message: 'You are sending messages too fast', retry_after_ms: 1200 });
	const r = await client.send(1, 'too fast');
	assert.equal(r.err_code, E.RATE_LIMITED);
	assert.equal(r.retry_after_ms, 1200);
	assert.equal(r.message, null);
	const failed = views[views.length - 1].messages.pop();
	assert.equal(failed.failed, E.RATE_LIMITED);
	assert.equal(failed.pending, false);

	const again = await client.send(1, 'too fast');
	assert.equal(again.err_code, E.OK);
	assert.deepEqual(views[views.length - 1].messages.map((m) => [m.text, m.failed]), [['first', undefined], ['too fast', undefined]]);
});

test('a test command is carried out, not stored: the answer has no message and nothing stays pending', async (t) => {
	const { service, client } = setup(t);
	const views = [];
	await client.openRoom(1, (v) => views.push(v));
	service.failOnce('POST', /^\/rooms\/1\/messages$/, 200, { message: null });
	const r = await client.send(1, '/flood');
	assert.deepEqual(r, { message: null, err_code: E.OK });
	assert.deepEqual(views[views.length - 1].messages.map((m) => m.text), ['first']);
});

// ───────────── the states the test commands make ─────────────

test('/ro: the room says read only; a send is refused with the note', async (t) => {
	const { service, client } = setup(t);
	const views = [];
	await client.openRoom(1, (v) => views.push(v));
	service.stream().push('room', room(1, 'General', { my_role: 'read_only', my_note: 'Calm down', can_write: false }));
	await flush();
	const view = views[views.length - 1];
	assert.equal(view.room.can_write, false);
	assert.equal(view.room.my_note, 'Calm down');
	assert.equal(view.messages.length, 1, 'a read-only player still reads');
	service.failOnce('POST', /messages$/, 403, { err_code: E.READ_ONLY, err_message: 'Calm down' });
	const r = await client.send(1, 'please');
	assert.equal(r.err_code, E.READ_ONLY);
	assert.equal(r.err_message, 'Calm down');
});

test('/ban: the room stays with its note, the messages go; when the ban ends they are loaded again', async (t) => {
	const { service, client } = setup(t);
	const views = [];
	await client.openRoom(1, (v) => views.push(v));
	service.stream().push('room', room(1, 'General', { my_role: 'banned', my_note: 'Spam', can_write: false, last_message: null }));
	await flush();
	let view = views[views.length - 1];
	assert.equal(view.err_code, E.OK);
	assert.equal(view.room.my_role, 'banned');
	assert.equal(view.room.my_note, 'Spam');
	assert.deepEqual(view.messages, []);

	service.msgs[1].push(msg(1, 2, 'written during the ban'));
	const loads = service.count('GET', /^\/rooms\/1\/messages\?limit=50$/);
	service.stream().push('room', room(1, 'General', { last_message: service.msgs[1][1] }));
	await flush();
	view = views[views.length - 1];
	assert.equal(service.count('GET', /^\/rooms\/1\/messages\?limit=50$/), loads + 1);
	assert.deepEqual(view.messages.map((m) => m.text), ['first', 'written during the ban']);
});

test('opening a room the player is banned in: no error, no messages', async (t) => {
	const { service, client } = setup(t);
	service.rooms[1] = room(1, 'General', { my_role: 'banned', my_note: 'Spam', can_write: false });
	service.failOnce('GET', /^\/rooms\/1\/messages/, 403, { err_code: E.BANNED, err_message: 'Spam' });
	const view = await client.openRoom(1);
	assert.equal(view.err_code, E.OK);
	assert.equal(view.room.my_role, 'banned');
	assert.deepEqual(view.messages, []);
});

test('/mute: the status carries the end and the note', async (t) => {
	const { service, client } = setup(t);
	const statuses = [];
	client.getStatus((s) => statuses.push(s));
	await client.getRooms(() => {});
	service.stream().push('me', { ...service.me, muted_till: Date.now() + 60000, mute_note: 'Quiet hour' });
	await flush();
	const s = statuses[statuses.length - 1];
	assert.equal(s.me.mute_note, 'Quiet hour');
	assert.ok(s.me.muted_till > Date.now());
	service.stream().push('me', service.me);
	await flush();
	assert.equal(statuses[statuses.length - 1].me.muted_till, null);
});

test('/del: the message stays in place as removed, as a new object', async (t) => {
	const { service, client } = setup(t);
	const views = [];
	const first = (await client.openRoom(1, (v) => views.push(v))).messages[0];
	service.stream().push('msg_update', { room_id: 1, id: 1, status: 'removed', text: '' });
	await flush();
	const now = views[views.length - 1].messages[0];
	assert.deepEqual([now.id, now.status, now.text], [1, 'removed', '']);
	assert.notEqual(now, first, 'a changed message is a new object');
	assert.equal(first.status, 'visible', 'the object a UI already holds is not changed under it');
});

test('/clean: a new rev makes the client load the room again', async (t) => {
	const { service, client } = setup(t);
	const views = [];
	await client.openRoom(1, (v) => views.push(v));
	service.msgs[1] = [];
	service.stream().push('room', room(1, 'General', { rev: 2, last_message: null }));
	await flush();
	assert.deepEqual(views[views.length - 1].messages, []);
	assert.equal(service.count('GET', /^\/rooms\/1\/messages\?limit=50$/), 2);
});

test('a room that is not shown is not reloaded for a new rev until it is opened again', async (t) => {
	const { service, client } = setup(t);
	await client.openRoom(1);
	await client.openRoom(3);
	service.msgs[1] = [];
	service.stream().push('room', room(1, 'General', { rev: 2, last_message: null }));
	await flush();
	assert.equal(service.count('GET', /^\/rooms\/1\/messages/), 1, 'no request for a room nobody looks at');
	assert.deepEqual((await client.openRoom(1)).messages, []);
	assert.equal(service.count('GET', /^\/rooms\/1\/messages/), 2);
});

test('/gone: the room leaves the list, and its subscriber hears it once', async (t) => {
	const { service, client } = setup(t);
	const views = [];
	const lists = [];
	await client.getRooms((l) => lists.push(l));
	await client.openRoom(1, (v) => views.push(v));
	service.stream().push('room_gone', { room_id: 1, reason: 'closed' });
	await flush();
	const view = views[views.length - 1];
	assert.equal(view.err_code, E.ROOM_NOT_FOUND);
	assert.equal(view.room, null);
	assert.deepEqual(lists[lists.length - 1].map((r) => r.room_id), [3, 4]);
	const n = views.length;
	service.stream().push('msg', msg(1, 5, 'late'));
	await flush();
	assert.equal(views.length, n);
});

/** What `/flood` makes the service post: 20 bot messages at once, `announcement` in a news room, else `system`. */
const floodOf = (roomId, firstId, kind = 'system') =>
	Array.from({ length: 20 }, (_, i) => msg(roomId, firstId + i, `Flood message ${i + 1} of 20`, { author: null, kind }));

test('/flood: the burst shows in order and once; the summaries that come with it ask for nothing', async (t) => {
	const { service, client } = setup(t);
	const views = [];
	const lists = [];
	await client.getRooms((l) => lists.push(l));
	await client.openRoom(1, (v) => views.push(v));
	service.failOnce('POST', /^\/rooms\/1\/messages$/, 200, { message: null });
	assert.deepEqual(await client.send(1, '/flood'), { message: null, err_code: E.OK });

	const flood = floodOf(1, 2);
	service.msgs[1].push(...flood);
	const loads = service.count('GET', /^\/rooms\/1\/messages/);
	// the shown room gets each message and its summary at once, in the order the service writes them
	for (const m of flood) {
		service.stream().push('msg', m);
		service.stream().push('room', room(1, 'General', { last_message: m }));
	}
	await flush(40);

	const view = views[views.length - 1];
	assert.deepEqual(view.messages.map((m) => m.id), Array.from({ length: 21 }, (_, i) => i + 1));
	assert.ok(view.messages.slice(1).every((m) => m.author === null && m.kind === 'system'));
	assert.ok(!view.messages.some((m) => m.pending || m.failed), 'the command left no pending copy');
	assert.equal(service.count('GET', /^\/rooms\/1\/messages/), loads, 'every summary was already covered by its message');
	assert.equal(lists[lists.length - 1].find((r) => r.room_id === 1).last_message.id, 21);
});

test('/flood: a summary that runs ahead of the burst is caught up by ids, and the late messages do not show twice', async (t) => {
	const { service, client } = setup(t);
	const views = [];
	await client.openRoom(1, (v) => views.push(v));
	const flood = floodOf(1, 2);
	service.msgs[1].push(...flood);

	service.stream().push('room', room(1, 'General', { last_message: flood[19] }));
	await flush();
	assert.equal(service.count('GET', /^\/rooms\/1\/messages\?after=1&limit=50$/), 1);
	assert.equal(views[views.length - 1].messages.length, 21);

	for (const m of flood) service.stream().push('msg', m);
	await flush(40);
	assert.deepEqual(views[views.length - 1].messages.map((m) => m.id), Array.from({ length: 21 }, (_, i) => i + 1));
});

test('/flood in a room this tab does not show: only its unread count moves; opening it brings the whole burst', async (t) => {
	const { service, client } = setup(t);
	const lists = [];
	await client.getRooms((l) => lists.push(l));
	await client.openRoom(1);
	service.msgs[4] = floodOf(4, 1, 'announcement');

	// another tab typed it in News: this tab gets the summary only
	service.stream().push('room', room(4, 'News', { kind: 'announcement', can_write: false, unread_count: 20, last_message: service.msgs[4][19] }));
	await flush();
	const news = lists[lists.length - 1].find((r) => r.room_id === 4);
	assert.deepEqual([news.unread_count, news.last_message.id], [20, 20]);
	assert.equal(service.count('GET', /^\/rooms\/4\//), 0, 'no request for a room nobody looks at');

	const view = await client.openRoom(4);
	assert.equal(view.messages.length, 20);
	assert.ok(view.messages.every((m) => m.kind === 'announcement' && m.author === null));
	assert.equal(view.more_before, false);
});

test('/flood cut by a dropped stream: the next stream catches up from the last held id, no doubles, no gaps', async (t) => {
	const { service, client, tick } = setup(t);
	const views = [];
	await client.openRoom(1, (v) => views.push(v));
	const flood = floodOf(1, 2);
	service.msgs[1].push(...flood);
	for (const m of flood.slice(0, 5)) service.stream().push('msg', m);
	// dropped without `bye`, while the service goes on storing the burst
	service.stream().end();
	service.rooms = service.rooms.map((r) => (r.room_id === 1 ? room(1, 'General', { last_message: flood[19] }) : r));
	await flush();
	assert.deepEqual(views[views.length - 1].messages.map((m) => m.id), [1, 2, 3, 4, 5, 6]);

	await tick(1100, 100);
	assert.equal(service.streams.length, 2);
	assert.equal(service.count('GET', /^\/rooms\/1\/messages\?after=6&limit=50$/), 1);
	assert.deepEqual(views[views.length - 1].messages.map((m) => m.id), Array.from({ length: 21 }, (_, i) => i + 1));
});

test('/off (bye chat_disabled) and too many tabs: the chat stops and does not come back by itself', async (t) => {
	for (const [reason, code] of [['chat_disabled', E.CHAT_DISABLED], ['too_many', E.OK]]) {
		const { service, client, tick } = setup(t);
		const statuses = [];
		client.getStatus((s) => statuses.push(s));
		await client.getRooms(() => {});
		service.stream().push('bye', { reason });
		service.stream().end();
		await flush();
		const s = statuses[statuses.length - 1];
		assert.deepEqual([s.state, s.err_code, s.bye], ['stopped', code, reason]);
		const calls = service.calls.length;
		await tick(120000, 5000);
		assert.equal(service.calls.length, calls, 'no call in the next two minutes');
		t.mock.timers.reset();
		t.mock.restoreAll();
	}
});

test('a stream refused with CHAT_DISABLED stops the chat', async (t) => {
	const { service, client } = setup(t);
	service.streamMode = { status: 403, body: { err_code: E.CHAT_DISABLED, err_message: 'Chat is switched off' } };
	assert.deepEqual(await client.getRooms(), []);
	assert.deepEqual([client.getStatus().state, client.getStatus().err_code], ['stopped', E.CHAT_DISABLED]);
});

// ───────────── what happens after a stream ends ─────────────

test('nextStep: every way a stream can end', () => {
	const end = (over) => ({ hello: false, lived: 0, bye: null, status: 0, code: null, timedOut: false, ...over });
	const was = { polling: false, misses: 0 };
	const cases = [
		['healthy stream, bye rotate', end({ hello: true, lived: 3600e3, bye: 'rotate', status: 200 }), was, { do: 'retry', renew: false, atOnce: true }],
		['young stream, bye rotate', end({ hello: true, lived: 500, bye: 'rotate', status: 200 }), was, { do: 'retry', renew: false, atOnce: true }],
		['healthy stream, bye token_expired', end({ hello: true, lived: 7200e3, bye: 'token_expired', status: 200 }), was, { do: 'retry', renew: true, atOnce: true }],
		['young stream, bye token_expired', end({ hello: true, lived: 900, bye: 'token_expired', status: 200 }), was, { do: 'retry', renew: true, atOnce: true }],
		['refused 401 TOKEN_EXPIRED', end({ status: 401, code: E.TOKEN_EXPIRED }), was, { do: 'retry', renew: true, atOnce: false }],
		['refused 401 NOT_IDENTIFIED', end({ status: 401, code: E.NOT_IDENTIFIED }), was, { do: 'retry', renew: true, atOnce: false }],
		['refused 401 without a code', end({ status: 401 }), was, { do: 'retry', renew: true, atOnce: false }],
		['refused 403 CHAT_DISABLED', end({ status: 403, code: E.CHAT_DISABLED }), was, { do: 'stop', code: E.CHAT_DISABLED, bye: undefined }],
		['bye chat_disabled', end({ hello: true, lived: 99999, bye: 'chat_disabled', status: 200 }), was, { do: 'stop', code: E.CHAT_DISABLED, bye: 'chat_disabled' }],
		['bye too_many', end({ hello: true, lived: 99999, bye: 'too_many', status: 200 }), was, { do: 'stop', code: E.OK, bye: 'too_many' }],
		['healthy stream breaks without bye', end({ hello: true, lived: 600e3, status: 200 }), was, { do: 'retry', renew: false, atOnce: false }],
		['hello, then broken at once', end({ hello: true, lived: 200, status: 200 }), was, { do: 'retry', renew: false, atOnce: false }],
		['no answer', end({}), was, { do: 'retry', renew: false, atOnce: false }],
		['503 while the service restarts', end({ status: 503, code: E.INTERNAL }), was, { do: 'retry', renew: false, atOnce: false }],
		['no hello in time, first', end({ timedOut: true }), was, { do: 'retry', renew: false, atOnce: false, misses: 1 }],
		['no hello in time, second', end({ timedOut: true }), { polling: false, misses: 1 }, { do: 'poll', misses: 2 }],
		['200 with nothing in it, second', end({ status: 200 }), { polling: false, misses: 1 }, { do: 'poll', misses: 2 }],
		['polling, the stream try fails', end({}), { polling: true, misses: 2 }, { do: 'poll' }],
		['polling, no hello again', end({ timedOut: true }), { polling: true, misses: 2 }, { do: 'poll', misses: 3 }],
		['polling, refused as expired', end({ status: 401, code: E.TOKEN_EXPIRED }), { polling: true, misses: 2 }, { do: 'poll' }],
	];
	for (const [name, e, w, want] of cases) assert.deepEqual(ChatClient.nextStep(e, w), want, name);
	const atOnce = cases.filter(([, e, w]) => ChatClient.nextStep(e, w).atOnce).map(([n]) => n);
	assert.deepEqual(
		atOnce,
		['healthy stream, bye rotate', 'young stream, bye rotate', 'healthy stream, bye token_expired', 'young stream, bye token_expired'],
		'a reconnect without a pause only for a stream closed on purpose, and after a young one only once',
	);
});

test('a stream that keeps breaking is retried with growing pauses, not every second', async (t) => {
	const { service, client, tick } = setup(t);
	const states = [];
	client.getStatus((s) => states.push(s.state));
	await client.getRooms(() => {});
	const opened = [];
	const breakAndWait = async (ms) => {
		service.stream().end();
		await flush();
		const n = service.streams.length;
		await tick(ms - 100, 100);
		assert.equal(service.streams.length, n, `no new stream ${ms - 100} ms after the break`);
		await tick(200, 100);
		assert.equal(service.streams.length, n + 1, `a new stream ${ms} ms after the break`);
		opened.push(ms);
	};
	// each stream says hello and breaks at once: the hello alone must not shorten the pause
	await breakAndWait(1000);
	await breakAndWait(2000);
	await breakAndWait(5000);
	await breakAndWait(10000);
	await breakAndWait(30000);
	await breakAndWait(30000);
	assert.ok(states.includes('retrying'));
	assert.equal(client.getStatus().state, 'online');

	// a stream that stayed up for 30 s earns the short pause again
	await tick(31000, 1000);
	await breakAndWait(1000);
	assert.equal(service.sessions, 1, 'reconnects reuse the token');
});

test('bye rotate after a healthy stream: a new stream at once; a room is caught up without doubles or gaps', async (t) => {
	const { service, client, tick } = setup(t);
	const views = [];
	await client.openRoom(1, (v) => views.push(v));
	await tick(31000, 1000);
	service.stream().push('bye', { reason: 'rotate' });
	service.stream().end();
	// written while the client had no stream
	service.msgs[1].push(msg(1, 2, 'missed 1'), msg(1, 3, 'missed 2'));
	service.rooms = service.rooms.map((r) => (r.room_id === 1 ? room(1, 'General', { last_message: service.msgs[1][2] }) : r));
	await flush();
	assert.equal(service.streams.length, 2, 'no pause');
	assert.deepEqual(views[views.length - 1].messages.map((m) => m.id), [1, 2, 3]);
	assert.equal(service.count('GET', /^\/rooms\/1\/messages\?after=1&limit=50$/), 1);
	assert.deepEqual(service.calls.filter((c) => c.path === '/stream/focus').pop().body, { stream_id: 'stream-2', room_id: 1 }, 'the focus is sent again');
});

test('after a restart of the service (another rev, ids from 1 again) nothing of the old run stays', async (t) => {
	const { service, client, tick } = setup(t);
	service.msgs[1] = [msg(1, 1, 'old 1'), msg(1, 2, 'old 2'), msg(1, 3, 'old 3')];
	const views = [];
	await client.openRoom(1, (v) => views.push(v));
	service.msgs = { 1: [msg(1, 1, 'new run')], 3: [], 4: [] };
	service.rooms = [room(1, 'General', { rev: 777, last_message: msg(1, 1, 'new run') }), room(4, 'News')];
	service.stream().end();
	await flush();
	await tick(1100, 100);
	assert.deepEqual(views[views.length - 1].messages.map((m) => m.text), ['new run']);
	assert.deepEqual((await client.getRooms()).map((r) => r.room_id), [1, 4], 'a room missing from hello is dropped');
});

test('catching up ends even when the service keeps saying "more" without anything newer', async (t) => {
	const { service, client } = setup(t);
	await client.openRoom(1);
	for (let i = 0; i < 30; i++) service.failOnce('GET', /^\/rooms\/1\/messages\?after=/, 200, { messages: [], more: true });
	service.stream().push('room', room(1, 'General', { last_message: msg(1, 9, 'newer') }));
	await flush(20);
	assert.equal(service.count('GET', /^\/rooms\/1\/messages\?after=/), 1, 'one page, then it stops');
});

test('a stream that never ends an event is dropped at 1 MB and retried', async (t) => {
	const { service, client, tick } = setup(t);
	await client.getRooms(() => {});
	service.stream().raw('data: ' + 'x'.repeat(1024 * 1024 + 10));
	await flush();
	assert.equal(service.stream().aborted, true);
	assert.equal(client.getStatus().state, 'retrying');
	await tick(1100, 100);
	assert.equal(service.streams.length, 2);
});

// ───────────── polling ─────────────

test('no hello twice in a row: polling; the stream is tried again every 5 minutes, and taken when it works', async (t) => {
	const { service, client, tick } = setup(t);
	service.streamMode = 'silent';
	const states = [];
	client.getStatus((s) => states.push(s.state));
	const views = [];
	const rooms = client.getRooms(() => {});
	await flush();
	await tick(10000, 1000);
	assert.equal(service.streams.length, 1);
	assert.equal(service.stream().aborted, true, 'the silent stream is given up after 10 s');
	await tick(1000, 100);
	assert.equal(service.streams.length, 2);
	await tick(10000, 1000);
	assert.equal(client.getStatus().state, 'polling');
	assert.equal((await rooms).length, 3, 'the room list comes from GET /rooms');
	assert.equal(service.count('GET', /^\/rooms$/), 1);

	// the mute is learned from the list answer
	service.me = { ...service.me, muted_till: Date.now() + 60000, mute_note: 'Quiet hour' };
	await client.openRoom(1, (v) => views.push(v));
	assert.equal(service.count('POST', /^\/stream\/focus$/), 0, 'no stream, no focus call');
	service.msgs[1].push(msg(1, 2, 'while polling'));
	await tick(5000, 1000);
	assert.deepEqual(views[views.length - 1].messages.map((m) => m.text), ['first', 'while polling']);
	await tick(30000, 1000);
	assert.equal(client.getStatus().me.mute_note, 'Quiet hour');
	assert.ok(service.count('GET', /^\/rooms$/) >= 2);

	// sending works while polling
	assert.equal((await client.send(1, 'from a polling tab')).err_code, E.OK);

	// five minutes later the stream is tried again; it still does not work
	const streams = service.streams.length;
	await tick(300000 - 35000, 5000);
	assert.equal(service.streams.length, streams + 1);
	await tick(10000, 1000);
	assert.equal(client.getStatus().state, 'polling');

	// now the network lets it through
	service.streamMode = 'hello';
	await tick(300000, 5000);
	assert.equal(client.getStatus().state, 'online');
	const polls = service.count('GET', /^\/rooms$/);
	await tick(60000, 5000);
	assert.equal(service.count('GET', /^\/rooms$/), polls, 'no polling once the stream is back');
	assert.deepEqual(service.calls.filter((c) => c.path === '/stream/focus').pop().body.room_id, 1);
});

test('a slow poll is not started a second time', async (t) => {
	const { service, client, tick } = setup(t);
	service.streamMode = 'silent';
	const rooms = client.getRooms(() => {});
	await flush();
	await tick(21500, 500);
	await rooms;
	await client.openRoom(1, () => {});
	let hold = [];
	const real = service.fetch;
	client.f = async (url, init) => {
		if (/messages\?after=/.test(url)) await new Promise((r) => hold.push(r));
		return real(url, init);
	};
	await tick(20000, 1000);
	assert.equal(hold.length, 1, 'four ticks, one request on its way');
	hold.forEach((r) => r());
});

// ───────────── the token ─────────────

test('an expired token: a new session, then the same call once more', async (t) => {
	const { service, client } = setup(t);
	await client.getRooms(() => {});
	service.refusedTokens.add('token-1');
	const r = await client.getMembers(1);
	assert.equal(r.err_code, E.OK);
	assert.equal(r.members.length, 1);
	assert.equal(service.sessions, 2);
	assert.equal(service.calls[service.calls.length - 1].auth, 'Bearer token-2');

	// a fresh token that is refused too is not tried for ever
	service.refusedTokens.add('token-2').add('token-3');
	assert.equal((await client.getMembers(1)).err_code, E.TOKEN_EXPIRED);
	assert.equal(service.sessions, 3);
});

test('the session is renewed 5 minutes before the token ends, only while the chat is in use', async (t) => {
	const { service, client, tick } = setup(t);
	await client.getRooms(() => {});
	await tick((7200 - 300) * 1000 - 1000, 60000);
	assert.equal(service.sessions, 1);
	await tick(2000, 1000);
	assert.equal(service.sessions, 2);

	client.close();
	await tick(7200 * 1000, 60000);
	assert.equal(service.sessions, 2, 'a closed chat does not renew');
});

test('bye token_expired on a healthy stream: a new session and a new stream with the new token', async (t) => {
	const { service, client, tick } = setup(t);
	await client.getRooms(() => {});
	await tick(31000, 1000);
	service.stream().push('bye', { reason: 'token_expired' });
	service.stream().end();
	await flush();
	assert.equal(service.sessions, 2);
	assert.equal(service.streams.length, 2);
	assert.equal(service.stream().auth, 'Bearer token-2');
});

test('a service that refuses every fresh token on the stream is asked with pauses, not in a tight loop', async (t) => {
	const { service, client, tick } = setup(t);
	service.streamMode = { status: 401, body: { err_code: E.TOKEN_EXPIRED, err_message: 'expired' } };
	client.getRooms(() => {});
	await flush();
	assert.equal(service.sessions, 1);
	await tick(1100, 100);
	assert.equal(service.sessions, 2);
	await tick(1100, 100);
	assert.equal(service.sessions, 2, 'the second pause is 2 s');
	await tick(1000, 100);
	assert.equal(service.sessions, 3);
	await tick(60000, 1000);
	assert.ok(service.sessions <= 7, `at most one try per pause, got ${service.sessions} sessions in about a minute`);
});

// ───────────── no answer ─────────────

test('no answer from the service: one more try, then NETWORK; nothing throws', async (t) => {
	const { service, client, tick } = setup(t);
	await client.openRoom(1, () => {});
	service.down = true;
	const sending = client.send(1, 'offline');
	await tick(1100, 100);
	const r = await sending;
	assert.equal(r.err_code, E.NETWORK);
	assert.equal(r.message, null);
	assert.equal(service.count('POST', /^\/rooms\/1\/messages$/), 2);
	service.down = false;
	assert.equal((await client.send(1, 'online again')).err_code, E.OK);
});

// ───────────── read markers, members, reports, rooms by key ─────────────

test('the read marker: at most one call per room in 2 s, with the highest id; ids at or below the marker are ignored', async (t) => {
	const { service, client, tick } = setup(t);
	const lists = [];
	service.rooms[1] = room(1, 'General', { last_read_id: 5, unread_count: 3 });
	await client.getRooms((l) => lists.push(l));
	const reads = () => service.calls.filter((c) => /\/read$/.test(c.path)).map((c) => c.body.message_id);

	client.markRead(1, 5);
	client.markRead(1, 4);
	await tick(100, 100);
	assert.deepEqual(reads(), [], 'not above the marker');

	client.markRead(1, 6);
	client.markRead(1, 8);
	client.markRead(1, 7);
	await tick(100, 100);
	assert.deepEqual(reads(), [8]);
	assert.equal(lists[lists.length - 1].find((r) => r.room_id === 1).unread_count, 0);
	assert.equal(lists[lists.length - 1].find((r) => r.room_id === 1).last_read_id, 8);

	client.markRead(1, 9);
	client.markRead(1, 10);
	await tick(1500, 100);
	assert.deepEqual(reads(), [8], 'the next one waits for the 2 s to pass');
	await tick(600, 100);
	assert.deepEqual(reads(), [8, 10]);
});

test('members, a report, a room by key, the reserved private chat target', async (t) => {
	const { service, client } = setup(t);
	const lists = [];
	await client.getRooms((l) => lists.push(l));
	assert.deepEqual(await client.getMembers(1, true, 20, 10), { err_code: E.OK, members: [{ ...service.me, role: 'member', online: true }], more: false });
	assert.equal(service.calls[service.calls.length - 1].path, '/rooms/1/members?offset=20&limit=10&online=1');
	assert.equal((await client.report(1, 1, 'spam', 'look')).err_code, E.OK);
	assert.deepEqual(service.calls[service.calls.length - 1].body, { room_id: 1, message_id: 1, reason: 'spam', comment: 'look' });

	const r = await client.ensure({ room_key: 'sport/123', name: 'Arsenal – Chelsea' });
	assert.equal(r.err_code, E.OK);
	assert.equal(r.room.room_id, 1001);
	assert.ok(lists[lists.length - 1].some((x) => x.room_id === 1001), 'the new room is in the list at once');
	assert.equal((await client.openRoom(1001)).err_code, E.OK);

	assert.equal((await client.ensure({ room_id: 1 })).room.name, 'General');
	assert.equal((await client.ensure({ room_id: 77 })).err_code, E.ROOM_NOT_FOUND);
	assert.equal((await client.ensure({ dm: 'u-other' })).err_code, E.NOT_ENABLED);
});

// ───────────── subscribers and the life of the connection ─────────────

test('the stream closes 30 s after the last subscriber left, and a quick reopen keeps it', async (t) => {
	const { service, client, tick } = setup(t);
	const onRooms = () => {};
	await client.getRooms(onRooms);
	await tick(120000, 5000);
	assert.equal(service.stream().aborted, false, 'a subscriber keeps the stream');

	client.unsubscribe(onRooms);
	await tick(20000, 5000);
	assert.equal(service.stream().aborted, false);
	await client.getRooms(onRooms);
	await tick(60000, 5000);
	assert.equal(service.stream().aborted, false, 'back within 30 s: the same stream');
	assert.equal(service.streams.length, 1);

	client.unsubscribe(onRooms);
	await tick(31000, 1000);
	assert.equal(service.stream().aborted, true);
	assert.equal(client.getStatus().state, 'idle');

	// a read without a subscription opens the stream and lets it go again
	assert.equal((await client.getRooms()).length, 3);
	assert.equal(service.streams.length, 2);
	await tick(31000, 1000);
	assert.equal(service.stream().aborted, true);
	// a status subscriber alone does not hold a connection
	client.getStatus(() => {});
	await tick(60000, 5000);
	assert.equal(service.streams.length, 2);
});

test('several subscribers per list; a callback that throws does not break the others', async (t) => {
	const { service, client, warnings } = setup(t);
	const a = [];
	const b = [];
	await client.getRooms(() => {
		throw new Error('UI bug');
	});
	await client.getRooms((l) => a.push(l));
	await client.getRooms((l) => b.push(l));
	service.stream().push('room', room(1, 'General', { unread_count: 2 }));
	await flush();
	assert.equal(a.length, b.length);
	assert.equal(a[a.length - 1].find((r) => r.room_id === 1).unread_count, 2);
	assert.ok(warnings.length >= 1, 'the failure is logged');
	assert.equal(client.getStatus().state, 'online');
});

test('chatClose drops every subscription and the stream; the next read opens it again', async (t) => {
	const { service, client } = setup(t);
	const lists = [];
	await client.getRooms((l) => lists.push(l));
	client.close();
	assert.equal(service.stream().aborted, true);
	assert.equal(client.getStatus().state, 'idle');
	const n = lists.length;
	assert.equal((await client.getRooms()).length, 3);
	assert.equal(lists.length, n, 'the old subscriber is gone');
	assert.equal(service.sessions, 1, 'the token is reused');
});

test('another player, or a logout: nothing of the previous player stays; the same player again changes nothing', async (t) => {
	const { service, client, who } = setup(t);
	const lists = [];
	await client.getRooms((l) => lists.push(l));
	await client.openRoom(1);

	client.reset();
	assert.equal(client.getStatus().state, 'online', 'the same player identified again: the chat goes on');
	assert.equal(service.stream().aborted, false);

	who.id = identityOf({ user_ext_id: 'player-2' });
	client.reset();
	assert.equal(service.stream().aborted, true);
	assert.deepEqual(lists[lists.length - 1], []);
	assert.equal(client.getStatus().me, null);
	service.me = { ...service.me, uid: 'u-two', name: 'Two' };
	assert.equal((await client.openRoom(1)).err_code, E.OK);
	assert.equal(service.sessions, 2, 'a new session for the new player');
	assert.equal(service.calls.filter((c) => c.path === '/session').pop().body.user_ext_id, 'player-2');
	assert.equal(client.getStatus().me.uid, 'u-two');

	who.id = identityOf({ user_ext_id: '' });
	client.reset();
	assert.equal(client.getStatus().err_code, E.NOT_IDENTIFIED);
	assert.deepEqual(await client.getRooms(), []);
});

// ───────────── through the public class ─────────────

test('_smartico.api: the chat methods are on the WSAPI object and read the page from the tracker', async (t) => {
	t.mock.timers.enable({ apis: ['setTimeout', 'setInterval', 'Date'], now: 1_700_000_000_000 });
	const service = makeService();
	const settings = { [PublicLabelSettings.CHAT_ENABLED]: 'true', [PublicLabelSettings.CHAT_API_URL]: 'https://chat.test' };
	const pushes = {};
	const tracker = {
		label_api_key: '00000000-0000-0000-0000-000000000000-8',
		userPublicProps: { core_user_language: 'UK' },
		params: { brand_key: 'brand-x' },
		ext: 'player-9',
		on: (cid, fn) => (pushes[cid] = fn),
		getLabelSetting: (key) => settings[key],
		triggerExternalCallBack: () => {},
		getExtUserId: () => tracker.ext,
		getHash: () => 'h:1',
	};
	const realFetch = globalThis.fetch;
	globalThis.fetch = service.fetch;
	t.after(() => (globalThis.fetch = realFetch));

	const api = new SmarticoAPI(tracker.label_api_key, null, async () => ({}), { tracker, logger: console }).getWSCalls();
	for (const name of ['chatGetStatus', 'chatGetRooms', 'chatOpenRoom', 'chatCloseRoom', 'chatLoadOlder', 'chatSendMessage', 'chatMarkRead', 'chatEnsureRoom',
		'chatGetMembers', 'chatReportMessage', 'chatOnEvent', 'chatUnsubscribe', 'chatClose', 'chatStartDirect', 'chatBlockUser', 'chatSetDirectIncoming']) {
		assert.equal(typeof api[name], 'function', name);
	}
	assert.deepEqual(await api.chatStartDirect({ uid: 'u' }), { err_code: E.NOT_ENABLED, room: null });
	assert.deepEqual(await api.chatBlockUser({ uid: 'u', blocked: true }), { err_code: E.NOT_ENABLED });
	assert.deepEqual(await api.chatSetDirectIncoming({ enabled: false }), { err_code: E.NOT_ENABLED });
	assert.equal(service.calls.length, 0, 'the reserved methods make no call');

	const rooms = await api.chatGetRooms({ onUpdate: () => {} });
	assert.equal(rooms.length, 3);
	assert.deepEqual(service.calls[0].body, {
		label_key: '00000000-0000-0000-0000-000000000000', brand_key: 'brand-x', user_ext_id: 'player-9', user_hash: 'h:1', lang: 'UK',
	});
	const view = await api.chatOpenRoom({ room_id: 1 });
	assert.equal(view.messages.length, 1);
	assert.equal((await api.chatSendMessage({ room_id: 1, text: 'through the api' })).err_code, E.OK);

	// the same player identified again (the tracker reconnected): the chat goes on
	pushes[ClassId.IDENTIFY_RESPONSE]({});
	assert.equal(api.chatGetStatus().state, 'online');
	// logout: the chat of that player is gone
	tracker.ext = null;
	pushes[ClassId.LOGOUT_RESPONSE]({});
	assert.equal(api.chatGetStatus().state, 'idle');
	assert.equal(api.chatGetStatus().err_code, E.NOT_IDENTIFIED);
	assert.equal(service.stream().aborted, true);

	// chat switched off for the label, and visitor mode
	settings[PublicLabelSettings.CHAT_ENABLED] = 'false';
	tracker.ext = 'player-9';
	assert.equal((await api.chatOpenRoom({ room_id: 1 })).err_code, E.CHAT_DISABLED);
	assert.equal((await api.chatStartDirect({ uid: 'u' })).err_code, E.CHAT_DISABLED);
	const visitor = new SmarticoAPI(tracker.label_api_key, null, async () => ({}), { logger: console }).getWSCalls();
	assert.deepEqual(await visitor.chatGetRooms(), []);
	assert.equal(visitor.chatGetStatus().err_code, E.CHAT_DISABLED);
});
