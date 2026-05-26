import { ClassId } from '../Base/ClassId';
import { SAWSpinsCountPush } from '../MiniGames';
import { ECacheContext, OCache } from '../OCache';
import { SmarticoAPI } from '../SmarticoAPI';
import { JackpotWinPush, JackpotsOptinResponse, JackpotsOptoutRequest } from '../Jackpots';
import { onUpdateContextKey } from './WSAPIBase';
import { WSAPIInbox } from './WSAPIInbox';

/**
 * Public surface of the Smartico WebSocket API. The consumer reaches every
 * method on this class via `_smartico.api.X(...)`. The class is the
 * terminator of an inheritance chain that splits the surface into focused
 * domain classes (see `WSAPIBase` → `WSAPIUser` → ... → `WSAPIInbox` →
 * `WSAPI`); each domain class hosts its own subset of methods. Consumers
 * don't need to know about the chain — every method is reachable directly
 * on the `WSAPI` instance via prototype-chain lookup.
 *
 * @group General API
 */
export class WSAPI extends WSAPIInbox {
	/** @private */
	constructor(api: SmarticoAPI, userExtId: string = null) {
		super(api, userExtId);

		// Push-subscription wiring. This block must live in the terminator
		// because it references `update*` helpers defined across multiple
		// domain classes; only the terminator has visibility into all of
		// them via the prototype chain.
		if (this.api.tracker) {
			const on = this.api.tracker.on;

			on(ClassId.SAW_SPINS_COUNT_PUSH, (data: SAWSpinsCountPush) => this.updateOnSpin(data));
			on(ClassId.SAW_SHOW_SPIN_PUSH, () => this.reloadMiniGameTemplate());
			on(ClassId.SAW_AKNOWLEDGE_RESPONSE, () => {
				this.reloadMiniGameTemplate();
				OCache.clear(ECacheContext.WSAPI, onUpdateContextKey.SAWHistory);
			});
			on(ClassId.SAW_DO_SPIN_RESPONSE, () => {
				this.reloadMiniGameTemplate();
				OCache.clear(ECacheContext.WSAPI, onUpdateContextKey.SAWHistory);
			});
			on(ClassId.MISSION_OPTIN_RESPONSE, () => this.updateMissions());
			on(ClassId.ACHIEVEMENT_CLAIM_PRIZE_RESPONSE, () => this.updateMissions());
			on(ClassId.RELOAD_ACHIEVEMENTS_EVENT, () => this.updateMissions());
			on(ClassId.TOURNAMENT_REGISTER_RESPONSE, () => this.updateTournaments());
			on(ClassId.BUY_SHOP_ITEM_RESPONSE, () => {
				this.updateStorePurchasedItems();
				this.updateStoreItems();
			});
			on(ClassId.CLIENT_ENGAGEMENT_EVENT_NEW, () => this.updateInboxMessages());
			on(ClassId.LOGOUT_RESPONSE, () => OCache.clearContext(ECacheContext.WSAPI));
			on(ClassId.IDENTIFY_RESPONSE, () => OCache.clearContext(ECacheContext.WSAPI));
			on(ClassId.JP_WIN_PUSH, (_data: JackpotWinPush) => this.jackpotClearCache());
			on(ClassId.JP_OPTOUT_RESPONSE, (_data: JackpotsOptoutRequest) => this.jackpotClearCache());
			on(ClassId.JP_OPTIN_RESPONSE, (_data: JackpotsOptinResponse) => this.jackpotClearCache());
			on(ClassId.CLAIM_BONUS_RESPONSE, () => this.updateBonuses());
			on(ClassId.SAW_DO_SPIN_BATCH_RESPONSE, () => {
				this.reloadMiniGameTemplate();
				OCache.clear(ECacheContext.WSAPI, onUpdateContextKey.SAWHistory);
			});
			on(ClassId.RAF_CLAIM_PRIZE_RESPONSE, () => this.updateRaffles());
			on(ClassId.GET_INBOX_MESSAGES_RESPONSE, (res) => {
				if (res.unread_count !== undefined && res.unread_count !== null) {
					this.updateInboxUnreadCount(res.unread_count);
				}
			});
			on(ClassId.CLIENT_PUBLIC_PROPERTIES_CHANGED_EVENT, (data: { props: { core_inbox_unread_count?: number; ach_points_balance?: number; ach_gems_balance?: number; ach_diamonds_balance?: number } }) => {
				if (data?.props?.core_inbox_unread_count !== undefined && data?.props?.core_inbox_unread_count !== null) {
					this.updateInboxUnreadCount(data.props.core_inbox_unread_count);
				}
				if (data?.props?.ach_points_balance !== undefined || data?.props?.ach_gems_balance !== undefined || data?.props?.ach_diamonds_balance !== undefined) {
					this.notifyActivityLogUpdate();
				}
			});
			on(ClassId.RAF_OPTIN_RESPONSE, () => this.updateRaffles());
		}
	}
}
