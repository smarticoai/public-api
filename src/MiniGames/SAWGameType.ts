/** @hidden */

export enum SAWGameType {
    SpinAWheel = 1,
    ScratchCard = 2,
    MatchX = 3,
    GiftBox = 4
}

export enum SAWGameTypeName {
    SpinAWheel = "wheel",
    ScratchCard = "scratch",
    MatchX = "matchx",
    GiftBox = "giftbox",
    Unknown = "unknown"
}

/** @hidden */
export const SAWGameTypeNamed = (type: SAWGameType): SAWGameTypeName => {
    return {
        [SAWGameType.SpinAWheel]: SAWGameTypeName.SpinAWheel,
        [SAWGameType.ScratchCard]: SAWGameTypeName.ScratchCard,
        [SAWGameType.MatchX]: SAWGameTypeName.MatchX,
        [SAWGameType.GiftBox]: SAWGameTypeName.GiftBox
    }[type] || SAWGameTypeName.Unknown;
}
