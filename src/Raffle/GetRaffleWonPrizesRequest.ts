import { ProtocolMessage } from "../Base/ProtocolMessage";

export interface GetRaffleWonPrizesRequest extends ProtocolMessage {
    /** ID of the raffle to fetch the current user's won prizes for. */
    raffle_id: number;

    /** Zero-based index of the first won-prize row to return (pagination). */
    offset: number;

    /** Maximum number of won-prize rows to return (pagination). */
    limit: number;
}
