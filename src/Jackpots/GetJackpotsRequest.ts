import { ProtocolMessage } from "../Base/ProtocolMessage";


export interface  GetJackpotsRequest extends ProtocolMessage {
    
    related_game_id?: string;
}
