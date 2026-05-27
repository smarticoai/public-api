# UI Guide — `joinClan`

## Overview
- Action-focused mutation. The user is on the clans browser or the
  detail modal, the CTA is "Join (...)", and they click it.
- A successful response (`errCode === 0`) means: membership persisted,
  entry fee (if any) already debited, cooldown restarted, CRM events
  fired. The SDK has done all of this server-side by the time the
  promise resolves.
- The SDK does NOT auto-refresh `getClans` after success. The
  consumer must re-call manually.
- Latency: typically 200–800 ms for a healthy WebSocket connection
  (the server performs balance checks + atomic DB writes
  synchronously).

## Loading state

- **Trigger**: set an in-flight flag (`joining = true`) immediately
  on click, BEFORE the call. This is the consumer's responsibility
  — the SDK has no in-flight guard.
- **Visual**: replace the button label with animated dots / spinner.
  Disable the button. Keep the modal open.
- **Reset**: clear the in-flight flag on response — success or error.

## Idempotency UI guard

**Two distinct hazards** the consumer must guard against:

1. **Double-click during in-flight**: the SDK does NOT prevent two
   simultaneous `joinClan` calls. If the user clicks twice before the
   first response arrives, both requests reach the server. If the
   first succeeds, the second behaves as a clan-switch to the same
   clan — which, on labels with `CLAN_COOLDOWN_DAYS = 0`, will
   **deduct the entry fee a second time**. Guard with an in-flight
   flag (see "Loading state").

2. **Same-clan re-click**: the SDK does NOT short-circuit when the
   user clicks Join on the clan they're already in. The server
   treats it as a clan-switch to the same clan, and on labels with
   cooldown=0 will re-deduct the fee. The Join button MUST be
   disabled (or show "Your clan") whenever
   `target.clan_id === user_clan_id`. Don't rely on the server to
   silently no-op.

Recommended pattern:

```ts
const [joining, setJoining] = useState(false);

const onJoin = async () => {
  if (joining) return;                           // in-flight guard
  if (target.clan_id === userClanId) return;     // same-clan guard
  if (cooldownUntil) return;                     // cooldown guard
  if (target.member_count >= target.capacity_limit) return;
  // (also: balance guard — handled by the pre-render CTA state matrix)

  setJoining(true);
  const r = await window._smartico.api.joinClan(target.clan_id);
  setJoining(false);
  handleResponse(r);
  if (r.errCode === 0) await window._smartico.api.getClans();
};
```

## Action button decision matrix

`errCode` branch behavior. Refer to the `joinClan` TSDoc for the full
table of codes; UI handling per code:

| `errCode` | Action |
|---|---|
| `0` (success) | Show success toast (e.g. `"Joined {clan.name}"`). Close modal (or transition it to the "Your clan" state). Call `getClans()` to refresh `user_clan_id`, `member_count`, and `cooldown_until`. The default Smartico UI also dispatches an optimistic local state update so the Join button instantly flips to "Your clan" before the refresh lands. |
| `1000` (invalid parameters) | Programming error from SDK consumer side — should not occur. Show a generic error toast. |
| `1001` (not found / archived) | Refresh `getClans()`; the clan should disappear from the list. Show a brief "clan no longer available" toast. |
| `1002` (full) | Show "Clan is full". Refresh `getClans()`; the now-full clan's button will pre-disable to "Clan is full". |
| `1003` (insufficient funds) | Show insufficient-balance UI naming the currency (`['points','gems','diamonds'][entry_fee_currency_type_id]`) and the deficit (`entry_fee_amount`). Optional: deep-link to a currency-earning surface. |
| `1004` (segment mismatch) | Show a gating message — operator-supplied copy if the clan exposes one; otherwise a generic "Not eligible for this clan". Don't retry. |
| `1005` | `joinClan` does NOT return `1005`. If you see it in this method's response, treat as a generic error. |
| `1006` (cooldown active) | Show "Cooldown until {cooldown_until local-formatted}". Disable the Join CTA across ALL clans until cooldown expires. |
| `1007` (archived) | Defined in the public enum but the server emits `1001` instead. Handle as a synonym for `1001` defensively. |
| `1011` | `joinClan` does NOT return `1011`. If you see it in this method's response, treat as a generic error. |
| Other | Generic error toast with `errMsg` if any. |

## Per-error-code message strategy

| `errCode` | `errMsg` usable? | Operator-supplied copy | Best source |
|---|---|---|---|
| `0` (success) | — | — | Localized `"Joined {clan.name}"` |
| `1003` (insufficient funds) | Fallback | — | Localized `"Insufficient {currency}"` + deficit derived from `entry_fee_amount` and the user's balance |
| `1004` (segment mismatch) | Fallback | If the clan has an operator-supplied entry-conditions message, prefer it | Otherwise localized "Not eligible for this clan" |
| `1006` (cooldown) | Fallback | — | Localized "Cooldown until {date}" — format `cooldown_until` from UTC to local |
| `1002` (full) | Fallback | — | Localized "Clan is full" |
| All others | Use `errMsg` as a fallback when no specific localized copy is available | — | Localized error per code |

## Optimistic update

The default Smartico UI optimistically flips the user's clan
membership state on `errCode === 0` (before `getClans()` refreshes).
This is **safe** for this method because:

- The server has already committed the membership row when the
  response returns.
- The fee is already debited.
- If the optimistic update sets `user_clan_id` to the new clan, the
  refresh from `getClans()` will confirm the same value.

You can mirror this pattern: on `errCode === 0`, immediately update
the UI to show the user in the new clan, then re-fetch in the
background. If the refresh disagrees (very unlikely), reconcile.

Do NOT optimistically update on any non-zero `errCode` — those are
real failures.

## Success celebration

The default Smartico UI does not play a dedicated celebration
animation (no confetti, no full-screen overlay). The button flips
to "Your clan" immediately via optimistic update, and the modal
re-renders with refreshed member data once `getClans()` returns.

If your product surface justifies a celebration, drive it from the
`onUpdate` detection: when `result.user_clan_id` flips between
pre-join and post-join fetches, play your celebration.

## Refresh after response

The SDK does NOT auto-refresh the `getClans` cache. After a
successful join, manually call `getClans()` to pick up:

- The new `user_clan_id`
- The new `cooldown_until` (cooldown restarts at join time)
- The updated `member_count` on the joined clan
- The decremented `member_count` on any previously-joined clan
  (clan-switch case)

The user's balance update from the entry-fee debit arrives via the
SDK's user-properties update channel — subscribe separately to
{@link getUserProfile} if your UI shows the balance.

## Clan-switch semantics

When the user is in clan A and successfully joins clan B, the
server performs an **atomic transition**: deactivate A membership,
insert B membership, debit fee — all in one transaction. The user
is never observably clanless during the switch.

From the UI's perspective, this is identical to a fresh join. No
special handling required — the response is the same `errCode === 0`,
and `getClans()` refresh will show the user in clan B with a fresh
cooldown.

## Special case — tournament clan-pick flow

When `registerInTournament(tournamentId)` returns `1005` (user has
no clan and the tournament is clan-based), the default UI typically:

1. Opens a clan-picker driven by `getClans`.
2. User picks a clan → call `joinClan(clanId)`.
3. On `errCode === 0`, automatically retry
   `registerInTournament(tournamentId)`.
4. Handle `1011` on the retry: user joined the clan but joined
   after this tournament started (and has prior tournament scores)
   — show an explanatory message; the user is in the clan but
   blocked from this specific tournament run.

The SDK does NOT chain these calls automatically. Each step is the
consumer's responsibility. See the
[UI Guide for `registerInTournament`](../tournaments/UIGuide_registerInTournament.md)
for the recommended sequence.

## Animations / transitions

- **Loading dots**: 3-dot bouncing animation on the button while the
  promise is in flight.
- **Button state flip**: when the response arrives, animate the
  button label transition (~150 ms ease-out).
- **Member list refresh**: after `getClans()` re-fetch, the affected
  clan rows (`member_count` change, your clan now highlighted) get a
  brief highlight pulse on update.

## Mobile vs desktop

- **Loading state**: identical (dots on the button).
- **Error surfacing**: desktop typically uses a toast/snackbar;
  mobile may use a centered modal with a clear "OK" affordance.
- **Cooldown / insufficient-balance disabled states**: rendered the
  same way on both — the disabled button shows the constraint text.

## Performance

- Single round-trip per click. No batching needed.
- The `getClans()` refresh after success adds ~50–500 ms (cache miss
  → fresh fetch). Treat as fire-and-forget; the optimistic UI flip
  has already happened.
- Don't poll `getClans()` to detect join completion — the response
  promise is the authoritative signal.
