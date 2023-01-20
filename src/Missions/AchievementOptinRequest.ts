import { ProtocolMessage } from "../Base/ProtocolMessage";


export interface AchievementOptinRequest extends ProtocolMessage {

    achievementId: number;
}