/** @hidden */
export enum TournamentRegistrationType {
	AUTO = 1,
	OPT_IN = 2,
	BUY_IN_POINTS = 3,
	MANUAL_APPROVAL = 4,
	REQUIRES_QUALIFICATION = 5,
	// BUY_IN_CASH = 5???,
}

export type TournamentRegistrationTypeName =
	| 'AUTO'
	| 'OPT_IN'
	| 'BUY_IN_POINTS'
	| 'MANUAL_APPROVAL'
	| 'REQUIRES_QUALIFICATION'
	| 'UNKNOWN';

/** @hidden */
export const TournamentRegistrationTypeGetName = (type: TournamentRegistrationType): TournamentRegistrationTypeName => {
	return ({
		[TournamentRegistrationType.AUTO]: 'AUTO',
		[TournamentRegistrationType.BUY_IN_POINTS]: 'BUY_IN_POINTS',
		[TournamentRegistrationType.MANUAL_APPROVAL]: 'MANUAL_APPROVAL',
		[TournamentRegistrationType.OPT_IN]: 'OPT_IN',
		[TournamentRegistrationType.REQUIRES_QUALIFICATION]: 'REQUIRES_QUALIFICATION',
	}[type] || 'UNKNOWN') as any as TournamentRegistrationTypeName;
};
