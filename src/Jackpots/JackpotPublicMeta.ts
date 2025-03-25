import { JackpotHtmlTemplate } from './JackpotHtmlTemplate';
interface JackpotPublicMeta {
	/** name of the jackpot */
	name: string;
	/** description/rules of the jackpot */
	description: string;
	/** image url of the jackpot */
	image_url: string;
	/** HTML template for the winner of the jackpt */
	winner_template: JackpotHtmlTemplate;
	/** HTML template for the not winner of the jackpot */
	not_winner_template: JackpotHtmlTemplate;
	/** custom value of placeholder1 defined by operator and can be used in the HTML templates */
	placeholder1: string;
	/** custom value of placeholder2 defined by operator and can be used in the HTML templates */
	placeholder2: string;
	/**
	 * Custom data as string or JSON string that can be used in API to build custom UI
	 * You can request from Smartico to define fields for your specific case that will be managed from Smartico BackOffice
	 * Read more here - https://help.smartico.ai/welcome/products/general-concepts/custom-fields-attributes
	*/
	custom_data: string;
}

export { JackpotPublicMeta };
