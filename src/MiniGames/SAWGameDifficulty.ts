export enum SAWGameDifficultyType {
	EASY = 1,
	MEDIUM = 2,
	HARD = 3,
}

export enum SAWGameDifficultyTypeName {
	EASY = 'easy',
	MEDIUM = 'medium',
	HARD = 'hard',
}

/** @hidden */
export const SawGameDifficultyTypeNamed = (type: SAWGameDifficultyType): SAWGameDifficultyTypeName => {
	return (
		{
			[SAWGameDifficultyType.EASY]: SAWGameDifficultyTypeName.EASY,
			[SAWGameDifficultyType.MEDIUM]: SAWGameDifficultyTypeName.MEDIUM,
			[SAWGameDifficultyType.HARD]: SAWGameDifficultyTypeName.HARD,
		}[type]
	);
};
