/**
 * Limit error codes returned in `errCode` by the `avatarsCustomize` method.
 * See the `avatarsCustomize` TSDoc for the full table (including the generic
 * `-1` failure, which has no named member here).
 */
export enum AvatarCustomizeErrorCode {
	/** The user has reached the operator-configured per-user monthly cap on custom-avatar generations. */
	AVATAR_USER_LIMIT = 12001,
	/** The brand's operator-configured shared monthly pool of custom-avatar generations is exhausted. */
	AVATAR_LABEL_LIMIT = 12002,
}
