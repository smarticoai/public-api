export interface AvatarPrompt {
	/** Unique identifier of the AI customization prompt */
	prompt_id: number;
	/** Public metadata for the prompt */
	public_meta: {
		/** Display name of the prompt style (e.g. "Cartoon", "Watercolor") */
		name: string;
		/** URL of the prompt style icon image */
		icon_url: string;
	};
	/** Currency type used to pay for this customization (0=points, 1=gems, 2=diamonds) */
	cost_currency_type_id: number;
	/** Cost amount in the given currency */
	cost_value: number;
}
