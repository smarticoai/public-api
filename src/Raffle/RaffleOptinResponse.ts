import { ProtocolResponse } from "../Base/ProtocolResponse";
import { TRaffleOptin } from "../WSAPI/WSAPITypes";

export interface RaffleOptinResponse extends ProtocolResponse {
	errCode: number;
	errMsg?: string;
	cid: number;
	ts: number;
	uuid: string;
	payload?: null | Record<string, unknown>;
	duration?: null | number;
}

/** @hidden */
export const raffleOptinResponseTransform = (info: RaffleOptinResponse): TRaffleOptin => {
    return {
        errorCode: info.errCode,
        errorMessage: info.errMsg,
        cid: info.cid,
        ts: info.ts,
        uuid: info.uuid,
        payload: info.payload,
        duration: info.duration
    }
}
