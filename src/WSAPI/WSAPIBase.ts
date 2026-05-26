import { ECacheContext, OCache } from '../OCache';
import { SmarticoAPI } from '../SmarticoAPI';

/** @hidden */
export const CACHE_DATA_SEC = 30;

/** @hidden */
export const JACKPOT_TEMPLATE_CACHE_SEC = 30;
/** @hidden */
export const JACKPOT_POT_CACHE_SEC = 1;
/** @hidden */
export const JACKPOT_WINNERS_CACHE_SEC = 30;
/** @hidden */
export const JACKPOT_ELIGIBLE_GAMES_CACHE_SEC = 30;

/** @hidden */
export enum onUpdateContextKey {
	Saw = 'saw',
	Missions = 'missions',
	TournamentList = 'tournamentList',
	InboxMessages = 'inboxMessages',
	Badges = 'badges',
	Levels = 'levels',
	StoreItems = 'storeItems',
	StoreCategories = 'storeCategories',
	AchCategories = 'achCategories',
	LeaderBoards = 'leaderBoards',
	LevelExtraCounters = 'levelExtraCounters',
	Segments = 'segments',
	StoreHistory = 'storeHistory',
	Jackpots = 'jackpots',
	Pots = 'Pots',
	CustomSections = 'customSections',
	Bonuses = 'bonuses',
	Clans = 'clans',
	SAWHistory = 'sawHistory',
	JackpotWinners = 'jackpotWinners',
	Raffles = 'raffles',
	JackpotEligibleGames = 'jackpotEligibleGames',
	CurrentLevel = 'currentLevel',
	InboxUnreadCount = 'inboxUnreadCount',
	ActivityLog = 'activityLog',
	AvatarsList = 'avatarsList',
	AvatarsCustomized = 'avatarsCustomized',
	AvatarPrompts = 'avatarPrompts',
}

/**
 * Abstract base of the SDK's public surface. Holds the shared state
 * (`api`, `userExtId`, `onUpdateCallback` map) and the generic cache /
 * subscription helper (`updateEntity`). Domain-specific methods live on
 * subclasses; the terminator `WSAPI` class composes the whole chain.
 *
 * **Consumers should not instantiate this directly** — the SDK constructs
 * the concrete `WSAPI` via `_smartico.api`.
 *
 * @hidden
 */
export abstract class WSAPIBase {
	/** @hidden */
	protected onUpdateCallback: Map<onUpdateContextKey, (data: any) => void> = new Map();

	/** @hidden */
	protected userExtId: string = null;

	/** @private */
	constructor(protected api: SmarticoAPI, userExtId: string = null) {
		this.userExtId = userExtId;
		OCache.clearAll();
	}

	/** @private */
	// AA: this method is used from the _smartico script to clear cache when the context is changed,
	// e.g. when user is changed or language is changed
	public clearCaches() {
		OCache.clearAll();
	}

	/**
	 * Generic cache-update + subscription-notify helper. Used by domain
	 * classes' `update*` methods to refresh a context and fire any
	 * registered `onUpdate` callback.
	 * @hidden
	 */
	protected async updateEntity(contextKey: onUpdateContextKey, payload: any) {
		OCache.set(contextKey, payload, ECacheContext.WSAPI);

		const onUpdate = this.onUpdateCallback.get(contextKey);
		if (onUpdate) {
			onUpdate(payload);
		}
	}
}
