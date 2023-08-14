/** @hidden */
export enum SAWBuyInType {
    Free = 1,
    Points = 2,
    Spins = 3
}

export enum SAWBuyInTypeName {
    Free = 'free',
    Points = 'points',
    Spins = 'spins',
    Unknown = 'unknown'
}

/** @hidden */
export const SAWBuyInTypeNamed = (type: SAWBuyInType): SAWBuyInTypeName => {
    return {
        [SAWBuyInType.Free]: SAWBuyInTypeName.Free,
        [SAWBuyInType.Points]: SAWBuyInTypeName.Points,
        [SAWBuyInType.Spins]: SAWBuyInTypeName.Spins
    }[type] || SAWBuyInTypeName.Unknown;
}