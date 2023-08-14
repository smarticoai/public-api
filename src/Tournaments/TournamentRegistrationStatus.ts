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

export enum TournamentRegistrationStatusName {
    NOT_REGISTERED = 'NOT_REGISTERED',
    REGISTERED = 'REGISTERED',
    FINISHED = 'FINISHED',
    PENDING = 'PENDING',
    CANCELLED = 'CANCELLED',
    REGISTERED_PENDING_QUALIFICATION = 'REGISTERED_PENDING_QUALIFICATION',
    QUALIFIED_PENDING_REGISTRATION = 'QUALIFIED_PENDING_REGISTRATION',
    UNKNOWN = "UNKNOWN"
}

/** @hidden */
export const TournamentRegistrationStatusNamed = (type: TournamentRegistrationStatus): TournamentRegistrationStatusName => {
    return ({
        [TournamentRegistrationStatus.CANCELLED]: TournamentRegistrationStatusName.CANCELLED,
        [TournamentRegistrationStatus.FINISHED]: TournamentRegistrationStatusName.FINISHED,
        [TournamentRegistrationStatus.NOT_REGISTERED]: TournamentRegistrationStatusName.NOT_REGISTERED,
        [TournamentRegistrationStatus.PENDING]: TournamentRegistrationStatusName.PENDING,
        [TournamentRegistrationStatus.QUALIFIED_PENDING_REGISTRATION]: TournamentRegistrationStatusName.QUALIFIED_PENDING_REGISTRATION,
        [TournamentRegistrationStatus.REGISTERED]: TournamentRegistrationStatusName.REGISTERED,
        [TournamentRegistrationStatus.REGISTERED_PENDING_QUALIFICATION]: TournamentRegistrationStatusName.REGISTERED_PENDING_QUALIFICATION
    }[type] || TournamentRegistrationStatusName.UNKNOWN) as TournamentRegistrationStatusName;
}    

