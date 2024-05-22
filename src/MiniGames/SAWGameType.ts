/** @hidden */

export enum SAWGameType {
    SpinAWheel = 1,
    ScratchCard = 2,
    MatchX = 3,
    GiftBox = 4,
    PrizeDrop = 5
}

export enum SAWGameTypeName {
    SpinAWheel = "wheel",
    ScratchCard = "scratch",
    MatchX = "matchx",
    GiftBox = "giftbox",
    PrizeDrop = "prizedrop",
    Unknown = "unknown"
}

/** @hidden */
export const SAWGameTypeNamed = (type: SAWGameType): SAWGameTypeName => {
    return {
        [SAWGameType.SpinAWheel]: SAWGameTypeName.SpinAWheel,
        [SAWGameType.ScratchCard]: SAWGameTypeName.ScratchCard,
        [SAWGameType.MatchX]: SAWGameTypeName.MatchX,
        [SAWGameType.GiftBox]: SAWGameTypeName.GiftBox,
        [SAWGameType.PrizeDrop]: SAWGameTypeName.PrizeDrop
    }[type] || SAWGameTypeName.Unknown;
}
