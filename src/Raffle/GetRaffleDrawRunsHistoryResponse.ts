import { TRaffleDrawRun } from '../WSAPI/WSAPITypes';
import { ProtocolResponse } from '../Base/ProtocolResponse';
import { RaffleDrawRun } from './RaffleDrawRun';

export interface GetRaffleDrawRunsHistoryResponse extends ProtocolResponse {
	draw_runs: RaffleDrawRun[];
}

/** @hidden */
export const drawRunHistoryTransform = (res: GetRaffleDrawRunsHistoryResponse): TRaffleDrawRun[] => {
	return res.draw_runs.map((item) => {
		return {
			id: item.draw_id,
			run_id: item.run_id,
			name: item.public_meta.name,
			description:  item.public_meta.description,
			image_url:  item.public_meta.image_url,
			image_url_mobile:  item.public_meta.image_url_mobile,
			icon_url:  item.public_meta.icon_url,
			background_image_url:  item.public_meta.background_image_url,
			background_image_url_mobile:  item.public_meta.background_image_url_mobile,
			is_grand:  item.public_meta.is_grand,
			execution_ts: item.execution_ts,
			actual_execution_ts:item.actual_execution_ts,
			ticket_start_ts:item.ticket_start_ts,
			is_winner:item.is_winner,
			has_unclaimed_prize:item.has_unclaimed_prize
		};
	});
};
