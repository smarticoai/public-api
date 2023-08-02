import { SmarticoAPI } from "../SmarticoAPI";

import { GetLevelMapClearedResponse, levelCleaner } from "./WSAPITypes";

/** @group General API */
export class WSAPI {
    private static api: SmarticoAPI;
    
    /** @private */
    constructor(api: SmarticoAPI) {
        WSAPI.api = api;
    }

    public async getLevelsTransformed(): Promise<GetLevelMapClearedResponse[]> {
        const levels = await WSAPI.api.levelsGet(null);
        return levelCleaner(levels);
    }
}