/** @hidden */
export enum SAWPrizeType {
	NO_PRIZE = 1,
	POINTS = 2,
	BONUS = 3,
	MANUAL = 4,
	SPIN = 5,
	JACKPOT = 6,
}

export enum MiniGamePrizeTypeName {
	NO_PRIZE = 'no-prize',
	POINTS = 'points',
	BONUS = 'bonus',
	MANUAL = 'manual',
	SPIN = 'spin',
	JACKPOT = 'jackpot',
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
		}[type] || MiniGamePrizeTypeName.UNKNOWN
	);
};
