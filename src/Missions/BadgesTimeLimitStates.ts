export enum BadgesTimeLimitStates {
	/** Before Start Date */
	BeforeStartDate = 0,
	/** After Start Date but before earned */
	AfterStartDateNoProgress = 1,
	/** After Start Date but before started (no progress) + End date */
	AfterStartDateNoProgressAndEndDate = 2,
	/** After Start Date, but with some progress + End date */
	AfterStartDateWithProgressAndEndDate = 3,
	/** After End Date (not started) */
	AfterEndDateNotStarted = 4,
	/** After End Date (player has some progress, but not completed) */
	AfterEndDateWithProgress = 5,
}

