export interface AchievementTaskPublicMeta {
	name?: string;
	display_progress_as_count?: boolean;
	stage_image?: string;
	priority?: number;
	user_state_operations?: {
		[key: string]: {
			op: string;
		};
	}

}
