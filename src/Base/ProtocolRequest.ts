import { ProtocolMessage } from './ProtocolMessage';

export interface ProtocolRequest extends ProtocolMessage {
	api_key: string;
	brand_key: string;
	ext_user_id: string;
}
