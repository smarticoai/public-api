import { ProtocolMessage } from '../Base/ProtocolMessage';

export interface JoinClanRequest extends ProtocolMessage {
	clan_id: number;
	join_source_id: number;
}
