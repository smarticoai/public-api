import { ProtocolMessage } from ".././Base/ProtocolMessage";
import { SAWPrize } from "./SAWPrize";

export interface SAWPrizeDropWinPush extends ProtocolMessage {
    request_id: string; // guid
    saw_template_id: number;
    saw_prize: SAWPrize;
}