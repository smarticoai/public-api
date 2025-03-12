import { ProtocolResponse } from 'src/Base/ProtocolResponse';
import { RaffleDrawRun } from './RaffleDraw';

export interface GetRaffleDrawRunsHistoryResponse extends ProtocolResponse {
	draw_runs: RaffleDrawRun[];
}
