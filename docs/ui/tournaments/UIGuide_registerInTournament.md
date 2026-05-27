# UI Guide — `registerInTournament`

## Overview
- Action-focused mutation. The user is on a tournament card or detail
  view, the CTA is "Join tournament", and they click it.
- A successful response (`err_code === 0`) means: registration row
  exists, buy-in already debited, lobby refresh fired. The SDK has
  already updated the cache by the time you receive the response — the
  `onUpdate` callback on `getTournamentsList` fires shortly after.
- Latency: typically 100–500 ms for a healthy WebSocket connection.

## Loading state

- **Trigger**: set an in-flight flag (`registering = true`) immediately
  on click, BEFORE the call. This is the consumer's responsibility —
  the SDK does NOT have an in-flight guard.
- **Visual**: replace the button label with animated dots (or a
  spinner). Disable the button. Keep the modal / panel open.
- **Reset**: clear the in-flight flag on response — success or error.

## Idempotency UI guard

The SDK does NOT prevent double-clicks. Two simultaneous calls both
send to the server; both responses resolve. The first will succeed
(`err_code = 0`); the second usually returns `30004`
(already-registered) but may also succeed if the race is exactly tied.

**Two practical guards**:

```ts
// 1. Component-local in-flight flag (simple)
const [registering, setRegistering] = useState(false);

const onJoin = async () => {
  if (registering) return;
  setRegistering(true);
  const r = await window._smartico.api.registerInTournament(tournament.instance_id);
  setRegistering(false);
  handleResponse(r);
};

// 2. Disable the button while is_user_registered hasn't flipped yet
const disabled = registering || tournament.is_user_registered;
```

Treat `err_code = 30004` as **idempotent success** in the UI — hide
the Register button and show "Registered". Don't show an error.

## Action button decision matrix

| `err_code` | Action |
|---|---|
| `0` (success) | Close any registration modal · Show a success toast · Refresh the detail view if open (call `getTournamentInstanceInfo` again) · The lobby list auto-refreshes via `onUpdate` — DON'T manually re-fetch `getTournamentsList` |
| `30004` (already registered) | Same as success — treat as idempotent success |
| `1010` (no clan) | Open a clan-pick modal driven by [`getClans`](../../api/classes/WSAPIClans.md#getclans) and [`joinClan`](../../api/classes/WSAPIClans.md#joinclan); after the clan-join resolves, call `registerInTournament` again. Don't show an error |
| `30002` (insufficient points) | Show insufficient-points UI: `"You need X more points to join"`. Optional: deep-link to a points-earning surface. |
| `300010` (insufficient gems) | Show insufficient-gems UI (analogous to `30002` but for gems currency). NOT in the public enum — branch on the literal numeric value. |
| `300011` (insufficient diamonds) | Show insufficient-diamonds UI (analogous, for diamonds). NOT in the public enum — branch on the literal. |
| `30001` (instance not found) | Refresh the lobby; the tournament is gone. Show a brief "no longer available" toast. |
| `30003` (not in registerable state) | Refresh the lobby; the button should disappear. |
| `30005` (segment mismatch) | Show the operator-supplied `tournament.segment_dont_match_message` if set; fall back to `err_message`. Don't retry. |
| `30006` (anomalous "not registered") | Show generic error toast with `err_message`. Allow retry. |
| `30007` (status-change blocked) | Show generic error toast. Don't retry. |
| `30008` (tournament full) | Show "Tournament is full" message; the lobby auto-refresh will hide the button on the refreshed item. |
| Other non-zero / unknown | Show generic error toast with `err_message` if any. |

## Per-code error message strategy

| `err_code` | Use `err_message`? | Use operator copy? | Best UX text source |
|---|---|---|---|
| `0` (success) | — | — | `"You're registered in {tournament.name}"` (localized) |
| `30005` (segment mismatch) | Fallback only | **Preferred** | `tournament.segment_dont_match_message` → `err_message` → localized generic |
| `30002` / `300010` / `300011` (no balance) | Fallback | — | Localized `"Insufficient {currency}"` with deficit amount derived from `tournament.registration_cost_*` and the user's profile balance |
| `30008` (full) | Fallback | — | Localized `"Tournament is full"` |
| All other `3000x` | Fallback | — | Localized error string for the code → fall back to `err_message` |

`segment_dont_match_message` is a field on the root `TTournament`
object — read it directly as `tournament.segment_dont_match_message`.

## Clan tournament gating

When `tournament.is_clan_based === true`, the user must already be in
a clan before calling `registerInTournament`. Two paths:

1. **Pre-call check** (recommended): in the click handler, read the
   user's clan membership (e.g. via {@link getUserProfile}). If they
   have no clan, open a clan-pick modal (driven by
   [`getClans`](../../api/classes/WSAPIClans.md#getclans) +
   [`joinClan`](../../api/classes/WSAPIClans.md#joinclan)). After
   `joinClan` resolves, call `registerInTournament` — typically
   automatically, without requiring a second click.
2. **Server-side safety net**: if a race occurs (e.g. the user leaves
   their clan between the pre-check and the server-side check), the
   server returns `err_code = 1010`. Handle this the same way —
   re-open the clan-pick flow, then retry.

The default Smartico UI uses approach 1 with 2 as a fallback.

## Optimistic update

**Do NOT optimistically flip `is_user_registered`** before the
response. The local tournament object should only update when the
auto-refreshed lobby array arrives via `getTournamentsList`'s
`onUpdate` callback. The `registering` in-flight flag provides
sufficient visual feedback during the wait.

If you DO use an optimistic state (for instant UI feedback), reconcile
on the response: if `err_code !== 0` AND `err_code !== 30004`, revert
the optimistic flip. Most consumers should skip optimistic UI for
this mutation — the latency is short enough that a loading spinner
suffices.

## Refresh after response

The SDK auto-refreshes `getTournamentsList` after every response
(success or error) via a server push. The `onUpdate` callback on
`getTournamentsList({ onUpdate })` fires with the refreshed array
shortly after `registerInTournament` resolves. **Don't manually call
`getTournamentsList()` after a register response — the cache is
already being refreshed.**

The detail view (`getTournamentInstanceInfo`) is NOT auto-refreshed.
If the detail screen is open, call it again to get the updated
leaderboard, registration count, and `me` block.

The user's balance (after a buy-in deduction) updates via the
SDK's user-properties channel — subscribe to user-property
changes separately if your UI shows the balance.

## Animations / transitions

- **Loading dots**: 3-dot bouncing animation on the button while the
  call is in flight.
- **Success celebration**: when `is_user_registered` flips from
  `false` to `true` on the refreshed lobby item, play a
  check-mark scale-in on the registered card. The default Smartico UI
  also fires a success toast with the tournament name.
- **Error modal**: dismissable; auto-close after ~5 s for
  recoverable errors (`30002`, `300010`, `300011`); persistent for
  `30005` (operator-supplied message is usually important).

## Mobile vs desktop

- **Loading state**: identical (dots animation on the button).
- **Error surfacing**: desktop typically uses a toast/snackbar;
  mobile may use a centered modal with a clear "OK" affordance.
- **Clan-pick flow**: full-screen slide-up sheet on mobile;
  centered modal on desktop.

## Performance

- Single round-trip per click. No batching needed.
- The lobby refresh (server push + SDK cache write + `onUpdate` fire)
  adds ~50–100 ms after the response — fine for UI purposes.
- Don't poll `getTournamentsList` after a register response — the
  refresh is already happening.
