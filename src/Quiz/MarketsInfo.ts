import { QuizMarketType } from "./MarketsType";

const quizAnswerHomeTeamReplacementText = '%HomeTeam%';
const quizAnswerAwayTeamReplacementText = '%AwayTeam%';

export const marketsInfo = [
    {
        type: QuizMarketType.OneXTwo,
        name: '1X2',
        question: { text: 'Who will win the match ?', trKey: 'quiz_answer_1x2' },
        answers: [
            { text: quizAnswerHomeTeamReplacementText, trKey: 'quiz_answer_1x2_home' },
            { text: 'Draw', trKey: 'quiz_answer_1x2_draw' },
            { text: quizAnswerAwayTeamReplacementText, trKey: 'quiz_answer_1x2_away' }
        ]
    }
]