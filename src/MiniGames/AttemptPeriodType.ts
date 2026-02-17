export enum AttemptPeriodType {
	FromLastAttempt = 1,
	CalendarDaysUTC = 2,
	CalendarDaysUserTimeZone = 3,
	Lifetime = 4,
}

export enum AttemptPeriodTypeName {
	FromLastAttempt = 'from-last-attempt',
	CalendarDaysUTC = 'calendar-days-utc',
	CalendarDaysUserTimeZone = 'calendar-days-user-time-zone',
	Lifetime = 'lifetime',
}

/** @hidden */
export const AttemptPeriodTypeNamed = (type: AttemptPeriodType): AttemptPeriodTypeName => {
	return (
		{
			[AttemptPeriodType.FromLastAttempt]: AttemptPeriodTypeName.FromLastAttempt,
			[AttemptPeriodType.CalendarDaysUTC]: AttemptPeriodTypeName.CalendarDaysUTC,
			[AttemptPeriodType.CalendarDaysUserTimeZone]: AttemptPeriodTypeName.CalendarDaysUserTimeZone,
			[AttemptPeriodType.Lifetime]: AttemptPeriodTypeName.Lifetime,
		}[type]
	);
};