# checkSegmentMatch — API

> Checks whether the current user matches a single segment, returning `true` / `false` directly.
> Import: `import { /* types */ } from '@smartico/public-api'`
> Search terms: checkSegmentMatch, user

## Signature
```ts
_smartico.api.checkSegmentMatch(segment_id: number): Promise<boolean>
```

## Parameters
- `segment_id` — The segment ID. Segment IDs are label-scoped; the same numeric ID can refer to different segments under different labels. Use the IDs configured for your label.

## Returns
See `the domain types`.

## Behavioral contract
**Refresh model**
- **No client cache.** Every call sends a request; the SDK does not
 memoize results.
- **No push event** notifies the consumer when segment membership
 flips (the user crosses a qualification threshold, or the
 operator changes the segment definition). Membership changes
 become visible only on the next `checkSegmentMatch` call.
- **Behavioral segments (configured against BigQuery) have batch
 lag** — even if the user's activity has changed (deposit, wager,
 etc.), the segment-membership result may not reflect that change
 until the next batch evaluation run (typically up to several
 hours).

**Rate limit** (important)
The server caps `checkSegment*` calls at **10 requests per
60-second window**, with a minimum gap of **~5 seconds between
consecutive calls**. Avoid calling on every render — cache the
result client-side for the session, or until you have a reason to
believe the user's state changed (e.g. after a deposit completes,
a level changes via `getUserProfile`'s `props_change`, or a
specific custom event fires).

**`is_matching: false` is ambiguous on the server** — both "the
segment doesn't exist for this label" and "the user doesn't
qualify" return `false` with no distinguishing signal. Pass IDs
you've verified are valid for your label.

**Idempotency**: safe. Read-only. No side effects (no analytics
events, no DB writes).

**Visitor mode**: not supported.

## Example
```ts
const isVip = await window._smartico.api.checkSegmentMatch(vipSegmentId);
if (isVip) {
  console.log('[smartico] user is in VIP segment — render the VIP-only widget surface');
} else {
  console.log('[smartico] user not in VIP segment (or segment id misconfigured) — hide the VIP surface');
}

// Cache the result for the session; re-check after material user-state changes.
window._smartico.on('props_change', async (changed) => {
  if ('ach_points_ever' in changed || 'ach_level_current_id' in changed) {
    const fresh = await window._smartico.api.checkSegmentMatch(vipSegmentId);
    console.log('[smartico] user state changed — VIP membership now:', fresh);
  }
});
```

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `checkSegmentListMatch`
- `getUserProfile`
