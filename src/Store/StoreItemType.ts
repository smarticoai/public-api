export enum StoreItemType {
	Bonus = 1,
	Tangible = 2,
	MiniGameSpin = 3,
	ChangeLevel = 4,
	PrizeDrop = 5,
	RaffleTicket = 6,
}

export enum StoreItemTypeName {
	Bonus = 'bonus',
	Tangible = 'tangible',
	MiniGameSpin = 'minigamespin',
	ChangeLevel = 'changelevel',
	PrizeDrop = 'prizedrop',
	RaffleTicket = 'raffleticket',
	Unknown = 'unknown',
}

export const StoreItemTypeNamed = (type: StoreItemType): StoreItemTypeName => {
	return (
		{
			[StoreItemType.Bonus]: StoreItemTypeName.Bonus,
			[StoreItemType.Tangible]: StoreItemTypeName.Bonus,
			[StoreItemType.MiniGameSpin]: StoreItemTypeName.MiniGameSpin,
			[StoreItemType.ChangeLevel]: StoreItemTypeName.ChangeLevel,
			[StoreItemType.PrizeDrop]: StoreItemTypeName.PrizeDrop,
			[StoreItemType.RaffleTicket]: StoreItemTypeName.RaffleTicket,
		}[type] || StoreItemTypeName.Unknown
	);
};
