export interface ActivityLogPublicMeta {
	name?: string;
	image_url?: string;
	image?: string;
	url?: string;
	avatar_url?: string;
	avatar_id?: string;
	icon_url?: string;
	position?: number;
}

export interface ActivityLogMeta {
	image_url?: string;
	image?: string;
	url?: string;
	avatar_url?: string;
	avatar_id?: string;
	icon_url?: string;
	name?: string;
	position?: number;
	score?: number;
	user_points_balance_before?: number;
	points_requested?: number;
	user_points_ever?: number;
	public_meta?: ActivityLogPublicMeta;
	public_map?: ActivityLogPublicMeta;
}
