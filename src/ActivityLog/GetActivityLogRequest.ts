import { ProtocolMessage } from '../Base/ProtocolMessage';

export interface GetActivityLogRequest extends ProtocolMessage {
	userId: number;
	startTimeSeconds: number;
	endTimeSeconds: number;
	limit: number;
	offset: number;
	/** Optional filter — {@link ActivityLogActivities} values to include. */
	types?: number[];
	/** Optional filter — {@link PointChangeSourceType} values to include. */
	src_types?: number[];
	/** Optional — `true` requests the full activity feed (all activity kinds); omitted returns wallet changes only. */
	new_format?: boolean;
}
