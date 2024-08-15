import { ProtocolRequest } from '../Base/ProtocolRequest';

export interface ClaimBonusRequest extends ProtocolRequest {
	bonusId: number;
}
