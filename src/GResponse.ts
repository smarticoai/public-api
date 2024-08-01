import { ErrorCodes } from './ErrorCodes';

interface GResponseBase {
	errCode: ErrorCodes;
	errMessage?: string;
}

interface GResponse<T> extends GResponseBase {
	data?: T;
}

export { GResponseBase, GResponse };
