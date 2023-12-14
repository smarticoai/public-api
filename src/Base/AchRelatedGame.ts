interface AchRelatedGame {
    ach_game_id: number;
    ext_game_id: string;
    game_public_meta: {
        name: string;
        link: string;
        image: string;
        enabled: boolean;
        game_categories?: string[];
        game_provider?: string;
    }
}

export { AchRelatedGame }