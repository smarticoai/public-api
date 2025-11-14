import { AchievementTaskPublicMeta } from './AchievementTaskPublicMeta';
import { AchievementTaskType } from './AchievementTaskType';

export interface UserAchievementTask {
	task_id?: number;
	task_public_meta?: AchievementTaskPublicMeta;
	points_reward?: number;
	task_type_id: AchievementTaskType;
	isCompleted?: boolean;
	userExecutedCount?: number; // This is the number of times the user has executed 'activity' of the task. e.g. he bet 5 times out of 100. here will be 5
	executionCount?: number; // This is the total number of times the user needs to execute to complete task. e.g. he needs to bet 100 times. here will be 100
	userProgress?: number;
	lastExecutionDate: string;
	unlocked_by_mission_id?: number;
	unlocked_by_level_id?: number;
	user_state_params?: { [key: string]: any };
}
