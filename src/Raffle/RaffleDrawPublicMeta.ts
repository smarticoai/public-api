export interface RaffleDrawPublicMeta {
    /** Name of the draw, e.g. 'Daily draw' */
    name: string;
    /** Description of the draw */
    description: string;
    /** URL of the image that represents the draw */
    image_url: string;
    /** URL of the icon that represents the draw */
    icon_url: string;
    /** URL of the background image that will be used in the draw list item */
    background_image_url: string;
    /** Show if the draw is grand and is marked as special */
    is_grand: boolean;
}
