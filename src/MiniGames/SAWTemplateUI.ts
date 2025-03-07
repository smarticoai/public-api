import { SAWAskForUsername } from './SAWAskForUsername';
import { SAWGameLayout } from './SAWGameLayout';

export interface SAWTemplateUI {
	skin: string;
	name: string;
	description?: string;
	over_limit_message?: string;
	hide_prize_names?: string;
	no_attempts_message?: string;
	thumbnail?: string;
	sectors_count: number;
	priority: number;
	flow_builder_only: boolean;
	background_image?: string;
	background_image_mobile?: string;
	background_sound?: string;
	spin_animation_duration?: number;
	wheel_pointer_rotation?: number;
	scratch_logo?: string;
	scratch_cover?: string;
	scratch_bg_desktop?: string;
	scratch_bg_mobile?: string;
	scratch_cursor?: string;
	custom_css?: string;
	custom_skin_folder?: string;
	jackpot_symbol?: string;

	promo_image?: string;
	promo_text?: string;
	matchx_banner?: string;
	matchx_banner_mobile?: string;
	matchx_seasonal_ranking?: boolean;
	matchx_is_completed?: boolean;
	matchx_general_board_users_count?: number;
	matchx_hide_ranking?: boolean;
	ask_for_username?: SAWAskForUsername;
	show_prize_board?: boolean;

	max_spins_period_ms?: number;
	show_countdown_for_next_availability?: boolean;
	disable_background_music?: boolean;
	custom_section_id?: number;
	only_in_custom_section?: boolean;

	custom_data: any;

	// prize drop specific
	placeholder1?: string;
	placeholder2?: string;
	prize_drop_template?: {
		id: string;
		content: string;
	};

	// lootbox specific
	game_layout?: SAWGameLayout;

	// treasure hunt specific
	steps_to_finish_game?: number;
}
