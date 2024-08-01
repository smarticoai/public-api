interface JackPotWinner {
	/** Flag indicating that this winner is the currently logged in user */
	is_me: boolean;
	/** Name of the winner, note that for all users except is_me, the name is masked by default, but masking can be disabled by request to Smartico AM team */
	public_username: string; // masked for all except "is_me"
	/** Won amount in the Jackpot currency */
	winning_amount_jp_currency: number;
	/** Won amount in the user Wallet currency */
	winning_amount_wallet_currency: number;
	/** Position of the winner. Relevant for jackpots where there could be multiple winners */
	winning_position: number;
}

export { JackPotWinner };
