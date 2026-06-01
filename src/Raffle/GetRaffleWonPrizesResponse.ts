import { ProtocolResponse } from '../Base/ProtocolResponse';

/** Presentation meta for a won prize. */
export interface RaffleWonPrizePublicMeta {
	/** Name of the prize, e.g. '1 $'. */
	name: string;
	/** Indicates whether the chance to win should be hidden in the UI. */
	hide_chance_to_win: boolean;
	/** URL of the image that represents the prize. */
	image_url: string;
}

/** A single prize the user won within the raffle. */
export interface RaffleWonPrize {
	/** Unique ID of the winning row (pass to `claimRafflePrize` when `requires_claim` is `true`). */
	raf_won_id: number;
	/** ID of the prize definition. */
	prize_id: number;
	/** Run-instance ID of the draw that awarded this prize. */
	raffle_run_id: number;
	/** Schedule ID of the draw that awarded this prize. */
	draw_id: number;
	/** Presentation meta (name / image). */
	public_meta: RaffleWonPrizePublicMeta;
	/** Whether this prize requires a claim action from the user. */
	requires_claim: boolean;
	/** Epoch ms when the prize was claimed; `null` when not yet claimed. */
	claimed_date: number | null;
}

/** The user the won-prizes list belongs to. */
export interface RaffleWonPrizeUser {
	/** Internal user ID. */
	user_id: number;
	/** Avatar image: a full URL for a system avatar, otherwise an avatar token to resolve against the widget's avatar domain. */
	avatar_id: string;
	/** Numeric ID of the user's selected avatar definition. */
	avatar_real_id: number;
	/** Public username; server-masked for other users (e.g. `"32:r*****"`). */
	public_username?: string;
	/** Always `null` on the wire — use `avatar_id`. */
	avatar_url?: string | null;
}

export interface GetRaffleWonPrizesResponse extends ProtocolResponse {
	/** The user the won prizes belong to; `null` when `won_prizes` is empty. */
	user: RaffleWonPrizeUser | null;
	/** Page of won prizes for the requested raffle, newest-first. */
	won_prizes: RaffleWonPrize[];
	/** Total number of won prizes for this user/raffle across all draws (for pagination). */
	total: number;
	/** Zero-based offset of this page (echoes the resolved request). */
	offset: number;
	/** Page size (echoes the resolved request). */
	limit: number;
}
