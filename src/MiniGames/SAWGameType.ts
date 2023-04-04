export enum SAWGameType {
    SpinAWheel = 1,
    ScratchCard = 2,
    MatchX = 3,
    GiftBox = 4
}

export const SAWGameTypeName = {
    [SAWGameType.SpinAWheel]: "wheel",
    [SAWGameType.ScratchCard]: "scratch",
    [SAWGameType.MatchX]: "matchx",
    [SAWGameType.GiftBox]: "giftbox",
}
