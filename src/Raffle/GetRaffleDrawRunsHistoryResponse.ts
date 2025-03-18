import { ProtocolResponse } from '../Base/ProtocolResponse';
import { RaffleDrawRun } from './RaffleDrawRun';

export interface GetRaffleDrawRunsHistoryResponse extends ProtocolResponse {
	draw_runs: RaffleDrawRun[];
}
