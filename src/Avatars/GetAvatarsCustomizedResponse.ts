import { ProtocolResponse } from '../Base/ProtocolResponse';
import { AvatarCustomized } from './AvatarCustomized';

export interface GetAvatarsCustomizedResponse extends ProtocolResponse {
	avatars: AvatarCustomized[];
}
