import { ProtocolResponse } from '../Base/ProtocolResponse';

export interface JoinClanResponse extends ProtocolResponse {
	errCode?: number;
	errMsg?: string;
}
