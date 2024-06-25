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
}

export { JackpotPublicMeta }