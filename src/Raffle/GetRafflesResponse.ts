import { TRaffle, TRaffleDraw, TRafflePrize, TRafflePrizeWinner, TRaffleTicket } from '../WSAPI/WSAPITypes';
import { ProtocolResponse } from '../Base/ProtocolResponse';
import { Raffle } from './Raffle';
import { RaffleDraw } from './RaffleDraw';
import { RafflePrize } from './RafflePrize';
import { RafflePrizeWinner } from './RafflePrizeWinner';
import { RaffleTicket } from './RaffleTicket';

export interface GetRafflesResponse extends ProtocolResponse {
	items: Raffle[];
}

/** @hidden */
export const ticketsTransform = (items: RaffleTicket[]): TRaffleTicket[] => {
	return items.map((item) => {
		return {
			ticekt_id: item.id,
			ticket_id_string: item.s,
		};
	});
};

/** @hidden */
export const winnersTransform = (items: RafflePrizeWinner[]): TRafflePrizeWinner[] => {
	return items.map((item) => {
		return {
			id: item.user_id,
			username: item.public_username,
			avatar_url: item.avatar_url,
			ticket: { ticekt_id: item.ticket.id, ticket_id_string: item.ticket.s },
			raf_won_id: item.raf_won_id,
			claimed_date: item.claimed_date,
		};
	});
};

/** @hidden */
export const prizeTransform = (items: RafflePrize[]): TRafflePrize[] => {
	return items.map((item) => {
		return {
			id: item.prize_id,
			name: item.public_meta.name,
			description: item.public_meta.description,
			image_url: item.public_meta.image_url,
			prizes_per_run: item.prizes_per_run,
			prizes_per_run_actual: item.prizes_per_run_actual,
			chances_to_win_perc: item.chances_to_win_perc,
			min_required_total_tickets: item.min_required_total_tickets,
			cap_prizes_per_run: item.cap_prizes_per_run,
			priority: item.priority,
			stock_items_per_draw: item.stock_items_per_draw,
			should_claim: item.should_claim,
			winners: winnersTransform(item.winners),
			requires_claim: item.requires_claim,
			min_required_tickets_for_user: item.min_required_tickets_for_user,
		};
	});
};

/** @hidden */
export const drawTransform = (items: RaffleDraw[]): TRaffleDraw[] => {
	return items.map((item) => {
		return {
			id: item.draw_id,
			name: item.public_meta.name,
			description: item.public_meta.description,
			image_url: item.public_meta.image_url,
			image_url_mobile: item.public_meta.image_url_mobile,
			icon_url: item.public_meta.icon_url,
			background_image_url: item.public_meta.background_image_url,
			background_image_url_mobile: item.public_meta.background_image_url_mobile,
			is_grand: item.public_meta.is_grand,
			prizes: prizeTransform(item.prizes),
			current_state: item.current_state,
			run_id: item.run_id,
			execution_type: item.execution_type,
			execution_ts: item.execution_ts,
			previous_run_ts: item.previous_run_ts,
			previous_run_id: item.previous_run_id,
			ticket_start_ts: item.ticket_start_ts,
			allow_multi_prize_per_ticket: item.allow_multi_prize_per_ticket,
			total_tickets_count: item.total_tickets_count,
			my_tickets_count: item.my_tickets_count,
			my_last_tickets: ticketsTransform(item.my_last_tickets),
			user_opted_in: Boolean(item.user_opted_in),
			requires_optin: Boolean(item.requires_optin),
			winners_limit: item.winners_limit,
			winners_offset: item.winners_offset,
			winners_total: item.winners_total,
		};
	});
};

/** @hidden */
export const raffleTransform = (items: Raffle[]): TRaffle[] => {
	return items.map((item) => {
		return {
			id: item.raffle_id,
			name: item.public_meta.name,
			description: item.public_meta.description,
			custom_section_id: item.public_meta.custom_section_id,
			image_url: item.public_meta.image_url,
			image_url_mobile: item.public_meta.image_url_mobile,
			custom_data: item.public_meta.custom_data,
			start_date: item.start_date_ts,
			end_date: item.end_date_ts,
			max_tickets_count: item.max_tickets_count,
			current_tickets_count: item.current_tickets_count,
			draws: drawTransform(item.draws),
		};
	});
};
