# getClans — API (TClans)

> Returns the active clans visible to the current user along with the user's own membership state (`user_clan_id`, `cooldown_until`, `join_date`).
> Import: `import { TClans } from '@smartico/public-api'`
> Search terms: getClans, clans, TClans, TClan, onUpdate, subscription, user_clan_id, cooldown_until, join_date

## Signature
```ts
_smartico.api.getClans({ onUpdate }: { onUpdate?: (data: TClans) => void } = {}): Promise<TClans>
```

## Parameters
- `params` — Optional. Omit to fetch without subscribing.
- `params.onUpdate` — Callback invoked with the full refreshed `TClans` payload whenever the 30 s cache expires and a subsequent fetch lands. Each call to `getClans` overwrites the prior callback.

## Returns — `Promise<TClans>`
- `clans` (object[]) — List of active clans available to the user
  - `clan_id` (number) — Clan ID
  - `public_meta` (object) — Translated clan metadata
  - `member_count` (number) — Current number of members in clan
  - `capacity_limit` (number) — Max number of members allowed in clan
  - `entry_fee_currency_type_id` (number) — Currency type for `entry_fee_amount`. `0` = points, `1` = gems, `2` = diamonds, `3` = free (no fee).
  - `entry_fee_amount` (number) — Entry fee amount in the currency indicated by `entry_fee_currency_type_id`. `0` (or `entry_fee_currency_type_id === 3`) means the clan is free to join.
  - `rating_position` (number) — Global rank among all active clans in the label, by `rating_score` DESC. `1` = highest-rated. May skip positions when some clans are hidden by per-user visibility (e.g. user sees positions 1, 3, 7).
  - `rating_score` (number) — Clan rating score (higher is better).
- `user_clan_id` (null) — The clan ID the current user belongs to; null if clanless
- `cooldown_until` (null) — Switch-cooldown expiry as ISO 8601 UTC string ("YYYY-MM-DDTHH:MM:SS" with no timezone suffix; interpret as UTC). `null` when no cooldown. User-level: while set, the user cannot join any clan.
- `join_date` (null) — Epoch ms when the current user joined their clan; null if clanless

## Behavioral contract
**Subscription model (`onUpdate`)**
The callback receives the FULL refreshed `TClans` payload (never a
diff/patch). Each subsequent call to `getClans({ onUpdate })`
REPLACES the prior callback. Pass `onUpdate: undefined` (or omit
it) to keep the prior callback in place; the callback is never
auto-cleared.

**Update triggers** — note that, unlike most other subscription
methods in the SDK, this callback is **poll-driven only**. There
is NO server push that refreshes the clans list. The callback
fires when:

1. The 30-second cache TTL expires and a subsequent `getClans()`
 call (from the consumer) triggers a fresh fetch.

Consequence: clan-membership changes (other users joining your
clan, an operator-driven kick, a clan being archived) surface
only on the next consumer-driven fetch. If your UI needs
near-live state, poll `getClans()` on an interval; or re-call
after a `joinClan` resolves to pick up the new
`user_clan_id` immediately.

**Reading state from the returned payload**
Drive list rendering from `clans[]` (already sorted). Identify
the user's own clan via `clan.clan_id === user_clan_id`
(`null` for clanless users). Detect an active switch-cooldown
with `cooldown_until !== null` — when set, the user cannot join
any clan until the cooldown expires, even clans they could
normally join. The cooldown is **user-level**, not per-clan.

`cooldown_until` is an ISO 8601 UTC datetime string with no
timezone suffix (`"YYYY-MM-DDTHH:MM:SS"`). Parse as UTC:
`new Date(cooldown_until + 'Z')` or `moment.utc(cooldown_until)`.
Display in the user's local time. The default cooldown period
is configured per label by the operator (typically 7 days).

`rating_position` is a global rank computed server-side across
all active clans in the label (1 = highest-rated). Because some
clans may be hidden by per-user segment visibility, positions
the user sees may skip (e.g. 1, 3, 7) — don't assume the array
spans a contiguous range.

The `entry_fee_currency_type_id` enum on each clan uses values
`0` = points, `1` = gems, `2` = diamonds, `3` = free. Compare
`entry_fee_amount` against the user's matching balance (from
`getUserProfile`) to drive Join button affordability.

**Cache TTL**: the SDK caches the response for 30 seconds. Cache
is fully cleared on login / logout.

**Idempotency**: safe. Read-only. Repeated calls within the
cache window return a deep-cloned cached payload without a
network round-trip.

**Side effects**: none — pure metadata read.

**UI guidance**: see [UI Guide — `getClans`](../../docs/ui/clans/UIGuide_getClans.md).

**Visitor mode**: not supported.

## Example
```ts
const result = await window._smartico.api.getClans({
  onUpdate: (refreshed) => {
    console.log('[smartico] clans payload refreshed (poll-driven; ~30 s cadence) — re-render the clan list from this payload:', refreshed);
  },
});

console.log('[smartico] user is', result.user_clan_id == null ? 'clanless' : 'in clan ' + result.user_clan_id);

// Cooldown handling — affects ALL clans, not a specific one.
if (result.cooldown_until) {
  const cooldownEndsUtc = new Date(result.cooldown_until + 'Z');
  console.log('[smartico] switch-cooldown active — disable all Join buttons until', cooldownEndsUtc.toLocaleString(),
    '(local). Render the cooldown end on the disabled button label.');
}

// Render clans — already sorted by rating_position ASC.
for (const clan of result.clans) {
  const isMine = clan.clan_id === result.user_clan_id;
  const isFull = clan.member_count >= clan.capacity_limit;

  if (isMine) {
    console.log('[smartico] highlight clan', clan.clan_id, 'as "Your clan"; CTA label "Your clan", no-op');
  } else if (result.cooldown_until) {
    console.log('[smartico] clan', clan.clan_id, '— Join blocked by user cooldown; show disabled button with cooldown end date');
  } else if (isFull) {
    console.log('[smartico] clan', clan.clan_id, '— Clan full; show disabled "Clan is full" button');
  } else {
    const label = clan.entry_fee_amount === 0 || clan.entry_fee_currency_type_id === 3
      ? 'Join free'
      : `Join (${clan.entry_fee_amount} ${['Points','Gems','Diamonds'][clan.entry_fee_currency_type_id]})`;
    console.log('[smartico] clan', clan.clan_id, '— render enabled Join button labelled', label);
  }
}

// After a successful joinClan(), re-call getClans manually — no push refresh.
// const r = await window._smartico.api.joinClan(targetClanId);
// if (r.errCode === 0) await window._smartico.api.getClans();
```

### Example response (REAL shape)
```json
{
  "clans": [
    {
      "clan_id": 6,
      "public_meta": {
        "…": "(nested)"
      },
      "member_count": 884,
      "capacity_limit": 1000,
      "entry_fee_currency_type_id": 0,
      "entry_fee_amount": 100,
      "rating_position": 1,
      "rating_score": 87
    }
  ],
  "user_clan_id": null,
  "cooldown_until": null,
  "join_date": null
}
```

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `joinClan`
- `getUserProfile`
