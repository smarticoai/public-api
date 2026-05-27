import { ECacheContext, OCache } from '../OCache';
import {
	TClans,
	TClanInfo,
	TClanJoinResult,
} from './WSAPITypes';
import {
	CACHE_DATA_SEC,
	onUpdateContextKey,
} from './WSAPIBase';
import { WSAPITournaments } from './WSAPITournaments';

/** @group Clans */
export class WSAPIClans extends WSAPITournaments {
	/**
	 * Returns clans list payload for the current user.
	 * The returned payload is cached for 30 seconds.
	 * If onUpdate is passed, it will be called when clans response is received.
	 *
	 * **Visitor mode: not supported**
	 */
	public async getClans({ onUpdate }: { onUpdate?: (data: TClans) => void } = {}): Promise<TClans> {
		if (onUpdate) {
			this.onUpdateCallback.set(onUpdateContextKey.Clans, onUpdate);
		}

		return OCache.use(
			onUpdateContextKey.Clans,
			ECacheContext.WSAPI,
			() => this.api.clansGetListT(this.userExtId),
			CACHE_DATA_SEC,
		);
	}

	/**
	 * Returns detailed information for a specific clan including its members.
	 *
	 * **Visitor mode: not supported**
	 */
	public async getClanInfo(clanId: number): Promise<TClanInfo> {
		return this.api.clansGetInfoT(this.userExtId, clanId);
	}

	/**
	 * Joins a clan on behalf of the current user.
	 *
	 * **Visitor mode: not supported**
	 */
	public async joinClan(clanId: number): Promise<TClanJoinResult> {
		return this.api.clanJoin(this.userExtId, clanId);
	}

	protected async updateClans() {
		const payload = await this.api.clansGetListT(this.userExtId);
		this.updateEntity(onUpdateContextKey.Clans, payload);
	}
}
