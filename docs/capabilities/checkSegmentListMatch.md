# checkSegmentListMatch — API (TSegmentCheckResult)

> Checks the current user's membership in multiple segments in a single server round-trip — returns a `TSegmentCheckResult[]` with one entry per *unique* segment ID.
> Import: `import { TSegmentCheckResult } from '@smartico/public-api'`
> Search terms: checkSegmentListMatch, user, TSegmentCheckResult

## Signature
```ts
_smartico.api.checkSegmentListMatch(segment_ids: number[]): Promise<TSegmentCheckResult[]>
```

## Parameters
- `segment_ids` — Array of segment IDs to check. Duplicates are silently de-duplicated server-side. Segment IDs are label-scoped — use the IDs configured for your label.

## Returns — `Promise<TSegmentCheckResult[]>`
Array of `TSegmentCheckResult`. Each item:
- `segment_id` (number) — The segment ID this result refers to (label-scoped).
- `is_matching` (boolean) — `true` if the user currently matches this segment. `false` also covers the case where the segment doesn't exist for the label — the two are not distinguishable.

## Behavioral contract
**Response order is NOT guaranteed**
The server returns results in an unspecified order — different
from the input array. Always correlate by the `segment_id` field on
each `TSegmentCheckResult` rather than by array position. The
returned array length may also be smaller than the input array
(duplicate IDs are silently de-duplicated server-side).

**Single round-trip**
The entire `segment_ids` array is sent in one request. Two segments
cost the same as one in terms of network latency and rate-limit
consumption (one call = one rate-limit slot, regardless of how many
segments).

**Shared semantics with `checkSegmentMatch`**
Both methods wrap the same underlying server endpoint and share
the same caching, refresh, rate-limit, and ambiguity behavior. See
`checkSegmentMatch` for: no client cache · no push event for
membership changes · behavioral segments have batch lag · rate
limit (10 requests / 60 s, ~5 s minimum gap between calls) ·
`is_matching: false` doesn't distinguish "not in segment" from
"segment doesn't exist for this label".

**Idempotency**: safe. Read-only. No side effects.

**Visitor mode**: not supported.

## Example
```ts
const segmentIds = [vipSegmentId, newPlayerSegmentId, freeRollSegmentId];
const results = await window._smartico.api.checkSegmentListMatch(segmentIds);

// Always correlate by segment_id — the response order is unspecified.
const byId = new Map(results.map(r => [r.segment_id, r.is_matching]));

if (byId.get(vipSegmentId)) {
  console.log('[smartico] user is in VIP segment — render VIP surface');
}
if (byId.get(newPlayerSegmentId) && byId.get(freeRollSegmentId)) {
  console.log('[smartico] new player AND eligible for free roll — show the welcome promo');
}

// Cache the result map for the session; refresh on material state changes.
```

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `checkSegmentMatch`
