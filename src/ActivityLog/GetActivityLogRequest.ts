import { ProtocolMessage } from '../Base/ProtocolMessage';

export interface GetActivityLogRequest extends ProtocolMessage {
	userId: number;
	startTimeSeconds: number;
	endTimeSeconds: number;
	limit: number;
	offset: number;
}


