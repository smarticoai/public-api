export interface AchievementPublicMeta {

    description?: string;
    unlock_mission_description?: string;
    custom_data?: string;
    cta_text?: string;
    cta_action?: string;
    label_tag?: string;
    custom_label_tag?: string;
    reward?: string;
    image_url?: string;
    name?: string;
    position?: number;
    hide_tasks?: boolean;
    hide_locked_mission?: boolean;
    custom_section_id?: number;
    only_in_custom_section?: boolean;
    hint_text?: string;
    hide_badge_from_ui?: boolean;
    show_badge_first_task_completed?: boolean;
}
