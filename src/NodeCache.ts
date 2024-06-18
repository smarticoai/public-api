
class NodeCache {

    private static ttlChecker: NodeJS.Timeout;

    private static cache: { [key: string] : any } = {};

    constructor() {
        if (NodeCache.ttlChecker === undefined) {
            NodeCache.ttlChecker = setInterval(() => {
                const now = new Date().getTime();
                for (const key in NodeCache.cache) {
                    if (NodeCache.cache.hasOwnProperty(key)) {
                        const o = NodeCache.cache[key];
                        if (o.ttl < now) {
                            delete NodeCache.cache[key];
                        }
                    }
                }
            }, 1000);
        }
    }

    public get(key: string): any {
        const o = NodeCache.cache[key];
        if (o !== undefined && o.ttl > new Date().getTime()) {
            return o.value;
        }
    }

    public set(key: string, value: any, ttlSeconds: number = 60) {
        NodeCache.cache[key] = {
            value,
            ttl: new Date().getTime() + ttlSeconds * 1000
        }
    }

    public remove(key: string) {
        if (NodeCache.cache.hasOwnProperty(key)) { 
            delete NodeCache.cache[key];

        }
    }    

    public flushAll() {
        NodeCache.cache = {};
    }

}


export { NodeCache }