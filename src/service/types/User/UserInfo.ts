interface UserInfo {

    ext_user_id: string;
    int_user_id: number;
    public_username: string;
    avatar_url: string;
    last_wallet_sync_time?: Date;
    ach_points_balance?: number;
    pubic_username_set?: boolean;
}

export { UserInfo }