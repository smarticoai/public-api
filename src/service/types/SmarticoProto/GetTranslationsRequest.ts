import { ProtocolRequest } from "./ProtocolRequest";
import { TranslationArea } from "./TranslationArea";

export interface GetTranslationsRequest extends ProtocolRequest {

    hash_code: number;
    areas: TranslationArea[];
    lang_code: string;
}
