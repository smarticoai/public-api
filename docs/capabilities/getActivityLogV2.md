# getActivityLogV2 — API (TActivityLogEntry)

> Returns the full activity log (v2) — wallet changes **and** non-wallet activities (missions, badges, levels, tournaments, avatars, …).
> Import: `import { TActivityLogEntry } from '@smartico/public-api'`
> Search terms: getActivityLogV2, user, TActivityLogEntry, UserBalanceType, PointChangeSourceType, ActivityLogActivities, ActivityLogMeta

## Signature
```ts
_smartico.api.getActivityLogV2({
		startTimeSeconds,
		endTimeSeconds,
		from,
		to,
		types,
	}: {
		startTimeSeconds: number;
		endTimeSeconds: number;
		from: number;
		to: number;
		types?: number[];
	}): Promise<TActivityLogEntry[]>
```

## Parameters
_None._

## Returns — `Promise<TActivityLogEntry[]>`
Array of `TActivityLogEntry`. Each item:
- `create_date` (number)
- `user_ext_id` (string)
- `crm_brand_id` (number)
- `type` (UserBalanceType)
- `amount` (number)
- `balance` (number)
- `total_ever` (number)
- `source_type_id` (PointChangeSourceType)
- `activity_type_id` (ActivityLogActivities)
- `context_value_1` (number)
- `meta` (ActivityLogMeta)
  - `name` (string)
  - `image_url` (string)
  - `position` (number)
  - `user_points_balance_before` (number)
  - `points_requested` (number)
  - `user_points_ever` (number)
- `source_entity_name` (string)
- `source_entity_id` (number)
- `source_reference_id` (number)
- `source_root_id` (number)
- `is_wallet_entry` (boolean)

## Behavioral contract
See the [UI guide](../ui/user/UIGuide_getActivityLogV2.md) if present.

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `getActivityLog`
- `TActivityLog`
- `ActivityLogActivities`
- `TActivityLogEntry`
