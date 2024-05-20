import { QuizMarketType } from "./MarketsType";
import { QuizSportType } from "./SportTypes";

export const QuizMarketPerSport = {
    [QuizSportType.Basketball]: [
        QuizMarketType.One_Two,
        QuizMarketType.Overtime,
        QuizMarketType.OneXTwo,
        QuizMarketType.OddEven,
        QuizMarketType.OddEvenHomeAway,
        QuizMarketType.DoubleChance,
    ],
    [QuizSportType.Soccer]: [
        QuizMarketType.OneXTwo,
        QuizMarketType.OneXTwoHalftime,
        QuizMarketType.HalftimeFulltime,
        QuizMarketType.FirstGoal,
        QuizMarketType.LastGoal,
        QuizMarketType.DoubleChance,
        QuizMarketType.OverUnder2_5,
        QuizMarketType.OverUnder1_5Halftime,
        QuizMarketType.OverUnder1_5__2ndHalf,
        QuizMarketType.RedCard,
        QuizMarketType.TotalCorners8_5,
        QuizMarketType.TotalCorners9_5,
        QuizMarketType.Corners1x2,
    ],
    [QuizSportType.Tennis]: [
        QuizMarketType.One_Two,
        QuizMarketType.FirstSet,
        QuizMarketType.SecondSet,
        QuizMarketType.ThirdSet,
        QuizMarketType.FourthSet,
        QuizMarketType.FifthSet,
        QuizMarketType.PlayerOneWinsOneSet,
        QuizMarketType.PlayerTwoWinsOneSet,
        QuizMarketType.OddEven
    ]
}