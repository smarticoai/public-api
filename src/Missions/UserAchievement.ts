import { AchRelatedGame } from '../Base/AchRelatedGame';
import { IntUtils } from '../IntUtils';
import { TMissionOrBadge } from '../WSAPI/WSAPITypes';
import { AchievementPublicMeta } from './AchievementPublicMeta';
import { AchievementStatus } from './AchievementStatus';
import { AchievementTaskType } from './AchievementTaskType';
import { AchievementType } from './AchievementType';
import { MissionUtils } from './MissionsUtils';
import { ScheduledMissionType } from './ScheduledMissionType';
import { UserAchievementTask } from './UserAchievementTask';
import { BadgesTimeLimitStates } from './BadgesTimeLimitStates';

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
	next_recurrence_date_ts?: number;
	ach_status_id?: AchievementStatus;
	scheduledMissionType?: ScheduledMissionType;
	related_games?: AchRelatedGame[];
	active_from_ts?: number; // indicates when 'scheduled' mission is active from,
	active_till_ts?: number; // indicates when 'scheduled' mission is active till,
	ach_categories?: number[];
	recurring_quantity?: number; // max completion count for Recurring upon completion
	completed_count?: number; // completion count for Recurring upon completion

	ach_completed_id?: number; // ID of the completion fact from ach_completed or ach_completed_recurring tables
	requires_prize_claim?: boolean; // flag from achievement if the mission prize will be given only after user claims it
	prize_claimed_date_ts?: number; // the date/timestamp indicating when the prize was claimed by the user

	completed_today?: boolean;
	completed_this_week?: boolean;
	completed_this_month?: boolean;
	custom_section_type_id?: number;
	badgeTimeLimitState?: BadgesTimeLimitStates;
}

export const enrichUserAchievementsWithBadgeState = (items: UserAchievement[]): UserAchievement[] => {
	return items.map((item) => {
		if (item.ach_type_id === AchievementType.Badge && (item.active_from_ts || item.active_till_ts)) {
			item.badgeTimeLimitState = MissionUtils.determineBadgeState(item);
		}
		return item;
	});
};

export const UserAchievementTransform = (items: UserAchievement[]): TMissionOrBadge[] => {
	return items
		.filter((r) => r.ach_id >= 1)
		.map((r) => {
			const completedToday = r.complete_date_ts ? IntUtils.isWithinPeriod(r.complete_date_ts, 'today') : false;
			const completedThisWeek = r.complete_date_ts ? IntUtils.isWithinPeriod(r.complete_date_ts, 'thisWeek') : false;
			const completedThisMonth = r.complete_date_ts ? IntUtils.isWithinPeriod(r.complete_date_ts, 'thisMonth') : false;

			let missionName = r.ach_public_meta.name;
			let missionSubHeader = r.ach_public_meta.sub_header;
			let missionDescription = r.ach_public_meta.description;

			if (missionName?.includes('{{suggested_') || missionSubHeader?.includes('{{suggested_') || missionDescription?.includes('{{suggested_')) {
				r.achievementTasks.forEach(t => {
					if (r.ach_public_meta.name?.includes('{{suggested_')) {
						missionName = MissionUtils.replaceTagsFavMissionTask({ task: t, valueToReplace: r.ach_public_meta.name });
					}
					if (r.ach_public_meta.sub_header?.includes('{{suggested_')) {
						missionSubHeader = MissionUtils.replaceTagsFavMissionTask({ task: t, valueToReplace: r.ach_public_meta.sub_header });
					}
					if (r.ach_public_meta.description?.includes('{{suggested_')) {
						missionDescription = MissionUtils.replaceTagsFavMissionTask({ task: t, valueToReplace: r.ach_public_meta.description });
					}
				});
			}

			const x: TMissionOrBadge = {
				id: r.ach_id,
				name: missionName,
				sub_header: missionSubHeader,
				description: missionDescription,
				hint_text: r.ach_public_meta.hint_text,
				unlock_mission_description: r.ach_public_meta.unlock_mission_description,
				image: r.ach_public_meta.image_url,
				is_completed: r.isCompleted,
				is_locked: r.isLocked,
				is_requires_optin: r.requiresOptin,
				is_opted_in: r.isOptedIn,
				time_limit_ms: r.time_limit_ms,
				active_from_ts: r.active_from_ts,
				active_till_ts: r.active_till_ts,
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
				ribbon:
					r.ach_public_meta.label_tag === 'custom' ? r.ach_public_meta.custom_label_tag : r.ach_public_meta.label_tag,
				tasks: (r.achievementTasks || [])
					.filter((t) => t.task_type_id === AchievementTaskType.CompleteAchievement)
					.map((t) => {
						MissionUtils.replaceFavGameNameTag({ task: t });

						return ({
							id: t.task_id,
							name: t.task_public_meta?.name,
							points_reward: t.points_reward,
							is_completed: t.isCompleted,
							progress: t.userProgress,
							execution_count_expected: t.executionCount,
							execution_count_actual: t.userExecutedCount,
							display_progress_as_count: t.task_public_meta.display_progress_as_count,
							stage_image: t.task_public_meta.stage_image,
						})
					}),
				related_games: (r.related_games || []).map((g) => ({
					ext_game_id: g.ext_game_id,
					game_public_meta: {
						name: g.game_public_meta.name,
						link: g.game_public_meta.link,
						image: g.game_public_meta.image,
						enabled: g.game_public_meta.enabled,
						game_categories: g.game_public_meta.game_categories,
						game_provider: g.game_public_meta.game_provider,
						mobile_spec_link: g.game_public_meta.mobile_spec_link
					},
				})),
				category_ids: r.ach_categories ?? [],
				ach_completed_id: r.ach_completed_id,
				requires_prize_claim: r.requires_prize_claim,
				prize_claimed_date_ts: r.prize_claimed_date_ts,
				complete_date: r.complete_date,
				complete_date_ts: r.complete_date_ts,
				completed_today: completedToday,
				completed_this_week: completedThisWeek,
				completed_this_month: completedThisMonth,
				custom_section_type_id: r.ach_public_meta.custom_section_type_id,
				availability_status: MissionUtils.getAvailabilityStatus(r),
				claim_button_title: r.ach_public_meta.claim_button_title,
				claim_button_action: r.ach_public_meta.claim_button_action,
				badgeTimeLimitState: r.badgeTimeLimitState,
				hide_locked_mission: r.ach_public_meta.hide_locked_mission,
			};

			if (r.ach_status_id === AchievementStatus.Recurring) {
				x.next_recurrence_date_ts = Date.now() + r?.milliseconds_till_available;
			}

			if (r.ach_status_id === AchievementStatus.RecurringUponCompletion) {
				x.completion_count = r.completed_count;
				x.max_completion_count = r.recurring_quantity;
			}
			return x;
		});
};
