import { AvatarCustomizeErrorCode } from './AvatarCustomizeErrorCode';

/**
 * Response of the `avatar-customize` HTTP POST (AI avatar generation).
 * On success only `cdn_url` is set; on failure only `errCode` / `errMessage`.
 */
export interface AvatarCustomizeResponse {
	/** CDN URL of the generated avatar variant — present on success. */
	cdn_url?: string;
	/**
	 * Error code — present on failure. `12001` / `12002` are
	 * {@link AvatarCustomizeErrorCode} limits; `-1` is a generic server error.
	 */
	errCode?: AvatarCustomizeErrorCode | number;
	/** Human-readable error message — present on failure. */
	errMessage?: string;
}
