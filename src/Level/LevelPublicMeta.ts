export interface LevelPublicMeta {
	/** Description of level, HTML capabable */
	description?: string;
	/** URL to the image of level */
	image_url?: string;
	/** Name of level */
	name?: string;
	/** Number of points that user should have collected in order to see this level */
	visibility_points?: number;
	/** X & Y coordinates of level on the visual mission map, for desktop and mobile */
	position?: {
		mx: number;
		my: number;
		dx: number;
		dy: number;
	};
	/**
	 * Custom data as string or JSON string that can be used in API to build custom UI
	 * You can request from Smartico to define fields for your specific case that will be managed from Smartico BackOffice
	 * Read more here - https://help.smartico.ai/welcome/products/general-concepts/custom-fields-attributes
	*/
	custom_data?: string;
}
