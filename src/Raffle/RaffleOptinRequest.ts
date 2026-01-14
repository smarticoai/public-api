import { ProtocolMessage } from "../Base/ProtocolMessage";

export interface RaffleOptinRequest extends ProtocolMessage {
    raffle_id: number;
    draw_id: number;
    raffle_run_id: number;
}
