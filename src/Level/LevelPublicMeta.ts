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
}
