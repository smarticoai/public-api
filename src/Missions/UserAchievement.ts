
import { IntUtils } from "../IntUtils";
import { TMissionOrBadge } from "../WSAPI/WSAPITypes";
import { AchievementPublicMeta } from "./AchievementPublicMeta";
import { AchievementStatus } from "./AchievementStatus";
import { AchievementTaskType } from "./AchievementTaskType";
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

export const UserAchievementTransform = (items: UserAchievement[]): TMissionOrBadge[] => {

    return items.filter( r => r.ach_id >= 1).map( r => (
        {
            id: r.ach_id,
            name: r.ach_public_meta.name,
            desription: r.ach_public_meta.description,
            unlock_mission_description: r.ach_public_meta.unlock_mission_description,
            image: r.ach_public_meta.image_url,
            is_completed: r.isCompleted,
            is_locked: r.isLocked,
            is_requires_optin: r.requiresOptin,
            is_opted_in: r.isOptedIn,
            time_limit_ms: r.time_limit_ms,
            dt_start: r.start_date as any, // TODO: convert to epoch
            reward: r.ach_public_meta.reward,
            progress: r.progress,
            type: r.ach_type_id === AchievementType.Mission ? 'mission' : 'badge',
            cta_action: r.ach_public_meta.cta_action,
            cta_text: r.ach_public_meta.cta_text,
            custom_section_id: r.ach_public_meta.custom_section_id,
            only_in_custom_section: r.ach_public_meta.only_in_custom_section,
            custom_data: IntUtils.JsonOrText(r.ach_public_meta.custom_data),
            tasks: (r.achievementTasks || [])
                .filter( t => t.task_type_id === AchievementTaskType.CompleteAchievement)
                .map( t => ({
                    id: t.task_id,
                    name: t.task_public_meta?.name,
                    is_completed: t.isCompleted,
                    progress: t.userProgress,
                }))
        }
    ));
}    

