export enum PrizeModifiers {
    '2x' = 1,
    '5x' = 2,
    '10x' = 3,
    '/2' = 4,
    '/5' = 5,
    '/10' = 6,
    '0x' = 7,
    "reset" = 8,
}

export const PrizeModifiersKeysNames = {
    [PrizeModifiers['2x']]: '2x',
    [PrizeModifiers['5x']]: '5x',
    [PrizeModifiers['10x']]: '10x',
    [PrizeModifiers['/2']]: '/2',
    [PrizeModifiers['/5']]: '/5',
    [PrizeModifiers['/10']]: '/10',
    [PrizeModifiers['0x']]: '0',
    [PrizeModifiers['reset']]: 'Reset to 0',
};