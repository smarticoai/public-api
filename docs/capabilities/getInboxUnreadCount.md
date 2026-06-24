# getInboxUnreadCount — API

> Returns the user's current unread inbox message count — a single integer suitable for driving a header badge.
> Import: `import { /* types */ } from '@smartico/public-api'`
> Search terms: getInboxUnreadCount, inbox, onUpdate, subscription

## Signature
```ts
_smartico.api.getInboxUnreadCount({ onUpdate }: { onUpdate?: (unread_count: number) => void } = {}): Promise<number>
```

## Parameters
- `params` — Optional subscription bag.
- `params.onUpdate` — Callback invoked with the new unread count whenever it changes (push-driven).

## Returns
Resolves to `number`.

## Behavioral contract
**Subscription model**
`onUpdate` fires whenever the cached value changes — either on a
push from the user-properties channel (new message arrival,
mark-as-read, delete) or after an inbox-list fetch that returns
a fresh count.

**Cache TTL**: 30 seconds. The cached value is patched in place
by push events (no full re-fetch on every push), so the
`onUpdate` callback reflects server state with sub-second latency
regardless of the TTL.

**Idempotency / Side effects**: safe. Read-only.

**Visitor mode**: not supported.

## Example
```ts
// Static read for an initial badge render.
const count = await window._smartico.api.getInboxUnreadCount();
console.log('[smartico] inbox badge initial count:', count);

// Live subscription for badge updates.
await window._smartico.api.getInboxUnreadCount({
  onUpdate: (newCount) => {
    console.log('[smartico] inbox count changed — update the badge to:', newCount,
      '— hide badge entirely when 0, show raw integer otherwise (no "99+" cap in the default UI)');
  },
});
```

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `getUserProfile`
