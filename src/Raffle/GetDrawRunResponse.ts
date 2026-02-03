import { TRaffleDraw } from '../WSAPI/WSAPITypes';
import { ProtocolResponse } from '../Base/ProtocolResponse';
import { RaffleDraw } from './RaffleDraw';
import { prizeTransform, ticketsTransform } from './GetRafflesResponse';

export interface GetDrawRunResponse extends ProtocolResponse {
	draw: RaffleDraw;
}

/** @hidden */
export const drawRunTransform = (res: GetDrawRunResponse): TRaffleDraw => {
	return {
		id: res.draw.draw_id,
		name: res.draw.public_meta.name,
		description: res.draw.public_meta.description,
		image_url:res.draw.public_meta.image_url,
		image_url_mobile:res.draw.public_meta.image_url_mobile,
		icon_url: res.draw.public_meta.icon_url,
		background_image_url: res.draw.public_meta.background_image_url,
		background_image_url_mobile: res.draw.public_meta.background_image_url_mobile,
		is_grand: res.draw.public_meta.is_grand,
		prizes: prizeTransform(res.draw.prizes),
		current_state: res.draw.current_state,
		run_id: res.draw.run_id,
		execution_type: res.draw.execution_type,
		execution_ts: res.draw.execution_ts,
		previous_run_ts: res.draw.previous_run_ts,
		previous_run_id: res.draw.previous_run_id,
		ticket_start_ts: res.draw.ticket_start_ts ?? res.draw['ticket_start_date'],
		allow_multi_prize_per_ticket: res.draw.allow_multi_prize_per_ticket,
		total_tickets_count: res.draw.total_tickets_count,
		my_tickets_count: res.draw.my_tickets_count,
		my_last_tickets: ticketsTransform(res.draw.my_last_tickets),
		user_opted_in: Boolean(res.draw.user_opted_in),
		requires_optin: Boolean(res.draw.requires_optin),
		is_active: Boolean(res.draw.is_active),
		winners_limit: res.draw.winners_limit,
		winners_offset: res.draw.winners_offset,
		winners_total: res.draw.winners_total,
	} 	
};