export enum SAWWinSoundType {

    Disappointing = 1,
    Positive = 2,
    HighlyPositive = 3,
    NoSound = 4
}

export const SAWWinSoundFiles = {
    [SAWWinSoundType.NoSound]: null,
    [SAWWinSoundType.Disappointing]: "saw-disappointed.m4a",
    [SAWWinSoundType.Positive]: "saw-positive.m4a",
    [SAWWinSoundType.HighlyPositive]: "saw-highly-positive.m4a",
}