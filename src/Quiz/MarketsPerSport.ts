import { SAWGPMarketType } from './MarketsType';
import { QuizSportType } from './SportTypes';

export const QuizMarketPerSport = {
	[QuizSportType.Basketball]: [
		SAWGPMarketType.One_Two,
		SAWGPMarketType.Overtime,
		SAWGPMarketType.OneXTwo,
		SAWGPMarketType.OddEven,
		SAWGPMarketType.OddEvenHomeAway,
		SAWGPMarketType.DoubleChance,
	],
	[QuizSportType.Soccer]: [
		SAWGPMarketType.OneXTwo,
		SAWGPMarketType.OneXTwoHalftime,
		// SAWGPMarketType.HalftimeFulltime,
		SAWGPMarketType.FirstGoal,
		SAWGPMarketType.LastGoal,
		SAWGPMarketType.DoubleChance,
		SAWGPMarketType.OverUnder2_5,
		SAWGPMarketType.OverUnder1_5Halftime,
		SAWGPMarketType.OverUnder1_5__2ndHalf,
		SAWGPMarketType.RedCard,
		SAWGPMarketType.TotalCorners8_5,
		SAWGPMarketType.TotalCorners9_5,
		SAWGPMarketType.Corners1x2,
	],
	[QuizSportType.Tennis]: [
		SAWGPMarketType.One_Two,
		SAWGPMarketType.FirstSet,
		SAWGPMarketType.SecondSet,
		SAWGPMarketType.ThirdSet,
		SAWGPMarketType.FourthSet,
		SAWGPMarketType.FifthSet,
		SAWGPMarketType.PlayerOneWinsOneSet,
		SAWGPMarketType.PlayerTwoWinsOneSet,
		SAWGPMarketType.OddEven,
	],
};
