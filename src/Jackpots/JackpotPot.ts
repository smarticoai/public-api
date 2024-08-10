interface JackpotPot {
	/** ID of the jackpot template */
	jp_template_id: number;
	/** ID of the jackpot pot */
	jp_pot_id: number;
	/** current jackpot pot real money amount */
	current_pot_amount_real: number;
	/** current jackpot pot bonus points amount */
	current_pot_amount_bonus: number;
	/** the date/time when this pot exploded */
	explode_date_ts: number;
}

export { JackpotPot };
