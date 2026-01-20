export enum SAWGameType {
	SpinAWheel = 1,
	ScratchCard = 2,
	MatchX = 3,
	GiftBox = 4,
	PrizeDrop = 5,
	Quiz = 6,
	LootboxWeekdays = 7,
	LootboxCalendarDays = 8,
	TreasureHunt = 9,
	Voyager = 10,
	Plinko = 11,
	СoinFlip = 12,
}

export enum SAWGameTypeName {
	SpinAWheel = 'wheel',
	ScratchCard = 'scratch',
	MatchX = 'matchx',
	GiftBox = 'giftbox',
	PrizeDrop = 'prizedrop',
	Quiz = 'quiz',
	LootboxWeekdays = 'lootbox_weekdays',
	LootboxCalendarDays = 'lootbox_calendar_days',
	TreasureHunt = 'treasure_hunt',
	Voyager = 'voyager',
	Plinko = 'plinko',
	СoinFlip = 'coin_flip',
	Unknown = 'unknown',
}

/** @hidden */
export const SAWGameTypeNamed = (type: SAWGameType): SAWGameTypeName => {
	return (
		{
			[SAWGameType.SpinAWheel]: SAWGameTypeName.SpinAWheel,
			[SAWGameType.ScratchCard]: SAWGameTypeName.ScratchCard,
			[SAWGameType.MatchX]: SAWGameTypeName.MatchX,
			[SAWGameType.GiftBox]: SAWGameTypeName.GiftBox,
			[SAWGameType.PrizeDrop]: SAWGameTypeName.PrizeDrop,
			[SAWGameType.Quiz]: SAWGameTypeName.Quiz,
			[SAWGameType.LootboxWeekdays]: SAWGameTypeName.LootboxWeekdays,
			[SAWGameType.LootboxCalendarDays]: SAWGameTypeName.LootboxCalendarDays,
			[SAWGameType.TreasureHunt]: SAWGameTypeName.TreasureHunt,
			[SAWGameType.Voyager]: SAWGameTypeName.Voyager,
			[SAWGameType.Plinko]: SAWGameTypeName.Plinko,
			[SAWGameType.СoinFlip]: SAWGameTypeName.СoinFlip,
		}[type] || SAWGameTypeName.Unknown
	);
};
