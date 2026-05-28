# Class: WSAPIClans
## Methods

### getClans()

> **getClans**(`params?`): `Promise`\<[`TClans`](../interfaces/TClans.md)\>

Returns the active clans visible to the current user along with the
user's own membership state (`user_clan_id`, `cooldown_until`,
`join_date`). Use this to power a clan-picker / clan-browser screen.

The returned `clans[]` is server-sorted by `rating_position` ASC
(1 = highest-ranked). The server has already filtered out archived
clans, clans the user fails segment conditions for, and (when any
clan has a non-zero score) clans with a zero rating score.

#### Parameters

##### params?

Optional. Omit to fetch without subscribing.

###### onUpdate?

(`data`) => `void`

Callback invoked with the full refreshed
                           `TClans` payload whenever the 30 s cache
                           expires and a subsequent fetch lands.
                           Each call to `getClans` overwrites the
                           prior callback.

#### Returns

`Promise`\<[`TClans`](../interfaces/TClans.md)\>

Promise resolving to `TClans`. Empty
                           `clans` array if no clans are visible.

#### Remarks

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
after a [joinClan](#joinclan) resolves to pick up the new
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
[getUserProfile](WSAPIUser.md#getuserprofile)) to drive Join button affordability.

**Cache TTL**: the SDK caches the response for 30 seconds. Cache
is fully cleared on login / logout.

**Idempotency**: safe. Read-only. Repeated calls within the
cache window return a deep-cloned cached payload without a
network round-trip.

**Side effects**: none — pure metadata read.

**UI guidance**: see [UI Guide — `getClans`](../_media/UIGuide_getClans.md).

**Visitor mode**: not supported.

#### Example

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

***

### getClanInfo()

> **getClanInfo**(`clanId`): `Promise`\<[`TClanInfo`](../interfaces/TClanInfo.md)\>

Returns the full detail of a single clan — adds the ranked
`members[]` roster and a fresh `cooldown_until` on top of the same
fields exposed on a `TClan` list entry. Use this to power a clan
detail screen / popup after the user picks an item from
[getClans](#getclans).

Each call is a fresh server round-trip — there is no client cache
and no push event refreshes detail state. Re-call to refresh.

#### Parameters

##### clanId

`number`

The clan ID from `TClans.clans[i].clan_id`.

#### Returns

`Promise`\<[`TClanInfo`](../interfaces/TClanInfo.md)\>

Promise resolving to `TClanInfo`. Rejects if the
               clan ID is invalid or the user lacks visibility
               for it.

#### Remarks

**Preconditions**
Pass a valid `clanId` (typically read from
`TClans.clans[i].clan_id` returned by [getClans](#getclans)). The
method works standalone — `getClans()` is not required first —
but is the only stable source of valid IDs.

**Refresh model**
- **No subscription.** One-shot promise.
- **No client cache.** Every call sends a network request.
- **No push event** refreshes the detail. Member-join, kick, or
  contribution-score changes require a fresh `getClanInfo` call.

**Returned shape — beyond `TClan`**
`TClanInfo` adds two things on top of the same identity / capacity
/ fee / rating fields you'd see on a `TClan` list entry:
1. A ranked `members[]` array — each entry carries `user_id`,
   `public_username`, `avatar_id` / `avatar_real_id`, the resolved
   `avatar_url`, the member's `position` (rank within this clan),
   `contribution_score`, the `is_me` flag identifying the current
   user's row, and the optional `clean_ext_user_id`. The server
   orders members by score DESC (i.e. `position` ASC); no
   client-side re-sort is required.
2. A fresh `cooldown_until` on the clan info itself. This is the
   SAME user-level cooldown as `TClans.cooldown_until` (the
   cooldown is global to the user, not per clan) — but `getClans`
   returns a value cached for up to 30 s while `getClanInfo`
   always returns the current value. If the list-cached cooldown
   has just expired, this detail call will reflect it first.

**Username display**: in the default Smartico UI, member rows use
`public_username`. Some surfaces (e.g. the tournament clan
drill-down) prefer `clean_ext_user_id` as the primary display
with `public_username` as fallback — pick the convention that
matches your product's identity model.

**Idempotency**: safe. Read-only.

**Side effects**: none — pure metadata read.

**UI guidance**: see [UI Guide — `getClanInfo`](../_media/UIGuide_getClanInfo.md).

**Visitor mode**: not supported.

#### Example

```ts
const result = await window._smartico.api.getClans();
const clan = result.clans[0];

console.log('[smartico] loading detail for clan', clan.clan_id);
const detail = await window._smartico.api.getClanInfo(clan.clan_id);

console.log('[smartico] render detail with', detail.members.length, 'members');

// Find current user's row to power a sticky "me" footer.
const meRow = detail.members.find(m => m.is_me);
if (meRow) {
  console.log('[smartico] current user rank in this clan:', meRow.position,
    'contribution:', meRow.contribution_score, '— render sticky my-member footer');
}

// Resolve Join CTA state using the detail's cooldown (always fresh).
const isMyClan = detail.clan_id === result.user_clan_id;
const inCooldown = detail.cooldown_until != null;
const isFull = detail.member_count >= detail.capacity_limit;
if (isMyClan) {
  console.log('[smartico] this is the user\'s clan — render disabled "Your clan" button');
} else if (inCooldown) {
  const ends = new Date(detail.cooldown_until + 'Z');
  console.log('[smartico] user is in clan-switch cooldown until', ends.toLocaleString(),
    '— render disabled cooldown button');
} else if (isFull) {
  console.log('[smartico] clan is full — render disabled "Clan is full" button');
} else {
  console.log('[smartico] joinable — render enabled Join button');
}
```

***

### joinClan()

> **joinClan**(`clanId`): `Promise`\<[`TClanJoinResult`](../interfaces/TClanJoinResult.md)\>

Joins (or switches into) a clan on behalf of the current user. For
paid clans (`entry_fee_amount > 0`), the user's balance for the
matching currency is debited synchronously before the response
returns. If the user is already in a clan, this is treated as an
atomic clan-switch (deactivate old membership + insert new + debit
fee, all in one transaction — the user is never observably
clanless).

A successful response (`errCode === 0`) means: membership is
persisted, the fee (if any) has been debited, the user's
switch-cooldown has restarted, and a clan-joined CRM event has
fired server-side.

#### Parameters

##### clanId

`number`

The clan ID from `TClans.clans[i].clan_id` (or
               `TClanInfo.clan_id`).

#### Returns

`Promise`\<[`TClanJoinResult`](../interfaces/TClanJoinResult.md)\>

`{ errCode, errMsg }`; success when `errCode === 0`.
         Note camelCase keys (see "Result shape note" above).

#### Remarks

**Result shape note**: `TClanJoinResult` uses `errCode` / `errMsg`
(camelCase) — different from most other SDK result types in this
library which use `err_code` / `err_message` (snake_case). Branch
on the camelCase keys when reading this method's result.

**Preconditions**
Read the candidate from [getClans](#getclans) and gate the call on
`clan.member_count < clan.capacity_limit`, `cooldown_until == null`
(on the `TClans` payload — the cooldown is user-level, not
per-clan), and the user's balance for `entry_fee_currency_type_id`
being at least `entry_fee_amount` (free clans bypass this check).
The SDK forwards the call unconditionally — calling without
satisfying these will most likely return one of the error codes
below.

**Error codes** (in `errCode`, typed as [JoinClanErrorCode](../enumerations/JoinClanErrorCode.md))
- `0` (`JOIN_CLAN_OK`) — success; membership persisted, fee
  debited, cooldown restarted.
- `1000` (`JOIN_CLAN_INVALID_PARAMETERS`) — request body missing
  `clan_id`. Should not occur via the SDK; treat as a programming
  error.
- `1001` (`JOIN_CLAN_NOT_FOUND`) — clan doesn't exist for this
  label, OR the clan is archived / in draft state. The server
  merges "missing" and "archived" into this single code. Refresh
  `getClans()` and remove the entry from the UI.
- `1002` (`JOIN_CLAN_FULL`) — capacity reached between the list
  fetch and the join click (`member_count >= capacity_limit` at
  the server's atomic check). Refresh the list — the button will
  become "Clan is full".
- `1003` (`JOIN_CLAN_INSUFFICIENT_FUNDS`) — insufficient balance
  for the clan's entry fee. A single code covers all three
  currencies (points / gems / diamonds); read
  `clan.entry_fee_currency_type_id` to identify which currency
  the user is short on. Show an insufficient-balance UI naming
  the deficit.
- `1004` (`JOIN_CLAN_SEGMENT_MISMATCH`) — user does not meet the
  clan's entry segment or numeric conditions. There is no
  client-side pre-guard for this — surface a gating message.
- `1005` (`JOIN_CLAN_USER_IS_NOT_IN_CLAN`) — this method NEVER
  returns `1005`. The code is shared with the tournament
  registration error space and fires only on
  [registerInTournament](WSAPITournaments.md#registerintournament) responses when a clan-based
  tournament requires the user to be in a clan first.
- `1006` (`JOIN_CLAN_COOLDOWN_ACTIVE`) — user is inside the
  switch-cooldown window from a previous clan join (default
  7 days, configurable per label). Surface the
  `TClans.cooldown_until` expiry in the disabled CTA.
- `1007` (`JOIN_CLAN_ARCHIVED`) — defined on the public enum but
  the server does NOT emit this code in practice (archived clans
  are reported as `1001`). Handle it as a synonym for `1001`
  defensively, but do not rely on it.
- `1011` (`JOIN_CLAN_JOINED_AFTER_TOURNAMENT_START`) — this
  method does NOT return `1011` directly. The code fires on
  [registerInTournament](WSAPITournaments.md#registerintournament) responses when the user joined
  their current clan after the tournament started AND already
  has tournament scores.
- other non-zero — generic server error. Surface `errMsg` if any.

**Idempotency**: NOT safe — and notably dangerous. Calling
`joinClan` with the user's CURRENT `clanId` does NOT short-circuit
server-side; the call is treated as a clan-switch to the same
clan. If the label's cooldown is non-zero (the default), the
second call returns `1006`. If the cooldown is configured to
zero, the second call will deduct the entry fee AGAIN, deactivate
the membership, and re-insert it. The SDK does NOT enforce an
in-flight lock. Consumers MUST guard the call site against
double-clicks (set a local "joining" flag on click, clear it on
response) AND short-circuit when the user is already in the
target clan.

**Refresh after success (and after failure)**
The SDK does NOT automatically refresh the [getClans](#getclans) cache
after a join. Manually re-call `getClans()` on success to pick up
the new `user_clan_id`, refreshed `member_count`, and the new
`cooldown_until` value. Until you do, the cached `TClans` payload
is stale.

**Side effects** (consumer-observable on success)
- Entry-fee currency balance decreases by `entry_fee_amount`
  (visible on the next [getUserProfile](WSAPIUser.md#getuserprofile) refresh / via the
  user-properties update channel).
- The user's clan membership row is created (or replaced, on a
  switch). `member_count` on the new clan increments by 1; on a
  switch, the old clan's `member_count` decrements by 1 in the
  same transaction.
- The user's switch-cooldown restarts at the join time (the
  `TClans.cooldown_until` field on the next list fetch reflects
  the new expiry).
- Server-side CRM analytics fire (clan-joined event, currency-
  deducted event for paid clans). These surface only as
  server-side traces; the SDK consumer observes them indirectly
  via balance / membership refresh.

**UI guidance**: see [UI Guide — `joinClan`](../_media/UIGuide_joinClan.md).

**Visitor mode**: not supported. The server rejects the request
for unauthenticated sessions.

#### Example

```ts
const result = await window._smartico.api.getClans();
const target = result.clans.find(c => c.clan_id === clanId);

if (!target) {
  console.log('[smartico] clan not in current list — refresh getClans and retry');
  return;
}
if (target.clan_id === result.user_clan_id) {
  console.log('[smartico] user is already in this clan — short-circuit; do NOT call joinClan again, the server will treat it as a switch and may re-deduct the fee');
  return;
}
if (result.cooldown_until) {
  console.log('[smartico] user is in cooldown — disable Join until', new Date(result.cooldown_until + 'Z').toLocaleString());
  return;
}
if (target.member_count >= target.capacity_limit) {
  console.log('[smartico] clan is full — disable Join');
  return;
}

console.log('[smartico] join starting — set in-flight flag, show loading dots on Join button, keep modal open');
const r = await window._smartico.api.joinClan(target.clan_id);
console.log('[smartico] join response received — clear in-flight flag');

if (r.errCode === 0) {
  console.log('[smartico] joined successfully — refresh getClans to pick up the new user_clan_id, member_count, and cooldown_until');
  await window._smartico.api.getClans();
} else if (r.errCode === 1002) {
  console.error('[smartico] clan is full — refresh list, hide the Join CTA on the now-full clan');
} else if (r.errCode === 1003) {
  const currencyLabel = ['points', 'gems', 'diamonds'][target.entry_fee_currency_type_id] ?? 'currency';
  console.error('[smartico] insufficient', currencyLabel, '— need', target.entry_fee_amount);
} else if (r.errCode === 1004) {
  console.error('[smartico] user does not meet segment / entry conditions — show a gating message');
} else if (r.errCode === 1006) {
  console.error('[smartico] cooldown active — surface the cooldown_until from getClans:', result.cooldown_until);
} else if (r.errCode === 1001) {
  console.error('[smartico] clan not found or archived — refresh list and remove from UI');
} else {
  console.error('[smartico] join failed — show a generic error toast with this message:', r.errMsg);
}
```

***
