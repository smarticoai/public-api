export enum AskForUsername {
    NOASK = "no-ask",
    ONSUMBIT = "on-submit"
}
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
    ask_for_username?: AskForUsername;
    show_prize_board?: boolean;

    max_spins_period_ms?: number;
}