import { TAvatarPrompt } from '../WSAPI/WSAPITypes';
import { ProtocolResponse } from '../Base/ProtocolResponse';
import { AvatarPrompt } from './AvatarPrompt';

export interface GetAvatarPromptsResponse extends ProtocolResponse {
	prompts: AvatarPrompt[];
}

export const avatarPromptTransform = (items: AvatarPrompt[], avatarDomain: string): TAvatarPrompt[] => {
	return items.map((item) => ({
		prompt_id: item.prompt_id,
		name: item.public_meta.name,
		icon_url: item.public_meta.icon_url && !item.public_meta.icon_url.startsWith('http') ? `${avatarDomain}${item.public_meta.icon_url}` : item.public_meta.icon_url,
		cost_currency_type_id: item.cost_currency_type_id,
		cost_value: item.cost_value,
	}));
};
