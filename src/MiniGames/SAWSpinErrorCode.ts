/*
 *  Possible error codes for the mini-games attempts
 */
export enum SAWSpinErrorCode {
	/** No error */
	SAW_OK = 0,
	/** User doesn't have 'spin attempts' to play. In case buy in type for the game is 'spins' based */
	SAW_NO_SPINS = 40001,
	/** The are no prizes left to play the game */
	SAW_PRIZE_POOL_EMPTY = 40002,
	/** User doesn't have enough points to play. In case buy in type for the game is 'points' based */
	SAW_NOT_ENOUGH_POINTS = 40003,
	/** User reached max number of game attempts defined in the BackOffice */
	SAW_FAILED_MAX_SPINS_REACHED = 40004,
	/** Special code for the 'visitor' mode */
	SAW_VISITOR_STOP_SPIN_REQUEST = -40001,
}
