export enum SAWBuyInType {
	Free = 1,
	Points = 2,
	Spins = 3,
	Gems = 4,
	Diamonds = 5,
}

export enum SAWBuyInTypeName {
	Free = 'free',
	Points = 'points',
	Spins = 'spins',
	Unknown = 'unknown',
	Gems = 'gems',
	Diamonds = 'diamonds',
}

/** @hidden */
export const SAWBuyInTypeNamed = (type: SAWBuyInType): SAWBuyInTypeName => {
	return (
		{
			[SAWBuyInType.Free]: SAWBuyInTypeName.Free,
			[SAWBuyInType.Points]: SAWBuyInTypeName.Points,
			[SAWBuyInType.Spins]: SAWBuyInTypeName.Spins,
			[SAWBuyInType.Gems]: SAWBuyInTypeName.Gems,
			[SAWBuyInType.Diamonds]: SAWBuyInTypeName.Diamonds,
		}[type] || SAWBuyInTypeName.Unknown
	);
};
