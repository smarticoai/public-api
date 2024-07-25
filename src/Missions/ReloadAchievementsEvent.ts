import { ProtocolResponse } from "../Base/ProtocolResponse";
import { UserAchievement } from "./UserAchievement";

export interface ReloadAchievementsEvent extends ProtocolResponse {
    // !important, server will push here UserAchievement but public_meta of ach and tasks will be null
    // we should use only fields that are reflecting updated progress and not meta data for mission/task
    achievements: UserAchievement[];
}
