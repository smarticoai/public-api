import {
	QuizAnswersValueType,
	quizAnswerAwayTeamReplacementText,
	quizAnswerHomeTeamReplacementText,
	quizDrawReplacementText,
	quizEvenReplacementText,
	quizNoReplacementText,
	quizOddReplacementText,
	quizOrReplacementText,
	quizYesReplacementText,
} from './MarketsAnswers'
import { SAWGPMarketType } from './MarketsType'

const yesNoAnswers = [
	{ text: quizYesReplacementText, value: QuizAnswersValueType.Yes },
	{ text: quizNoReplacementText, value: QuizAnswersValueType.No },
]

const homeAwayAnswers = [
	{ text: quizAnswerHomeTeamReplacementText, value: QuizAnswersValueType.HomeTeam },
	{ text: quizAnswerAwayTeamReplacementText, value: QuizAnswersValueType.AwayTeam },
]

const homeAwayDrawAnswers = [...homeAwayAnswers, { text: quizDrawReplacementText, value: QuizAnswersValueType.Draw }]

export const marketsInfo = [
	{
		type: SAWGPMarketType.OneXTwo,
		name: '1x2',
		question: { text: 'Who will win the match ?', trKey: 'quizQuestion_1x2' },
		answers: homeAwayDrawAnswers,
	},
	{
		type: SAWGPMarketType.OneXTwoHalftime,
		name: '1x2 Halftime',
		question: { text: 'Who will lead the first half of the match ?', trKey: 'quizQuestion_x2half' },
		answers: homeAwayDrawAnswers,
	},
	{
		type: SAWGPMarketType.HalftimeFulltime,
		name: 'Halftime / Fulltime',
		question: { text: 'Who will lead the first half and who will win the match ?', trKey: 'quizQuestion__HalftimeFulltime' },
		answers: [
			{ text: `${quizAnswerHomeTeamReplacementText} / ${quizAnswerHomeTeamReplacementText}`, value: QuizAnswersValueType.HomeTeamHomeTeam },
			{ text: `${quizAnswerHomeTeamReplacementText} / ${quizDrawReplacementText}`, value: QuizAnswersValueType.HomeTeamDraw },
			{ text: `${quizAnswerHomeTeamReplacementText} / ${quizAnswerAwayTeamReplacementText}`, value: QuizAnswersValueType.HomeTeamAwayTeam },
			{ text: `${quizDrawReplacementText} / ${quizAnswerHomeTeamReplacementText}`, value: QuizAnswersValueType.DrawHomeTeam },
			{ text: `${quizDrawReplacementText} / ${quizDrawReplacementText}`, value: QuizAnswersValueType.DrawDraw },
			{ text: `${quizDrawReplacementText} / ${quizAnswerAwayTeamReplacementText}`, value: QuizAnswersValueType.DrawAwayTeam },
			{ text: `${quizAnswerAwayTeamReplacementText} / ${quizAnswerHomeTeamReplacementText}`, value: QuizAnswersValueType.AwayTeamHomeTeam },
			{ text: `${quizAnswerAwayTeamReplacementText} / ${quizDrawReplacementText}`, value: QuizAnswersValueType.AwayTeamDraw },
			{ text: `${quizAnswerAwayTeamReplacementText} / ${quizAnswerAwayTeamReplacementText}`, value: QuizAnswersValueType.AwayTeamAwayTeam },
		],
	},
	{
		type: SAWGPMarketType.FirstGoal,
		name: 'First Goal',
		question: { text: 'Who will score the first goal ?', trKey: 'quizQuestion_firstGoal' },
		answers: homeAwayDrawAnswers,
	},
	{
		type: SAWGPMarketType.LastGoal,
		name: 'Last Goal',
		question: { text: 'Who will score the last goal ?', trKey: 'quizQuestion_lastGoal' },
		answers: homeAwayAnswers,
	},
	{
		type: SAWGPMarketType.DoubleChance,
		name: 'Double Chance',
		question: { text: 'Who will win the match? Choose a combination:', trKey: 'quizQuestion_doubleChance' },
		answers: [
			{ text: `${quizDrawReplacementText} ${quizOrReplacementText} ${quizAnswerHomeTeamReplacementText}`, value: QuizAnswersValueType.HomeTeamDraw },
			{ text: `${quizAnswerHomeTeamReplacementText} ${quizOrReplacementText} ${quizAnswerAwayTeamReplacementText}`, value: QuizAnswersValueType.HomeTeamAwayTeam },
			{ text: `${quizDrawReplacementText} ${quizOrReplacementText} ${quizAnswerAwayTeamReplacementText}`, value: QuizAnswersValueType.AwayTeamDraw },
		],
	},
	{
		type: SAWGPMarketType.OverUnder2_5,
		name: 'Over/Under 2.5',
		question: { text: 'Will there be 3 or more goals in the match?', trKey: 'quizQuestion_overUnder2_5' },
		answers: yesNoAnswers,
	},
	{
		type: SAWGPMarketType.OverUnder1_5Halftime,
		name: 'Over/Under 1.5 Halftime',
		question: { text: 'Will there be 2 or more goals in the first half?', trKey: 'quizQuestion_overUnder1_5Halftime' },
		answers: yesNoAnswers,
	},
	{
		type: SAWGPMarketType.OverUnder1_5__2ndHalf,
		name: 'Over/Under 1.5 2nd Half',
		question: { text: 'Will there be 2 or more goals in the second half?', trKey: 'quizQuestion_overUnder1_5__2ndHalf' },
		answers: yesNoAnswers,
	},
	{
		type: SAWGPMarketType.RedCard,
		name: 'Red Card',
		question: { text: 'Will there be a red card in the match?', trKey: 'quizQuestion_redCard' },
		answers: yesNoAnswers,
	},
	{
		type: SAWGPMarketType.TotalCorners8_5,
		name: 'Total Corners 8.5',
		question: { text: 'Will there be 9 or more corners in the match?', trKey: 'quizQuestion_totalCorners8_5' },
		answers: yesNoAnswers,
	},
	{
		type: SAWGPMarketType.TotalCorners9_5,
		name: 'Total Corners 9.5',
		question: { text: 'Will there be 10 or more corners in the match?', trKey: 'quizQuestion_totalCorners9_5' },
		answers: yesNoAnswers,
	},
	{
		type: SAWGPMarketType.Corners1x2,
		name: 'Corners 1x2',
		question: { text: 'Which team will have more corners in the match?', trKey: 'quizQuestion_corners1x2' },
		answers: homeAwayAnswers,
	},
	{
		type: SAWGPMarketType.One_Two,
		name: '1-2',
		question: { text: 'Who will win the match ?', trKey: 'quizQuestion_1-2' },
		answers: homeAwayAnswers,
	},
	{
		type: SAWGPMarketType.Overtime,
		name: 'Overtime',
		question: { text: 'Will there be overtime in the match?', trKey: 'quizQuestion_overtime' },
		answers: yesNoAnswers,
	},
	{
		type: SAWGPMarketType.OddEven,
		name: 'Odd/Even',
		question: { text: 'Is the sum of all points scored in the game going to be an odd number or even?', trKey: 'quizQuestion_oddEven' },
		answers: [
			{ text: quizOddReplacementText, value: QuizAnswersValueType.Odd },
			{ text: quizEvenReplacementText, value: QuizAnswersValueType.Even },
		],
	},
	{
		type: SAWGPMarketType.OddEvenHomeAway,
		name: 'Odd/Even Home/Away',
		question: { text: 'Which team will win and what will be the sum of the points (Odd or Even)?', trKey: 'quizQuestion_oddEvenHomeAway' },
		answers: [
			{ text: `${quizAnswerHomeTeamReplacementText} - ${quizOddReplacementText}`, value: QuizAnswersValueType.HomeOdd },
			{ text: `${quizAnswerHomeTeamReplacementText} - ${quizEvenReplacementText}`, value: QuizAnswersValueType.HomeEven },
			{ text: `${quizAnswerAwayTeamReplacementText} - ${quizOddReplacementText}`, value: QuizAnswersValueType.AwayOdd },
			{ text: `${quizAnswerAwayTeamReplacementText} - ${quizEvenReplacementText}`, value: QuizAnswersValueType.AwayEven },
		],
	},
	{
		type: SAWGPMarketType.FirstSet,
		name: 'First Set',
		question: { text: 'Who will win the first set ?', trKey: 'quizQuestion_firstSet' },
		answers: homeAwayAnswers,
	},
	{
		type: SAWGPMarketType.SecondSet,
		name: 'Second Set',
		question: { text: 'Who will win the second set ?', trKey: 'quizQuestion_secondSet' },
		answers: homeAwayAnswers,
	},
	{
		type: SAWGPMarketType.ThirdSet,
		name: 'Third Set',
		question: { text: 'Who will win the third set ?', trKey: 'quizQuestion_thirdSet' },
		answers: homeAwayAnswers,
	},
	{
		type: SAWGPMarketType.FourthSet,
		name: 'Fourth Set',
		question: { text: 'Who will win the fourth set ?', trKey: 'quizQuestion_fourthSet' },
		answers: homeAwayAnswers,
	},
	{
		type: SAWGPMarketType.FifthSet,
		name: 'Fifth Set',
		question: { text: 'Who will win the fifth set ?', trKey: 'quizQuestion_fifthSet' },
		answers: homeAwayAnswers,
	},
	{
		type: SAWGPMarketType.PlayerOneWinsOneSet,
		name: 'Player One Wins One Set',
		question: { text: 'Will Player One win at least one set?', trKey: 'quizQuestion_playerOneWinsOneSet' },
		answers: yesNoAnswers,
	},
	{
		type: SAWGPMarketType.PlayerTwoWinsOneSet,
		name: 'Player Two Wins One Set',
		question: { text: 'Will Player Two win at least one set?', trKey: 'quizQuestion_playerTwoWinsOneSet' },
		answers: yesNoAnswers,
	},
]
