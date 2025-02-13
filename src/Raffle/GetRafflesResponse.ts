import { ProtocolResponse } from '../Base/ProtocolResponse';
import { Raffle } from './Raffle';

export interface GetRafflesResponse extends ProtocolResponse {
	items: Raffle[];
}
