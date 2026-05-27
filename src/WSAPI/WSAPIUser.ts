import { CoreUtils } from '../Core';
import { ECacheContext, OCache } from '../OCache';
import {
	TActivityLog,
	TLevel,
	TLevelCurrent,
	TSegmentCheckResult,
	TUserProfile,
	UserLevelExtraCountersT,
} from './WSAPITypes';
import {
	CACHE_DATA_SEC,
	onUpdateContextKey,
} from './WSAPIBase';
import { WSAPIBase } from './WSAPIBase';

/** @group User */
export class WSAPIUser extends WSAPIBase {
	public getUserProfile(): TUserProfile {
		if (this.api.tracker) {
			const o: TUserProfile = Object.assign({}, this.api.tracker.userPublicProps);
			o.avatar_url = CoreUtils.avatarUrl(this.api.tracker.userPublicProps.avatar_id, this.api.avatarDomain);
			return o;
		} else {
			throw new Error('Tracker is not initialized, cannot getUserProfile');
		}
	}

	/** Check if user belongs to specific segments
	 * **Example**:
	 * ```
	 * _smartico.api.checkSegmentMatch(1).then((result) => {
	 *   console.log(result);
	 * });
	 * ```
	 *
	 * **Visitor mode: not supported**
	 */
	public async checkSegmentMatch(segment_id: number): Promise<boolean> {
		const r = await this.api.coreCheckSegments(this.userExtId, [segment_id]);
		if (r && r.find((s) => s.segment_id === segment_id && s.is_matching)) {
			return true;
		} else {
			return false;
		}
	}

	/** Check if user belongs to specific list of segments
	 * **Example**:
	 * ```
	 * _smartico.api.checkSegmentListMatch([1, 2, 3]).then((result) => {
	 *    console.log(result);
	 * });
	 * ```
	 * **Visitor mode: not supported**
	 */
	public async checkSegmentListMatch(segment_ids: number[]): Promise<TSegmentCheckResult[]> {
		return await this.api.coreCheckSegments(this.userExtId, Array.isArray(segment_ids) ? segment_ids : [segment_ids]);
	}

	/** Returns all the levels available to the current user
	 * **Example**:
	 * ```
	 * _smartico.api.getLevels().then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 * **Example in the Visitor mode**:
	 * ```
	 * _smartico.vapi('EN').getLevels().then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 */
	public async getLevels(): Promise<TLevel[]> {
		return OCache.use(onUpdateContextKey.Levels, ECacheContext.WSAPI, () => this.api.levelsGetT(this.userExtId), CACHE_DATA_SEC);
	}

	/**
	 * Returns the current level of the user with extended information including ordinal position and progress.
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.getCurrentLevel().then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 * **Visitor mode: not supported**
	 */
	public async getCurrentLevel(): Promise<TLevelCurrent> {
		return OCache.use(onUpdateContextKey.CurrentLevel, ECacheContext.WSAPI, () => this.api.getLevelCurrent(this.userExtId), CACHE_DATA_SEC);
	}

	/**
	 * Returns the extra counters for the current user level.
	 * These are counters that are configured for each Smartico client separately by request.
	 * For example 1st counter could be total wagering amount, 2nd counter could be total deposit amount, etc.
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.getUserLevelExtraCounters().then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 * **Visitor mode: not supported**
	 */
	public async getUserLevelExtraCounters(): Promise<UserLevelExtraCountersT> {
		return OCache.use(
			onUpdateContextKey.LevelExtraCounters,
			ECacheContext.WSAPI,
			() => this.api.getUserGamificationInfoT(this.userExtId),
			CACHE_DATA_SEC,
		);
	}

	/**
	 * Returns the activity log for a user within a specified time range.
	 * The response includes both points changes and gems/diamonds changes.
	 * Each log entry contains information about the change amount, balance, and source.
	 * The returned list is cached for 30 seconds.
	 * You can pass the onUpdate callback as a parameter, it will be called every time the activity log is updated and will provide the updated list of activity logs for the last 10 minutes.
	 *
	 * **Example**:
	 * ```
	 * const startTime = Math.floor(Date.now() / 1000) - 86400 * 30; // 30 days ago
	 * const endTime = Math.floor(Date.now() / 1000); // now
	 *
	 * _smartico.api.getActivityLog({
	 *      startTimeSeconds: startTime,
	 *      endTimeSeconds: endTime,
	 *      from: 0,
	 *      to: 50,
	 *      onUpdate: (data) => console.log('Updated:', data)
	 * }).then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 * **Visitor mode: not supported**
	 *
	 * @param params - Activity log parameters
	 * @param params.startTimeSeconds - Start time in seconds (epoch timestamp)
	 * @param params.endTimeSeconds - End time in seconds (epoch timestamp)
	 * @param params.from - Start index of records to return
	 * @param params.to - End index of records to return
	 * @param params.onUpdate - Optional callback function that will be called when the activity log is updated
	 */
	public async getActivityLog({
		startTimeSeconds,
		endTimeSeconds,
		from,
		to,
		onUpdate,
	}: {
		startTimeSeconds: number;
		endTimeSeconds: number;
		from: number;
		to: number;
		onUpdate?: (data: TActivityLog[]) => void;
	}): Promise<TActivityLog[]> {

		if (onUpdate) {
			this.onUpdateCallback.set(onUpdateContextKey.ActivityLog, onUpdate);
		}

		return await OCache.use(
			onUpdateContextKey.ActivityLog,
			ECacheContext.WSAPI,
			() => this.api.getActivityLogT(this.userExtId, startTimeSeconds, endTimeSeconds, from, to),
			CACHE_DATA_SEC,
		);
	}

	protected async notifyActivityLogUpdate() {
		const startSeconds = Date.now() / 1000 - 600;
		const endSeconds = Date.now() / 1000;
		const payload = await this.api.getActivityLogT(this.userExtId, startSeconds, endSeconds, 0, 50);

		this.updateEntity(onUpdateContextKey.ActivityLog, payload);
	}
}
