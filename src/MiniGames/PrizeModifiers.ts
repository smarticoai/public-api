export enum PrizeModifiers {
    '2x' = 2,
    '5x' = 5,
    '10x' = 10,
    '/2' = -2,
    '/5' = -5,
    '/10' = -10,
    Reset = 0,
}

export const PrizeModifiersKeysNames = {
    [PrizeModifiers['2x']]: '2x',
    [PrizeModifiers['5x']]: '5x',
    [PrizeModifiers['10x']]: '10x',
    [PrizeModifiers['/2']]: '/2',
    [PrizeModifiers['/5']]: '/5',
    [PrizeModifiers['/10']]: '/10',
    [PrizeModifiers['Reset']]: 'Reset to 0',
};