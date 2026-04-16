import { ProtocolResponse } from '../Base/ProtocolResponse';
import { AvatarPrompt } from './AvatarPrompt';

export interface GetAvatarPromptsResponse extends ProtocolResponse {
	prompts: AvatarPrompt[];
}
