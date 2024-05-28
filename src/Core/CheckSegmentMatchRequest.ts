
import { ProtocolRequest } from "../Base/ProtocolRequest";

export interface CheckSegmentMatchRequest extends ProtocolRequest {
    segment_id: number[];
}
