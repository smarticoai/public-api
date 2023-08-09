/** @hidden */
export enum TournamentRegistrationStatus {

    NOT_REGISTERED = 0,
    REGISTERED = 1,
    FINISHED = 2,
    PENDING = 3,
    CANCELLED = 4,
    REGISTERED_PENDING_QUALIFICATION = 5,
    QUALIFIED_PENDING_REGISTRATION = 6
}

export type TournamentRegistrationStatusName = 'NOT_REGISTERED' | 'REGISTERED' | 'FINISHED' | 'PENDING' | 'CANCELLED' | 'REGISTERED_PENDING_QUALIFICATION' | 'QUALIFIED_PENDING_REGISTRATION';

/** @hidden */
export const TournamentRegistrationStatusName = (type: TournamentRegistrationStatus): TournamentRegistrationStatusName => {
    return ({
        [TournamentRegistrationStatus.CANCELLED]: 'CANCELLED',
        [TournamentRegistrationStatus.FINISHED]: 'FINISHED',
        [TournamentRegistrationStatus.NOT_REGISTERED]: 'NOT_REGISTERED',
        [TournamentRegistrationStatus.PENDING]: 'PENDING',
        [TournamentRegistrationStatus.QUALIFIED_PENDING_REGISTRATION]: 'QUALIFIED_PENDING_REGISTRATION',
        [TournamentRegistrationStatus.REGISTERED]: 'REGISTERED',
        [TournamentRegistrationStatus.REGISTERED_PENDING_QUALIFICATION]: 'REGISTERED_PENDING_QUALIFICATION',
    }[type] || 'UNKNOWN') as TournamentRegistrationStatusName;
}    

