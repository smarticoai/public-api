export enum SAWExposeUserSpinId {
    UserId = 1,
    SpinId = 2,
}

export enum SAWExposeUserSpinIdName {
    UserId = 'userId',
    SpinId = 'spinId',
}

/** @hidden */
export const SAWExposeUserSpinIdNamed = (id: SAWExposeUserSpinId): SAWExposeUserSpinIdName => {
    return (
        {
            [SAWExposeUserSpinId.UserId]: SAWExposeUserSpinIdName.UserId,
            [SAWExposeUserSpinId.SpinId]: SAWExposeUserSpinIdName.SpinId,
        }[id]
    );
};