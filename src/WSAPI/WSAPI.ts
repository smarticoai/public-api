import { CoreUtils } from "../Core";
import { SmarticoAPI } from "../SmarticoAPI";

import { TLevel, TMissionOrBadge, TUserProfile } from "./WSAPITypes";

/** @group General API */
export class WSAPI {

    /** @private */
    constructor(private api: SmarticoAPI) {
    }

    /** Returns information about current user */
    public async getUserProfile(): Promise<TUserProfile> {
        if (this.api.tracker) {
            const o: TUserProfile = Object.assign({}, this.api.tracker.userPublicProps);
            o.avatar_url = CoreUtils.avatarUrl(this.api.tracker.userPublicProps.avatar_id, this.api.avatarDomain);
            return o;
        } else {
            throw new Error('Tracker is not initialized, cannot getUserProfile');
        }
    }    

    /** Returns all the levels available the current user */
    public async getLevels(): Promise<TLevel[]> {
        return this.api.levelsGetT(null);
    }

    /** Returns all the missions available the current user */
    public async getMissions(): Promise<TMissionOrBadge[]> {
        return this.api.missionsGetItemsT(null);
    }

}