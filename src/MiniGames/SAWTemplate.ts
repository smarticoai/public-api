import { SAWBuyInType } from './SAWBuyInType';
import { SAWGameType } from './SAWGameType';
import { SAWPrize } from './SAWPrize';
import { SAWTemplateUI } from './SAWTemplateUI';

export interface SAWTemplate {
	/** ID of the mini-game template */
	saw_template_id: number;
	/** The type of the game — see {@link SAWGameType} */
	saw_game_type_id: SAWGameType;
	/** Full UI definition of the mini-game (name, description, skin, colors, per-game visual settings) */
	saw_template_ui_definition: SAWTemplateUI;

	/** How the user is charged per attempt — see {@link SAWBuyInType} */
	saw_buyin_type_id: SAWBuyInType;
	/** Cost per attempt in the buy-in currency (points, gems or diamonds per `saw_buyin_type_id`) */
	buyin_cost_points?: number;
	/** Operator hint: show the game only while the user can actually play it (has attempts / sufficient balance) */
	visibile_when_can_spin: boolean;

	/** Number of spin attempts the user currently has (initial value; later changes arrive as spin-count pushes) */
	spin_count?: number;

	/** Prizes configured for this game — see {@link SAWPrize} */
	prizes: SAWPrize[];

	/** Operator visibility flag for the template */
	is_visible: boolean;

	/** Time from which the template becomes available (epoch ms); absent when not restricted */
	activeFromDate?: number;
	/** Time until which the template stays available (epoch ms); absent when not restricted */
	activeTillDate?: number;

	/** Amount added to the jackpot on every play (abstract contribution — nothing is deducted from the player) */
	jackpot_add_on_attempt: number;
	/** Current jackpot accumulator value */
	jackpot_current: number;
	/** Seed value of the jackpot — the accumulator starts at (and resets to) this amount after a jackpot win */
	jackpot_guaranteed: number;

	/** Maximum number of unspent spin attempts a user can accumulate */
	maxActiveSpinsAllowed: number;
	/** Maximum number of attempts a user can make during `maxSpinsPediodMs` */
	maxSpinsCount: number;
	/** Length of the attempt-limit period in ms (note the field-name spelling) */
	maxSpinsPediodMs: number;

	/** Epoch-ms time when the next attempt becomes available; populated only when the operator enabled the "show time to the next available spin" setting and max attempts per period is 1 */
	next_available_spin_ts?: number;

	/** Soonest-expiring spin's expiration time for this user (epoch ms); `null`/absent when no expirable spins. */
	earliest_expiration_dt?: number | null;
	/** Latest-expiring spin's expiration time for this user (epoch ms); `null`/absent when no expirable spins. */
	latest_expiration_dt?: number | null;

	/** Key of the visual skin the operator selected for the game */
	saw_skin_key: string;
	/** Skin assets of the game: `skin_folder` is the base URL for the skin's images, `skin_css` custom CSS overrides, plus optional popup/animation tweaks */
	saw_skin_ui_definition: {
		skin_folder: string;
		skin_css: string;
		use_new_popups?: boolean;
		lottie_animation_speed?: number;
	};

	/** Operator template setting. When enabled, the per-prize stock statistics (`pool`, `wins_count`, `weekdays`, `active_from_ts` / `active_till_ts`) are populated on `prizes`; when disabled (default) the server strips them from the response (`pool` is kept for MatchX / Quiz games). */
	expose_game_stat_on_api?: boolean;

	/** Prize Drop only: when true, the pushed prize requires an explicit claim by the user before it is credited */
	requires_prize_claim?: boolean;

	/** Timezone offset in minutes used to evaluate the template's period-based rules (UTC minus local, as in JS `Date.getTimezoneOffset()`) */
	relative_period_timezone?: number;
	/** Operator setting: show a prize-history entry point (icon / button) on this game's view */
	show_prize_history?: boolean;
}
