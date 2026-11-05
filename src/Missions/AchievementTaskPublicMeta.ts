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
	/** Multiplier for a task whose target is relative to the player's recommended deposit or bet amount (target = multiplier × recommended amount). Used to fill the `{{suggested_amount}}` tag in the task texts. */
	prop_to_prop_multiplier?: number;
}
