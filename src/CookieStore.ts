import { TSMap } from "typescript-map";

class CookieStore {
    private static cookieStore = new TSMap<string, string[]>()

    public static get(key: string): string[] | undefined {
        
        return CookieStore.cookieStore.get(key);
    }

    public static set(key: string, value: string[]) {
        const v = value.map(v => v.split(';')[0]);
        CookieStore.cookieStore.set(key, v);
    }
}

export { CookieStore }