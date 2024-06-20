/** @hidden */

export enum SAWGameType {
    SpinAWheel = 1,
    ScratchCard = 2,
    MatchX = 3,
    GiftBox = 4,
    PrizeDrop = 5,
    Quiz = 6
}

export enum SAWGameTypeName {
    SpinAWheel = "wheel",
    ScratchCard = "scratch",
    MatchX = "matchx",
    GiftBox = "giftbox",
    PrizeDrop = "prizedrop",
    Quiz = 'quiz',
    Unknown = "unknown"
}

/** @hidden */
export const SAWGameTypeNamed = (type: SAWGameType): SAWGameTypeName => {
    return {
        [SAWGameType.SpinAWheel]: SAWGameTypeName.SpinAWheel,
        [SAWGameType.ScratchCard]: SAWGameTypeName.ScratchCard,
        [SAWGameType.MatchX]: SAWGameTypeName.MatchX,
        [SAWGameType.GiftBox]: SAWGameTypeName.GiftBox,
        [SAWGameType.PrizeDrop]: SAWGameTypeName.PrizeDrop,
        [SAWGameType.Quiz]: SAWGameTypeName.Quiz
    }[type] || SAWGameTypeName.Unknown;
}
