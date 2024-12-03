import { ProtocolMessage } from "../Base/ProtocolMessage";
import { SAWGameType } from "./SAWGameType";

export interface SAWEventSawPush extends ProtocolMessage {
	pending_message_id: number;
	saw_template_id: number;
	saw_game_type_id: SAWGameType;
}
