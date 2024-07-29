export const ErrorCodes_FatalStartingRange = 100000

export enum ErrorCodesGame {
	OK = 0,
	NoBetsUpdatedOnSubmit = 3,
	RepeatRequest_Unhandled = 4,

	// Fatal errors starting from 100 000
	Fatal_NotValidHash = ErrorCodes_FatalStartingRange,
	Fatal_WrongCustomerID = ErrorCodes_FatalStartingRange + 1,
	Fatal_TemplateNotFound = ErrorCodes_FatalStartingRange + 2,
	Fatal_NoOpenRounds = ErrorCodes_FatalStartingRange + 3,
	Fatal_Unhandled = ErrorCodes_FatalStartingRange + 4,
}

export type ErrorCodes = ErrorCodesGame
