import { ProtocolResponse } from '../Base/ProtocolResponse';
import { Tournament } from '../Tournaments';
import { UserAchievement } from './UserAchievement';

export interface GetRelatedAchTourResponse extends ProtocolResponse {
	achievements: UserAchievement[];
	tournaments?: Tournament[];
}
