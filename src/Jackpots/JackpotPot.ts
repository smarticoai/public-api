enum JackPotTemparature {
	/** cold */
	COLD = 0,
	/** warm */
	WARM = 1,
	/** hot */
	HOT = 2
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
	/** current pot temperature
	 * 0 - cold. seed amount < current pot < (min amount - seed amount)/2
	 * 1 - warm. (min amount - seed amount)/2 < current pot < min amount
	 * 2 - hot.  current pot > min amount
	 */
	current_pot_temperature: JackPotTemparature;
}

export { JackpotPot };
