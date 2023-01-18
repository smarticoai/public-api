import { ProtocolResponse } from "../ProtocolResponse";


export enum SAWSpinErrorCode {
    SAW_OK = 0,
    SAW_NO_SPINS = 40001,
    SAW_PRIZE_POOL_EMPTY = 40002,
    SAW_NOT_ENOUGH_POINTS = 40003,
    SAW_FAILED_MAX_SPINS_REACHED = 40004,
}

export interface SAWDoSpinResponse extends ProtocolResponse {
    errCode: SAWSpinErrorCode;
    errMsg?: string;
    request_id: string; // guid
    saw_prize_id: number;
    first_spin_in_period: number;
};
