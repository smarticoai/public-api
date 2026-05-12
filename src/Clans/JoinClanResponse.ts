import { ProtocolResponse } from '../Base/ProtocolResponse';
import { JoinClanErrorCode } from './JoinClanErrorCode';

export interface JoinClanResponse extends ProtocolResponse {
	errCode?: JoinClanErrorCode;
	errMsg?: string;
}
