import { ProtocolResponse } from "../Base/ProtocolResponse";
import {Tournament} from "./Tournament";

export interface GetTournamentsResponse extends ProtocolResponse {

    /** array of the tournaments */
    tournaments?: Tournament[];
}
