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

interface JackpotPot {
	/** ID of the jackpot template */
	jp_template_id: number;
	/** ID of the jackpot pot */
	jp_pot_id: number;
	/** currency of the jackpot pot in the Jackput base currency */
	current_pot_amount: number;
	/** currency of the jackpot pot in the user wallet currency */
	current_pot_amount_user_currency: number;
	/** the date/time when this pot exploded */
	explode_date_ts: number;
	/** current pot temperature */
	current_pot_temperature: JackPotTemparature;
}

export { JackpotPot };
