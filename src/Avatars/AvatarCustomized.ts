export interface AvatarCustomized {
	/** The avatar real id that this customization belongs to */
	avatar_real_id: number;
	/** CDN URL of the AI-customized avatar image */
	url: string;
	/** ISO date string when the customization was created */
	dt_created: string;
}
