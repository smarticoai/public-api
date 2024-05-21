import { ProtocolMessage } from "../Base/ProtocolMessage";

export interface  GetJackpotsPotsRequest extends ProtocolMessage {
    pot_ids: number[];
}
