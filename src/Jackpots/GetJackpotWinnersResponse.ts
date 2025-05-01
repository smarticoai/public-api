import { ProtocolResponse } from "../Base/ProtocolResponse";
import { JackPotWinner } from "./JackPotWinner";

export interface GetJackpotWinnersResponse extends ProtocolResponse {
	/** The list of jackpot winners */
	winners: JackpotWinnerHistory[];
	/** Whether there are more winners to fetch */
	has_more: boolean;
}

export interface JackpotWinnerHistory {
	/** Id of the jackpot pot */
	jp_pot_id: number;
	/** Date of winning in milliseconds */
	win_date_ts: number;
	/** Info about jackpot winner */
	winner: JackPotWinner;
}

/**
 * @ignore
 */
export const GetJackpotWinnersResponseTransform = (items: JackpotWinnerHistory[]): JackpotWinnerHistory[] => {
	return items.map((item) => {
		const winnerInfo: JackpotWinnerHistory = {
			winner: item.winner,
			win_date_ts: item.win_date_ts,
			jp_pot_id: item.jp_pot_id,
		};

		return winnerInfo;
	});
};
