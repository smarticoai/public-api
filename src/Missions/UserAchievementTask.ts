import { AchievementTaskPublicMeta } from "./AchievementTaskPublicMeta";
import { AchievementTaskType } from "./AchievementTaskType";

export interface UserAchievementTask {

    task_id?: number;
    task_public_meta?: AchievementTaskPublicMeta;
    points_reward?: number;
    task_type_id: AchievementTaskType;
    isCompleted?: boolean;
    userExecutedCount?: number;
    userProgress?: number;
    lastExecutionDate: string;
    unlocked_by_mission_id?: number;
    unlocked_by_level_id?: number;
}

