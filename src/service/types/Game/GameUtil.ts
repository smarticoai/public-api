import { GameInfo } from "./GameInfo";
import { GamePickRound, GamePickRoundBase } from "./GamePick";
import { Util } from "../../../util/Util";


class GameUtil {

    public static getRoundName(round: GamePickRoundBase, gameInfo: GameInfo): string {
        if (gameInfo.sawTemplate.jackpot_current) {
            const t = gameInfo.sawTemplate;
            const jackpotValue = t.jackpot_current + (t.saw_template_ui_definition?.jackpot_symbol ? ' ' + t.saw_template_ui_definition?.jackpot_symbol : '');
            return Util.replaceAll(round.round_name, "{{jackpot}}", jackpotValue);
        } else {
            return round.round_name;
        }
    }

    public static getRoundDescription(round: GamePickRound, gameInfo: GameInfo): string {
        if (gameInfo.sawTemplate.jackpot_current) {
            const t = gameInfo.sawTemplate;
            const jackpotValue = t.jackpot_current + (t.saw_template_ui_definition?.jackpot_symbol ? ' ' + t.saw_template_ui_definition?.jackpot_symbol : '');
            return Util.replaceAll(round.round_description, "{{jackpot}}", jackpotValue);
        } else {
            return round.round_description;
        }
    }    
}


export { GameUtil }