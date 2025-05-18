import { TransformedRaffleClaimPrizeResponse } from "../WSAPI/WSAPITypes";
import { ProtocolResponse } from "../Base/ProtocolResponse";

export interface RaffleClaimPrizeResponse extends ProtocolResponse { 
    errCode: number
    errMsg?: string
}


export const raffleClaimPrizeResponseTransform = (info: RaffleClaimPrizeResponse): TransformedRaffleClaimPrizeResponse => {
    return {
        errorCode: info.errCode,
        errorMessage: info.errMsg
    }
}



