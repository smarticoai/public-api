import { TAvatarCustomized } from '../WSAPI/WSAPITypes';
import { ProtocolResponse } from '../Base/ProtocolResponse';
import { AvatarCustomized } from './AvatarCustomized';

export interface GetAvatarsCustomizedResponse extends ProtocolResponse {
	avatars: AvatarCustomized[];
}

export const avatarCustomizedTransform = (items: AvatarCustomized[], avatarDomain: string): TAvatarCustomized[] => {
	return items.map((item) => ({
		avatar_real_id: item.avatar_real_id,
		url: item.url && !item.url.startsWith('http') ? `${avatarDomain}${item.url}` : item.url,
		dt_created: item.dt_created,
	}));
};
