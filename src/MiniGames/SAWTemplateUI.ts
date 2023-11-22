import { SAWAskForUsername } from "./SAWAskForUsername";

export interface SAWTemplateUI {
    skin: string;
    name: string;
    description?: string;
    over_limit_message?: string;
    no_attempts_message?: string;
    thumbnail?: string;
    sectors_count: number;
    priority: number;
    flow_builder_only: boolean;
    background_image?: string;
    background_image_mobile?: string;
    background_sound?: string;
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
}