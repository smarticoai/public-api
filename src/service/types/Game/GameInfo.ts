import { ResponseIdentifyLabelInfo } from "../SmarticoProto/PublicLabelInfo";
import { GamePickRoundBase } from "./GamePick";
import { SAWTemplate } from "../SmarticoProto/SAW/SAWTemplate";

interface GameInfo {
    sawTemplate: SAWTemplate;
    allRounds: GamePickRoundBase[];
    labelInfo: ResponseIdentifyLabelInfo
}

export { GameInfo }