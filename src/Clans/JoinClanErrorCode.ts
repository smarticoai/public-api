/*
 *  Possible error codes returned in JOIN_CLAN_RESPONSE.errCode (cid: 575).
 *  Clan-protocol-specific numeric codes defined in the handler spec.
 */
export enum JoinClanErrorCode {
	/** No error, join completed */
	JOIN_CLAN_OK = 0,
	/** Invalid parameters */
	JOIN_CLAN_INVALID_PARAMETERS = 1000,
	/** clan_id doesn't exist for this label */
	JOIN_CLAN_NOT_FOUND = 1001,
	/** members_count >= capacity_limit */
	JOIN_CLAN_FULL = 1002,
	/** Not enough Points / Gems / Diamonds for entry fee */
	JOIN_CLAN_INSUFFICIENT_FUNDS = 1003,
	/** User doesn't satisfy entry_conditions / entry_segment_id */
	JOIN_CLAN_SEGMENT_MISMATCH = 1004,
	/** User is not in a clan */
	JOIN_CLAN_USER_IS_NOT_IN_CLAN = 1005,
	/** User is within the CLAN_COOLDOWN_DAYS window */
	JOIN_CLAN_COOLDOWN_ACTIVE = 1006,
	/** clan_status_id != 1 (clan is archived) */
	JOIN_CLAN_ARCHIVED = 1007,
	/** Clan joined after tournament start */
	JOIN_CLAN_JOINED_AFTER_TOURNAMENT_START = 1011,
}
