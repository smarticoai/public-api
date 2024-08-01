import { ProtocolRequest } from './../Base/ProtocolRequest';

export interface SAWGetTemplatesRequest extends ProtocolRequest {
	force_language?: string; // request templates in the defined language instead of the language of the user
	is_visitor_mode?: boolean; // request templates only for visitors or for users or all.
}
