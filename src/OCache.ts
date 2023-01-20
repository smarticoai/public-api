import { NodeCache } from "./NodeCache";


export enum ECacheContext {
    Translations,
    LabelInfo
}

const WITH_REF_CACHE = [
    ECacheContext.Translations
];

export class OCache {

    private static cache: { [key: string] : NodeCache } = {}

    public static get<T>(oKey: any, cacheContext: ECacheContext): T | undefined {

        const key = cacheContext.toString() + '_' + JSON.stringify(oKey);

        if (this.cache[cacheContext] === undefined) {
            this.cache[cacheContext] = new NodeCache( );
        }

        return this.cache[cacheContext].get(key);
    }

    public static set(oKey: any, o: any, cacheContext: ECacheContext, ttlSeconds: number = 60) {

        const key = cacheContext.toString() + '_' + JSON.stringify(oKey);

        this.cache[cacheContext].set(key, o, ttlSeconds);
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

    public static async clear(cacheContext: ECacheContext) {
        if (this.cache[cacheContext]) {
            this.cache[cacheContext].flushAll();
        }
    }
}
