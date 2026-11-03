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
	/** Multiplier of the Prop to Prop target ("Total amount should reach" = multiplier x a recommended amount). */
	prop_to_prop_multiplier?: number;
}
