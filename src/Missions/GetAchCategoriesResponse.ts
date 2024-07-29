import { ProtocolResponse } from '../Base/ProtocolResponse'
import { AchCategory } from './AchievementCategory'

export interface GetAchCategoriesResponse extends ProtocolResponse {
	categories: AchCategory[]
}
