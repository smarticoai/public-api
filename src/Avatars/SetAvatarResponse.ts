import { ProtocolResponse } from '../Base/ProtocolResponse';

export interface SetAvatarResponse extends ProtocolResponse {
	/** The resolved avatar URL after applying the avatar */
	avatar_id: string;
}
