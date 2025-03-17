import { ProtocolMessage } from "../Base/ProtocolMessage";

export interface GetRaffleDrawRunsHistoryRequest extends ProtocolMessage {
    raffle_id: number;
    
    /**
     * If draw_id is not passed all draw runs that belong to raffle with passed raffle_id will be returned.
     */
    draw_id: number;
}