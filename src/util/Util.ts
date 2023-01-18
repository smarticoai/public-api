import { Md5 } from "md5-typescript";
import {TSMap} from "typescript-map";

class Util {

    private constructor() {
    }

    public static isNumber(value: string): boolean {
        return /^\d+$/.test(value);
    }

    public static parseNumber(v: string): number | null {
        if (Util.isNotEmpty(v)) {
            const result: number = parseFloat(v);
            if (isNaN(result)) {
                return null;
            }
            return result;
        }
        return null;
    }

    public static parseBoolean(v: string | boolean): boolean | null {
        return v === "true" || v === true ? true : v === "false" || v === false ? false : null;
    }

    public static escapeRegExp(v: string): string {
        if (Util.isNotEmpty(v)) {
            return v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        }
        return v;
    }

    public static nullToEmpty(val: string): string {
        return this.isNotEmpty(val) ? val : "";
    }

    public static nullTo0(val: number): number {
        return this.isNotNull(val) ? val : 0;
    }

    public static isNotEmpty(val: string): boolean {
        return typeof val !== "undefined" && val !== null && val.length > 0;
    }

    public static isNotNull(val: any): boolean {
        return typeof val !== "undefined" && val !== null;
    }

    public static isNull(val: any): boolean {
        return typeof val === "undefined" || val === null;
    }

    public static isArrayNotEmpty(val: any[]): boolean {
        return typeof val !== "undefined" && val !== null && val.length > 0;
    }

    public static isArrayEmpty(val: any[]): boolean {
        return typeof val === "undefined" || val === null || val.length === 0;
    }

    public static isObjectEmpty(val: any): boolean {
        return Util.isNull(val) || (Object.keys(val).length === 0 && val.constructor === Object);
    }

    public static isMapNotEmpty(val: TSMap<any, any>): boolean {
        return typeof val !== "undefined" && val !== null && (val.size() > 0 || val.keys().length > 0);
    }

    public static isMapEmpty(val: TSMap<any, any>): boolean {
        return typeof val === "undefined" || val === null || val.size() === 0 || val.keys().length === 0;
    }

    public static objectToMap<K, V>(obj: any): TSMap<K, V> | null {
        if (Util.isNotNull(obj)) {
            const map: TSMap<K, V> = new TSMap();
            Object.keys(obj).forEach((key: any) => {
                map.set(key, obj[key]);
            });
            return map;
        }
        return null;
    }

    public static keyByValue(obj: any, value: any): string | null {
        for (const prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                if (obj[prop] === value) {
                    return prop;
                }
            }
        }
        return null;
    }

    public static greaterThen0(val: number): boolean {
        return this.isNotNull(val) && val > 0;
    }

    public static not0(val: number): boolean {
        return this.isNotNull(val) && val !== 0;
    }

    public static lessThen0(val: number): boolean {
        return this.isNotNull(val) && val < 0;
    }

    public static compareUndefined(o1: any, o2: any): number {
        if (this.isNotNull(o1) && this.isNull(o2)) {
            return -1;
        }
        if (this.isNull(o1) && this.isNotNull(o2)) {
            return 1;
        }
        return 0;
    }

    public static compareArrayLength<T>(o1: T[], o2: T[]): number {
        const result: number = Util.compareUndefined(o1, o2);
        if (result === 0 && Util.isNotNull(o1) && Util.isNotNull(o2)) {
            return o1.length < o2.length ? -1 : (o1.length > o2.length ? 1 : 0);
        }
        return result;
    }

    public static compareObject(a: { [key: string]: any }, b: { [key: string]: any }) {
        for (const key in a) {
            if (!(key in b) || a[key] !== b[key]) {
                return false;
            }
        }
        for (const key in b) {
            if (!(key in a) || a[key] !== b[key]) {
                return false;
            }
        }
        return true;
    }

    public static compareArrays<T>(arr1: T[], arr2: T[], comparator: (t1: T, t2: T) => number): number {
        Util.checkNotNull(comparator);
        let result: number = this.compareArrayLength(arr1, arr2);
        if (result === 0 && Util.isNotNull(arr1) && Util.isNotNull(arr2)) {
            for (let i = 0; i < arr1.length; i++) {
                result = comparator(arr1[i], arr2[i]);
                if (result !== 0) {
                    break;
                }
            }
        }
        return result;
    }

    public static compareBool(o1: boolean, o2: boolean): number {
        const result: number = this.compareUndefined(o1, o2);
        if (result === 0 && this.isNotNull(o1) && this.isNotNull(o2)) {
            return (Boolean(o2) as any) - (Boolean(o1) as any)
        }
        return result;
    }

    public static compareNumber(o1: number, o2: number): number {
        const result: number = this.compareUndefined(o1, o2);
        if (result === 0 && this.isNotNull(o1) && this.isNotNull(o2)) {
            return o1 === o2 ? 0 : o1 < o2 ? -1 : 1;
        }
        return result;
    }

    public static compareString(o1: string, o2: string): number {
        const result: number = Util.compareUndefined(o1, o2);
        if (result === 0 && Util.isNotNull(o1) && Util.isNotNull(o2)) {
            return o1 < o2 ? -1 : (o1 > o2 ? 1 : 0);
        }
        return result;
    }

    public static range(from: number, to: number): number[] {
        return Array(to - from + 1).fill(null).map((_, idx) => from + idx);
    }

    public static has(array: any[], val: any): boolean {
        if (Util.isArrayNotEmpty(array) && Util.isNotNull(val)) {
            for (let i = 0; i < array.length; i++) {
                if (array[i] === val) {
                    return true;
                }
            }
        }
        return false;
    }

    public static isEmpty(val: string): boolean {
        return typeof val === "undefined" || val === null || val.length === 0;
    }

    public static checkNotNull<T>(reference: T, msg?: string): T {
        if (Util.isNull(reference)) {
            throw new ReferenceError(msg);
        }
        return reference;
    }

    public static randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    public static randomArr<T>(arr: T[]): T | undefined {
        if (Util.isArrayEmpty(arr)) {
            return undefined;
        }
        return arr[Util.randomInt(0, arr.length - 1)];
    }

    public static remove<T>(arr: T[], item: T): boolean {
        if (Util.isArrayNotEmpty(arr) && item) {
            for (let i: number = 0; i < arr.length; i++) {
                if (arr[i] === item) {
                    arr.splice(i, 1);
                    return true;
                }
            }
        }
        return false;
    }

    public static replaceAll(value: string, regex: string, replacement: string | number): string {
        if (Util.isNotNull(value)) {
            return value.replace(new RegExp(Util.escapeRegExp(regex), "g"), replacement as string);
        }
        return value;
    }

    public static to<T, U = any>(
        promise: Promise<T>,
        errorExt?: object
    ): Promise<[U | null, T | undefined]> {
        return promise
            .then<[null, T]>((data: T) => [null, data])
            .catch<[U, undefined]>((err) => {
                if (errorExt) {
                    Object.assign(err, errorExt);
                }
                return [err, undefined];
            });
    }

    public static isObject(item: any): boolean {
        return (item && typeof item === "object" && !Array.isArray(item));
    }

    public static merge(target: any, ...sources: any[]): any {
        if (!sources.length) {
            return target;
        }
        const source = sources.shift();
        if (this.isObject(target) && this.isObject(source)) {
            for (const key in source) {
                if (this.isObject(source[key])) {
                    if (!target[key]) {
                        Object.assign(target, { [key]: {} });
                    }
                    this.merge(target[key], source[key]);
                } else if (Array.isArray(source[key])) {
                    Object.assign(target, { [key]: [...source[key]] });
                } else if (typeof source[key] !== "undefined") {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }
        return this.merge(target, ...sources);
    }

    public static deepCopy(source: object): object {
        return JSON.parse(JSON.stringify(source));
    }

    public static uuid = () => {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            // eslint-disable-next-line no-mixed-operators
            const r = Math.random() * 16 | 0, v = c === "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    public static getStackTrace(): string | undefined {
        return (new Error()).stack;
    }

    public static  shuffleArray(array: any[]) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        };
        return array;
    }

    public static buildValidationHash(ext_user_id: string, ext_game_id: number, customer_id: string, secretKey: string): string {
        const toHash = `${ext_user_id}|${ext_game_id}|${customer_id}:${secretKey}`;
        return Md5.init(toHash);
    }    
}


export { Util };