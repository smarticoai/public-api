/**
 * One winner entry inside a {@link JackpotWinPush}.
 *
 * Distinct from {@link JackPotWinner}, which is the winner shape returned by the
 * `getJackpotWinners()` history — the live win push carries bet / trigger context
 * and no avatar.
 */
interface JackPotWinPushWinner {
	/** Smartico user ID of the winner */
	user_id: number;
	/** Operator's external user ID of the winner */
	ext_user_id: string;
	/** Flag indicating that this copy of the push was delivered to the winner themselves */
	is_me: boolean;
	/** Name of the winner, masked for everyone except `is_me` unless masking is disabled by request to Smartico AM team */
	public_username: string;
	/** Custom display name; falls back to `public_username` when not set */
	public_username_custom: string;
	/** Won amount in the Jackpot currency; real and bonus parts are combined */
	winning_amount_jp_currency: number;
	/** Won amount in the user Wallet currency; real and bonus parts are combined */
	winning_amount_wallet_currency: number;
	/** Position of the winner. Relevant for jackpots where there could be multiple winners */
	winning_position: number;
	/** External game ID of the game whose bet triggered the win; `null` when the triggering bet context is unavailable */
	winning_game_id: string | null;
	/** External provider ID of the triggering game's provider; `null` when the triggering bet context is unavailable */
	winning_provider_id: string | null;
	/** Placement time of the triggering bet as reported by the operator (epoch milliseconds) — not the time Smartico processed it; `null` when unavailable */
	bet_original_date: number | null;
	/** Present only on the `is_me` copy; `true` while the win awaits manual approval before payout */
	pending_approve?: boolean;
}

export { JackPotWinPushWinner };
