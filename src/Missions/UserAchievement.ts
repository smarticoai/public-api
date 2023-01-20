
import { AchievementPublicMeta } from "./AchievementPublicMeta";
import { AchievementStatus } from "./AchievementStatus";
import { AchievementType } from "./AchievementType";
import { UserAchievementTask } from "./UserAchievementTask";

export interface UserAchievement {

    ach_id?: number;
    ach_type_id?: AchievementType;
    ach_public_meta?: AchievementPublicMeta;
    isCompleted?: boolean;
    isLocked?: boolean;
    requiresOptin?: boolean;
    isOptedIn?: boolean;
    start_date?: string; // time when mission unlocked or opted-in. Needed to calculated "remaining time" in case time_limit_ms is set
    time_limit_ms?: number;
    progress?: number;
    complete_date?: string;
    unlock_date?: string;
    completed_tasks?: number;
    achievementTasks?: UserAchievementTask[];
    ach_status_id?: AchievementStatus;
}

