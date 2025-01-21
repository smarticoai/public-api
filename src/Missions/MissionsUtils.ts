import { AchievementAvailabilityStatus } from "./AchievementAvailabilityStatus";
import { AchievementStatus } from "./AchievementStatus";
import { UserAchievement } from "./UserAchievement";

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
}
