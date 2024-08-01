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
}

export { JackpotPot };
