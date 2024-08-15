import { ProtocolResponse } from '../Base/ProtocolResponse';
import { Bonus } from './Bonus';

export interface GetBonusesResponse extends ProtocolResponse {
	bonuses: Bonus[];
}
