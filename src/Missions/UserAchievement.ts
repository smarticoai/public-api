
import { AchRelatedGame } from "../Base/AchRelatedGame";
import { IntUtils } from "../IntUtils";
import { TMissionOrBadge } from "../WSAPI/WSAPITypes";
import { AchievementPublicMeta } from "./AchievementPublicMeta";
import { AchievementStatus } from "./AchievementStatus";
import { AchievementTaskType } from "./AchievementTaskType";
import { AchievementType } from "./AchievementType";
import { ScheduledMissionType } from "./ScheduledMissionType";
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
    start_date_ts?: number; 
    time_limit_ms?: number;
    progress?: number;
    complete_date?: string;
    complete_date_ts?: number;
    unlock_date?: string;
    milliseconds_till_available?: number;
    completed_tasks?: number;
    achievementTasks?: UserAchievementTask[];
    ach_status_id?: AchievementStatus;
    scheduledMissionType?: ScheduledMissionType;
    related_games?: AchRelatedGame[];
    active_from_ts?: number; // indicates when 'scheduled' mission is active from,
    ach_categories?: number[];

    ach_completed_id?: number; // ID of the completion fact from ach_completed or ach_completed_recurring tables
    requires_prize_claim?: boolean; // flag from achievement if the mission prize will be given only after user claims it
    prize_claimed_date_ts?: number; // the date/timestamp indicating when the prize was claimed by the user

    completed_today?: boolean;
    completed_this_week?: boolean;
    completed_this_month?: boolean;
}



export const UserAchievementTransform = (items: UserAchievement[]): TMissionOrBadge[] => {
    
    return items.filter( r => r.ach_id >= 1).map( r => {
        const completedToday = r.complete_date_ts ? IntUtils.isWithinPeriod(r.complete_date_ts, 'today') : false;
        const completedThisWeek = r.complete_date_ts ? IntUtils.isWithinPeriod(r.complete_date_ts, 'thisWeek') : false;
        const completedThisMonth = r.complete_date_ts ? IntUtils.isWithinPeriod(r.complete_date_ts, 'thisMonth') : false;

        const x: TMissionOrBadge = {
            id: r.ach_id,
            name: r.ach_public_meta.name,
            description: r.ach_public_meta.description,
            hint_text: r.ach_public_meta.hint_text,
            unlock_mission_description: r.ach_public_meta.unlock_mission_description,
            image: r.ach_public_meta.image_url,
            is_completed: r.isCompleted,
            is_locked: r.isLocked,
            is_requires_optin: r.requiresOptin,
            is_opted_in: r.isOptedIn,
            time_limit_ms: r.time_limit_ms,
            dt_start: r.start_date_ts,
            reward: r.ach_public_meta.reward,
            progress: r.progress,
            type: r.ach_type_id === AchievementType.Mission ? 'mission' : 'badge',
            cta_action: r.ach_public_meta.cta_action,
            cta_text: r.ach_public_meta.cta_text,
            custom_section_id: r.ach_public_meta.custom_section_id,
            only_in_custom_section: r.ach_public_meta.only_in_custom_section,
            custom_data: IntUtils.JsonOrText(r.ach_public_meta.custom_data),
            position: r.ach_public_meta.position,
            ribbon: r.ach_public_meta.label_tag === 'custom' ? r.ach_public_meta.custom_label_tag : r.ach_public_meta.label_tag,
            tasks: (r.achievementTasks || [])
                .filter( t => t.task_type_id === AchievementTaskType.CompleteAchievement)
                .map( t => ({
                    id: t.task_id,
                    name: t.task_public_meta?.name,
                    points_reward: t.points_reward,
                    is_completed: t.isCompleted,
                    progress: t.userProgress,
                })),
            related_games: (r.related_games || []).map(g => ({
                ext_game_id: g.ext_game_id,
                game_public_meta: {
                    name: g.game_public_meta.name,
                    link: g.game_public_meta.link,
                    image: g.game_public_meta.image,
                    enabled: g.game_public_meta.enabled,
                    game_categories: g.game_public_meta.game_categories,
                    game_provider: g.game_public_meta.game_provider,
                },
            })),
            category_ids: r.ach_categories ?? [],
            ach_completed_id: r.ach_completed_id,
            requires_prize_claim: r.requires_prize_claim,
            prize_claimed_date_ts: r.prize_claimed_date_ts,
            completed_today: completedToday,
            completed_this_week: completedThisWeek,
            completed_this_month: completedThisMonth
        }
        return x;
});
}    

