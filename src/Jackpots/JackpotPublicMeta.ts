import { JackpotHtmlTemplate } from './JackpotHtmlTemplate';
interface JackpotPublicMeta {
    name: string;
    description: string;
    image_url: string;
    winner_template: JackpotHtmlTemplate;
    not_winner_template: JackpotHtmlTemplate;
    placeholder1: string;
    placeholder2: string;
}

export { JackpotPublicMeta }