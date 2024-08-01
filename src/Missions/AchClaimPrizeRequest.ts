import { ProtocolMessage } from '../Base/ProtocolMessage';

export interface AchClaimPrizeRequest extends ProtocolMessage {
	ach_id: number;
	ach_completed_id: number; // ID of the completion fact from ach_completed or ach_completed_recurring tables
}
