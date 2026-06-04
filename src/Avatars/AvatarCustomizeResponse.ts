import { AvatarCustomizeErrorCode } from './AvatarCustomizeErrorCode';

/**
 * Result of `_smartico.api.avatarsCustomize()`. On success only `cdn_url` is
 * set; on failure only `errCode` / `errMessage`.
 */
export interface AvatarCustomizeResponse {
	/** CDN URL of the generated avatar variant. Present on success. */
	cdn_url?: string;
	/** Error code. Present on failure. Typed values are members of
	 * {@link AvatarCustomizeErrorCode}; `-1` is a generic failure. See the
	 * `avatarsCustomize` TSDoc for the full table. */
	errCode?: AvatarCustomizeErrorCode | number;
	/** Optional error message. Present on failure; the generic (`-1`) message
	 * is fixed text, so branch on `errCode`, not this string. */
	errMessage?: string;
}
