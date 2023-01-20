import { ProtocolMessage } from "../Base/ProtocolMessage";
import { LeaderBoardPeriodType } from "./LeaderBoardPeriodType";


export interface  GetLeaderBoardsRequest extends ProtocolMessage {
    // if not set will return all boards
    period_type_id?: LeaderBoardPeriodType;
    // can be >=1, if set will return snapshot for the previous period (1), or period before previous (2) etc
    snapshot_offset?: number;
    include_users?: boolean;
}
