import { ChatMessage } from './ChatTypes';

type Page = { messages: ChatMessage[]; more: boolean };

const DB = 'smartico-chat';
const STORE = 'dm';

/**
 * The private chats of one browser. The chat service keeps no private message: it only passes one on to the
 * players who are connected, so what a player sent and received is kept here, in the IndexedDB of the page's
 * site. Another browser, or this one after its site data was cleared, starts empty. So does this browser after a
 * logout or another player's login: the messages of whoever used it before are not left for the next person.
 * Where IndexedDB cannot be used (a private window, an old WebView) the messages live as long as the page.
 * No method throws.
 *
 * @hidden
 */
export class ChatHistory {
	private declare db: Promise<IDBDatabase | null>;
	/** `<owner>:<room>` → its messages, oldest first. Used only without IndexedDB. */
	private mem = new Map<string, ChatMessage[]>();

	/** `owner`: the player the messages belong to (the player's public `uid`): a browser can serve several players. */
	public async put(owner: string, list: ChatMessage[]): Promise<void> {
		// what only the sender's tab knows about a message is not part of it
		const rows = list
			.filter((m) => m.id > 0)
			.map(({ client_msg_id, pending, failed, ...m }) => ({ o: owner, r: m.room_id, i: m.id, m }));
		const db = await this.open();
		if (db) {
			await new Promise<void>((done) => {
				try {
					const tx = db.transaction(STORE, 'readwrite');
					rows.forEach((row) => tx.objectStore(STORE).put(row));
					tx.oncomplete = tx.onerror = tx.onabort = () => done();
				} catch (e) {
					done();
				}
			});
			return;
		}
		for (const row of rows) {
			const key = owner + ':' + row.r;
			const all = this.mem.get(key) || this.mem.set(key, []).get(key)!;
			let i = all.length;
			while (i > 0 && all[i - 1].id > row.i) i--;
			if (i > 0 && all[i - 1].id === row.i) all[i - 1] = row.m;
			else all.splice(i, 0, row.m);
		}
	}

	/** The newest `limit` messages of the room, or the ones right before the message `before`; oldest first. */
	public async page(owner: string, roomId: number, before: number | undefined, limit: number): Promise<Page> {
		const db = await this.open();
		// newest first, one more than asked: it says whether older ones exist
		let found: ChatMessage[];
		if (db) {
			found = await new Promise((done) => {
				const out: ChatMessage[] = [];
				try {
					const range = IDBKeyRange.bound([owner, roomId, 0], [owner, roomId, before ? before - 1 : Infinity]);
					const rq = db.transaction(STORE).objectStore(STORE).openCursor(range, 'prev');
					rq.onsuccess = () => {
						const at = rq.result;
						if (at && out.length <= limit) {
							out.push(at.value.m);
							at.continue();
						} else {
							done(out);
						}
					};
					rq.onerror = () => done(out);
				} catch (e) {
					done(out);
				}
			});
		} else {
			const all = this.mem.get(owner + ':' + roomId) || [];
			found = (before ? all.filter((m) => m.id < before) : all).slice(-(limit + 1)).reverse();
		}
		return { messages: found.slice(0, limit).reverse(), more: found.length > limit };
	}

	/**
	 * Forgets every private message this browser keeps, of every player: the player logged out or another one logged
	 * in. Not only the leaving player's: who that was is not known when chat was never opened on this page.
	 */
	public async clear(): Promise<void> {
		this.mem.clear();
		const db = await this.open();
		if (db) {
			await new Promise<void>((done) => {
				try {
					const tx = db.transaction(STORE, 'readwrite');
					tx.objectStore(STORE).clear();
					tx.oncomplete = tx.onerror = tx.onabort = () => done();
				} catch (e) {
					done();
				}
			});
		}
	}

	/** Null when this browser has no IndexedDB to use; asked once. */
	private open(): Promise<IDBDatabase | null> {
		return (
			this.db ||
			(this.db = new Promise((done) => {
				try {
					const rq = indexedDB.open(DB, 1);
					rq.onupgradeneeded = () => rq.result.createObjectStore(STORE, { keyPath: ['o', 'r', 'i'] });
					rq.onsuccess = () => done(rq.result);
					rq.onerror = rq.onblocked = () => done(null);
				} catch (e) {
					done(null);
				}
			}))
		);
	}
}
