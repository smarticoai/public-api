# joinClan — API (TClanJoinResult)

> Joins (or switches into) a clan on behalf of the current user.
> Import: `import { TClanJoinResult } from '@smartico/public-api'`
> Search terms: joinClan, clans, TClanJoinResult

## Signature
```ts
_smartico.api.joinClan(clanId: number): Promise<TClanJoinResult>
```

## Parameters
- `clanId` — The clan ID from `TClans.clans[i].clan_id` (or `TClanInfo.clan_id`).

## Returns — `Promise<TClanJoinResult>`
`TClanJoinResult` (shape from the type — capture a response into `_responses/` for a real example):
- `errCode` (number) — Error code. `0` = success. Typed values are members of `JoinClanErrorCode`. See `joinClan` TSDoc for the full table and per-code UI guidance.
- `errMsg` (string) — Optional server-side error message. Present only on non-zero `errCode`; may be empty even then.

## Behavioral contract
**Result shape note**: `TClanJoinResult` uses `errCode` / `errMsg`
(camelCase) — different from most other SDK result types in this
library which use `err_code` / `err_message` (snake_case). Branch
on the camelCase keys when reading this method's result.

**Preconditions**
Read the candidate from `getClans` and gate the call on
`clan.member_count < clan.capacity_limit`, `cooldown_until == null`
(on the `TClans` payload — the cooldown is user-level, not
per-clan), and the user's balance for `entry_fee_currency_type_id`
being at least `entry_fee_amount` (free clans bypass this check).
The SDK forwards the call unconditionally — calling without
satisfying these will most likely return one of the error codes
below.



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
The SDK does NOT automatically refresh the `getClans` cache
after a join. Manually re-call `getClans()` on success to pick up
the new `user_clan_id`, refreshed `member_count`, and the new
`cooldown_until` value. Until you do, the cached `TClans` payload
is stale.

**Side effects** (consumer-observable on success)
- Entry-fee currency balance decreases by `entry_fee_amount`
 (visible on the next `getUserProfile` refresh / via the
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

**UI guidance**: see [UI Guide — `joinClan`](../../docs/ui/clans/UIGuide_joinClan.md).

**Visitor mode**: not supported. The server rejects the request
for unauthenticated sessions.

## Example
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

## Errors
**Error codes** (in `errCode`, typed as `JoinClanErrorCode`)
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
 `registerInTournament` responses when a clan-based
 tournament requires the user to be in a clan first.
- `1006` (`JOIN_CLAN_COOLDOWN_ACTIVE`) — user is inside the
 switch-cooldown window from a previous clan join (default
 7 days, configurable per label). Only reachable when the user is
 already in a *different* clan (this call is then a clan switch);
 a first-time join never returns `1006`. Surface the
 `TClans.cooldown_until` expiry in the disabled CTA.
- `1011` (`JOIN_CLAN_JOINED_AFTER_TOURNAMENT_START`) — this
 method does NOT return `1011` directly. The code fires on
 `registerInTournament` responses when the user joined
 their current clan after the tournament started AND already
 has tournament scores.
- other non-zero — generic server error. Surface `errMsg` if any.

## Related
- `getClans`
- `JoinClanErrorCode`
- `registerInTournament`
- `getUserProfile`
