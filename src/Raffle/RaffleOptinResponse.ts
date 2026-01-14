import { ProtocolResponse } from "../Base/ProtocolResponse";

export interface RaffleOptinResponse extends ProtocolResponse {
	errCode: number;
	errMsg: string;
	cid: number;
	ts: number;
	uuid: string;
	payload?: null | Record<string, unknown>;
	duration?: null | number;
}