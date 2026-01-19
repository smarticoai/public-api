import { RaffleDraw } from "./RaffleDraw";


interface RafflePublicMeta {
    /** Name of the raffle */
    name: string;
    /** Description of the raffle */
    description: string;
    /** ID of the custom section that is linked to the raffle in the Gamification widget */
    custom_section_id: number;
    /** URL of the image that represents the raffle */
    image_url: string;
    /** URL of the mobile image that represents the raffle */
    image_url_mobile: string;
     /** Text for Terms and Conditions */
    hint_text:string;
    /** 
	 * Custom data as string or JSON string that can be used in API to build custom UI
	 * You can request from Smartico to define fields for your specific case that will be managed from Smartico BackOffice
	 * Read more here - <https://help.smartico.ai/welcome/products/general-concepts/custom-fields-attributes>
     */
	custom_data: string;
}


interface Raffle {
    /** ID of the Raffle template */
    raffle_id: number;
    /** Meta information about raffle for the presentation on UI */
    public_meta: RafflePublicMeta;
    /** Date of start */
    start_date_ts: number;
    /** Date of end */
    end_date_ts: number;    
    /** Maximum numer of tickets that can be given to all users for the whole period of raffle */
    max_tickets_count: number;
    /** 
     * Number of tickets that are already given to all users for this raffle
     */
    current_tickets_count: number;

    /** 
     * List of draws that are available for this raffle.
     * For example, if the raffle is containg one hourly draw, one daily draw and one draw on fixed date like 01/01/2022,
     * Then the list will always return 3 draws, no matter if the draws are already executed or they are in the future.
     */
    draws: RaffleDraw[]

}

export { Raffle, RafflePublicMeta };
