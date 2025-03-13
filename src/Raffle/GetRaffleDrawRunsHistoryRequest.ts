import { ProtocolMessage } from "../Base/ProtocolMessage";

export interface GetRaffleDrawRunsHistoryRequest extends ProtocolMessage {
    raffle_id: number;
    draw_id: number;
}