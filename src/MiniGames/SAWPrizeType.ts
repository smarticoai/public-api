/** @hidden */
export enum SAWPrizeType {
	NO_PRIZE = 1,
	POINTS = 2,
	BONUS = 3,
	MANUAL = 4,
	SPIN = 5,
	JACKPOT = 6,
	CHANGE_LEVEL = 7,
	MISSION = 8,
	RAFFLE_TICKET = 9,
	GEMS_AND_DIAMONDS = 10,
}

export enum MiniGamePrizeTypeName {
	NO_PRIZE = 'no-prize',
	POINTS = 'points',
	BONUS = 'bonus',
	MANUAL = 'manual',
	SPIN = 'spin',
	JACKPOT = 'jackpot',
	CHANGE_LEVEL = 'change-level',
	MISSION = 'mission',
	RAFFLE_TICKET = 'raffle-ticket',
	GEMS_AND_DIAMONDS = 'gems-and-diamonds',
	UNKNOWN = 'unknown',
}

/** @hidden */
export const MiniGamePrizeTypeNamed = (type: SAWPrizeType): MiniGamePrizeTypeName => {
	return (
		{
			[SAWPrizeType.NO_PRIZE]: MiniGamePrizeTypeName.NO_PRIZE,
			[SAWPrizeType.POINTS]: MiniGamePrizeTypeName.POINTS,
			[SAWPrizeType.BONUS]: MiniGamePrizeTypeName.BONUS,
			[SAWPrizeType.MANUAL]: MiniGamePrizeTypeName.MANUAL,
			[SAWPrizeType.SPIN]: MiniGamePrizeTypeName.SPIN,
			[SAWPrizeType.JACKPOT]: MiniGamePrizeTypeName.JACKPOT,
			[SAWPrizeType.CHANGE_LEVEL]: MiniGamePrizeTypeName.CHANGE_LEVEL,
			[SAWPrizeType.MISSION]: MiniGamePrizeTypeName.MISSION,
			[SAWPrizeType.RAFFLE_TICKET]: MiniGamePrizeTypeName.RAFFLE_TICKET,
			[SAWPrizeType.GEMS_AND_DIAMONDS]: MiniGamePrizeTypeName.GEMS_AND_DIAMONDS,
		}[type] || MiniGamePrizeTypeName.UNKNOWN
	);
};
