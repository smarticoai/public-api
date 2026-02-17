export enum SAWGameLayout {
    Horizontal = 1,
    VerticalMap = 2,
}

export enum SAWGameLayoutName {
    Horizontal = 'horizontal',
    VerticalMap = 'vertical-map',
}

/** @hidden */
export const SAWGameLayoutNamed = (layout: SAWGameLayout): SAWGameLayoutName => {
    return (
        {
            [SAWGameLayout.Horizontal]: SAWGameLayoutName.Horizontal,
            [SAWGameLayout.VerticalMap]: SAWGameLayoutName.VerticalMap,
        }[layout]
    );
};