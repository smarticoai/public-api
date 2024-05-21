import { ProtocolResponse } from "../Base/ProtocolResponse";
import { JackpotPot } from "./JackpotPot";

export interface GetJackpotsPotsResponse extends ProtocolResponse {

    pots: JackpotPot[];
}

