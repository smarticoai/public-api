import { ClassId } from "../Base/ClassId";
import { CoreUtils } from "../Core";
import { MiniGamePrizeTypeName, SAWDoSpinResponse, SAWSpinErrorCode, SAWSpinsCountPush } from "../MiniGames";
import { ECacheContext, OCache } from "../OCache";
import { SmarticoAPI } from "../SmarticoAPI";
import { TLevel, TMiniGamePlayResult, TMiniGamePrize, TMiniGameTemplate, TMissionOrBadge, TStoreItem, TTournament, TTournamentDetailed, TUserProfile } from "./WSAPITypes";
 
/** @hidden */
const CACHE_DATA_SEC = 30;
 /** @hidden */
enum onUpdateContextKey {
    Saw = 'saw',
    Missions = 'missions',
    TournamentList = 'tournamentList',
}


/** @group General API */
export class WSAPI {

    private onUpdateCallback: Map<onUpdateContextKey, (data: any) => void> = new Map();

    /** @private */
    constructor(private api: SmarticoAPI) {
        const on = this.api.tracker.on;
        on(ClassId.SAW_SPINS_COUNT_PUSH, (data: SAWSpinsCountPush) => this.updateOnSpin(data));
        on(ClassId.SAW_DO_SPIN_RESPONSE, (data: SAWDoSpinResponse) => on(ClassId.SAW_AKNOWLEDGE_RESPONSE, () => this.updateOnPrizeWin(data)));
        on(ClassId.MISSION_OPTIN_RESPONSE, () => this.updateMissionsOnOptIn());
        on(ClassId.TOURNAMENT_REGISTER_RESPONSE, () => this.updateTournamentsOnRegistration());
    }

    /** Returns information about current user */
    public getUserProfile(): TUserProfile {
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

    /** Returns all the missions available the current user.
     * The returned missions is cached for 30 seconds. But you can pass the onUpdate callback as a parameter. Note that each time you call getMissions with a new onUpdate callback, the old one will be overwritten by the new one. 
     * The onUpdate callback will be called on mission OptIn and the updated missions will be passed to it. */ 
    public async getMissions({ onUpdate }: { onUpdate?: (data: TMissionOrBadge[]) => void }): Promise<TMissionOrBadge[]> {
        if (onUpdate) {
            this.onUpdateCallback.set(onUpdateContextKey.Missions, onUpdate);
        }

        return OCache.use(onUpdateContextKey.Missions, ECacheContext.WSAPI, () => this.api.missionsGetItemsT(null), CACHE_DATA_SEC);
    }

    /** Returns all the badges available the current user */
    public async getBadges(): Promise<TMissionOrBadge[]> {
        return this.api.badgetsGetItemsT(null);
    }

    /** Returns all the store items available the current user */
    public async getStoreItems(): Promise<TStoreItem[]> {
        return this.api.storeGetItemsT(null);
    }

    /** Returns store categories */
    public async getStoreCategories(): Promise<TStoreItem[]> {
        return this.api.storeGetItemsT(null);
    }

    /** Returns the list of mini-games available for user 
     * The returned list of mini-games is cached for 30 seconds. But you can pass the onUpdate callback as a parameter. Note that each time you call getMiniGames with a new onUpdate callback, the old one will be overwritten by the new one. 
     * The onUpdate callback will be called on available spin count change, if mini-game has increasing jackpot per spin or wined prize is spin/jackpot and if max count of the available user spin equal one. Updated templates will be passed to onUpdate callback. */
    public async getMiniGames({ onUpdate }: { onUpdate?: (data: TMiniGameTemplate[]) => void }): Promise<TMiniGameTemplate[]> {
        if (onUpdate) {
            this.onUpdateCallback.set(onUpdateContextKey.Saw, onUpdate);
        }

        return OCache.use(onUpdateContextKey.Saw, ECacheContext.WSAPI, () => this.api.sawGetTemplatesT(null), CACHE_DATA_SEC);
    }

    /** Plays the specified by template_id mini-game on behalf of user and returns prize_id or err_code  */
    public async playMiniGame(template_id: number): Promise<TMiniGamePlayResult> {
        const r = await this.api.sawSpinRequest(null, template_id);
        this.api.doAcknowledgeRequest(null, r.request_id)

        const o: TMiniGamePlayResult = {
            err_code: r.errCode,
            err_message: r.errMsg,
            prize_id: r.saw_prize_id,
        }

        return o;
    }    

    /** Returns all the active instances of tournaments 
     * The returned list is cached for 30 seconds. But you can pass the onUpdate callback as a parameter. Note that each time you call getTournamentsList with a new onUpdate callback, the old one will be overwritten by the new one. 
     * The onUpdate callback will be called when the user has registered in a tournament. Updated list will be passed to onUpdate callback.*/
    public async getTournamentsList({ onUpdate }: { onUpdate?: (data: TTournament[]) => void }): Promise<TTournament[]> {
        if (onUpdate) {
            this.onUpdateCallback.set(onUpdateContextKey.TournamentList, onUpdate);
        }

        return OCache.use(onUpdateContextKey.TournamentList, ECacheContext.WSAPI, () => this.api.tournamentsGetLobbyT(null), CACHE_DATA_SEC);
    }

    /** Returns details information of specific tournament instance, the response will includ tournamnet info and the leaderboard of players */
    public async getTournamentInstanceInfo(tournamentInstanceId: number): Promise<TTournamentDetailed> {
        return this.api.tournamentsGetInfoT(null, tournamentInstanceId);
    }

    private async updateOnSpin(data: SAWSpinsCountPush) {
        const templates: TMiniGameTemplate[] = await OCache.use(onUpdateContextKey.Saw, ECacheContext.WSAPI, () => this.api.sawGetTemplatesT(null), CACHE_DATA_SEC);
        const index = templates.findIndex(t => t.id === data.saw_template_id);
        templates[index].spin_count = data.spin_count;
        this.updateEntity(onUpdateContextKey.Saw, templates)
    }

    private async updateOnPrizeWin(data: SAWDoSpinResponse) {
        if (data.errCode === SAWSpinErrorCode.SAW_OK) {
            const templates: TMiniGameTemplate[] = await OCache.use(onUpdateContextKey.Saw, ECacheContext.WSAPI, () => this.api.sawGetTemplatesT(null), CACHE_DATA_SEC);
            const template: TMiniGameTemplate = templates.find(t => t.prizes.find(p => p.id === data.saw_prize_id));
            const prizeType = template.prizes.find(p => p.id === data.saw_prize_id)?.prize_type;

            if (
                template.jackpot_add_on_attempt ||
                template.spin_count === 1 ||
                prizeType === MiniGamePrizeTypeName.JACKPOT ||
                prizeType === MiniGamePrizeTypeName.SPIN
            ) {
                const updatedTemplates = await this.api.sawGetTemplatesT(null);
                this.updateEntity(onUpdateContextKey.Saw, updatedTemplates)
            }
        }
    }

    private async updateMissionsOnOptIn() {
        const payload = await this.api.missionsGetItemsT(null);
        this.updateEntity(onUpdateContextKey.Missions, payload)
    }

    private async updateTournamentsOnRegistration() {
        const payload = await this.api.tournamentsGetLobbyT(null);
        this.updateEntity(onUpdateContextKey.TournamentList, payload)
    }

    private async updateEntity(contextKey: onUpdateContextKey, payload: any) {
        OCache.set(contextKey, payload, ECacheContext.WSAPI);

        const onUpdate = this.onUpdateCallback.get(contextKey);
        if (onUpdate) {
            onUpdate(payload);
        }
    }
}