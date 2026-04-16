export interface AvatarDefinition {
	/** Unique identifier of the avatar */
	avatar_real_id: number;
	/** Whether this avatar is the default one */
	is_default: boolean;
	/** If true, avatar is hidden until user achieves/unlocks it */
	hide_until_achieved: boolean;
	/** Display priority — lower value means higher position */
	priority: number;
	/** Public metadata containing the avatar image URL and optional description */
	public_meta: {
		/** Optional description of the avatar */
		description?: string;
		/** Image path/URL of the avatar */
		url: string;
	};
	/**
	 * Source type of the avatar.
	 * 0 = free (always available), other values = earned/purchased
	 */
	avatar_source_type_id: number;
	/** ISO date string from which the avatar becomes available */
	active_from_date?: string;
	/** ISO date string until which the avatar is available */
	active_till_date?: string;
	/** Whether the avatar has been granted/given to the current user */
	is_given: boolean;
	/** Whether this avatar is currently in use by the user */
	is_in_use?: boolean;
}
