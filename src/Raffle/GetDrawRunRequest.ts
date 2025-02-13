import { ProtocolMessage } from '../Base/ProtocolMessage';

export interface GetDrawRunRequest extends ProtocolMessage {
    raffle_id: number;
    instance_id: number;
}
