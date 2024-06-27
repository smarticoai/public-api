import { MarketsValueType } from "./MarketsAnswersType";
import { QuizMarketType } from "./MarketsType";

export const quizAnswerHomeTeamReplacementText = '{quiz_home_team}';
export const quizAnswerAwayTeamReplacementText = '{quiz_away_team}';
export const quizDrawReplacementText = '{quiz_draw}';
export const quizYesReplacementText = '{yes}';
export const quizNoReplacementText = '{no}';
export const quizOddReplacementText = '{odd}';
export const quizEvenReplacementText = '{even}';
export const quizOrReplacementText = '{or}';

const yesNoAnswers = [
    { text: quizYesReplacementText, value: MarketsValueType.Yes },
    { text: quizNoReplacementText, value: MarketsValueType.No }
]

const homeAwayAnswers = [
    { text: quizAnswerHomeTeamReplacementText, value: MarketsValueType.HomeTeam },
    { text: quizAnswerAwayTeamReplacementText, value: MarketsValueType.AwayTeam }
]

const homeAwayDrawAnswers = [
    ...homeAwayAnswers,
    { text: quizDrawReplacementText, value: MarketsValueType.Draw },
]

export const marketsInfo = [
    {
        type: QuizMarketType.OneXTwo,
        name: '1x2',
        question: { text: 'Who will win the match ?', trKey: 'quizQuestion_1x2'},
        answers: homeAwayDrawAnswers
    },
    {
        type: QuizMarketType.OneXTwoHalftime,
        name: '1x2 Halftime',
        question: { text: 'Who will lead the first half of the match ?', trKey: 'quizQuestion_x2half' },
        answers: homeAwayDrawAnswers
    },
    {
        type: QuizMarketType.HalftimeFulltime,
        name: 'Halftime / Fulltime',
        question: { text: 'Who will lead the first half and who will win the match ?', trKey: 'quizQuestion__HalftimeFulltime' },
        answers: [
            { text: `${quizAnswerHomeTeamReplacementText} / ${quizAnswerHomeTeamReplacementText}`, value: MarketsValueType.HomeTeamHomeTeam },
            { text: `${quizAnswerHomeTeamReplacementText} / ${quizDrawReplacementText}`, value: MarketsValueType.HomeTeamDraw },
            { text: `${quizAnswerHomeTeamReplacementText} / ${quizAnswerAwayTeamReplacementText}`,  value: MarketsValueType.HomeTeamAwayTeam },
            { text: `${quizDrawReplacementText} / ${quizAnswerHomeTeamReplacementText}`, value: MarketsValueType.DrawHomeTeam },
            { text: `${quizDrawReplacementText} / ${quizDrawReplacementText}`,  value: MarketsValueType.DrawDraw },
            { text: `${quizDrawReplacementText} / ${quizAnswerAwayTeamReplacementText}`, value: MarketsValueType.DrawAwayTeam },
            { text: `${quizAnswerAwayTeamReplacementText} / ${quizAnswerHomeTeamReplacementText}`, value: MarketsValueType.AwayTeamHomeTeam },
            { text: `${quizAnswerAwayTeamReplacementText} / ${quizDrawReplacementText}`,  value: MarketsValueType.AwayTeamDraw },
            { text: `${quizAnswerAwayTeamReplacementText} / ${quizAnswerAwayTeamReplacementText}`, value: MarketsValueType.AwayTeamAwayTeam }
        ]
    },
    {
        type: QuizMarketType.FirstGoal,
        name: 'First Goal',
        question: { text: 'Who will score the first goal ?', trKey: 'quizQuestion_firstGoal' },
        answers: homeAwayDrawAnswers
    },
    {
        type: QuizMarketType.LastGoal,
        name: 'Last Goal',
        question: { text: 'Who will score the last goal ?', trKey: 'quizQuestion_lastGoal' },
        answers: homeAwayAnswers
    },
    {
        type: QuizMarketType.DoubleChance,
        name: 'Double Chance',
        question: { text: 'Who will win the match? Choose a combination: ?', trKey: 'quizQuestion_doubleChance' },
        answers: [
            { text: `${quizDrawReplacementText} ${quizOrReplacementText} ${quizAnswerHomeTeamReplacementText}`, value: MarketsValueType.HomeTeamDraw },
            { text: `${quizAnswerHomeTeamReplacementText} ${quizOrReplacementText} ${quizAnswerAwayTeamReplacementText}`, value: MarketsValueType.HomeTeamAwayTeam },
            { text: `${quizDrawReplacementText} ${quizOrReplacementText} ${quizAnswerAwayTeamReplacementText}`, value: MarketsValueType.AwayTeamDraw }
        ]
    },
    {
        type: QuizMarketType.OverUnder2_5,
        name: 'Over/Under 2.5',
        question: { text: 'Will there be 3 or more goals in the match?', trKey: 'quizQuestion_overUnder2_5' },
        answers: yesNoAnswers
    },
    {
        type: QuizMarketType.OverUnder1_5Halftime,
        name: 'Over/Under 1.5 Halftime',
        question: { text: 'Will there be 2 or more goals in the first half?', trKey: 'quizQuestion_overUnder1_5Halftime' },
        answers: yesNoAnswers
    },
    {
        type: QuizMarketType.OverUnder1_5__2ndHalf,
        name: 'Over/Under 1.5 2nd Half',
        question: { text: 'Will there be 2 or more goals in the second half?', trKey: 'quizQuestion_overUnder1_5__2ndHalf' },
        answers: yesNoAnswers
    },
    {
        type: QuizMarketType.RedCard,
        name: 'Red Card',
        question: { text: 'Will there be a red card in the match?', trKey: 'quizQuestion_redCard' },
        answers: yesNoAnswers
    },
    {
        type: QuizMarketType.TotalCorners8_5,
        name: 'Total Corners 8.5',
        question: { text: 'Will there be 9 or more corners in the match?', trKey: 'quizQuestion_totalCorners8_5' },
        answers: yesNoAnswers
    },
    {
        type: QuizMarketType.TotalCorners9_5,
        name: 'Total Corners 9.5',
        question: { text: 'Will there be 10 or more corners in the match?', trKey: 'quizQuestion_totalCorners9_5' },
        answers: yesNoAnswers
    },
    {
        type: QuizMarketType.Corners1x2,
        name: 'Corners 1x2',
        question: { text: 'Which team will have more corners in the match?', trKey: 'quizQuestion_corners1x2' },
        answers: homeAwayAnswers
    },
    {
        type: QuizMarketType.One_Two,
        name: '1-2',
        question: { text: 'Who will win the match ?', trKey: 'quizQuestion_1-2'},
        answers: homeAwayAnswers
    },
    {
        type: QuizMarketType.Overtime,
        name: 'Overtime',
        question: { text: 'Will there be overtime in the match?', trKey: 'quizQuestion_overtime' },
        answers: yesNoAnswers
    },
    {
        type: QuizMarketType.OddEven,
        name: 'Odd/Even',
        question: { text: 'Is the sum of all points scored in the game going to be an odd number or even?', trKey: 'quizQuestion_oddEven' },
        answers: [
            { text: quizOddReplacementText, value: MarketsValueType.Odd },
            { text: quizEvenReplacementText, value: MarketsValueType.Even }
        ]
    },
    {
        type: QuizMarketType.OddEvenHomeAway,
        name: 'Odd/Even Home/Away',
        question: { text: 'Which team will win and what will be the sum of the points (Odd or Even)?', trKey: 'quizQuestion_oddEvenHomeAway' },
        answers: [
            { text: `${quizAnswerHomeTeamReplacementText} - ${quizOddReplacementText}`, value: MarketsValueType.HomeOdd },
            { text: `${quizAnswerHomeTeamReplacementText} - ${quizEvenReplacementText}`, value: MarketsValueType.HomeEven },
            { text: `${quizAnswerAwayTeamReplacementText} - ${quizOddReplacementText}`, value: MarketsValueType.AwayOdd },
            { text: `${quizAnswerAwayTeamReplacementText} - ${quizEvenReplacementText}`, value: MarketsValueType.AwayEven }
        ]
    },
    {
        type: QuizMarketType.FirstSet,
        name: 'First Set',
        question: { text: 'Who will win the first set ?', trKey: 'quizQuestion_firstSet' },
        answers: homeAwayAnswers
    },
    {
        type: QuizMarketType.SecondSet,
        name: 'Second Set',
        question: { text: 'Who will win the second set ?', trKey: 'quizQuestion_secondSet' },
        answers: homeAwayAnswers
    },
    {
        type: QuizMarketType.ThirdSet,
        name: 'Third Set',
        question: { text: 'Who will win the third set ?', trKey: 'quizQuestion_thirdSet' },
        answers: homeAwayAnswers
    },
    {
        type: QuizMarketType.FourthSet,
        name: 'Fourth Set',
        question: { text: 'Who will win the fourth set ?', trKey: 'quizQuestion_fourthSet' },
        answers: homeAwayAnswers
    },
    {
        type: QuizMarketType.FifthSet,
        name: 'Fifth Set',
        question: { text: 'Who will win the fifth set ?', trKey: 'quizQuestion_fifthSet' },
        answers: homeAwayAnswers
    },
    {
        type: QuizMarketType.PlayerOneWinsOneSet,
        name: 'Player One Wins One Set',
        question: { text: 'Will Player One win at least one set?', trKey: 'quizQuestion_playerOneWinsOneSet' },
        answers: yesNoAnswers
    },
    {
        type: QuizMarketType.PlayerTwoWinsOneSet,
        name: 'Player Two Wins One Set',
        question: { text: 'Will Player Two win at least one set?', trKey: 'quizQuestion_playerTwoWinsOneSet' },
        answers: yesNoAnswers
    },
]