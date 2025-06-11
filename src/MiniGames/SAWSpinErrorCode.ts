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
	/** User tries to play a template that is restricted by date */
	SAW_TEMPLATE_NOT_ACTIVE = 40007,
	/** Special code for the 'visitor' mode */
	SAW_VISITOR_STOP_SPIN_REQUEST = -40001,
	/** User is not in the segment */
	SAW_NOT_IN_SEGMENT = 40009,
	/** User doesn't have enough gems to play. In case buy in type for the game is 'gems' based */
	SAW_NO_BALANCE_GEMS = 40011,
	/** User doesn't have enough diamonds to play. In case buy in type for the game is 'diamonds' based */
	SAW_NO_BALANCE_DIAMONDS = 40012,
}
