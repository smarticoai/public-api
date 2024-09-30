import { ProtocolMessage } from "../Base/ProtocolMessage";

export interface SAWWinningHistoryRequest extends ProtocolMessage {
    limit: number;
    offset: number;
    saw_template_id?: number;
    only_claimed?: boolean;
}