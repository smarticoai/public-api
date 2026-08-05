import { ActivityLogActivities } from './ActivityLogActivities';
import { ActivityLogMeta } from './ActivityLogMeta';
import { PointChangeSourceType } from './PointChangeSourceType';

/**
 * One raw activity-log row as it arrives on the wire.
 *
 * JS consumers receive the friendlier {@link TActivityLog} instead — this is the
 * pre-transform shape, documented for native clients that read the protocol directly.
 */
export interface ActivityLogEntry {
	/** Creation time; `seconds` is the epoch value in SECONDS (not ms). */
	create_date: { seconds: number; nanos?: number };
	user_ext_id: string;
	/** Sent as a string on the wire. */
	crm_brand_id: string;
	/** Kind of activity this row records. */
	type: ActivityLogActivities;
	/** Sub-action within `type` (e.g. unlock vs complete, add vs deduct). */
	ctx_1: number;
	/** Extra display payload for the row; contents vary by `type`. */
	ctx_meta?: ActivityLogMeta;
	/** What triggered the change. */
	source_type_id: PointChangeSourceType;
	/** More specific id within the source (e.g. level id, draw id, win id). */
	source_ref_id: number;
	/** Root / parent entity id when the source is nested. */
	source_root_id: number;
	/** Delta applied by this row, in the balance named by `type`. */
	amount: number;
	/** Balance after this row, in the balance named by `type`. */
	balance: number;
	/** Points balance after this row; points rows only. */
	user_points_balance?: number;
	/** Total points ever collected after this row; points rows only. */
	user_points_ever?: number;
	/** Placeholder on points rows (`-1`) — read `amount` for the real delta. */
	points_collected?: number;
}
