import { SAWGPMarketType } from '../Quiz/MarketsType';
import { QuizAnswersValueType } from '../Quiz/MarketsAnswers';

export enum GamePickMarketType {
	Goals = 1,
	Winner = 2,
}

export enum GamePickResolutionType {
	None = 0,
	Lost = 2,
	PartialWin = 3,
	FullWin = 4,
}

export enum GPRoundStatus {
	Other = -1,
	NoEventsDefined = 1,
	NoMoreBetsAllowed = 2,
	AllEventsResolved_ButNotRound = 3,
	RoundResolved = 4,
}

export enum GamePickScoreType {
	ExactScore = 1,
	PointsDifference = 2,
}

export enum GamePickSportType {
	Golf = 9,
	Cycling = 17,
	Specials = 18,
	TouringCarRacing = 188,
	StockCarRacing = 191,
	IndyRacing = 129,
	Biathlon = 44,
	Speedway = 131,
	Motorsport = 11,
	AlpineSkiing = 43,
	SkiJumping = 48,
	Lacrosse = 39,
	CrossCountry = 46,
	NordicCombined = 47,
	Chess = 33,
	Athletics = 36,
	ESportOverwatch = 121,
	MMA = 117,
	Futsal = 29,
	IceHockey = 4,
	Kabaddi = 138,
	BeachVolley = 34,
	Formula1 = 40,
	ESporteBasketball = 153,
	MotorcycleRacing = 190,
	Bowls = 32,
	Boxing = 10,
	Floorball = 7,
	GaelicHurling = 136,
	Bandy = 15,
	Handball = 6,
	Waterpolo = 26,
	Rugby = 12,
	ESporteSoccer = 137,
	FieldHockey = 24,
	Pesapallo = 61,
	Snooker = 19,
	Badminton = 31,
	Cricket = 21,
	BeachSoccer = 60,
	Baseball = 3,
	StarCraft = 112,
	ESportCounterStrike = 109,
	ESportArenaofValor = 158,
	Curling = 28,
	Squash = 37,
	Darts = 22,
	TableTennis = 20,
	Basketball3x3 = 155,
	AussieRules = 13,
	GaelicFootball = 135,
	CallOfDuty = 118,
	Soccer = 1,
	Tennis = 5,
	ESportDota = 111,
	Basketball = 2,
	ESportLeagueofLegends = 110,
	AmericanFootball = 16,
	Volleyball = 23,
	Netball = 35,
	ESportRocketLeague = 128,
	Schwingen = 56,
}

export enum GameRoundOrderType {
	HowAdded = 1,
	HowAddedReversed = 2,
	EventDateAscending = 3,
	EventDateDescending = 4,
}

export const AllRoundsGameBoardID = -1;

export interface QuizEventMeta {
	answers?: {
		value: string;
		text: string;
		_translations: {
			[key: string]: {
				text: string;
			};
		};
	}[];
	question_image?: string;
	result?: QuizAnswersValueType;
	custom_question: string;
}

export interface GamePickEventMeta extends QuizEventMeta {
	event_name?: string;
	team1_name: string;
	team1_image: string;
	team2_name: string;
	team2_image: string;
	team1_result?: number;
	team2_result?: number;
	sport_type_id?: number;
	is_canceled?: boolean;
	auto_resolve_enabled?: boolean;
	auto_resolve_date?: string;
	team1_auto_result?: number;
	team2_auto_result?: number;
	auto_result?: string;
	_translations: {
		[key: string]: {
			team1_name: string;
			team2_name: string;
			event_name: string;
			custom_question: string;
		};
	};
}

export interface GamePickEvent {
	gp_event_id: number;
	event_resolution_date: number;
	match_date: number;
	market_type_id: SAWGPMarketType;
	event_meta: GamePickEventMeta;
	user_placed_bet: boolean;
	team1_user_selection?: number | { from: number; to: number };
	team2_user_selection?: number | { from: number; to: number };
	user_selection?: QuizAnswersValueType;
	resolution_type_id: GamePickResolutionType;
	resolution_score?: number;
	is_open_for_bets?: boolean;
	odds_details?: { odd_value: { [key: string]: number } };
	question_image?: string;
}

export interface GamePickRoundBase {
	round_id: number;
	round_row_id: number;
	round_name: string;
	round_description: string;
	final_screen_cta_button_title: string;
	final_screen_message: string;
	final_screen_image_desktop: string;
	final_screen_image_mobile: string;
	promo_image: string;
	promo_text: string;
	open_date: number;
	last_bet_date: number;
	resolution_date: number;
	score_full_win: number;
	score_part_win: number;
	score_lost: number;
	is_active_now: boolean;
	is_resolved: boolean;
	round_status_id: GPRoundStatus;
	events_total: number;
	events_resolved: number;
	score_type_id: GamePickScoreType;
	order_events: GameRoundOrderType;
	board_users_count: number;
	hide_users_predictions: boolean;
	public_meta: {
		round_name: string;
		round_description: string;
		promo_image: string;
		promo_text: string;
		hide_resolved_round: boolean;
		final_screen_image_desktop: string;
		final_screen_image_mobile: string;
		final_screen_message: string;
		final_screen_cta_button_title: string;
		final_screen_cta_dp: string;
		allow_edit_answers?: boolean;
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
	};
	next_round_open_date: number;
	show_users_preference: boolean;
}

export interface GamePickRound extends GamePickRoundBase {
	events: GamePickEvent[];
	user_score: number;
	user_placed_bet: boolean;
	has_open_for_bet_events?: boolean;
	has_not_submitted_changes?: boolean;
}

export interface GamePickRoundBoard extends GamePickRoundBase {
	my_user: GamePickBoardUser;
	users: GamePickBoardUser[];
}

export interface GamePickBoardUser {
	ext_user_id: string;
	int_user_id: number;
	public_username: string;
	avatar_url: string;
	gp_position: number;
	resolution_score: number;
	full_wins_count: number;
	part_wins_count: number;
	lost_count: number;
}

export interface GamePickUserInfo {
	ext_user_id: string;
	int_user_id: number;
	public_username: string;
	avatar_url: string;
	gp_position?: number;
	full_wins_count?: number;
	part_wins_count?: number;
	resolution_score?: number;
	last_wallet_sync_time?: Date;
	ach_points_balance?: number;
	ach_gems_balance?: number;
	ach_diamonds_balance?: number;
	pubic_username_set?: boolean;
}

export interface GamePickGameInfo {
	sawTemplate: any;
	allRounds: GamePickRoundBase[];
	labelInfo: any;
}

export interface GamesApiResponse<T> {
	errCode: number;
	errMessage?: string;
	data?: T;
}

export interface GamePickRequestParams {
	saw_template_id: number;
	ext_user_id: string;
	smartico_ext_user_id: string;
	lang?: string;
}

export interface GamePickRoundRequestParams extends GamePickRequestParams {
	round_id: number;
}
