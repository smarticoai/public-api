/**
 * Error codes returned in `err_code` by the `registerInTournament` method.
 *
 * These are terse value definitions for lookup. The full per-code narrative —
 * when each fires and how the consumer's UI should react — lives in the
 * `registerInTournament` method TSDoc, which owns the error table.
 *
 * Note the numbering break: the gems / diamonds codes are 6-digit
 * (`300010` / `300011`) while the rest of the tournament block is 5-digit;
 * they were appended after the original `30001`–`30009` range was occupied.
 * Branch on the exact numeric value, not on digit count.
 */
export enum TournamentRegistrationError {
	/** Success — registration persisted; buy-in (if any) deducted. */
	NO_ERROR = 0,
	/** Clan-based tournament and the user does not belong to a clan yet. */
	TOURNAMENT_USER_CANNOT_JOIN_WITHOUT_CLAN = 1010,
	/** Instance id is invalid or the tournament was deleted. */
	TOURNAMENT_INSTANCE_NOT_FOUND = 30001,
	/** Insufficient points balance for a points-priced buy-in. */
	TOURNAMENT_REGISTRATION_NOT_ENOUGH_POINTS = 30002,
	/** Tournament is no longer in a registerable state (finished, cancelled, finalizing, or not yet open). */
	TOURNAMENT_INSTANCE_NOT_IN_STATE = 30003,
	/** User is already registered; treat as an idempotent success. */
	TOURNAMENT_ALREADY_REGISTERED = 30004,
	/** User does not satisfy the tournament's segment / entry conditions. */
	TOURNAMENT_USER_DONT_MATCH_CONDITIONS = 30005,
	/** User is not registered; anomalous on a register call (usually a server-side race). */
	TOURNAMENT_USER_NOT_REGISTERED = 30006,
	/** Registration status transition is not allowed (e.g. re-registering a finished tournament). */
	TOURNAMENT_CANT_CHANGE_REGISTRATION_STATUS = 30007,
	/** Tournament filled up — maximum registrations reached. */
	TOURNAMENT_MAX_REGISTRATIONS_REACHED = 30008,
	/**
	 * The user's wallet currency could not be resolved. Emitted server-side
	 * during tournament score processing, NOT during registration — it is
	 * never returned by `registerInTournament`. Included for completeness.
	 */
	TOURNAMENT_INVALID_USER_CURRENCY = 30009,
	/** Insufficient gems balance for a gems-priced buy-in. */
	TOURNAMENT_REGISTRATION_NOT_ENOUGH_GEMS = 300010,
	/** Insufficient diamonds balance for a diamonds-priced buy-in. */
	TOURNAMENT_REGISTRATION_NOT_ENOUGH_DIAMONDS = 300011,
}
