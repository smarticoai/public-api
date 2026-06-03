type TeamType = 'Home' | 'Away';
type CardType = 'Yellow' | 'Red' | 'YellowRed';
type TimeType = 'FT' | '1st Half' | '2nd Half';

export type OverHalfFullTimeScoreType = {
	home: number;
	away: number;
};

export type CardScoreType = {
	time: 'string';
	type: CardType;
	player: string;
};

export type CornerScoreType = {
	team: TeamType;
	timeType: TimeType;
	totalCount: number;
};

export type GoalScoreType = {
	team: TeamType;
	time: string;
	player: string;
	matchScore: OverHalfFullTimeScoreType;
};

export type SetsScoreType = {
	set: number;
	setScore: OverHalfFullTimeScoreType;
};
