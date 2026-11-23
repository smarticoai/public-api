import { ProtocolRequest } from './../Base/ProtocolRequest';

export interface SAWGetTemplatesRequest extends ProtocolRequest {
	force_language?: string; // request templates in the defined language instead of the language of the user
	is_visitor_mode?: boolean; // request templates only for visitors or for users or all.
	saw_template_ids?: number[]; // return only these templates (same visitor, date, day and segment checks as the full list); without it the full list is returned
	only_visible?: boolean; // leave out the templates the lobby hides: flow_builder_only, and visibile_when_can_spin ones the user can't play (no spins, or a points / gems / diamonds cost above the balance)
	active_saw_template_id?: number; // with only_visible: the template the user has open, kept even when it can't be played any more
}
