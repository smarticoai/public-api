export enum QuizAnswersValueType {
	HomeTeam = '1',
	AwayTeam = '2',
	Draw = 'x',
	HomeTeamHomeTeam = '1/1',
	HomeTeamDraw = '1/x',
	HomeTeamAwayTeam = '1/2',
	DrawHomeTeam = 'x/1',
	DrawDraw = 'x/x',
	DrawAwayTeam = 'x/2',
	AwayTeamHomeTeam = '2/1',
	AwayTeamDraw = '2/x',
	AwayTeamAwayTeam = '2/2',
	Yes = 'yes',
	No = 'no',
	Odd = 'odd',
	Even = 'even',
	HomeOdd = '1/odd',
	HomeEven = '1/even',
	AwayOdd = '2/odd',
	AwayEven = '2/even',
}

export const quizAnswerHomeTeamReplacementText = '{quiz_home_team}';
export const quizAnswerAwayTeamReplacementText = '{quiz_away_team}';
export const quizDrawReplacementText = '{quiz_draw}';
export const quizYesReplacementText = '{yes}';
export const quizNoReplacementText = '{no}';
export const quizOddReplacementText = '{odd}';
export const quizEvenReplacementText = '{even}';
export const quizOrReplacementText = '{or}';

export const quizAnswersTrKeys = {
	[quizDrawReplacementText]: 'quizAnswer_draw',
	[quizYesReplacementText]: 'quizAnswer_yes',
	[quizNoReplacementText]: 'quizAnswer_no',
	[quizOddReplacementText]: 'quizAnswer_odd',
	[quizEvenReplacementText]: 'quizAnswer_even',
	[quizOrReplacementText]: 'quizAnswer_or',
};
