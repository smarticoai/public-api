import { ClassId } from "../Base/ClassId";
import { CoreUtils } from "../Core";
import { MiniGamePrizeTypeName, SAWSpinErrorCode } from "../MiniGames";
import { ECacheContext, OCache } from "../OCache";
import { SmarticoAPI } from "../SmarticoAPI";
import { TLevel, TMiniGamePlayResult, TMiniGamePrize, TMiniGameTemplate, TMissionOrBadge, TStoreItem, TTournament, TTournamentDetailed, TUserProfile } from "./WSAPITypes";
 
/** @hidden */
const cacheDataSec = 30;
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
        const sm = (window as any)._smartico;
        sm.on(ClassId.SAW_SPINS_COUNT_PUSH, (data: { saw_template_id: number, spin_count: number }) => this.updateOnSpin(data));
        sm.on(ClassId.SAW_DO_SPIN_RESPONSE, (data: { saw_prize_id: number, errCode: number }) => sm.on(ClassId.SAW_AKNOWLEDGE_RESPONSE, () => this.updateOnPrizeWin(data)));
        sm.on(ClassId.MISSION_OPTIN_RESPONSE, () => this.updateMissionsOnOptIn());
        sm.on(ClassId.TOURNAMENT_REGISTER_RESPONSE, (data) => this.updateTournamentsOnRegistration(data));
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

    /** Returns all the missions available the current user */
    public async getMissions({ onUpdate }: { onUpdate?: (data: TMissionOrBadge[]) => void }): Promise<TMissionOrBadge[]> {
        if (onUpdate) {
            this.onUpdateCallback.set(onUpdateContextKey.Missions, onUpdate);
        }

        return OCache.use(onUpdateContextKey.Missions, ECacheContext.WSAPI, () => this.api.missionsGetItemsT(null), cacheDataSec);
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

    /** Returns the list of mini-games available for user */
    public async getMiniGames({ onUpdate }: { onUpdate?: (data: TMiniGameTemplate[]) => void }): Promise<TMiniGameTemplate[]> {
        if (onUpdate) {
            this.onUpdateCallback.set(onUpdateContextKey.Saw, onUpdate);
        }

        return OCache.use(onUpdateContextKey.Saw, ECacheContext.WSAPI, () => this.api.sawGetTemplatesT(null), cacheDataSec);
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

    /** Returns all the active instances of tournaments */
    public async getTournamentsList({ onUpdate }: { onUpdate?: (data: TTournament[]) => void }): Promise<TTournament[]> {
        if (onUpdate) {
            this.onUpdateCallback.set(onUpdateContextKey.TournamentList, onUpdate);
        }

        return OCache.use(onUpdateContextKey.TournamentList, ECacheContext.WSAPI, () => this.api.tournamentsGetLobbyT(null), cacheDataSec);
    }

    /** Returns details information of specific tournament instance, the response will includ tournamnet info and the leaderboard of players */
    public async getTournamentInstanceInfo(tournamentInstanceId: number): Promise<TTournamentDetailed> {
        return this.api.tournamentsGetInfoT(null, tournamentInstanceId);
    }

    private async updateOnSpin(data: { saw_template_id: number, spin_count: number }) {
        const templates: TMiniGameTemplate[] = await OCache.use(onUpdateContextKey.Saw, ECacheContext.WSAPI, () => this.api.sawGetTemplatesT(null), cacheDataSec);
        const index = templates.findIndex(t => t.id === data.saw_template_id);
        templates[index].spin_count = data.spin_count;
        OCache.set(onUpdateContextKey.Saw, templates, ECacheContext.WSAPI);

        const onUpdate = this.onUpdateCallback.get(onUpdateContextKey.Saw);
        if (onUpdate) {
            onUpdate(templates);
        }
    }

    private async updateOnPrizeWin(data: { saw_prize_id: number, errCode: number }) {
        if (data.errCode === SAWSpinErrorCode.SAW_OK) {
            const templates: TMiniGameTemplate[] = await OCache.use(onUpdateContextKey.Saw, ECacheContext.WSAPI, () => this.api.sawGetTemplatesT(null), cacheDataSec);
            const template: TMiniGameTemplate = templates.find(t => t.prizes.find(p => p.id === data.saw_prize_id));
            const prizeType = template.prizes.find(p => p.id === data.saw_prize_id)?.prize_type;

            if (
                template.jackpot_add_on_attempt ||
                template.spin_count === 1 ||
                prizeType === MiniGamePrizeTypeName.JACKPOT ||
                prizeType === MiniGamePrizeTypeName.SPIN
            ) {
                const updatedTemplates = await this.api.sawGetTemplatesT(null);

                OCache.set(onUpdateContextKey.Saw, updatedTemplates, ECacheContext.WSAPI);

                const onUpdate = this.onUpdateCallback.get(onUpdateContextKey.Saw);
                if (onUpdate) {
                    onUpdate(updatedTemplates);
                }
            }
        }
    }

    private async updateMissionsOnOptIn() {
        const payload = await this.api.missionsGetItemsT(null);
        OCache.set(onUpdateContextKey.Missions, payload, ECacheContext.WSAPI);

        const onUpdate = this.onUpdateCallback.get(onUpdateContextKey.Missions);
        if (onUpdate) {
            onUpdate(payload);
        }
    }

    private async updateTournamentsOnRegistration(data) {
        const payload = await this.api.tournamentsGetLobbyT(null);
        OCache.set(onUpdateContextKey.Missions, payload, ECacheContext.WSAPI);

        const onUpdate = this.onUpdateCallback.get(onUpdateContextKey.TournamentList);
        if (onUpdate) {
            onUpdate(payload);
        }
    }
}