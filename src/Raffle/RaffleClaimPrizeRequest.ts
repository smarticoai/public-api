import { ProtocolMessage } from "../Base/ProtocolMessage";

export interface RaffleClaimPrizeRequest extends ProtocolMessage {
    won_id: number;
}
