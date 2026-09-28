import { ProtocolResponse } from "../Base/ProtocolResponse";
import { JackPotWinner } from "./JackPotWinner";

export interface GetJackpotWinnersResponse extends ProtocolResponse {
	/** The list of jackpot winners */
	winners: JackpotWinnerHistory[];
	/** Whether there are more winners to fetch */
	has_more: boolean;
	/** Win statistics of the jackpot template */
	win_stats?: JackpotWinStats;
}

export interface JackpotWinnerHistory {
	/** Id of the jackpot pot */
	jp_pot_id: number;
	/** Date of winning in milliseconds */
	win_date_ts: number;
	/** Info about jackpot winner */
	winner: JackPotWinner;
}

export interface JackpotWinStats {
	/** Total number of issued wins of the jackpot template. Wins waiting for manual approval are not counted */
	total_wins: number;
	/** The biggest win of the jackpot template, `null` when there are no wins yet */
	highest_win: JackpotWin | null;
	/** The most recent win of the jackpot template, `null` when there are no wins yet */
	last_win: JackpotWin | null;
}

export interface JackpotWin {
	/** Won amount in the Jackpot currency */
	winning_amount: number;
	/** Date of winning in milliseconds */
	win_date_ts: number;
	/** Name of the winner, masked by default. `null` when the jackpot template doesn't expose winners over API */
	public_username: string | null;
}

export interface TGetJackpotWinStatsResponse {
	/** The list of jackpot winners */
	winners: JackpotWinnerHistory[];
	/** Win statistics of the jackpot template */
	win_stats: JackpotWinStats;
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

/**
 * @ignore
 */
export const GetJackpotWinStatsResponseTransform = (response: GetJackpotWinnersResponse): TGetJackpotWinStatsResponse => {
	return {
		winners: GetJackpotWinnersResponseTransform(response.winners ?? []),
		win_stats: {
			total_wins: response.win_stats?.total_wins ?? 0,
			highest_win: response.win_stats?.highest_win ?? null,
			last_win: response.win_stats?.last_win ?? null,
		},
	};
};
