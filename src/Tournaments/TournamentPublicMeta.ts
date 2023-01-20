export interface TournamentPublicMeta {
    /** Name of tournament */
    name?: string;
    /** 1st image */
    image_url?: string;
    /** 2nd image */
    image_url2?: string;
    /** Description, html capable */
    description?: string;
    /** Short explanation of prize pool */
    prize_pool_short?: string;
    /** Message to show when user is not matching to the segment allowed to register (error code 30005 in registration response) */
    segment_dont_match_message?: string;
    /** Short explanation of registration price */
    custom_price_text?: string;
    /** Indicator if the scores of other users should be shown in the leaderboard of tournament */
    show_other_users_score?: boolean;

    custom_section_id?: number;

    only_in_custom_section?: boolean;

    label_tag?: string;

    featured?: boolean;
}
