import { ProtocolMessage } from '../Base/ProtocolMessage';

export interface GetDrawRunRequest extends ProtocolMessage {
    raffle_id: number;
    run_id: number;
}
