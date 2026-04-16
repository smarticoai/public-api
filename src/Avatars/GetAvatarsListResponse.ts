import { ProtocolResponse } from '../Base/ProtocolResponse';
import { AvatarDefinition } from './AvatarDefinition';

export interface GetAvatarsListResponse extends ProtocolResponse {
	avatars: AvatarDefinition[];
}
