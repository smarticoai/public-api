import { ProtocolResponse } from "../Base/ProtocolResponse";
import { Level } from "./Level";

export interface  GetLevelMapResponse extends ProtocolResponse {

    levels: Level[];
}
