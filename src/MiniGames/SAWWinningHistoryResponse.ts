import { ProtocolResponse } from "../Base/ProtocolResponse";
import { TSawHistory } from "../WSAPI/WSAPITypes";
import { SAWTemplate } from "./SAWTemplate";
import { SAWGameType } from "./SAWGameType";
import { SAWPrize } from "./SAWPrize";

export interface SAWWinningHistoryResponse extends ProtocolResponse {
	prizes: SAWPrizesHistory[];
	hasMore: boolean;
}

export interface SAWPrizesHistory {
	/** Full template of the game. Sent only on protocol version 1; on version 2+ use the flat fields below */
	template?: SAWTemplate,
	saw_template_id: number,
	saw_prize_id: number,
	prize_amount: number,
	client_request_id: string,
	is_claimed: boolean,
	create_date_ts: number;
	acknowledge_date_ts: number;
	/** Protocol version 2+: game type of the template */
	saw_game_type_id?: SAWGameType;
	/** Protocol version 2+: translated name of the template (saw_template_ui_definition.name) */
	saw_template_name?: string;
	/** Protocol version 2+: thumbnail of the template (saw_template_ui_definition.thumbnail) */
	saw_template_thumbnail?: string;
	/** Protocol version 2+: the won prize, same shape as an item of template.prizes. Null when nothing was won */
	prize?: SAWPrize | null;
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
			saw_game_type_id: r.saw_game_type_id ?? r.template?.saw_game_type_id,
			saw_template_name: r.saw_template_name ?? r.template?.saw_template_ui_definition?.name,
			saw_template_thumbnail: r.saw_template_thumbnail ?? r.template?.saw_template_ui_definition?.thumbnail,
			prize: r.prize !== undefined ? r.prize : r.template?.prizes?.find((p) => p.saw_prize_id === r.saw_prize_id) ?? null,
		}
		return x;
	})
}

