import { ProtocolRequest } from '../Base/ProtocolRequest';

export interface SetAvatarRequest extends ProtocolRequest {
	/** The avatar image URL or path to set */
	avatar_id: string;
	/** The avatar_real_id from the avatar catalog */
	avatar_real_id: number;
}
