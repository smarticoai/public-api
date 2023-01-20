import { ProtocolResponse } from "../Base/ProtocolResponse";
import { TournamentRegistrationError } from "./TournamentRegistrationError";

export interface TournamentRegisterResponse extends ProtocolResponse {

    errCode?: TournamentRegistrationError;
}



