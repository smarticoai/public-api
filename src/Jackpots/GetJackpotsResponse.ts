import { AchRelatedGame } from "../Base/AchRelatedGame";
import { ProtocolResponse } from "../Base/ProtocolResponse";
import { JackpotDetails } from "./JackpotDetails";

export interface  GetJackpotsResponse extends ProtocolResponse {

    items: JackpotDetails[];
}

