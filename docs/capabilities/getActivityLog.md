# getActivityLog — API (TActivityLog)

> Returns the user's unified balance-change history — every points, gems, and diamonds transaction within the requested time window, ordered newest-first.
> Import: `import { TActivityLog } from '@smartico/public-api'`
> Search terms: getActivityLog, user, TActivityLog

## Signature
```ts
_smartico.api.getActivityLog({
		startTimeSeconds,
		endTimeSeconds,
		from,
		to,
		onUpdate,
	}: {
		/** Window start in epoch seconds. */
		startTimeSeconds: number;
		/** Window end in epoch seconds. */
		endTimeSeconds: number;
		/** Pagination offset (0-based). */
		from: number;
		/** Pagination ceiling (exclusive); server caps `to - from` at 50. */
		to: number;
		/** Optional push callback; payload is a fixed 10-min / 50-entry refresh on every wallet change (see Subscription model). */
		onUpdate?: (data: TActivityLog[]) => void;
	}): Promise<TActivityLog[]>
```

## Parameters
_None._

## Returns — `Promise<TActivityLog[]>`
Array of `TActivityLog`. Each item (shape from the type — capture a response into `_responses/` for a real example):
- `create_date` (number) — Date when the change was created (epoch timestamp in seconds)
- `user_ext_id` (string) — External user ID
- `crm_brand_id` (number) — CRM brand ID
- `type` (UserBalanceType) — Type of balance: Points = 0, Gems = 1, Diamonds = 2
- `amount` (number) — Amount changed (positive or negative)
- `balance` (number) — Current balance after this change
- `total_ever` (number) — Total ever collected (only relevant for type points)
- `source_type_id` (PointChangeSourceType) — Source type ID indicating what triggered this change

## Behavioral contract
**Preconditions**
- User must be authenticated. Visitor mode is not guarded at the SDK level
  but is not meaningful — activity is per-user.

**Pagination — `from` / `to` are offset + ceiling, not timestamps**
The SDK derives `offset = from`, `limit = min(to - from, 50)` — the server
hard-caps a single response at 50 entries. For infinite scroll, advance
`from` by 50 between calls. Both `startTimeSeconds` and `endTimeSeconds`
are epoch seconds bounding the window the server scans.

**Subscription model (`onUpdate`)**
The callback fires when the user's `ach_points_balance`,
`ach_gems_balance`, or `ach_diamonds_balance` changes (i.e. whenever a
wallet event lands). The pushed payload is a FIXED re-fetch of the
**last 10 minutes / first 50 entries** — it does NOT honor the original
call's `startTimeSeconds` / `endTimeSeconds` / `from` / `to`. Consumers
maintaining a long historical view must re-call `getActivityLog` with
their own params after receiving an `onUpdate` notification.

**Refresh**
- The SDK caches results for 30 seconds.
- Push triggers fire only on balance changes; transactions that don't
  alter a balance (theoretical zero-amount entries) won't refresh.

**Visitor mode**: not meaningful (no per-user history available).

**UI guidance**: see [UI Guide — `getActivityLog`](../../docs/ui/user/UIGuide_getActivityLog.md).

## Example
```ts
const now = Math.floor(Date.now() / 1000);
const start = now - 86400 * 30; // 30 days

const log = await window._smartico.api.getActivityLog({
    startTimeSeconds: start,
    endTimeSeconds:   now,
    from: 0,
    to:   50,
    onUpdate: (refreshed) => {
        console.log('[smartico] wallet changed — refreshed payload is last 10 min / 50 entries:', refreshed.length, 'rows');
        // If the consumer is showing a full 30-day view, re-call getActivityLog with the original params here.
    },
});

for (const row of log) {
    const sign = row.amount >= 0 ? '+' : '';
    console.log('[smartico] activity row — render with', row.type === 0 ? 'points' : row.type === 1 ? 'gems' : 'diamonds', 'icon, color by sign:', sign + row.amount, 'balance after:', row.balance, 'source:', row.source_type_id);
}
```

### Example response (REAL shape)
```json
[
  null
]
```

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `UserBalanceType`
- `PointChangeSourceType`
- `TActivityLog`
