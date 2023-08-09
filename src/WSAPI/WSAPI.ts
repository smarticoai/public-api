import { CoreUtils } from "../Core";
import { SmarticoAPI } from "../SmarticoAPI";

import { TLevel, TMissionOrBadge, TStoreItem, TTournament, TTournamentDetailed, TUserProfile } from "./WSAPITypes";

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

    /** Returns all the badges available the current user */
    public async getBadges(): Promise<TMissionOrBadge[]> {
        return this.api.badgetsGetItemsT(null);
    }

    /** Returns all the store items available the current user */
    public async getStoreItems(): Promise<TStoreItem[]> {
        return this.api.storeGetItemsT(null);
    }

    /** Returns all the active instances of tournaments */
    public async getTournamentsList(): Promise<TTournament[]> {
        return this.api.tournamentsGetLobbyT(null);
    }

    /** Returns details information of specific tournament instance, the response will includ tournamnet info and the leaderboard of players */
    public async getTournamentInstanceInfo(tournamentInstanceId: number): Promise<TTournamentDetailed> {
        return this.api.tournamentsGetInfoT(null, tournamentInstanceId);
    }

}