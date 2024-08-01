export enum TournamentInstanceStatus {
	PUBLISHED = 1,
	REGISTER = 2,
	STARTED = 3,
	FINISHED = 4,
	CANCELLED = 5,
	FAILED = 6,
	FINALIZING = 7,
}

export const TournamentInstanceStatusName = (s: TournamentInstanceStatus): string => {
	return {
		[TournamentInstanceStatus.PUBLISHED]: 'PUBLISHED',
		[TournamentInstanceStatus.REGISTER]: 'REGISTER',
		[TournamentInstanceStatus.STARTED]: 'STARTED',
		[TournamentInstanceStatus.FINISHED]: 'FINISHED',
		[TournamentInstanceStatus.CANCELLED]: 'CANCELLED',
		[TournamentInstanceStatus.FAILED]: 'FAILED',
		[TournamentInstanceStatus.FINALIZING]: 'FINALIZING',
	}[s];
};
