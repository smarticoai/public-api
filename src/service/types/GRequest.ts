
interface GBaseRequest {
    customer_id: string;
    ext_user_id: string; // int in the smartico system
    int_user_id: number; // int in the retention games
    smartico_ext_user_id: string; // string in the smartico system, that is referencing to user identification in the partner system
    ext_game_id: number;
    lang: string;
    hash: string;
    zoom?: number;
    label_api_key?: string;
    brand_key?: string;
    bridgeId?: string;
    height?: 'auto' | string;
    theme?: string;
}

export { GBaseRequest }