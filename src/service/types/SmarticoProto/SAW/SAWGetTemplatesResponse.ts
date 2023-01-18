import { ProtocolResponse } from "../ProtocolResponse";
import { SAWTemplate } from "./SAWTemplate";


export interface SAWGetTemplatesResponse extends ProtocolResponse {

    templates: SAWTemplate[];
}
