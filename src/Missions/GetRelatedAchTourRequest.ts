import { ProtocolMessage } from "../Base/ProtocolMessage";

export interface  GetRelatedAchTourRequest extends ProtocolMessage {
    
    related_game_id?: string;
}
