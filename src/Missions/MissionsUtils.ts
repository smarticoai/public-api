import { AchievementAvailabilityStatus } from "./AchievementAvailabilityStatus";
import { AchievementStatus } from "./AchievementStatus";
import { UserAchievement } from "./UserAchievement";
import { UserAchievementTask } from "./UserAchievementTask";
import { BadgesTimeLimitStates } from "./BadgesTimeLimitStates";

type UserStateParamsKeys =
    | 'core_fav_game_top3' | 'core_fav_game_type_top3' | 'core_fav_game_provider_top3'
    | 'core_fav_sport_type_top3' | 'core_fav_sport_league_top3' | 'core_fav_sport_market_top3'
    | 'core_recommended_deposit_amount' | 'core_recommended_casino_bet_amount' | 'core_recommended_sport_bet_amount';

// tag -> favorites (top 3 arrays) that fill it; a task has at most one condition per tag (enforced in the BO)
const FAV_TAGS: [string, UserStateParamsKeys[]][] = [
    ['{{suggested_games}}', ['core_fav_game_top3', 'core_fav_game_type_top3', 'core_fav_game_provider_top3']],
    ['{{suggested_sport}}', ['core_fav_sport_type_top3', 'core_fav_sport_league_top3']],
    ['{{suggested_market}}', ['core_fav_sport_market_top3']],
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

        // a mission available only on some weekdays / days of the month, currently outside them
        if (mission.activity_period_next_start_ts && MissionUtils.getMs(mission.activity_period_next_start_ts) > Date.now()) {
            return AchievementAvailabilityStatus.UnavailableWithActiveFrom;
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
        if (Object.keys(userStateParams).length === 0) {
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

        // favorites need the operator; the amount does not - a Prop to Prop target comes without one
        if (userStateOperator) {
            FAV_TAGS.forEach(([tag, keys]) => {
                replaceTag(tag, keys.map(favValue).find(Boolean));
            });
        }

        // a condition's amount first, then the Prop to Prop target's, which Java nests under 'r'
        const amountOf = (src: { [key: string]: any }) => src && src[USER_STATE_PARAMS_KEYS_BET_AMOUNT.find((k) => src[k])];
        const amount = amountOf(userStateParams) || amountOf(userStateParams.r);
        // {{suggested_amount}} is the target itself (multiplier x its recommended amount), so a task with a condition can show both
        const targetAmount = MissionUtils.targetAmountOf(task, amountOf(userStateParams.r));
        const currency = currencySymbol || userStateParams.core_wallet_currency || '';

        if (amount) {
            replaceTag('{{suggested_value}}', `${amount} ${currency}`);
        }

        if (targetAmount) {
            replaceTag('{{suggested_amount}}', `${targetAmount} ${currency}`);
        }

        return result;
    }

    // The BO stores the multiplier in task_public_meta. A task saved before that falls back to Java's goal,
    // which Java sends only until the task is completed, and then to the recommended amount itself.
    private static targetAmountOf = (task: UserAchievementTask, recommended: string | number): string | number => {
        if (!recommended || isNaN(Number(recommended))) {
            return recommended;
        }

        const multiplier = Number(task.task_public_meta?.prop_to_prop_multiplier);

        if (multiplier > 0) {
            return MissionUtils.formatAmount(recommended, multiplier);
        }

        return MissionUtils.formatAmount(!task.isCompleted && task.executionCount > 0 ? task.executionCount : recommended);
    }

    // value x multiplier, rounded half up to at most 2 decimals, no trailing zeros: 49.995 -> '50', 45.45123 -> '45.45', 1500 -> '1500'.
    // Done on scaled integers: floats give 443568.98 x 3.75 = 1663383.6749999998 and round it down. A product too long
    // for a safe integer (amounts around 1e12, where a double holds no 2 decimals anyway) falls back to floats.
    private static formatAmount = (value: number | string, multiplier: number = 1): string => {
        const decimal = (v: number | string) => {
            const s = String(Number(v));

            return /^\d+(\.\d+)?$/.test(s) ? { int: Number(s.replace('.', '')), scale: (s.split('.')[1] || '').length } : null;
        };
        const a = decimal(value);
        const b = decimal(multiplier);
        const int = a && b ? a.int * b.int : NaN;

        if (!Number.isSafeInteger(int)) {
            return String(Number((Number(value) * multiplier).toFixed(2)));
        }

        const scale = a.scale + b.scale;

        if (scale <= 2) {
            return String(int / 10 ** scale);
        }

        const div = 10 ** (scale - 2);
        const rem = int % div;

        return String(((int - rem) / div + (rem * 2 >= div ? 1 : 0)) / 100);
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
