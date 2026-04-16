import { TAvatarDefinition } from '../WSAPI/WSAPITypes';
import { ProtocolResponse } from '../Base/ProtocolResponse';
import { AvatarDefinition } from './AvatarDefinition';

export interface GetAvatarsListResponse extends ProtocolResponse {
	avatars: AvatarDefinition[];
}

export const avatarDefinitionTransform = (items: AvatarDefinition[], avatarDomain: string): TAvatarDefinition[] => {
	return items.map((item) => ({
		avatar_real_id: item.avatar_real_id,
		is_default: item.is_default,
		hide_until_achieved: item.hide_until_achieved,
		priority: item.priority,
		description: item.public_meta.description,
		url: item.public_meta.url,
		avatar_url: item.public_meta.url && !item.public_meta.url.startsWith('http') ? `${avatarDomain}${item.public_meta.url}` : item.public_meta.url,
		avatar_source_type_id: item.avatar_source_type_id,
		active_from_date: item.active_from_date,
		active_till_date: item.active_till_date,
		is_given: item.is_given,
		is_in_use: item.is_in_use,
	}));
};
