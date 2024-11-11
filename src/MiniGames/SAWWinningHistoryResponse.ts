import { ProtocolResponse } from "../SmarticoLib";
import { TSawHistory } from "../WSAPI/WSAPITypes";
import { SAWTemplate } from "./SAWTemplate";

export interface SAWWinningHistoryResponse extends ProtocolResponse {
	prizes: SAWPrizesHistory[];
}

export interface SAWPrizesHistory {
	template: SAWTemplate,
	saw_template_id: number,
	saw_prize_id: number,
	prize_amount: number,
	client_request_id: string,
	is_claimed: boolean,
	create_date_ts: number;
	acknowledge_date_ts: number;
}

export const SAWHistoryTransform = (items: SAWPrizesHistory[]): TSawHistory[] => {
	return items.map((r) => {
		const x: TSawHistory = {
			template: r.template,
			saw_template_id: r.saw_template_id,
			saw_prize_id: r.saw_prize_id,
			prize_amount: r.prize_amount,
			client_request_id: r.client_request_id,
			is_claimed: r.is_claimed,
			create_date_ts: r.create_date_ts,
			acknowledge_date_ts: r.acknowledge_date_ts,
		}
		return x;
	})
}

