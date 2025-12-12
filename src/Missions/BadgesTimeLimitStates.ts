export enum BadgesTimeLimitStates {
	//Before Start Date → Show badge in greyed-out state with a "Locked by date" status.
	BeforeStartDate = 0,
	//After Start Date but before earned → Show badge in greyed-out state, without the "Locked by date" status.
	AfterStartDateNoProgress = 1,
	//After Start Date but before started (no progress) + End date → Show badge in greyed-out state, without the "Locked by date" status, but with date stamp chip. The date is the End date.
	AfterStartDateNoProgressAndEndDate = 2,
	//After Start Date, but with some progress + End date → Show badge in colorful state, with date stamp chip. The date is the End date.
	AfterStartDateWithProgressAndEndDate = 3,
	//After End Date (not started) → Show badge in greyed-out state with a "Missed" status.
	AfterEndDateNotStarted = 4,
	//After End Date (player has some progress, but not completed) → Show badge colorful with a "Missed" status.
	AfterEndDateWithProgress = 5,
}

