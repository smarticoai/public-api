import { ProtocolMessage } from '../Base/ProtocolMessage';

export interface GetPointsHistoryRequest extends ProtocolMessage {
	userId: number;
	startTimeSeconds: number;
	endTimeSeconds: number;
}

