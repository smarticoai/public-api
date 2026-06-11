import { SAWTemplate } from "../MiniGames";
import { QuizAnswersValueType } from "./MarketsAnswers";
import { SAWGPMarketType } from "./MarketsType";

/**
 * GamePickMarketType defines legacy market categories for MatchX events
 */
export enum GamePickMarketType {
	/** Predict the number of goals */
	Goals = 1,
	/** Predict the winner */
	Winner = 2,
}

/**
 * GamePickResolutionType defines how a user's prediction was scored after event resolution
 */
export enum GamePickResolutionType {
	/** Event not yet resolved */
	None = 0,
	/** Prediction was wrong */
	Lost = 2,
	/** Prediction was partially correct (e.g. correct winner but wrong score) */
	PartialWin = 3,
	/** Prediction was fully correct */
	FullWin = 4,
}

/**
 * GPRoundStatus defines the lifecycle stage of a game round
 */
export enum GPRoundStatus {
	/** Round is in an active/other state */
	Other = -1,
	/** Round exists but has no events defined yet */
	NoEventsDefined = 1,
	/** Betting deadline has passed, no more bets allowed */
	NoMoreBetsAllowed = 2,
	/** All events in the round are resolved, but the round itself is not finalized */
	AllEventsResolved_ButNotRound = 3,
	/** Round is fully resolved and scored */
	RoundResolved = 4,
}

/**
 * GamePickScoreType defines how scores are calculated for predictions
 */
export enum GamePickScoreType {
	/** Score based on exact match of predicted result */
	ExactScore = 1,
	/** Score based on closeness (difference) of predicted result */
	PointsDifference = 2,
}

/**
 * GamePickSportType defines supported sport types for events, using Betradar sport IDs
 */
export enum GamePickSportType {
	Soccer = 1,
	Basketball = 2,
	Baseball = 3,
	IceHockey = 4,
	Tennis = 5,
	Handball = 6,
	Floorball = 7,
	Golf = 9,
	Boxing = 10,
	Motorsport = 11,
	Rugby = 12,
	AussieRules = 13,
	Bandy = 15,
	AmericanFootball = 16,
	Cycling = 17,
	Specials = 18,
	Snooker = 19,
	TableTennis = 20,
	Cricket = 21,
	Darts = 22,
	Volleyball = 23,
	FieldHockey = 24,
	Waterpolo = 26,
	Curling = 28,
	Futsal = 29,
	Badminton = 31,
	Bowls = 32,
	Chess = 33,
	BeachVolley = 34,
	Netball = 35,
	Athletics = 36,
	Squash = 37,
	Lacrosse = 39,
	Formula1 = 40,
	AlpineSkiing = 43,
	Biathlon = 44,
	CrossCountry = 46,
	NordicCombined = 47,
	SkiJumping = 48,
	Schwingen = 56,
	BeachSoccer = 60,
	Pesapallo = 61,
	ESportCounterStrike = 109,
	ESportLeagueofLegends = 110,
	ESportDota = 111,
	StarCraft = 112,
	MMA = 117,
	CallOfDuty = 118,
	ESportOverwatch = 121,
	ESportRocketLeague = 128,
	IndyRacing = 129,
	Speedway = 131,
	GaelicFootball = 135,
	GaelicHurling = 136,
	ESporteSoccer = 137,
	Kabaddi = 138,
	ESporteBasketball = 153,
	Basketball3x3 = 155,
	ESportArenaofValor = 158,
	TouringCarRacing = 188,
	MotorcycleRacing = 190,
	StockCarRacing = 191,
}

/**
 * GameRoundOrderType defines how events within a round are ordered for display
 */
export enum GameRoundOrderType {
	/** Display in the order events were added */
	HowAdded = 1,
	/** Display in reverse of the order events were added */
	HowAddedReversed = 2,
	/** Display ordered by event/match date ascending (earliest first) */
	EventDateAscending = 3,
	/** Display ordered by event/match date descending (latest first) */
	EventDateDescending = 4,
}

/** Round ID constant used to request the overall/seasonal leaderboard across all rounds */
export const AllRoundsGameBoardID = -1;

/**
 * QuizEventMeta describes metadata for a quiz-type event (custom question with answer options)
 */
export interface QuizEventMeta {
	/** List of possible answer options for the quiz question */
	answers?: {
		/** Answer identifier value sent on submission */
		value: string;
		/** Localized display text of the answer */
		text: string;
		/** Per-language overrides for the answer text */
		_translations: {
			[key: string]: {
				text: string;
			};
		};
	}[];
	/** URL of an image associated with the question */
	question_image?: string;
	/** Correct answer value after resolution */
	result?: QuizAnswersValueType;
	/** Custom question text displayed to the user */
	custom_question: string;
}

/**
 * GamePickEventMeta describes metadata for a MatchX or Quiz event, including team info and sport context
 */
export interface GamePickEventMeta extends QuizEventMeta {
	/** Display name of the event/match */
	event_name?: string;
	/** Name of the first team (home) */
	team1_name: string;
	/** URL of the first team's logo image */
	team1_image: string;
	/** Name of the second team (away) */
	team2_name: string;
	/** URL of the second team's logo image */
	team2_image: string;
	/** Actual result score for team 1 after resolution */
	team1_result?: number;
	/** Actual result score for team 2 after resolution */
	team2_result?: number;
	/** Betradar sport type ID for the event */
	sport_type_id?: number;
	/** Whether the event has been canceled */
	is_canceled?: boolean;
	/** Whether auto-resolution from live data feed is enabled */
	auto_resolve_enabled?: boolean;
	/** ISO date string for when auto-resolution is expected */
	auto_resolve_date?: string;
	/** Auto-resolved score for team 1 from live data feed */
	team1_auto_result?: number;
	/** Auto-resolved score for team 2 from live data feed */
	team2_auto_result?: number;
	/** Auto-resolved answer value from live data feed (for quiz events) */
	auto_result?: string;
	/** Per-language overrides for team names, event name, and custom question */
	_translations: {
		[key: string]: {
			team1_name: string;
			team2_name: string;
			event_name: string;
			custom_question: string;
		};
	};
}

/**
 * GamePickEvent describes a single event (match or question) within a round, including the user's prediction and resolution
 */
export interface GamePickEvent {
	/** Unique identifier of the event */
	gp_event_id: number;
	/** Timestamp (ms) when the event was resolved, null if not yet resolved */
	event_resolution_date: number;
	/** Timestamp (ms) of the match/event start time */
	match_date: number;
	/** Market type defining the prediction format (e.g. two-team score, quiz question, custom) */
	market_type_id: SAWGPMarketType;
	/** Event metadata containing team names, images, sport type, and question details */
	event_meta: GamePickEventMeta;
	/** Whether the current user has submitted a prediction for this event */
	user_placed_bet: boolean;
	/** User's predicted score for team 1 (MatchX only). Can be a number or a range object */
	team1_user_selection?: number | { from: number; to: number };
	/** User's predicted score for team 2 (MatchX only). Can be a number or a range object */
	team2_user_selection?: number | { from: number; to: number };
	/** User's selected answer (Quiz only). Value depends on market type (e.g. '1', '2', 'x', 'yes', 'no') */
	user_selection?: QuizAnswersValueType;
	/** How the user's prediction was scored after resolution */
	resolution_type_id: GamePickResolutionType;
	/** Points awarded for this event based on prediction accuracy */
	resolution_score?: number;
	/** Whether this event is still accepting predictions */
	is_open_for_bets?: boolean;
	/** Betting odds details for the event outcomes */
	odds_details?: { odd_value: { [key: string]: number } };
	/** URL of a question-specific image (quiz events) */
	question_image?: string;
}

/**
 * GamePickRoundPublicMeta describes the public-facing metadata and translations for a round, configured in the BackOffice
 */
export interface GamePickRoundPublicMeta {
	/** Localized round name */
	round_name: string;
	/** Localized round description */
	round_description: string;
	/** URL of the promotional image for the round */
	promo_image: string;
	/** Promotional text displayed with the round */
	promo_text: string;
	/** Whether to hide the round from the UI after it has been resolved */
	hide_resolved_round: boolean;
	/** URL of the final screen image for desktop */
	final_screen_image_desktop: string;
	/** URL of the final screen image for mobile */
	final_screen_image_mobile: string;
	/** Message displayed on the final/results screen */
	final_screen_message: string;
	/** Label for the CTA button on the final screen */
	final_screen_cta_button_title: string;
	/** Deep link triggered by the CTA button on the final screen */
	final_screen_cta_dp: string;
	/** Whether users can edit their answers after initial submission (within betting window) */
	allow_edit_answers?: boolean;
	/** Per-language overrides for round display content */
	_translations: {
		[key: string]: {
			round_name: string;
			round_description: string;
			promo_image: string;
			promo_text: string;
			final_screen_image_desktop: string;
			final_screen_image_mobile: string;
			final_screen_message: string;
			final_screen_cta_button_title: string;
		};
	};
}

/**
 * GamePickRoundBase describes a game round's metadata (without events or user-specific data)
 */
export interface GamePickRoundBase {
	/** Unique round identifier */
	round_id: number;
	/** Sequential row ID used for ordering rounds */
	round_row_id: number;
	/** Localized display name of the round */
	round_name: string;
	/** Localized description of the round */
	round_description: string;
	/** Label for the CTA button on the final/results screen */
	final_screen_cta_button_title: string;
	/** Message displayed on the final/results screen */
	final_screen_message: string;
	/** URL of the final screen image (desktop) */
	final_screen_image_desktop: string;
	/** URL of the final screen image (mobile) */
	final_screen_image_mobile: string;
	/** URL of the promotional image for the round */
	promo_image: string;
	/** Promotional text displayed with the round */
	promo_text: string;
	/** Timestamp (ms) when the round opens for participation */
	open_date: number;
	/** Timestamp (ms) of the last moment bets are accepted */
	last_bet_date: number;
	/** Timestamp (ms) when the round is expected to be resolved */
	resolution_date: number;
	/** Points awarded for a fully correct prediction */
	score_full_win: number;
	/** Points awarded for a partially correct prediction */
	score_part_win: number;
	/** Points awarded (or deducted) for an incorrect prediction */
	score_lost: number;
	/** Whether the round is currently active for participation */
	is_active_now: boolean;
	/** Whether the round has been fully resolved and scored */
	is_resolved: boolean;
	/** Current lifecycle status of the round */
	round_status_id: GPRoundStatus;
	/** Total number of events in the round */
	events_total: number;
	/** Number of events that have been resolved */
	events_resolved: number;
	/** Scoring method used for this round */
	score_type_id: GamePickScoreType;
	/** How events are ordered for display */
	order_events: GameRoundOrderType;
	/** Maximum number of users shown on the leaderboard */
	board_users_count: number;
	/** Whether other users' predictions are hidden until resolution */
	hide_users_predictions: boolean;
	/** Public metadata including translations and display settings from the BackOffice */
	public_meta: GamePickRoundPublicMeta;
	/** Timestamp (ms) when the next round opens, if available */
	next_round_open_date: number;
	/** Whether to show aggregated user preference percentages for each outcome */
	show_users_preference: boolean;
}

/**
 * GamePickRound describes a round with its events and the current user's prediction data
 */
export interface GamePickRound extends GamePickRoundBase {
	/** List of events (matches/questions) in this round */
	events: GamePickEvent[];
	/** Current user's total score in this round */
	user_score: number;
	/** Whether the current user has submitted any predictions in this round */
	user_placed_bet: boolean;
	/** Whether there are events still open for betting */
	has_open_for_bet_events?: boolean;
	/** Whether the user has unsaved changes to their predictions */
	has_not_submitted_changes?: boolean;
}

/**
 * GamePickRoundBoard describes a round's leaderboard with ranked users
 */
export interface GamePickRoundBoard extends GamePickRoundBase {
	/** Current user's leaderboard entry, or null if user hasn't participated */
	my_user: GamePickBoardUser;
	/** Ranked list of users on the leaderboard */
	users: GamePickBoardUser[];
}

/**
 * GamePickBoardUser describes a user's entry on the round leaderboard
 */
export interface GamePickBoardUser {
	/** External user ID (Smartico numeric user ID) */
	ext_user_id: string;
	/** Internal user ID within the games system */
	int_user_id: number;
	/** Display name shown on the leaderboard */
	public_username: string;
	/** URL of the user's avatar image */
	avatar_url: string;
	/** User's rank position on the leaderboard, null if not yet ranked */
	gp_position: number;
	/** User's total score in this round/season */
	resolution_score: number;
	/** Number of fully correct predictions */
	full_wins_count: number;
	/** Number of partially correct predictions */
	part_wins_count: number;
	/** Number of incorrect predictions */
	lost_count: number;
}

/**
 * GamePickUserInfo describes the current user's profile in the games system
 */
export interface GamePickUserInfo {
	/** External user ID (Smartico numeric user ID) */
	ext_user_id: string;
	/** Internal user ID within the games system */
	int_user_id: number;
	/** Display name */
	public_username: string;
	/** URL of the user's avatar image */
	avatar_url: string;
	/** User's leaderboard rank position */
	gp_position?: number;
	/** Number of fully correct predictions */
	full_wins_count?: number;
	/** Number of partially correct predictions */
	part_wins_count?: number;
	/** User's total score */
	resolution_score?: number;
	/** Last time the user's balance was synced from the Smartico platform */
	last_wallet_sync_time?: Date;
	/** User's current points balance */
	ach_points_balance?: number;
	/** User's current gems balance */
	ach_gems_balance?: number;
	/** User's current diamonds balance */
	ach_diamonds_balance?: number;
	/** Whether the user has set a custom public username */
	pubic_username_set?: boolean;
}

/**
 * GamePickGameInfo describes the game configuration including SAW template, rounds list, and label settings
 */
export interface GamePickGameInfo {
	/** Game template configuration (SAW template) with UI settings, buy-in type, cost, and spin count */
	sawTemplate: SAWTemplate;
	/** List of all rounds (metadata only, no events) */
	allRounds: GamePickRoundBase[];
	/** Label/brand configuration and settings */
	labelInfo: any;
}

/**
 * GamesApiResponse is the standard response wrapper for all GamePick/Quiz API calls
 */
export interface GamesApiResponse<T> {
	/** Error code: 0 on success, non-zero on failure */
	errCode: number;
	/** Human-readable error message when errCode is non-zero */
	errMessage?: string;
	/** Response payload, present on success */
	data?: T;
}

/**
 * GamePickRequestParams describes the base parameters required for GamePick API calls
 */
export interface GamePickRequestParams {
	/** ID of the MatchX or Quiz game template */
	saw_template_id: number;
	/** External user ID */
	ext_user_id: string;
	/** Smartico external user ID used for platform API calls */
	smartico_ext_user_id: string;
	/** Language code for translations (e.g. 'EN', 'DE') */
	lang?: string;
}

/**
 * GamePickRoundRequestParams extends base params with a specific round ID
 */
export interface GamePickRoundRequestParams extends GamePickRequestParams {
	/** ID of the specific round */
	round_id: number;
}
