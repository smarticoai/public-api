import { ProtocolMessage } from '../Base/ProtocolMessage';

export interface GetJackpotEligibleGamesRequest extends ProtocolMessage {
	jp_template_id: number;
}
