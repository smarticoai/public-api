import { BuyStoreItemErrorCode } from '../Store';
import { AttemptPeriodType, MiniGamePrizeTypeName, SAWAcknowledgeTypeName, SAWAskForUsername, SAWBuyInTypeName, SAWExposeUserSpinIdName, SAWGameLayout, SAWGameLayoutName, SAWGameTypeName, SAWSpinErrorCode, SAWTemplate, SAWTemplateUI } from '../MiniGames';
import { TournamentRegistrationError, TournamentRegistrationStatusName, TournamentRegistrationTypeName } from '../Tournaments';
import { AchievementAvailabilityStatus, BadgesTimeLimitStates } from '../Missions';
import { LeaderBoardPeriodType } from '../Leaderboard';
import { AchCustomLayoutTheme, AchCustomSectionType, AchMissionsTabsOptions, AchOverviewMissionsFilter, LiquidEntityData } from '../CustomSections';
import { PrizeModifiers } from '../MiniGames/PrizeModifiers';
import { InboxCategories } from '../Inbox/InboxCategories';
import { RaffleDrawInstanceState, RaffleDrawTypeExecution, RaffleTicketCapVisualization } from '../Raffle';
import { PointChangeSourceType } from '../ActivityLog/PointChangeSourceType';
import { UserBalanceType } from '../ActivityLog/UserBalanceType';
import { SAWGPMarketType } from '../GamePick/MarketsType';
import { QuizAnswersValueType } from '../GamePick/MarketsAnswers';
import { AchievementClaimPeriodTypeId } from '../Missions/AchievementClaimTypeId';


/** Preset ribbon keys or a custom image URL. For custom images **250×300 px** */
type TRibbon = 'sale' | 'hot' | 'new' | 'vip' | string;

/**
 * TMiniGamePrize describes the information of prize in the array of prizes in the TMiniGameTemplate
 */
export interface TMiniGamePrize {
	/** ID of the prize */
	id: number;
	/** The visual name of the prize */
	name: string;
	/** The type of the prize,  no-prize, points, bonus, manual, spin, jackpot */
	prize_type: MiniGamePrizeTypeName;
	/** Numeric value of the prize in case it's 'points' or 'spin' type. For other types of prizes this value is not relevant. 
	 * For example for prize  '100 points' the prize_value will be 100. For '100 free spins' the prize_value will be 100.
	*/
	prize_value?: number;
	/** Custom font size for the prize (desktop) */
	font_size?: number;
	/** Custom font size for the prize (mobile) */
	font_size_mobile?: number;
	/** The URL of the icon of the prize, aspect ratio 1:1 */
	icon?: string;
	/** for scratch card defines position of prize in the list */
	position: number;
	/** List of sectors for the prize */
	sectors: number[];
	/** Type of acknowledge message for users */
	acknowledge_type: SAWAcknowledgeTypeName;
	/** Message that will be shown to user in modal pop-up */
	aknowledge_message: string;
	/** Deep link that will trigger some action in modal pop-up */
	acknowledge_dp: string;
	/** The name of the action button in modal pop-up */
	acknowledge_action_title: string;
	/** Deep link that will trigger some action in modal pop-up (additional) */
	acknowledge_dp_additional?: string;
	/** The name of the action button in modal pop-up (additional) */
	acknowledge_action_title_additional?: string;
	/** Deep link that will trigger some action in modal pop-up (second button) */
	second_btn?: string,
	/** The name of the action button in modal pop-up (second button) */
	second_btn_action_title?: string;
	/** Message when the prize pool is empty for that specific prize */
	out_of_stock_message?: string;
	/** Remaining stock of the prize — decrements on each win, refunded if the spin is finalised as lost. Populated only when the template's `expose_game_stat_on_api` is enabled; always populated for MatchX / Quiz games */
	pool?: number;
	/** Initial (configured) stock of the prize. Populated regardless of `expose_game_stat_on_api` */
	pool_initial?: number;
	/** Number of times the prize has been won, across all players. Populated only when the template's `expose_game_stat_on_api` is enabled */
	wins_count?: number;
	/** ISO weekday numbers (1 = Monday … 7 = Sunday) on which the prize can be won; absent = any day. Populated only when the template's `expose_game_stat_on_api` is enabled */
	weekdays?: number[];
	/** Time from which the prize can be won (epoch ms), evaluated against `relative_period_timezone`. Populated only when the template's `expose_game_stat_on_api` is enabled */
	active_from_ts?: number;
	/** Time until which the prize can be won (epoch ms), evaluated against `relative_period_timezone`. Populated only when the template's `expose_game_stat_on_api` is enabled */
	active_till_ts?: number;
	/** Timezone offset in minutes used to evaluate `weekdays` and the active window (UTC minus local, as in JS `Date.getTimezoneOffset()` — e.g. `-180` for UTC+3) */
	relative_period_timezone?: number;
	/** When true, the prize stays winnable even when its `pool` reaches 0 (effectively unlimited stock) */
	is_surcharge?: boolean;
	/** Always `false` in API responses — deleted prizes are excluded server-side */
	is_deleted?: boolean;
	/** The custom data of the mini-game defined by operator in the BackOffice. Can be a JSON object, string or number */
	custom_data?: any;
	/** Prize modifiers that will multiply by 2x, 5x or 10x the current total. This will not affect the final Prize Amount that will be awarded. */
	prize_modifiers?: PrizeModifiers[];
	/** When enabled, you can split prize value by decimal values */
	allow_split_decimal?: boolean;
	/** When enabled, you can hide prize from prize history */
	hide_prize_from_history?: boolean;
	/** Requirements to claim the prize  (lootbox specific)*/
	requirements_to_get_prize?: string;
	/** The period type for the prize to be given: Time from last attempt, Calendar days UTC, Calendar days user time zone, Lifetime */
	max_give_period_type_id?: AttemptPeriodType;
}

/**
 * TMiniGamePlayResult describes the response of
 * `_smartico.api.playMiniGame(template_id)`.
 */
export interface TMiniGamePlayResult {
	/** Error code. `0` = success ({@link SAWSpinErrorCode.SAW_OK}).
	 * See `playMiniGame` TSDoc for the full table. */
	err_code: SAWSpinErrorCode;
	/** Optional server-side error message. Present only on non-zero
	 * `err_code`; may be empty even then. */
	err_message: string;
	/** ID of the won prize. Look up in `template.prizes` to interpret
	 * (including `prize_type === 'no-prize'` for a configured loss
	 * slot). Always populated, even when `err_code !== 0`. */
	prize_id: number;
	/** Correlation id of this spin. Pass it to
	 * `miniGameWinAcknowledgeRequest` to finalise the win when
	 * playing with `acknowledge: false` — no need to look it up via
	 * `getMiniGamesHistory`. */
	request_id: string;
}

/**
 * TMiniGamePlayBatchResult describes one entry in the array returned
 * by `_smartico.api.playMiniGameBatch(template_id, spin_count)`.
 *
 * Note: this type uses `errCode` / `errMessage` (camelCase) —
 * different from `TMiniGamePlayResult` which uses `err_code` /
 * `err_message` (snake_case).
 */
export interface TMiniGamePlayBatchResult {
	/** ID of the won prize for this spin. Look up in `template.prizes`. */
	saw_prize_id: number;
	/** Error code. `0` = success. See `playMiniGameBatch` TSDoc for the
	 * full table. */
	errCode: SAWSpinErrorCode;
	/** Optional server-side error message. */
	errMessage?: string;
	/** Jackpot amount the user won, populated when the prize type is
	 * `'jackpot'`. */
	jackpot_amount?: number;
	/** Epoch ms of the user's first spin in the current cooldown
	 * period; populated when `errCode === SAWSpinErrorCode.SAW_FAILED_MAX_SPINS_REACHED`. */
	first_spin_in_period?: number,
}

/**
 * TMiniGameTemplate describes the information of mini-games available for the user
 */
export interface TMiniGameTemplate {
	/** ID of the mini-game template */
	id: number;
	/** Name of the mini-game template, translated to the user language */
	name: string;
	/** Description of the mini-game template, translated to the user language */
	description: string;
	/** URL of the icon of the mini-game template, 256x256px */
	thumbnail: string;

	/** Indicates if the mini-game is visible when the user have attempts/points/gems/diamonds to play */
	visibile_when_can_spin?: boolean;

	/** The type of the game, e.g. Spin the Wheel, Gift Box, Scratch card, MatchX etc */
	saw_game_type: SAWGameTypeName;
	/** How the user is charged for each game attempt e.g. Free, Points or Spin attempts */
	saw_buyin_type: SAWBuyInTypeName;

	/** in case of charging type 'Points', what is the points amount will be deducted from user balance */
	buyin_cost_points?: number;
	/** in case of charging type 'Gems', what is the gems amount will be deducted from user balance */
	buyin_cost_gems?: number;
	/** in case of charging type 'Diamonds', what is the diamonds amount will be deducted from user balance */
	buyin_cost_diamonds?: number;
	/** in case of charging type 'Spin attempts', shows the current number of spin attempts that user has */
	spin_count?: number;

	/** 
	 * if the game is limit to the number of spins that user can do during period of time,
	 * this property shows the epoch time in UTC when the next attempt will be available.
	 * Note that you need to enable 'Show time to the next available spin' setting on mini-game template in the backoffice
	 * Important: this field will not be populated if “Max number of attempts a user can do” is set to value different from 1
	 * */
	next_available_spin_ts: number;

	/** Soonest-expiring spin's expiration time for the current user, as an epoch-ms timestamp.
	 * `null` when the user has no expirable spins for this template — spins only expire when the
	 * template defines a spin-expiration rule (Wheel of Fortune, Loot Boxes, etc.). Pair with
	 * `latest_expiration_dt` to render a "spins expire between X and Y" window. */
	earliest_expiration_dt?: number | null;
	/** Latest-expiring spin's expiration time for the current user, as an epoch-ms timestamp.
	 * `null` when the user has no expirable spins; equals `earliest_expiration_dt` when a single
	 * expiration applies. */
	latest_expiration_dt?: number | null;

	/** The message that should be shown to the user when he cannot play the game, server rejected attempt with error code SAWSpinErrorCode.SAW_FAILED_MAX_SPINS_REACHED */
	over_limit_message: string;
	/** The message that should be shown to the user when he cannot play the game because he doesn't have spin attempts or points. */
	no_attempts_message: string;

	/** Current jackpont amount, if jackpot is enabled. */
	jackpot_current: number;
	/** The amount that will be added to the jackpot every time when somebody plays the game. Note that the contribution amount is abstract, means that no money or points are deducted from the user balance. */
	jackpot_add_on_attempt: number;
	/** The symbol of jackpot that is giving the sense to the 'amount' E.g. the symbol could be EUR and connected to the amount it can indicate that amount is monetary, e.g. '100 EUR'. Or the symbol can be 'Free spins' and connected to the amount it can indicate that amount is number of free spins, e.g. '100 Free spins'.
	 */
	jackpot_symbol: string;

	/** The promo image, 500x240px */
	promo_image: string;
	/** The promo text  */
	promo_text: string;
	/** The custom data of the mini-game defined by operator in the BackOffice. Can be a JSON object, string or number */
	custom_data: any;

	/** List of prizes for mini-games */
	prizes: TMiniGamePrize[];

	/** Operator template setting. When enabled, the per-prize stock statistics (`pool`, `wins_count`, `weekdays`, `active_from_ts` / `active_till_ts`) are populated on `prizes` and kept current after every play; when disabled (default) those fields are omitted. See `getMiniGames` "Per-prize statistics" */
	expose_game_stat_on_api?: boolean;

	/** Time zone to ensure each day aligns with your local midnight. */
	relative_period_timezone?: number;
	/** Holds time from which template will become available, for the template that are targeted to be available from specific time (UNIX timestamp) */
	activeFromDate?: number;
	/** Holds time till which template will become available, for the templates that are targeted to be available from specific time (UNIX timestamp) */
	activeTillDate?: number;
	/** The amount of steps to complete the game and gather the prize */
	steps_to_finish_game?: number;
	/** ID of the operator-defined custom section (widget menu grouping) the mini-game is assigned to */
	custom_section_id?: number;

	/** The UI definition of the mini-game */
	saw_template_ui_definition: SAWTemplateUI;
	/** The layout of the game */
	game_layout?: SAWGameLayoutName;
	/** When enabled the prize history icon is visible on a certain template */
	show_prize_history?: boolean;
	/** The maximum number of attempts that user can do during period of time */
	max_number_of_attempts?: number;
	/** The period of time in milliseconds during which the user can do the maximum number of attempts */
	max_spins_period_ms?: number;
	/** Which identifier to show next to a win result for transparency/audit — 'userId' (the player's external user id) or 'spinId' (the spin's transaction id). Absent when the operator disabled it */
	expose_user_spin_id?: SAWExposeUserSpinIdName;
}

/**
 * TUser describes the information of the user
 * The user object is returned by _smartico.api.getUserProfile() method.
 * If you want to track the changes of the user profile, you can subscribe to the callback in the following way
 *  _smartico.on('props_change', () => console.log(_smartico.api.getUserProfile()) );
 */

export interface TUserProfile {
	/** Language code stored server-side for the user (e.g. `"en"`, `"de"`). */
	core_user_language: string;
	/** Current spendable points balance — decremented by store purchases,
	 * tournament buy-ins, and clan entry fees. */
	ach_points_balance: number;
	/** All-time cumulative points earned. Monotonic — NOT decremented by
	 * store purchases or clan/tournament fees. */
	ach_points_ever: number;
	/** Current gems balance (secondary currency). */
	ach_gems_balance: number;
	/** Current diamonds balance (tertiary currency). */
	ach_diamonds_balance: number;
	/** Server-stored public tags on the user (uppercase strings).
	 * Modify via `_smartico.updatePublicTags(operation, tags)`. */
	core_public_tags: string[];
	/** FK into the level ladder; resolve via `getCurrentLevel()` or `getLevels()`. */
	ach_level_current_id?: number;
	/** `true` when the user is flagged as a test account. */
	core_is_test_account?: boolean;
	/** Resolved CDN URL for the user's avatar. */
	avatar_url?: string;
	/** Display username (operator-defined alias). */
	public_username?: string;
	/** Unread inbox messages count. Push-updated in real time. */
	core_inbox_unread_count?: number;
	/** AI-recommended deposit amount for this user. Undefined when no
	 * recommendation is currently available. */
	core_recommended_deposit_amount?: number;
	/** AI-recommended casino bet amount for this user. Undefined when no
	 * recommendation is currently available. */
	core_recommended_casino_bet_amount?: number;
	/** Display name of the user's current level (e.g. `"Silver"`); resolve the id via `getCurrentLevel()`. */
	ach_level_current?: string;
	/** `true` when the user is in the gamification A/B control group (gamification UI suppressed). */
	ach_gamification_in_control_group?: boolean;
	/** Smartico-internal numeric user id. */
	user_id?: number;
	/** ISO country code of the user (e.g. `"BG"`). */
	user_country?: string;
	/** Wallet currency code (e.g. `"EUR"`). */
	core_wallet_currency?: string;
	/** Registration timestamp (epoch ms); `0` when unknown. */
	core_registration_date?: number;
	/** Last-session browser push-permission state (e.g. `"BLOCKED"`, `"GRANTED"`). */
	user_last_session_push_state?: string;
	/** `true` when the account is flagged as a bonus abuser. */
	acc_bonus_abuser?: boolean;
	/** Selected avatar id (catalogue avatar or AI-variant base). */
	avatar_id?: string;
	/** `avatar_real_id` of the selected avatar; `0` when none. */
	avatar_real_id?: number;
	/** `avatar_real_id` of the user's core avatar; null when unset. */
	core_avatar_real_id?: number | null;
	/** Current clan id (string); empty/null when not in a clan. */
	core_clan_id?: string;
	/** `true` when the user was kicked from their clan; null when not applicable. */
	core_clan_is_kicked?: boolean | null;
	/** Id of the clan the user was kicked from; null when not applicable. */
	core_clan_kicked_out_id?: number | null;
	/** ext_user_id of the friend who referred this user; null when none. */
	aff_referred_by_friend_ext_user_id?: string | null;
	/** Refer-a-friend share URL; null when the feature is disabled. */
	aff_refer_friend_url?: string | null;
	/** Count of friends this user has referred. */
	aff_refered_friends_count?: number;
}

/**
 * TLevel describes one level in the label's level ladder.
 * Returned by `_smartico.api.getLevels()` (already sorted by `required_points` ASC).
 */
export interface TLevel {
	/** Stable ID of the level. */
	id: number;
	/** Display name of the level, pre-translated to the user's language. */
	name: string;
	/** Display description of the level, pre-translated to the user's language. */
	description: string;
	/** URL of the level image (256x256 px source). */
	image: string;
	/** Total `ach_points_ever` required to reach this level. */
	required_points: number;
	/** Visibility threshold — clients hide the level from the user until
	 * `ach_points_ever >= visibility_points`. `null` means always visible. */
	visibility_points: number;
	/** Required value of the first level counter for sliding-window leveling.
	 * `null` on points-only labels. See `UserLevelExtraCountersT`. */
	required_level_counter_1: number;
	/** Required value of the second level counter for sliding-window leveling.
	 * `null` on points-only labels. */
	required_level_counter_2: number;
	/** Operator-defined custom data. The SDK auto-parses JSON-looking
	 * strings, so at runtime this is `any` despite the `string` type. */
	custom_data: string;
	/** 1-based position in the ladder (matches the order of the returned
	 * array, which is sorted by `required_points` ASC). */
	ordinal_position: number;
}

/**
 * TLevelCurrent extends `TLevel` with the user's progress toward the next level.
 * Returned by `_smartico.api.getCurrentLevel()`.
 */
export interface TLevelCurrent extends TLevel {
	/** Progress to the next level as a 0–100 integer percentage. `100`
	 * at the highest level. */
	progress: number;
}

/**
 * TTournament describes the general information of the tournament item
 */

export interface TTournament {
	/** ID of tournament instance. Generated every time when tournament based on specific template is scheduled for run */
	instance_id: number;
	/** ID of tournament template */
	tournament_id: number;
	/** Name of the tournament, translated to the user language */
	name: string;
	/** Description of the tournament, translated to the user language */
	description: string;
	/** 1st image URL representing the tournament, 544×216px */
	image1: string;
	/** 2nd image URL representing the tournament, 920x200px */
	image2: string;
	/** 2nd image URL representing the tournament for mobile, 720x400px */
	image2_mobile: string;
	/** The message indicating the prize pool of the tournament */
	prize_pool_short: string;
	/** The message indicating the price to register in the tournament */
	custom_price_text: string;

	/** The message that should be shown to the user when the user cannot register in tournament with error code TOURNAMENT_USER_DONT_MATCH_CONDITIONS  */
	segment_dont_match_message: string;
	/**
	 * The ID of the custom section where the tournament is assigned
	 * The list of custom sections can be retrieved using _smartico.api.getCustomSections() method
	 */
	custom_section_id: number;
	/** The custom data of the tournament defined by operator. Can be a JSON object, string or number */
	custom_data: any;

	/** The indicator if the tournament is 'Featured' */
	is_featured: boolean;

	/** The ribbon of the tournament item. Can be 'sale', 'hot', 'new', 'vip' or URL to the image in case of custom ribbon, 250×300px */
	ribbon: TRibbon;

	/** A number is used to order the tournaments, representing their priority in the list  */
	priority: number;
	/** Info about current player in tournament */
	me?: {
		/** The username of the participant */
		public_username: string;
		/** The URL to the avatar of the participant */
		avatar_url: string;
		/** The position of the participant in the tournament */
		position: number;
		/** The scores of the participant in the tournament */
		scores: number;
		/** The external user id of the participant */
		user_ext_id: string;
		/** The crm brand id of the participant */
		crm_brand_id: number;
		/** The user id of the participant */
		user_id: number;
	};
	/** Prize structure */
	prizes?: {
		/** The name of the prize */
		name: string;
		/** The description of the prize */
		description: string;
		/** The image of the prize, 1:1 aspect ratio */
		image_url: string;
		/** from-to range of the places to which this prize */
		place_from: number;
		place_to: number;
		/** type of the prize: TANGIBLE, POINTS_ADD, POINTS_DEDUCT, POINTS_RESET, MINI_GAME_ATTEMPT, BONUS */
		type: string;
		/** if the prize is points related, indicates amount of points */
		points?: number;
	}[];

	/** The time when tournament is going to start, epoch with milliseconds */
	start_time: number;
	/** The time when tournament is going to finish, epoch with milliseconds */
	end_time: number;
	/** Type of registration in the tournament */
	registration_type: TournamentRegistrationTypeName;
	/** Number of users registered in the tournament */
	registration_count: number;
	/** flag indicating if current user is registered in the tournament */
	is_user_registered: boolean;
	/** Minimum number of participant for this tournament. If tournament doesnt have enough registrations, it will not start */
	players_min_count: number;
	/** Maximum number of participant for this tournament. When reached, new users won't be able to register */
	players_max_count: number;
	/** Status of registration in the tournament for current user */
	registration_status: TournamentRegistrationStatusName;
	/** Tournament duration in millisecnnds */
	duration_ms: number;

	/** Cost of registration in the tournament in gamification points */
	registration_cost_points?: number;
	/** Cost of registration in the tournament in gems */
	registration_cost_gems?: number;
	/** Cost of registration in the tournament in diamonds */
	registration_cost_diamonds?: number;

	/** Indicator if tournament instance is active, means in one of the statues -  PUBLISHED, REGISTED, STARTED */
	is_active: boolean;

	/** Indicator if user can register in this tournament instance, e.g tournament is active, max users is not reached, user is not registered yet */
	is_can_register: boolean;
	/** Indicator if tournament instance is cancelled (status CANCELLED) */
	is_cancelled: boolean;
	/** Indicator if tournament instance is finished (status FINISHED, CANCELLED OR FINIALIZING) */
	is_finished: boolean;
	/** Indicator if tournament instance is running (status STARTED) */
	is_in_progress: boolean;
	/** Indicator if tournament instance is upcoming (status PUBLISHED or REGISTER) */
	is_upcoming: boolean;
	/** The minimum amount of score points that the user should get in order to be qualified for the prize */
	min_scores_win?: number;
	/** When enabled, users who don’t meet the minimum qualifying score will be hidden from the Leaderboard */
	hide_leaderboard_min_scores?: boolean;
	/** Total scores across all participants in the tournament */
	total_scores?: number;
	/** True when this tournament groups participants by clan */
	is_clan_based?: boolean;
}

/**
 * TTournamentDetailed describes the information of the tournament item and includes list of participants, their scores and position in the tournament leaderboard
 */
export interface TTournamentDetailed extends TTournament {
	/** List of casino games (or other types of entities) related to the tournament */
	related_games?: AchRelatedGame[];
	/** The list of the tournament participants */
	players?: {
		/** The username of the participant */
		public_username: string;
		/** The URL to the avatar of the participant */
		avatar_url: string;
		/** The position of the participant in the tournament */
		position: number;
		/** The scores of the participant in the tournament */
		scores: number;
		/** The indicator if the participant is current user */
		is_me: boolean;
		/** The external user id of the participant */
		user_ext_id: string;
		/** The crm brand id of the participant */
		crm_brand_id: number;
		/** The user id of the participant */
		user_id: number;
	}[];
	/** The information about current user in the tournament if he is registered in the tournamnet */
	me?: {
		/** The username of the current user */
		public_username: string;
		/** The URL to the avatar of the current user */
		avatar_url: string;
		/** The position of the current user in the tournament */
		position: number;
		/** The scores of the current user in the tournament */
		scores: number;
		/** The external user id of the current user */
		user_ext_id: string;
		/** The crm brand id of the current user */
		crm_brand_id: number;
		/** The user id of the current user */
		user_id: number;
	};

	prizes?: {
		/** The name of the prize */
		name: string;
		/** The description of the prize */
		description: string;
		/** The image of the prize, 1:1 aspect ratio */
		image_url: string;
		/** from-to range of the places to which this prize */
		place_from: number;
		place_to: number;
		/** type of the prize: TANGIBLE, POINTS_ADD, POINTS_DEDUCT, POINTS_RESET, MINI_GAME_ATTEMPT, BONUS */
		type: string;
		/** if the prize is points related, indicates amount of points */
		points?: number;
	}[];

	/** Ranked list of clans in this tournament; null for non-clan tournaments */
	clan_leaderboard?: {
		clan_id: number;
		public_meta: { name: string; description: string; image_url: string };
		position: number;
		total_score: number;
		contributing_members: number;
	}[] | null;
	/** The clan ID the current user belongs to; null when clanless or non-clan tournament */
	user_clan_id?: number | null;
	/** The user's rank within their own clan; null when clanless or not registered */
	user_position_in_clan?: number | null;
	/** The user's score contribution to their clan; null when clanless or not registered */
	user_score_in_clan?: number | null;
	/** Per-clan prize structure; null for non-clan tournaments */
	clan_prize_structure?: {
		clan_place: number;
		/** 1 = Fixed, 2 = Dynamic */
		prize_type_id: number;
		prize_pool_amount: number | null;
		prize_pool_currency_code: string | null;
		activity_type_id: number | null;
		details_json: Record<string, any>;
		public_meta: { name: string; description: string; image_url: string; prize_name?: string } | null;
		tiers: {
			player_place_from: number;
			player_place_to: number;
			pool_amount: number | null;
			/** 1 = ScoreWeighted, 2 = EqualSplit; null for Fixed */
			distribution_type: number | null;
			activity_type_id: number;
			details_json: Record<string, any>;
			public_meta: { name: string; description: string; image_url: string } | null;
		}[];
	}[] | null;
}

/**
 * TClanTournamentPlayers describes the players of a specific clan in a clan-based tournament.
 */
export interface TClanTournamentPlayers {
	/** Tournament instance ID */
	tournament_instance_id: number;
	/** Top players of this clan ranked by score DESC */
	players: {
		/** Smartico User ID */
		user_id: number;
		/** External User ID */
		clean_ext_user_id: string;
		/** Public username */
		public_username: string;
		/** Avatar ID */
		avatar_id: string;
		/** Avatar real ID */
		avatar_real_id: number;
		/** Avatar URL */
		avatar_url?: string;
		/** Position in the leaderboard */
		position: number;
		/** Score of the player */
		scores: number;
		/** Indicator if record is the current user */
		is_me: boolean;
	}[];
}

/**
 * TClan describes one clan item from the clans list.
 */
export interface TClan {
	/** Clan ID */
	clan_id: number;
	/** Translated clan metadata */
	public_meta: {
		name: string;
		description: string;
		image_url: string;
	};
	/** Current number of members in clan */
	member_count: number;
	/** Max number of members allowed in clan */
	capacity_limit: number;
	/** Currency type for `entry_fee_amount`. `0` = points, `1` = gems,
	 * `2` = diamonds, `3` = free (no fee). */
	entry_fee_currency_type_id: number;
	/** Entry fee amount in the currency indicated by `entry_fee_currency_type_id`.
	 * `0` (or `entry_fee_currency_type_id === 3`) means the clan is free to join. */
	entry_fee_amount: number;
	/** Global rank among all active clans in the label, by `rating_score` DESC.
	 * `1` = highest-rated. May skip positions when some clans are hidden by
	 * per-user visibility (e.g. user sees positions 1, 3, 7). */
	rating_position: number;
	/** Clan rating score (higher is better). */
	rating_score: number;
}

/**
 * TClans describes the clans payload returned by the API.
 */
export interface TClans {
	/** List of active clans available to the user */
	clans: TClan[];
	/** The clan ID the current user belongs to; null if clanless */
	user_clan_id: number | null;
	/** Switch-cooldown expiry as ISO 8601 UTC string ("YYYY-MM-DDTHH:MM:SS"
	 * with no timezone suffix; interpret as UTC). `null` when no cooldown.
	 * User-level: while set, the user cannot join any clan. */
	cooldown_until: string | null;
	/** Epoch ms when the current user joined their clan; null if clanless */
	join_date: number | null;
}

/**
 * TClanInfo describes the detailed info of a single clan including its members.
 * Returned by `_smartico.api.getClanInfo(clanId)`.
 */
export interface TClanInfo {
	/** Clan ID. */
	clan_id: number;
	/** Translated clan metadata (name, description, image URL). */
	public_meta: { name: string; description: string; image_url: string };
	/** Current number of members in clan. */
	member_count: number;
	/** Max number of members allowed in clan. */
	capacity_limit: number;
	/** Currency type for `entry_fee_amount`. `0` = points, `1` = gems,
	 * `2` = diamonds, `3` = free. */
	entry_fee_currency_type_id: number;
	/** Entry fee amount in the currency indicated by `entry_fee_currency_type_id`. */
	entry_fee_amount: number;
	/** Global rank among all active clans in the label, by `rating_score` DESC.
	 * `1` = highest-rated. */
	rating_position: number;
	/** Clan rating score (higher is better). */
	rating_score: number;
	/** User-level switch-cooldown expiry as ISO 8601 UTC string
	 * ("YYYY-MM-DDTHH:MM:SS" with no timezone suffix). `null` when no
	 * cooldown. Same semantic as `TClans.cooldown_until` but always fresh
	 * (the list version may be up to 30 s stale). */
	cooldown_until: string | null;
	/** Members of this clan, server-ordered by `contribution_score` DESC
	 * (i.e. `position` ASC). */
	members: {
		/** Member's internal user ID. */
		user_id: number;
		/** Member's display username. */
		public_username: string;
		/** Avatar identifier; resolve via `avatar_url` below or rebuild
		 * from `avatar_id` + brand avatar domain. */
		avatar_id: string;
		/** Numeric avatar ID (alternative identifier). */
		avatar_real_id: number;
		/** Pre-resolved CDN URL for the avatar. */
		avatar_url?: string;
		/** Member's rank within this clan; `1` = top contributor. */
		position: number;
		/** Member's contribution to the clan rating score. */
		contribution_score: number;
		/** `true` when this row is the current authenticated user. */
		is_me?: boolean;
		/** External user identifier (operator-provided alias);
		 * preferred over `public_username` on some surfaces. */
		clean_ext_user_id?: string;
	}[];
}

/**
 * TClanJoinResult describes the result of a join-clan request.
 * Note: this type uses `errCode` / `errMsg` (camelCase) — different
 * from most other SDK result types in this library which use
 * `err_code` / `err_message` (snake_case).
 */
export interface TClanJoinResult {
	/** Error code. `0` = success. Typed values are members of
	 * {@link JoinClanErrorCode}. See `joinClan` TSDoc for the full
	 * table and per-code UI guidance. */
	errCode: number;
	/** Optional server-side error message. Present only on non-zero
	 * `errCode`; may be empty even then. */
	errMsg: string;
}

/**
 * TStoreCategory describes the store category item. Each store item can be assigned to 1 or more categories
 */
export interface TStoreCategory {
	/**ID of the store category */
	id: number;
	/**Name of the store category */
	name: string;
	/**Order of the store category among other categories. Default value is 1 */
	order: number;
}

/**
 * TStoreItem describes the information of the store item defined in the system
 */
export interface TStoreItem {
	/** ID of the store item  */
	id: number;
	/** Name of the store item, translated to the user language */
	name: string;
	/** Description of the store item, translated to the user language */
	description: string;
	/** URL of the image of the store item, 256x256px */
	image: string;
	/** Type of the store item. Can be 'bonus' or 'tangible' or different others. */
	type: 'bonus' | 'tangible' | 'minigamespin' | 'changelevel' | 'prizedrop' | 'unknown' | 'raffleticket';
	/** The price of the store item in the gamification points */
	price: number;
	/** The ribbon of the store item. Can be 'sale', 'hot', 'new', 'vip' or URL to the image in case of custom ribbon, 250x300px */
	ribbon: TRibbon;
	/** 
	 *  The message that should be shown to the user if he is not eligible to buy it. this message can be used to explain the reason why user cannot buy the item, e.g. 'You should be VIP to buy this item' and can be used in case can_buy property is false.
		The message is translated to the user language.
		**Note**: when user is trying to buy the item, the response from server can return custom error messages that can be shown to the user as well
	*/
	limit_message: string;
	/** The message that should be shown to the user if they are not eligible to buy it because of purchase limitation. This message can be used to explain the reason why user cannot buy the item, e.g. 'Item is no more available today. Come back Friday'.
		The message is translated to the user language.
		**Note**: when user is trying to buy the item, the response from server can return custom error messages that can be shown to the user as well
	*/
	purchase_limit_message: string;
	/** The priority of the store item. Can be used to sort the items in the store */
	priority: number;
	/** The list of IDs of the related items. Can be used to show the related items in the store */
	related_item_ids: number[];
	/** List of casino games (or other types of entities) related to the store item */
	related_games?: AchRelatedGame[];
	/** The indicator if the user can buy the item
	 *  This indicator is taking into account the segment conditions for the store item, the price of item towards users balance,
	 */
	can_buy: boolean;
	/** The list of IDs of the categories where the store item is assigned, information about categories can be retrieved with getStoreCategories method */
	category_ids: number[];
	/** Items remaining in the pool available for purchase. `null` = unlimited
	 * supply. Positive integer = remaining stock. `0` = sold out but still
	 * returned (operator may instead hide pool-empty items entirely). */
	pool?: number;
	/** The custom data of the store item defined by operator. Can be a JSON object, string or number */
	custom_data: any;
	/** The T&C text for the store item */
	hint_text?: string;
	/** Purchase time to show in purchase history screen */
	purchase_ts?: number;
	/** The amount of points you can purchase an item */
	purchase_points_amount?: number;
	/** Flag for store item indicating that it was purchased today */
	purchased_today?: boolean;
	/** Flag for store item indicating that it was purchased this week  */
	purchased_this_week?: boolean;
	/** Flag for store item indicating that it was purchased this month  */
	purchased_this_month?: boolean;
	/** The type of the purchase */
	purchase_type: 'points' | 'gems' | 'diamonds';
	/** The date when the store item will be available till */
	active_till_date?: number;
	/** Should countdown timer be shown when `active_till_date` is present */
	show_timer?: boolean;
	/** The discounted price of the store item */
	discounted_price?: number;
	/** The ribbon of the discounted price. */
	discount_price_ribbon?: string;
	/** The custom ribbon image of the discounted price, 250x300px */
	custom_ribbon_image?: string;
	/** The ID of the custom section where the store item is assigned */
	custom_section_id?: number;
	/** The indicator if the store item is visible only in the custom section and should be hidden from the main overview of store items */
	only_in_custom_section?: boolean;
	/** ID of specific Custom Section type */
	custom_section_type_id?: number;
	/** The message that should be shown to the user if they are not eligible to buy it. This message can be used to explain the reason why user cannot buy the item, e.g. 'You should be VIP to buy this item'. */
	cant_buy_message?: string;
}

/**
 * TAchCategory describes a mission/badge category. Categories are
 * operator-defined groupings, configured per-label by the brand operator,
 * shared across BOTH missions and badges — the same list is returned for
 * both entity types. A mission or badge can belong to **zero or more**
 * categories (many-to-many) via its `category_ids: number[]` field on
 * `TMissionOrBadge`.
 *
 * Returned by `_smartico.api.getAchCategories()`. See that method's TSDoc
 * for translation, refresh, and rendering details.
 */
export interface TAchCategory {
	/** Stable numeric ID of the category. Used as the key when joining to
	 * `TMissionOrBadge.category_ids: number[]`. */
	id: number;
	/** Display name of the category, pre-translated server-side. Never null. */
	name: string;
	/** Relative display position (lower = appears first). Default 1 when the
	 * operator did not configure an explicit order. */
	order: number;
}

/**
 * TMissionOrBadge describes the information of mission or badge defined in the system
 */
export interface TMissionOrBadge {
	/** ID of the mission or badge  */
	id: number;
	/** Type of entity. Can be 'mission' or 'badge' */
	type: 'mission' | 'badge';
	/** Name of the mission or badge, translated to the user language */
	name: string;
	/** Sub-header of the mission, translated to the user language */
	sub_header: string;
	/** Description of the mission or badge, translated to the user language */
	description: string;
	/** Description of the mission reward if defined */
	reward: string;
	/** URL of the image of the mission or badge, 256x256px */
	image: string;
	/** Indicator if the mission is completed or badge is granted */
	is_completed: boolean;
	/** Indicator if the mission is locked. Means that it's visible to the user, but he cannot progress in it until it's unlocked.
	 * Mission may optionally contain the explanation of what should be done to unlock it in the unlock_mission_description property
	 */
	is_locked: boolean;
	/** Optional explaination of what should be done to unlock the mission */
	unlock_mission_description: string;
	/** Indicator if the mission requires opt-in. Means that user should explicitly opt-in to the mission in order to start progressing in it */
	is_requires_optin: boolean;
	/** Indicator if the user opted-in to the mission */
	is_opted_in: boolean;
	/** The amount of time in milliseconds that user has to complete the mission */
	time_limit_ms: number;

	/** Holds time from which mission will become available, for the missions that are targeted to be available from specific date/time */
	active_from_ts: number;

	/** Holds time till mission will become unavailable, for the missions that are targeted to be available from specific date/time */
	active_till_ts: number;

	/** The date when the mission was started, relevant for the time limited missions, also indicating opt-it date for mission that requires opt-in and unlock date for Locked mission. */
	dt_start: number;
	/** The progress of the mission in percents calculated as the aggregated relative percentage of all tasks */
	progress: number;
	/**
	 * The action that should be performed when user clicks on the mission or badge
	 * Can be URL or deep link, e.g. 'dp:deposit'. The most safe to execute CTA is to pass it to _smartico.dp(cta_action);
	 * The 'dp' function will handle the CTA and will execute it in the most safe way
	 */
	cta_action: string;
	/** The text of the CTA button, e.g. 'Make a deposit' */
	cta_text: string;
	/**
	 * The ID of the custom section where the mission or badge is assigned.
	 * Resolve to section metadata via `_smartico.api.getCustomSections()`.
	 */
	custom_section_id: number;
	/** The indicator if the mission or badge is visible only in the custom section and should be hidden from the main overview of missions/badges */
	only_in_custom_section: boolean;

	/** The custom data of the mission or badge defined by operator. Can be a JSON object, string or number */
	custom_data: any;

	/** The list of tasks of the mission or badge */
	tasks: TMissionOrBadgeTask[];

	/** List of casino games (or other types of entities) related to the mission or badge */
	related_games?: AchRelatedGame[];

	/** The list of IDs of the categories where the badge item is assigned, information about categories can be retrieved with getAchCategories method */
	category_ids: number[];

	/** The T&C text for the missions */
	hint_text?: string;

	/** Priority (or position) of the mission in the UI. Low value indicates higher position in the UI */
	position?: number;

	/** The ribbon of the mission/badge item. Can be 'sale', 'hot', 'new', 'vip' or URL to the image in case of custom ribbon, 250x300px */
	ribbon?: TRibbon;

	/** Stable identifier of this specific mission completion. Undefined for
	 * badges and for missions that have not yet completed. */
	ach_completed_id?: number;

	/** Flag from achievement if the mission prize will be given only after user claims it */
	requires_prize_claim?: boolean;

	/** The date/timestamp indicating when the prize was claimed by the user */
	prize_claimed_date_ts?: number;

	/** Date-time the mission/badge was completed, as a `"dd/MM/yyyy HH:mm:ss"` string
	 * (server local — NOT ISO-8601, so `new Date(complete_date)` will not parse it).
	 * Prefer the epoch-ms `complete_date_ts` for date math. */
	complete_date?: string;

	/** Time of mission/badge being completed, this property shows the epoch time in UTC */
	complete_date_ts?: number;

	/** Flag for mission/badge indicating that mission/badge completed today */
	completed_today?: boolean;

	/** Flag for mission/badge indicating that mission/badge completed this week */
	completed_this_week?: boolean;

	/** Flag for mission/badge indicating that mission/badge completed this month */
	completed_this_month?: boolean;

	/** ID of specific Custom Section type */
	custom_section_type_id?: number;

	/** Max number of times the user can complete a mission in case if mission type is Recurring upon completion. NULL equals infinite. */
	max_completion_count?: number;

	/** Current completion count for Recurring upon completion missions */
	completion_count?: number;

	/** The date/timestamp for recurring missions, which indicating the time remaining until the next recurrence of the mission.
	 * Note that if a mission has an "Active till" date defined, this field is not relevant after that date.
	*/
	next_recurrence_date_ts?: number;

	/** Availability status of the mission depends on the defined time limits */
	availability_status?: AchievementAvailabilityStatus;

	/** Title for the claim reward button */
	claim_button_title?: string;

	/** Action for the claim reward button */
	claim_button_action?: string;

	/** The date/timestamp indicating when the mission claim will expire */
	prize_claim_expiration_date?: number;

	/** The type of the prize claim period (Relative or Exact time and date) */
	prize_claim_period_type_id?: AchievementClaimPeriodTypeId;

	/** Badge time limit state for badges with time restrictions */
	badgeTimeLimitState?: BadgesTimeLimitStates;

	/** Flag from achievement if the mission should be hidden when it is locked, until it's unlocked */
	hide_locked_mission?: boolean;
}

export interface AchRelatedGame {
	/** The ID of the related game */
	ext_game_id: string;
	/** Game public meta information */
	game_public_meta: {
		/** The name of the game */
		name: string;
		/** The URL to the game */
		link: string;
		/** The URL to the image of the game, 1:1 aspect ratio */
		image: string;
		/** The indicator if the game is enabled */
		enabled: boolean;
		/** The list of categories of the game */
		game_categories: string[];
		/** The name of the game provider */
		game_provider: string;
		/** The URL to the mobile game */
		mobile_spec_link: string;
		/** The priority of the game */
		priority?: number;
	};
}

/**
 * TMissionOrBadgeTask describes the information of tasks that belings to mission or badge. See also TMissionOrBadge
 */
export interface TMissionOrBadgeTask {
	/** ID of the task */
	id: number;
	/** Name of the task, translated to the user language */
	name: string;
	/** Indicator if the task is completed */
	is_completed: boolean;
	/** The progress of the task in percents */
	progress: number;
	/** Reward for completing the task in points */
	points_reward: number;
	/** Reward for completing the task in gems */
	gems_reward?: number;
	/** Reward for completing the task in diamonds */
	diamonds_reward?: number;
	/** This is the total number of times the user needs to execute to complete task. e.g. he needs to bet 100 times. Here will be 100 */
	execution_count_expected?: number;
	/** This is the number of times the user has executed 'activity' of the task. e.g. he bet 5 times out of 100. Here will be 5 */
	execution_count_actual?: number;
}

/**
 * Response of `_smartico.api.requestMissionOptIn(mission_id)`.
 *
 * See `requestMissionOptIn` TSDoc for the full table of `err_code` values
 * and recommended UI handling.
 */
export interface TMissionOptInResult {
	/** Error code. `0` = success. See `requestMissionOptIn` TSDoc for the full table. */
	err_code: number;
	/** Optional error message; populated on non-zero `err_code`. */
	err_message: string;
}

/**
 * Response of `_smartico.api.requestMissionClaimReward(mission_id, ach_completed_id)`.
 *
 * See `requestMissionClaimReward` TSDoc for the full table of `err_code`
 * values, preconditions, side effects, and recommended UI handling.
 */
export interface TMissionClaimRewardResult {
	/** Error code. `0` = success (rewards credited). See `requestMissionClaimReward` TSDoc for the full table. */
	err_code: number;
	/** Optional error message; populated on non-zero `err_code`. */
	err_message: string;
}

/**
 * Result of `_smartico.api.registerInTournament(tournament_id)`.
 */
export interface TTournamentRegistrationResult {
	/** Error code. `0` = success. See `registerInTournament` TSDoc for the full table. */
	err_code: TournamentRegistrationError;
	/** Optional error message; populated on non-zero `err_code`. */
	err_message: string;
}

/**
 * Result of `_smartico.api.buyStoreItem(store_item_id)`.
 */
export interface TBuyStoreItemResult {
	/** Error code. `0` = success. See `buyStoreItem` TSDoc for the full table. */
	err_code: BuyStoreItemErrorCode;
	/** Optional error message; populated on non-zero `err_code`. */
	err_message: string;
}

/**
 * Result of `getTranslations(lang_code)`.
 */
export interface TGetTranslations {
	/** Flat dictionary of operator-defined translation key → translated string. */
	translations: { [key: string]: string };
}

/**
 * TInboxMessage is the lightweight envelope returned by
 * `_smartico.api.getInboxMessages()`. Fetch the rich body (title,
 * preview, icon, html_body, buttons) separately via
 * `_smartico.api.getInboxMessageBody(message_guid)`.
 */
export interface TInboxMessage {
	/** Unique identifier of the message. Pass to `getInboxMessageBody`
	 * and the mark / favorite / delete mutations. */
	message_guid: string;
	/** Date-time the message was sent, as a `"dd/MM/yyyy HH:mm:ss"` string
	 * (server local — NOT ISO-8601, so `new Date(sent_date)` will not parse it). */
	sent_date: string;
	/** `true` when the message has been marked read. */
	read: boolean;
	/** `true` when the message has been starred (favorited). */
	favorite: boolean;
	/** Operator-assigned category ({@link InboxCategories}). */
	category_id?: InboxCategories;
	/** Expiry timestamp as Unix-ms epoch. Server filters out expired
	 * messages from list responses — consumers rarely see this set
	 * unless the expiry is upcoming. */
	expire_on_dt?: number;
}

/**
 * TInboxMessageBody is the rich body of one inbox message.
 * Returned by `_smartico.api.getInboxMessageBody(message_guid)`.
 * Fetched from a CDN (not over WebSocket).
 */
export interface TInboxMessageBody {
	/** Display title. */
	title: string;
	/** Short preview text (typically rendered alongside the title in list items). */
	preview_body: string;
	/** Message icon URL (128×128 px recommended). */
	icon: string;
	/** Click-action — either a deep-link (e.g. `'dp:deposit'`) or a
	 * plain URL. The literal `'dp:inbox'` indicates the message has a
	 * rich `html_body`; for any other value `html_body` and `buttons`
	 * are absent. Pass to `_smartico.dp(action)` for safe execution. */
	action: string;
	/** Rich HTML body. Populated only when `action === 'dp:inbox'`. */
	html_body?: string;
	/** Up to 2 additional action buttons. Populated only when
	 * `action === 'dp:inbox'`. */
	buttons?: {
		/** Button click-action (deep-link or URL). */
		action: string;
		/** Button label. */
		text: string;
	}[];
	/** Operator-defined custom data. The SDK auto-parses JSON-looking
	 * strings, so at runtime this is `any` despite the `string` type. */
	custom_data?: string;
}

/**
 * InboxMarkMessageAction is the response of the five inbox mutation
 * methods (`markInboxMessageAsRead`, `markAllInboxMessagesAsRead`,
 * `markUnmarkInboxMessageAsFavorite`, `deleteInboxMessage`,
 * `deleteAllInboxMessages`).
 */
export interface InboxMarkMessageAction {
	/** Error code. `0` = success. See the calling method's TSDoc for
	 * the full error semantics (server returns generic codes; the
	 * five inbox mutations share the same shape). */
	err_code: number;
	/** Optional server-side error message. Present only on non-zero
	 * `err_code`; may be empty even then. */
	err_message: string;
}

/**
 * LeaderBoardDetailsT describes one period's leaderboard.
 * Returned by `_smartico.api.getLeaderBoard(periodType, getPreviousPeriod?)`.
 * May be `undefined` at runtime when no board is configured for the requested period.
 */
export interface LeaderBoardDetailsT {
	/** Stable ID of the leaderboard. */
	board_id: number;
	/** Operator-defined display name. */
	name: string;
	/** Operator-defined description (HTML allowed). */
	description: string;
	/** Operator-defined rules / terms (HTML allowed). */
	rules: string;
	/** Period type this board is bound to ({@link LeaderBoardPeriodType}). */
	period_type_id: LeaderBoardPeriodType;
	/** Snapshot version. `0` for the live current period; a positive value
	 * identifies a finalized previous-period snapshot (see `getPreviousPeriod`). */
	version_id: number;
	/** Snapshot creation timestamp (Unix ms). `0` for the live current period;
	 * the finalization time for a previous-period snapshot. */
	create_date: number;
	/** Per-place prize table; the array length is the number of paid places. */
	rewards: LeaderBoardsRewardsT[];
	/** Top-20 ranked entries (server-capped), sorted by `position` ASC.
	 * Empty when fetched via `getLeaderBoards()` (metadata-only list). */
	users: LeaderBoardUserT[];
	/** Current user's own entry. `undefined` for visitor sessions.
	 * For authenticated users, `position === -1` means the user is
	 * unranked / outside the ranked window. */
	me?: LeaderBoardUserT;
}

/**
 * LeaderBoardsRewardsT describes one place's prize on a leaderboard.
 * Leaderboard prizes are always gamification points (never gems / diamonds / items).
 */
export interface LeaderBoardsRewardsT {
	/** Place number (1-based). */
	place: number;
	/** Gamification points awarded to the user occupying this place at period finalization. */
	points: number;
}

/**
 * LeaderBoardUserT describes one participant row on a leaderboard.
 */
export interface LeaderBoardUserT {
	/** Display username (operator-defined alias). */
	public_username: string;
	/** Resolved CDN URL for the participant's avatar. May be empty when the
	 * participant has no custom avatar — fall back to a level-based default
	 * using `level_id`. */
	avatar_url: string;
	/** The participant's level id — use it to resolve a level-based default
	 * avatar when `avatar_url` is empty. */
	level_id: number;
	/** Rank in the leaderboard (DENSE_RANK over all participants).
	 * `-1` on the `me` entry signals "unranked / outside the window". */
	position: number;
	/** Participant's points for this period. */
	points: number;
	/** `true` when this row is the current authenticated user. Always `true`
	 * on the `me` entry. */
	is_me: boolean;
}

/**
 * UserLevelExtraCountersT exposes the user's current values for the two
 * label-defined sliding-window level counters. Returned by
 * `_smartico.api.getUserLevelExtraCounters()`. Both fields are
 * `undefined` on points-only labels.
 */
export interface UserLevelExtraCountersT {
	/** Current value of the user's first level counter. Operator-defined
	 * semantics per label. `undefined` on points-only labels. */
	level_counter_1?: number;
	/** Current value of the user's second level counter. Operator-defined
	 * semantics per label. `undefined` on points-only labels. */
	level_counter_2?: number;
}

/**
 * TSegmentCheckResult describes one segment-membership outcome.
 * Returned by `_smartico.api.checkSegmentListMatch()` (and used
 * internally by `checkSegmentMatch()`).
 */
export interface TSegmentCheckResult {
	/** The segment ID this result refers to (label-scoped). */
	segment_id: number;
	/** `true` if the user currently matches this segment. `false` also
	 * covers the case where the segment doesn't exist for the label —
	 * the two are not distinguishable. */
	is_matching: boolean;
}

/**
 * One operator-configured navigation entry. Returned by `getCustomSections()`.
 * `section_type_id` is the dispatch key — it determines which page component the
 * consumer mounts when the user opens this section.
 */
export interface TUICustomSection {
	/** Stable numeric ID of the section. */
	id: number;
	/** Raw HTML body for `HTML_PAGE` sections; Liquid template body for `LEVELS` (Liquid) sections. */
	body?: string;
	/** CDN URL of the section's nav icon, 64x64 px square. */
	menu_img?: string;
	/** Display name shown next to the nav icon. Pre-translated server-side. */
	menu_name?: string;
	/** JSON-serialized list of skin image overrides for themed sections (e.g. `MISSION_CUSTOM_LAYOUT`). */
	custom_skin_images?: string;
	/** Dispatch key — see {@link AchCustomSectionType}. */
	section_type_id?: AchCustomSectionType;
	/** Themed-layout name for `MISSION_CUSTOM_LAYOUT` sections; see {@link AchCustomLayoutTheme}. */
	theme?: AchCustomLayoutTheme;
	/** Custom CSS for themed layouts. */
	generic_custom_css?: string;
	/** Which tabs to render for `MISSIONS_CATEGORY` sections; see {@link AchMissionsTabsOptions}. */
	mission_tabs_options?: AchMissionsTabsOptions;
	/** Mission-filter rule for the Overview tab; see {@link AchOverviewMissionsFilter}. */
	overview_missions_filter?: AchOverviewMissionsFilter;
	/** Maximum number of missions shown in the Overview tab. */
	overview_missions_count?: number;
	/** Click target for `REDIRECT_LINK` sections — either a Smartico DP string (`dp:…`) or an external URL. */
	url_or_dp?: string;
	/** Data-context selectors for Liquid templates; see {@link LiquidEntityData}. */
	liquid_entity_data?: LiquidEntityData[];
	/** Tournament ID for a single-tournament Liquid template (`LiquidEntityData.Tournament`). */
	ach_tournament_id?: number;
	/** Operator debug flag — when `true`, Liquid renders raw context data instead of the templated HTML. */
	show_raw_data?: boolean;
	/** Liquid template ID resolved server-side; the rendered body is delivered in `body`. */
	liquid_template?: number;
	/** Category IDs the section filters badges by — correlate with `getAchCategories()`. */
	ach_category_ids?: number[];
	/** Category IDs the section filters store items by — correlate with `getStoreCategories()`. */
	shop_category_ids?: number[];
	/** Raffle ID for `RAFFLE` sections (and `LiquidEntityData.SingleRaffle` Liquid templates). */
	raffle_id?: number;
}

/**
 * TBonus describes one bonus awarded to the user.
 * Returned by `_smartico.api.getBonuses()`.
 */
export interface TBonus {
	/** Stable ID of the bonus. */
	bonus_id: number;
	/** `true` when the bonus is in a player-claim-required state.
	 * Gate the Claim button on this; see `claimBonus` TSDoc. */
	is_redeemable?: boolean;
	/** Bonus creation timestamp as ISO 8601 UTC string
	 * ("YYYY-MM-DDTHH:MM:SS", no timezone suffix). */
	create_date?: string;
	/** Bonus redemption timestamp as ISO 8601 UTC string. Absent until
	 * the bonus reaches `BonusStatus.REDEEMED`. */
	redeem_date?: string;
	/** ID of the bonus template used to issue this bonus. */
	label_bonus_template_id?: number;
	/** Lifecycle status; see {@link BonusStatus}. */
	bonus_status_id?: BonusStatus;
	/** Template-level display metadata (operator-configured, identical
	 * across all bonuses from the same template). */
	label_bonus_template_meta_map?: BonusTemplateMetaMap;
	/** Instance-level display metadata (per-issuance; carries the
	 * dynamic amount computed at award time). */
	bonus_meta_map?: BonusMetaMap;
}

/**
 * BonusStatus describes the lifecycle stage of a bonus on `TBonus.bonus_status_id`.
 * Operator widget configuration typically filters out internal statuses
 * (`New`, `COUPON_ISSUE_FAILED`, `EXPIRED`); consumers usually see
 * `COUPON_ISSUED`, `REDEEMED`, and `REDEEM_FAILED`.
 */
export enum BonusStatus {
	/** Newly created, not yet processed (internal). */
	New = 1,
	/** Issued and awaiting player claim. */
	COUPON_ISSUED = 2,
	/** Successfully redeemed. */
	REDEEMED = 3,
	/** Previous redemption attempt failed; still valid and re-claimable. */
	REDEEM_FAILED = 4,
	/** Coupon issuance failed (internal). */
	COUPON_ISSUE_FAILED = 5,
	/** Issued but expired before redemption (internal). */
	EXPIRED = 6,
}
/**
 * Template-level bonus display metadata (operator-configured at the
 * bonus template; identical for every bonus issued from the same template).
 */
export interface BonusTemplateMetaMap {
	/** Operator-set description / display text. May include HTML. */
	description: string;
	/** Operator-set additional message shown to the player at claim
	 * time (e.g. wagering terms). May include deep-links. */
	acknowledge: string;
	/** Bonus icon URL (1:1 aspect ratio recommended). */
	image_url: string;
	/** Optional redirect — external HTTP URL (opens in new tab) or
	 * internal deep-link (handled by the SDK's deep-link router). */
	redirect_url?: string;
}
/**
 * Instance-level bonus display metadata (set per-issuance, may carry
 * a dynamically-computed amount).
 */
export interface BonusMetaMap {
	/** Display-ready amount string (e.g. "€50", "100 free spins"). */
	uiAmount?: string;
}

/**
 * TClaimBonusResult describes the response of `_smartico.api.claimBonus(bonus_id)`.
 */
/**
 * Result of `_smartico.api.claimBonus(bonus_id)`.
 */
export interface TClaimBonusResult {
	/** Error code. `0` = success. See `claimBonus` TSDoc for the full table. */
	err_code: number;
	/** Optional error message; populated on non-zero `err_code`. */
	err_message: string;
	/** Unreliable on the wire — prefer `err_code === 0` as the success check. */
	success?: boolean;
}

export interface TSawHistory {
	/** The initial information about mini-game */
	template: SAWTemplate,
	/** ID of the mini-game template */
	saw_template_id: number,
	/** The saw_prize_id that user won, details of the prize can be found in the mini-game definition */
	saw_prize_id: number,
	/** Amount of prizes in stock */
	prize_amount: number,
	/** Request ID that client is sending to show history*/
	client_request_id: string,
	/** Flag indicating to show whether prize in the mini-game claimed or not */
	is_claimed: boolean,
	/** Win prize date in milliseconds */
	create_date_ts: number;
	/** Claimed prize date in milliseconds */
	acknowledge_date_ts: number;
}

export interface TRaffle {
	/** ID of the Raffle template */
	id: number;
	/** Name of the raffle */
	name: string;
	/** Description of the raffle */
	description: string;
	/** ID of the custom section that is linked to the raffle in the Gamification widget */
	custom_section_id: number;
	/** URL of the image that represents the raffle, 890x193px */
	image_url: string;
	/** URL of the mobile image that represents the raffle, 300x142px */
	image_url_mobile: string;
	/**
	 * Custom data as string or JSON string that can be used in API to build custom UI
	 * You can request from Smartico to define fields for your specific case that will be managed from Smartico BackOffice
	 * Read more here - https://help.smartico.ai/welcome/products/general-concepts/custom-fields-attributes
	 */
	custom_data: string;
	/** Date of start */
	start_date: number;
	/** Date of end */
	end_date: number;
	/** Maximum numer of tickets that can be given to all users for the whole period of raffle */
	max_tickets_count: number;
	/**
	 * Number of tickets that are already given to all users for this raffle
	 */
	current_tickets_count: number;
	/**
	 * List of draws that are available for this raffle.
	 * For example, if the raffle is containg one hourly draw, one daily draw and one draw on fixed date like 01/01/2022,
	 * Then the list will always return 3 draws, no matter if the draws are already executed or they are in the future.
	 */
	draws: TRaffleDraw[];
	/**
	 * Ticket cap visualization
	 */
	ticket_cap_visualization: RaffleTicketCapVisualization;
}

export interface TRaffleTicket {
	/**
	 * Int presentation of the ticket
	 */
	ticekt_id: number;
	/**
	 * String presentation of the ticket
	 */
	ticket_id_string: string;
}

export interface TRafflePrize {
	/**
	 * The unique identifier for the prize definition
	 */
	id: string;

	/** Name of the prize */
	name: string;
	/** Description of the prize */
	description: string;
	/** URL of the image that represents the prize, 256x256px */
	image_url: string;
	/**
	 * Custom data field set in the backoffice prize setup.
	 * Can be used to build custom UI for gamification.
	 */
	custom_data?: string;
	/**
	 * The number of prizes available per run of the draw.
	 * E.g. if the draw is run daily, this is the number of prizes available each day, for example 3 iPhones.
	 */
	prizes_per_run: number;

	/**
	 * The actual number of prizes for the current instance.
	 * This value is taking into account follwing values:
	 *  - min_required_total_tickets,
	 *  - add_one_prize_per_each_x_tickets
	 *  - stock_items_per_draw
	 *  - total_tickets_count (from Draw instance)
	 *  - cap_prizes_per_run
	 * For example:
	 *  - prizes_per_run = 1
	 *  - min_required_total_tickets = 1000
	 *  - add_one_prize_per_each_x_tickets = 1000
	 *  - stock_items_per_draw = 5
	 *  - total_tickets_count = 7000
	 *  - cap_prizes_per_run = 6
	 *  prizes_per_run_actual will be 5, because
	 *  7000 tickets are collected, so 7 iPhones are available, but the cap is 6 and the stock is 5.
	 */
	prizes_per_run_actual: number;

	/**
	 *
	 * The chances to win the prize by current player.
	 * Calculated as the ratio of the number of tickets collected by the current player to the
	 * total number of tickets collected by all players and multiplied by number of actual prizes of this kind.
	 */
	chances_to_win_perc: number;

	/**
	 * The minimum number of total tickets collected during draw period required to unlock the prize.
	 * If the number of tickets collected is less than this value, the prize is not available.
	 * Under total tickets we understand the number of tickets collected by all users.
	 * The 'draw period' is the time between the ticket_start_date value of the draw and the current time.
	 */
	min_required_total_tickets?: number;

	/**
	 * One additional prize will be awarded for each X tickets.
	 * E.g. if the prize is 1 iPhone and the value is set to 1000, then for every 1000 tickets collected, an additional iPhone is awarded.
	 * If min_required_total_tickets is set to 1000, then next iPhone is awarded when 2000 tickets are collected, and so on.
	 * If min_required_total_tickets is not set, then the next iPhone will be awarded when 1000 tickets are collected.
	 */
	add_one_prize_per_each_x_tickets?: number;

	/**
	 * Indicates whether the prize requires a claim action from the user.
	 */
	requires_claim: boolean;

	/**
	 * The minimum number of tickets a user must have to be eligible for the prize.
	 * For example iPhone prize may require 10 tickets to be collected, only users with 10 or more tickets will be eligible for the prize.
	 * More tickets are better, as they increase the chances of winning.
	 */
	min_required_tickets_for_user: number;

	/**
	 * The maximum number of prizes that can be given withing one instance/run of draw.
	 * For example the prize is iPhone and add_one_prize_per_each_x_tickets is set to 1000,
	 * cap_prizes_per_run is set to 3, and the total number of tickets collected is 7000.
	 * In this case, the prizes_per_run_actual will be limitted by 3
	 */
	cap_prizes_per_run?: number;

	/**
	 * The priority of the prize. The low number means higher priority (e.g. 1 is higher priority than 2).
	 * If there are multiple prizes available, the prize with the highest priority (lowest number) will be awarded first.
	 */
	priority: number;

	/**
	 * Optional field that indicates total remaining number of the prize for all draws of the type.
	 * For example, the Daily draw has 1 iPhone daily, and the total number of iPhones is 10.
	 * the stock_items_per_draw will be decreasing by 1 each day (assuming there is enough tickets and it is won every day), and when it reaches 0, the prize is not available anymore.
	 */
	stock_items_per_draw?: number;

	/**
	 * Shows if the prize has been claimed
	 */
	should_claim: boolean;

	winners: TRafflePrizeWinner[];
}

export interface TRafflePrizeWinner {
	/**
	 * Id of the winner definition, for the repetative winners (e.g. same winner won two prizes), this number will be the same for all winner that are repeating
	 * (internal name: schedule_id)
	 */
	id: number;
	/** Winner user name */
	username?: string;
	/** URL of the image of user avatar*/
	avatar_url?: string;
	/** Ticket information (number string and integer)*/
	ticket: TRaffleTicket;
	/** Unique ID of winning*/
	raf_won_id: number;
	/** Date when the prize was claimed*/
	claimed_date: number;
}

export interface TRaffleDraw {
	/**
	 * Id of the Draw definition, for the repetative draws (e.g. daily), this number will be the same for all draws that are repeating daily
	 * (internal name: schedule_id)
	 */
	id: number;
	/** Name of the draw, e.g. 'Daily draw' */
	name: string;
	/** Description of the draw */
	description: string;
	/** URL of the image that represents the draw, 365x175px */
	image_url: string;
	/** URL of the moible image that represents the draw, 300x145px */
	image_url_mobile: string;
	/**
	 * URL of the icon that represents the draw
	 * @remarks Square icon target **256×256 px**
	 */
	icon_url: string;
	/**
	 * URL of the background image that will be used in the draw list item
	 * @remarks Desktop draw list strip: **900×85 px**.
	 */
	background_image_url: string;
	/**
	 * URL of the moible background image that will be used in the draw list item
	 * @remarks Mobile draw list background: **1328×240 px**.
	 */
	background_image_url_mobile: string;
	/** Show if the draw is grand and is marked as special */
	is_grand: boolean;

	/** Information about prizes in the draw */
	prizes: TRafflePrize[];

	/**
	 * State of current instance of Draw
	 */
	current_state: RaffleDrawInstanceState;

	/**
	 * Field indicates the ID of the latest instance/run of draw
	 */
	run_id: number;

	/**
	 * Type of the draw execution, indicating how and when the draw is executed.
	 * - ExecDate: Draw is executed only once at a specific date and time.
	 * - Recurring: Draw is executed on a recurring basis (e.g., daily, weekly).
	 * - Grand: Draw is executed once and is marked as grand, often with larger prizes or more importance.
	 */
	execution_type: RaffleDrawTypeExecution;

	/** Date/time of the draw execution */
	execution_ts: number;

	/** Date of the previously executed draw (if there is such) */
	previous_run_ts?: number;

	/** Unique ID of the previusly executed draw (if there is such) */
	previous_run_id?: number;

	/**
	 *  Date/time starting from which the tickets will participate in the upcoming draw
	 *  This value need to be taken into account with next_execute_ts field value, for example
	 *  Next draw is at 10:00, ticket_start_date is 9:00, so all tickets that are collected after 9:00 will participate in the draw at 10:00
	 *  (internally this value is calculated as next_execute_ts - ticket_start_date)
	 */
	ticket_start_ts: number;
	/** Field is indicating if same ticket can win multiple prizes in the same draw
	 *  For example there are 3 types of prizes in the draw - iPhone, iPad, MacBook
	 *  If this field is true, then one ticket can win all 3 prizes (depending on the chances of course),
	 *  if false, then one ticket can win only one prize.
	 *  The distribution of the prizes is start from top (assuming on top are the most valuable prizes) to bottom (less valuable prizes)
	 *  If specific prize has multiple values, e.g. we have 3 iPhones,
	 *  then the same ticket can win only one prize of a kind, but can win multiple prizes of different kind (if allow_multi_prize_per_ticket is true)
	 */
	allow_multi_prize_per_ticket: boolean;
	/**
	 * The number of tickets that are already given to all users for this instance of draw.
	 * In other words tickets that are collected between ticket_start_date and current time (or till current_execution_ts is the instance is executed).
	 */
	total_tickets_count: number;
	/**
	 * The number of tickets collected by current user for this instance of draw.
	 */
	my_tickets_count: number;
	/*
	 * List of last 5 tickets are collected by current user for this instance of draw.
	 */
	my_last_tickets: TRaffleTicket[];
	/**
	 * If true, the user has opted-in to the raffle.
	 */
	user_opted_in: boolean;
	/**
	 * If true, the user needs to opt-in to the raffle before they can participate.
	 */
	requires_optin: boolean;
	/**
	 * If true, the draw is active and can be participated in.
	 */
	is_active: boolean;
	/**
	 * The number of winners to return
	 */
	winners_limit?: number;
	/**
	 * The offset of the winners to return
	 */
	winners_offset?: number;
	/**
	 * The total number of winners
	 */
	winners_total?: number;
}

export interface TRaffleDrawRun {
	/**
	 * Id of the Draw definition, for the repetative draws (e.g. daily), this number will be the same for all draws that are repeating daily
	 * (internal name: schedule_id)
	 */
	id: number;
	/**
	* Field indicates the ID of the latest instance/run of draw
	*/
	run_id: number;
	/** Name of the draw, e.g. 'Daily draw' */
	name: string;
	/** Description of the draw */
	description: string;
	/**
	 * URL of the image that represents the draw
	 * @remarks Same as {@link TRaffleDraw.image_url}: **365×175 px** desktop promo.
	 */
	image_url: string;
	/**
	 * URL of the moible image that represents the draw
	 * @remarks Same as {@link TRaffleDraw.image_url_mobile}: **300×145 px** mobile promo.
	 */
	image_url_mobile: string;
	/**
	 * URL of the icon that represents the draw
	 * @remarks Same as {@link TRaffleDraw.icon_url}: **256×256 px** square.
	 */
	icon_url: string;
	/**
	 * URL of the background image that will be used in the draw list item
	 * @remarks Same as {@link TRaffleDraw.background_image_url}: **900×85 px**.
	 */
	background_image_url: string;
	/**
	 * URL of the moible background image that will be used in the draw list item
	 * @remarks Same as {@link TRaffleDraw.background_image_url_mobile}: **1328×240 px**.
	 */
	background_image_url_mobile: string;
	/** Show if the draw is grand and is marked as special */
	is_grand: boolean;
	/** Date/time of the draw execution */
	execution_ts: number;
	/** Actual Date/time of the draw execution */
	actual_execution_ts: number;
	/**
   *  Date/time starting from which the tickets will participate in the upcoming draw
   *  This value need to be taken into account with next_execute_ts field value, for example
   *  Next draw is at 10:00, ticket_start_date is 9:00, so all tickets that are collected after 9:00 will participate in the draw at 10:00
   *  (internally this value is calculated as next_execute_ts - ticket_start_date)
   */
	ticket_start_ts: number;
	/**
	 * Shows if user has won a prize in a current run
	 */
	is_winner: boolean;
	/**
	 * Shows if user has unclaimed prize
	 */
	has_unclaimed_prize: boolean;

}

/**
 * TransformedRaffleClaimPrizeResponse describes the response of
 * `_smartico.api.claimRafflePrize({won_id})`.
 *
 * Note: this type uses `errorCode` / `errorMessage` (camelCase
 * full-word) — different from most other SDK wrapper-result types in
 * this library which use `err_code` / `err_message` (snake_case).
 */
/**
 * Result of `_smartico.api.claimRafflePrize({raffle_id, draw_id, raffle_run_id})`.
 * Uses camelCase `errorCode` / `errorMessage` — distinct from most other SDK
 * result wrappers which use snake_case `err_code` / `err_message`.
 */
export interface TransformedRaffleClaimPrizeResponse {
	/** Error code. `0` = success. See `claimRafflePrize` TSDoc for the full table. */
	errorCode: number
	/** Optional error message; populated on non-zero `errorCode`. */
	errorMessage?: string
}
/**
 * TActivityLog describes a unified history log entry for points, gems, or diamonds changes.
 * The structure is the same regardless of balance type, making it easy to iterate and display.
 */
export interface TActivityLog {
	/** Date when the change was created (epoch timestamp in seconds) */
	create_date: number;
	/** External user ID */
	user_ext_id: string;
	/** CRM brand ID */
	crm_brand_id: number;
	/** Type of balance: Points = 0, Gems = 1, Diamonds = 2 */
	type: UserBalanceType;
	/** Amount changed (positive or negative) */
	amount: number;
	/** Current balance after this change */
	balance: number;
	/** Total ever collected (only relevant for type points) */
	total_ever?: number;
	/** Source type ID indicating what triggered this change */
	source_type_id: PointChangeSourceType;
}


/**
 * Result of `_smartico.api.requestRaffleOptin({raffle_id, draw_id, raffle_run_id})`.
 */
export interface TRaffleOptinResponse {
	/** Error code. `0` = success. See `requestRaffleOptin` TSDoc for the full table. */
	err_code: number;
	/** Optional error message; populated on non-zero `err_code`. */
	err_message?: string;
}
/**
 * One avatar in the user's catalog. Returned by `getAvatarsList()`.
 * Fields from the raw `public_meta` object are flattened to the top level.
 */
export interface TAvatarDefinition {
	/** Stable numeric identifier of the avatar. Primary key passed to `setAvatar()`. */
	avatar_real_id: number;
	/** True when this is the system default avatar for the label. */
	is_default: boolean;
	/** When true and `is_given === false`, the avatar should be hidden from the user (surprise unlock). */
	hide_until_achieved: boolean;
	/** Display position; lower = earlier in the grid. */
	priority: number;
	/** Optional description shown alongside the avatar in detail views. */
	description?: string;
	/** Raw image path as returned by the server (relative or absolute). */
	url: string;
	/** Absolute CDN URL of the avatar image; built from the configured avatar domain + `url`. */
	avatar_url: string;
	/** Source type. `0` = free / always available; non-zero = earned or purchased. */
	avatar_source_type_id: number;
	/** ISO date string from which the avatar becomes available; undefined when no start window. */
	active_from_date?: string;
	/** ISO date string until which the avatar is available; undefined when no end window. */
	active_till_date?: string;
	/** True when the user owns / has unlocked this avatar. */
	is_given: boolean;
	/** True when this avatar is the user's currently active profile avatar. */
	is_in_use?: boolean;
}

/**
 * One AI-generated variant of a base avatar. Returned by `getAvatarsCustomized()`.
 */
export interface TAvatarCustomized {
	/** `avatar_real_id` of the base avatar this variant was generated from. */
	avatar_real_id: number;
	/** Absolute CDN URL of the AI-generated image. Can be passed as `avatar_url` to `setAvatar()`. */
	url: string;
	/** Unix-ms timestamp of when the variant was generated. */
	dt_created: number;
}

/**
 * One AI style prompt for avatar customization. Returned by `getAvatarPrompts()`.
 * Fields from the raw `public_meta` object are flattened to the top level.
 */
export interface TAvatarPrompt {
	/** Stable numeric identifier of the prompt. */
	prompt_id: number;
	/** Display name of the style, e.g. "Cartoon", "Watercolor". */
	name: string;
	/** Absolute CDN URL of the prompt's preview icon. */
	icon_url: string;
	/** Currency used to pay for the customization. `0` = points, `1` = gems, `2` = diamonds, `3` = free. A `cost_value` of `0` is also free. */
	cost_currency_type_id: number;
	/** Cost amount in the currency named by `cost_currency_type_id`. `0` = free. */
	cost_value: number;
}

/**
 * Result of `_smartico.api.setAvatar()`.
 */
export interface TSetAvatarResult {
	/** Error code. `0` = success. See `setAvatar` TSDoc for the full table. */
	err_code: number;
	/** Optional error message; populated on non-zero `err_code`. */
	err_message?: string;
}

export { SAWAcknowledgeTypeName, PrizeModifiers, SAWTemplateUI, InboxCategories, AchCustomSectionType, SAWAskForUsername, SAWGameLayout, PointChangeSourceType, UserBalanceType, SAWGPMarketType, QuizAnswersValueType }