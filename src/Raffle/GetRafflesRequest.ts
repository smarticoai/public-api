import { ProtocolMessage } from '../Base/ProtocolMessage';

export interface GetRafflesRequest extends ProtocolMessage {
    skip_public_meta?: boolean
}
