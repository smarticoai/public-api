import { ProtocolResponse } from "./../Base/ProtocolResponse";
import { SAWSpinErrorCode } from "./SAWSpinErrorCode";


export interface SAWDoSpinResponse extends ProtocolResponse {
    errCode: SAWSpinErrorCode;
    errMsg?: string;
    request_id: string; // guid
    saw_prize_id: number;
    first_spin_in_period: number;
};
