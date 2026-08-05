/**
 * Extra display payload attached to an activity-log row (`ctx_meta` on the wire).
 * Which keys are present depends on the row's activity type — treat every field
 * as optional and render only what is there.
 */
export interface ActivityLogMeta {
	/** Display name of the source entity (mission, tournament, raffle, …). */
	name?: string;
	image_url?: string;
	position?: number;
	/** Points balance before this row; points rows. */
	user_points_balance_before?: number;
	/** Points the awarding rule asked for; points rows. */
	points_requested?: number;
	/** Total points ever collected after this row; points rows. */
	user_points_ever?: number;
	/** Gems / diamonds the awarding rule asked for; gems / diamonds rows. */
	amount_requested?: number;
	/** Gems / diamonds balance before this row. */
	balance_before?: number;
	/** Whether this row counts toward level progress. */
	affects_level?: boolean;
	/** Whether this row counts toward leaderboards. */
	affects_leaderboard?: boolean;
	/** Whether this row moved the spendable balance. */
	affects_current_balance?: boolean;
	/** Set on the row that seeds a brand-new user's wallet. */
	user_initialization?: boolean;
	/** Set on mission rows for repeatable missions. */
	is_recurring?: boolean;
	/** Level moved from; level-change rows. */
	from_level_id?: number;
	/** Level moved to; level-change rows. */
	to_level_id?: number;
	/** Public meta of the level moved from; level-change rows. */
	from_level_public_meta?: any;
	/** Public meta of the level moved to; level-change rows. */
	to_level_public_meta?: any;
}
