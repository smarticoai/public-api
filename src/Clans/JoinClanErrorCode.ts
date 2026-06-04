/**
 * Error codes returned in `errCode` by the `joinClan` method (also carried
 * on `TClanJoinResult`). These are terse value definitions for lookup; the
 * full per-code narrative and UI handling lives in the `joinClan` method
 * TSDoc, which owns the error table.
 */
export enum JoinClanErrorCode {
	/** Success — join completed; entry fee (if any) deducted. */
	JOIN_CLAN_OK = 0,
	/** Request was malformed (missing or invalid parameters). */
	JOIN_CLAN_INVALID_PARAMETERS = 1000,
	/** Clan doesn't exist for this label. Archived clans are also reported as `1001`. */
	JOIN_CLAN_NOT_FOUND = 1001,
	/** Clan is full — member capacity reached. */
	JOIN_CLAN_FULL = 1002,
	/** Insufficient balance for the entry fee (points / gems / diamonds). */
	JOIN_CLAN_INSUFFICIENT_FUNDS = 1003,
	/** User doesn't meet the clan's entry segment or conditions. */
	JOIN_CLAN_SEGMENT_MISMATCH = 1004,
	/**
	 * User is not in a clan. Note: a `registerInTournament` response code
	 * that shares this enum — never returned by `joinClan`.
	 */
	JOIN_CLAN_USER_IS_NOT_IN_CLAN = 1005,
	/** User is within the clan-switch cooldown window (switch only). */
	JOIN_CLAN_COOLDOWN_ACTIVE = 1006,
	/**
	 * Clan joined after tournament start. Note: a `registerInTournament`
	 * response code that shares this enum — never returned by `joinClan`.
	 */
	JOIN_CLAN_JOINED_AFTER_TOURNAMENT_START = 1011,
}
