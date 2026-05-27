import { JackpotContributionType } from './JackpotContributionType';
import { JackpotPot } from './JackpotPot';
import { JackpotPublicMeta } from './JackpotPublicMeta';
import { JackpotType } from './JackpotType';

/**
 * One jackpot template the user is eligible for, with its live pot snapshot.
 * Returned by `jackpotGet()`.
 */
interface JackpotDetails {
	/** Stable numeric ID of the template; pass to opt-in / opt-out / winners / eligible-games methods. */
	jp_template_id: number;
	/** Whether the jackpot has a shared pot or one independent per user; see {@link JackpotType}. */
	jp_type_id: JackpotType;
	/** Display data: name, description, image_url, winner / not-winner HTML templates, custom_data (JSON-parsed). */
	jp_public_meta: JackpotPublicMeta;
	/** Native jackpot currency (ISO 4217). Used for winner-history amounts. */
	jp_currency: string;
	/** Current user's wallet currency. Used to display the pot via `pot.current_pot_amount_user_currency`. */
	user_currency: string;
	/** Whether the contribution is a fixed amount or a percentage of the bet; see {@link JackpotContributionType}. */
	contribution_type: JackpotContributionType;
	/** Amount of contribution per qualifying bet — fixed value or percentage depending on `contribution_type`. */
	contribution_value: number;
	/** Live pot snapshot (amount, temperature, last explosion timestamp). */
	pot: JackpotPot;
	/** `true` when the current user is currently opted in. */
	is_opted_in: boolean;
	/** `true` when every game in the operator catalog contributes; if `true`, skip `getJackpotEligibleGames`. */
	ach_related_game_allow_all: boolean;
	/** Number of users currently opted in; always `1` for `JackpotType.Personal`. */
	registration_count: number;
	/** Operator flag: whether the winners list should be displayed. Enforced client-side only — gate `getJackpotWinners` calls on this. */
	expose_winners_over_api: boolean;
}

export { JackpotDetails };
