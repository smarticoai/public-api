import { ProtocolResponse } from '../Base/ProtocolResponse';
import { UserAchievement } from './UserAchievement';

export interface GetAchievementMapResponse extends ProtocolResponse {
	achievements?: UserAchievement[];
}
