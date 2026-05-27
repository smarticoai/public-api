enum JackPotTemparature {
	/** cold, seed amount < current pot < (min amount - seed amount)/2 */
	COLD = 0,
	/** warm, (min amount - seed amount)/2 < current pot < min amount */
	WARM = 1,
	/** hot, current pot > min amount, entered explosion range */
	HOT = 2,
	/** burning, current pot > min amount + 0.5 * (max amount - min amount). E.g. mid of allowed explosion range */
	BURNING = 3,
}

/**
 * Live snapshot of one jackpot pot's value and temperature.
 * Embedded on `JackpotDetails.pot`; refreshed at the 1 s SDK cache TTL.
 */
interface JackpotPot {
	/** Template ID this pot belongs to. */
	jp_template_id: number;
	/** Stable numeric ID of the current pot instance (rotates when the pot explodes). */
	jp_pot_id: number;
	/** Current pot amount in the jackpot's native currency (`jp_currency`). */
	current_pot_amount: number;
	/** Current pot amount converted to the user's wallet currency (`user_currency`). */
	current_pot_amount_user_currency: number;
	/** Unix ms timestamp of when this pot last exploded; `0` if it has never exploded. */
	explode_date_ts: number;
	/** Heat band of the pot relative to its explosion range; see {@link JackPotTemparature}. */
	current_pot_temperature: JackPotTemparature;
}

export { JackpotPot, JackPotTemparature };
