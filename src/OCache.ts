import { NodeCache } from './NodeCache';

export enum ECacheContext {
	Translations,
	LabelInfo,
	WSAPI,
}

const WITH_REF_CACHE = [ECacheContext.Translations];

export class OCache {
	private static cache: { [key: string]: NodeCache } = {};

	private static init(cacheContext: ECacheContext) {
		if (this.cache[cacheContext] === undefined) {
			this.cache[cacheContext] = new NodeCache();
		}
	}

	public static get<T>(oKey: any, cacheContext: ECacheContext): T | undefined {
		const key = cacheContext.toString() + '_' + JSON.stringify(oKey);

		this.init(cacheContext);

		return deepClone(this.cache[cacheContext].get(key));
	}

	public static set(oKey: any, o: any, cacheContext: ECacheContext, ttlSeconds: number = 60) {
		const key = cacheContext.toString() + '_' + JSON.stringify(oKey);

		this.init(cacheContext);

		this.cache[cacheContext].set(key, deepClone(o), ttlSeconds);
	}

	public static async use<T>(oKey: any, cacheContext: ECacheContext, f: () => Promise<T>, ttlSeconds: number = 60) {
		if (ttlSeconds <= 0) {
			return await f();
		} else {
			let o: T = OCache.get(oKey, cacheContext);

			if (o === undefined) {
				o = await f();
				OCache.set(oKey, o, cacheContext, ttlSeconds);
			}

			return o;
		}
	}

	public static async clear(cacheContext: ECacheContext, oKey: any) {
		const key = cacheContext.toString() + '_' + JSON.stringify(oKey);

		if (this.cache[cacheContext]) {
			this.cache[cacheContext].remove(key);
		}
	}

	/**
	 * Remove every entry whose string key starts with `oKeyBase` — the bare key
	 * AND all per-parameter composite variants (`${oKeyBase}:…` / `${oKeyBase}<id>`).
	 * Use when a cache is keyed per parameter (paginated, per-template, per-window):
	 * an exact-key `clear(oKeyBase)` would miss every variant. `oKeyBase` must be a string.
	 */
	public static async clearByPrefix(cacheContext: ECacheContext, oKeyBase: string) {
		// `set`/`get` build keys as `<context>_<JSON.stringify(oKey)>`; JSON.stringify
		// wraps a string in quotes, so dropping the trailing quote yields a prefix that
		// matches both the bare `"base"` key and every `"base…"` composite key.
		const prefix = cacheContext.toString() + '_' + JSON.stringify(oKeyBase).slice(0, -1);

		if (this.cache[cacheContext]) {
			this.cache[cacheContext].removeByPrefix(prefix);
		}
	}

	public static async clearContext(cacheContext: ECacheContext) {
		if (this.cache[cacheContext]) {
			this.cache[cacheContext].flushAll();
		}
	}

	public static async clearAll() {
		for (const cacheContext in this.cache) {
			if (this.cache.hasOwnProperty(cacheContext)) {
				this.cache[cacheContext].flushAll();
			}
		}
		this.cache = {};
	}
}

const deepClone = (o: any) => {
	if (o) {
		return JSON.parse(JSON.stringify(o));
	}

	return o;
};
