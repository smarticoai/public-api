import { AchievementAvailabilityStatus } from "./AchievementAvailabilityStatus";
import { AchievementStatus } from "./AchievementStatus";
import { UserAchievement } from "./UserAchievement";
import { UserAchievementTask } from "./UserAchievementTask";
import { BadgesTimeLimitStates } from "./BadgesTimeLimitStates";

type UserStateParamsKeys =
    | 'core_fav_game_top3' | 'core_fav_game_type_top3' | 'core_fav_game_provider_top3'
    | 'core_fav_sport_type_top3' | 'core_fav_sport_league_top3'
    | 'core_recommended_deposit_amount' | 'core_recommended_casino_bet_amount' | 'core_recommended_sport_bet_amount';

// tag -> favorites (top 3 arrays) that fill it; a task has at most one condition per tag (enforced in the BO)
const FAV_TAGS: [string, UserStateParamsKeys[]][] = [
    ['{{suggested_games}}', ['core_fav_game_top3', 'core_fav_game_type_top3', 'core_fav_game_provider_top3']],
    ['{{suggested_sport}}', ['core_fav_sport_type_top3', 'core_fav_sport_league_top3']],
];
const USER_STATE_PARAMS_KEYS_BET_AMOUNT: UserStateParamsKeys[] = [
    'core_recommended_deposit_amount',
    'core_recommended_casino_bet_amount',
    'core_recommended_sport_bet_amount',
];

const MINOR_WORDS = new Set([
    'of', 'at', 'in', 'on', 'to', 'up', 'as', 'by', 'for',
    'from', 'into', 'onto', 'with', 'upon', 'via',
    'and', 'but', 'or', 'nor', 'so', 'yet',
    'vs', 'v',
    'a', 'an', 'the',
]);

function toGameTitleCase(raw: string): string {
    if (!raw) return raw;
    const tokens = raw.toLowerCase().split(/(\b\w+\b)/);
    const wordTokens = tokens.filter((t) => /^\w+$/.test(t));
    const lastWordIdx = wordTokens.length - 1;
    let wordIndex = 0;
    return tokens
        .map((token) => {
            if (!/^\w+$/.test(token)) return token;
            const isFirst = wordIndex === 0;
            const isLast  = wordIndex === lastWordIdx;
            wordIndex++;
            if (isFirst || isLast || !MINOR_WORDS.has(token)) {
                return token.charAt(0).toUpperCase() + token.slice(1);
            }
            return token;
        })
        .join('');
}

export class MissionUtils {

    public static getAvailabilityStatus = (mission: UserAchievement) => {

        if (!mission) {
            return null;
        }

        const activeFrom = mission.active_from_ts ? MissionUtils.getMs(mission.active_from_ts) : null
        const activeTill = mission.active_till_ts ? MissionUtils.getMs(mission.active_till_ts) : null;
        const startDate = mission.start_date_ts ? MissionUtils.getMs(mission.start_date_ts) : null;
        const timeLimit = mission.time_limit_ms;
        const requiresOptIn = mission.requiresOptin;
        const optedIn = mission.isOptedIn;
        const isLockedMission = mission.ach_status_id === AchievementStatus.AvailableLocked;
        const isLocked = mission.isLocked;

        if (!activeFrom && !activeTill && !timeLimit) {
            if (requiresOptIn) {
                if (optedIn) {
                    return AchievementAvailabilityStatus.AvailableActive;
                } else {
                    return AchievementAvailabilityStatus.AvailableInactive;
                }
            } else if (isLockedMission) {
                if (!isLocked) {
                    return AchievementAvailabilityStatus.AvailableActive;
                } else {
                    return AchievementAvailabilityStatus.AvailableInactive;
                }
            } else {
                return AchievementAvailabilityStatus.Available;
            }
        }

        if (activeFrom && activeFrom > Date.now()) {
            return AchievementAvailabilityStatus.UnavailableWithActiveFrom;
        }

        if ((activeFrom && activeFrom < Date.now()) || !activeFrom) {
            if (!activeTill && !timeLimit) {
                if (requiresOptIn) {
                    if (optedIn) {
                        return AchievementAvailabilityStatus.AvailableActive;
                    } else {
                        return AchievementAvailabilityStatus.AvailableInactive;
                    }
                } else if (isLockedMission) {
                    if (!isLocked) {
                        return AchievementAvailabilityStatus.AvailableActive;
                    } else {
                        return AchievementAvailabilityStatus.AvailableInactive;
                    }
                } else {
                    return AchievementAvailabilityStatus.Available;
                }
            }

            if (activeTill && !timeLimit) {
                if (activeTill > Date.now()) {
                    if (requiresOptIn) {
                        if (optedIn) {
                            return AchievementAvailabilityStatus.AvailableWithActiveTillActive;
                        } else {
                            return AchievementAvailabilityStatus.AvailableWithActiveTillInactive;
                        }
                    } else if (isLockedMission) {
                        if (!isLocked) {
                            return AchievementAvailabilityStatus.AvailableWithActiveTillActive;
                        } else {
                            return AchievementAvailabilityStatus.AvailableWithActiveTillInactive;
                        }
                    } else {
                        return AchievementAvailabilityStatus.AvailableWithActiveTill;
                    }
                } else {
                    return AchievementAvailabilityStatus.MissedByActiveTill;
                }
            }

            if (timeLimit && !activeTill) {
                if (requiresOptIn) {
                    const endDate = startDate + timeLimit;

                    if (optedIn) {
                        if (endDate > Date.now()) {
                            return AchievementAvailabilityStatus.AvailableLimitedActive;
                        } else {
                            return AchievementAvailabilityStatus.MissedByLimitInTime;
                        }
                    } else {
                        return AchievementAvailabilityStatus.AvailableLimitedInactive;
                    }
                } else if (isLockedMission) {
                    const endDate = startDate + timeLimit;

                    if (!isLocked) {
                        if (endDate > Date.now()) {
                            return AchievementAvailabilityStatus.AvailableLimitedActive;
                        } else {
                            return AchievementAvailabilityStatus.MissedByLimitInTime;
                        }
                    } else {
                        return AchievementAvailabilityStatus.AvailableLimitedInactive;
                    }
                } else {
                    const endDate = activeFrom && activeFrom > startDate ? activeFrom + timeLimit : startDate + timeLimit;

                    if (endDate > Date.now()) {
                        return AchievementAvailabilityStatus.AvailableLimited;
                    } else {
                        return AchievementAvailabilityStatus.MissedByLimitInTime;
                    }
                }
            }

            if (timeLimit && activeTill) {
                if (activeTill > Date.now()) {
                    if (requiresOptIn) {
                        if (optedIn) {
                            const endDate = startDate + timeLimit;

                            if (endDate > Date.now()) {
                                return AchievementAvailabilityStatus.AvailableFullyLimitedActive;
                            } else {
                                return AchievementAvailabilityStatus.MissedByLimitInTime;
                            }
                        } else {
                            return AchievementAvailabilityStatus.AvailableFullyLimitedInactive;
                        }
                    } else if (isLockedMission) {
                        if (!isLocked) {
                            const endDate = startDate + timeLimit;

                            if (endDate > Date.now()) {
                                return AchievementAvailabilityStatus.AvailableFullyLimitedActive;
                            } else {
                                return AchievementAvailabilityStatus.MissedByLimitInTime;
                            }
                        } else {
                            return AchievementAvailabilityStatus.AvailableFullyLimitedInactive;
                        }
                    } else {
                        const endDate = activeFrom && activeFrom > startDate ? activeFrom + timeLimit : startDate + timeLimit;

                        if (endDate > Date.now()) {
                            return AchievementAvailabilityStatus.AvailableFullyLimited;
                        } else {
                            return AchievementAvailabilityStatus.MissedByLimitInTime;
                        }
                    }
                } else {
                    return AchievementAvailabilityStatus.MissedByActiveTill;
                }
            }
        }
    }

    public static getMs = (ts: number): number => {
        return new Date(ts).getTime();
    }

    public static replaceTagsFavMissionTask = ({ task, valueToReplace, currencySymbol }: { task: UserAchievementTask, valueToReplace: string, currencySymbol?: string }): string => {
        let result = valueToReplace || '';

        if (!task) {
            return result;
        }

        const userStateParams = (task.user_state_params || {});
        const userStateOperator = task.task_public_meta?.user_state_operations;
        if (Object.keys(userStateParams).length === 0 || !userStateOperator) {
            return result;
        }

        const formatFav = (v: string): string => toGameTitleCase(v.replace(/_/g, ' '));

        // 'has' / '!has' -> all favorites, 'posN' -> the N-th one
        const favValue = (k: UserStateParamsKeys): string => {
            const values = userStateParams[k];
            const operator: string = userStateOperator[k]?.op;

            if (!Array.isArray(values)) {
                return '';
            }

            if (operator === 'has' || operator === '!has') {
                return values.filter(Boolean).map(formatFav).join(', ');
            }

            const pos = /^pos[1-3]$/.test(operator) ? values[Number(operator.substring(3)) - 1] : null;

            return pos ? formatFav(pos) : '';
        };

        // split/join replaces every occurrence of the tag, not only the first one
        const replaceTag = (tag: string, value: string) => {
            if (value && result) {
                result = result.split(tag).join(value);
            }
        };

        FAV_TAGS.forEach(([tag, keys]) => {
            replaceTag(tag, keys.map(favValue).find(Boolean));
        });

        const amountKey = USER_STATE_PARAMS_KEYS_BET_AMOUNT.find((k) => userStateParams[k]);

        if (amountKey) {
            const currencyFromTheTask = userStateParams.core_wallet_currency;

            replaceTag('{{suggested_value}}', `${userStateParams[amountKey]} ${currencySymbol || currencyFromTheTask || ''}`);
        }

        return result;
    }

    public static replaceFavGameNameTag = ({ task, currencySymbol }: { task: UserAchievementTask, currencySymbol?: string }): UserAchievementTask => {
        if (task && task.task_public_meta && task.task_public_meta.name) {
            task.task_public_meta.name = MissionUtils.replaceTagsFavMissionTask({ task, valueToReplace: task.task_public_meta.name, currencySymbol });
        }

        return task;
    }

    public static determineBadgeState = (badge: UserAchievement): BadgesTimeLimitStates | null => {
        const now = Date.now();
        const { active_from_ts, active_till_ts, progress, isCompleted, complete_date_ts } = badge;

        // If badge is completed before active till date, return null
        if (isCompleted && (!active_till_ts || complete_date_ts < active_till_ts)) {
            return null;
        }
      
        // 1. BEFORE START
        if (active_from_ts > now) {
            return BadgesTimeLimitStates.BeforeStartDate;
        }
      
        // 2. AFTER START, NO END DATE (infinite badge)
        //    → grey, no locked, no date chip
        if (!active_till_ts) {
            if (progress === 0) {
                return BadgesTimeLimitStates.AfterStartDateNoProgress;
            }

            return BadgesTimeLimitStates.AfterStartDateWithProgress;
        }
      
        // 3. AFTER START, BEFORE END DATE
        if (now < active_till_ts) {
            if (progress === 0) {
                // now < end + has end date → must show chip
                return BadgesTimeLimitStates.AfterStartDateNoProgressAndEndDate;
            }
        
            return BadgesTimeLimitStates.AfterStartDateWithProgressAndEndDate;
        }
      
        // 4. AFTER END DATE
        if (progress === 0) {
            return BadgesTimeLimitStates.AfterEndDateNotStarted;
        }
      
        return BadgesTimeLimitStates.AfterEndDateWithProgress;
    }
}
