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
	/** Multiplier for a task whose target is relative to the player's recommended deposit or bet amount, or to the last deposit amount (target = multiplier × that amount). Used to fill the `{{suggested_amount}}` tag in the task texts. */
	prop_to_prop_multiplier?: number;
	/** Multiplier of the task's recommended amount condition (e.g. last deposit >= 1.5 × recommended deposit), set only when it is not 1. The `{{suggested_value}}` tag shows the recommended amount × this multiplier: the amount the player has to reach. */
	condition_multiplier?: number;
}
