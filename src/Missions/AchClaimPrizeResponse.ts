import { ProtocolMessage } from "../Base/ProtocolMessage";

export interface AchClaimPrizeRequest extends ProtocolMessage {

    // no details here, just check for errCode and reload list of missions
}