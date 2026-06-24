# registerInTournament — API (TTournamentRegistrationResult)

> Registers the authenticated user in the specified tournament instance.
> Import: `import { TTournamentRegistrationResult } from '@smartico/public-api'`
> Search terms: registerInTournament, tournaments, TTournamentRegistrationResult, TournamentRegistrationError, err_code, err_message

## Signature
```ts
_smartico.api.registerInTournament(tournamentInstanceId: number): Promise<TTournamentRegistrationResult>
```

## Parameters
- `tournamentInstanceId` — The `instance_id` from `TTournament` (NOT the template `tournament_id`).

## Returns — `Promise<TTournamentRegistrationResult>`
- `err_code` (number) — Error code. `0` = success. See `registerInTournament` TSDoc for the full table.
- `err_message` (string) — Optional error message; populated on non-zero `err_code`.

## Behavioral contract
**Preconditions**
Read the candidate from `getTournamentsList` and gate the call
on `is_can_register === true`. This composite flag already encodes:
not already registered, slot available
(`registration_count < players_max_count`), tournament status is
REGISTER (or STARTED with late-registration enabled), and the
registration type is not AUTO. The SDK forwards the call
unconditionally — calling without satisfying these will return one
of the error codes below.

For clan tournaments (`is_clan_based === true`), the user must
already belong to a clan before calling. If they don't, prompt them
to pick a clan first via `joinClan`, then call
`registerInTournament` after the clan-join resolves. See "Error
codes" `1010` below for the server-side safety net.



**Idempotency**: NOT idempotent. A second call on the same instance
returns `30004` once the first call has succeeded. The SDK does NOT
enforce an in-flight lock. The consumer MUST guard the call site
against double-clicks (set a local "registering" flag on click, clear
it on response).

**Refresh after success (and after failure)**
The SDK automatically refreshes the tournament lobby cache on every
response (success OR error) and fires any `onUpdate` callback
registered via `getTournamentsList({ onUpdate })`. After
`err_code === 0`, the affected item's `is_user_registered` /
`registration_status` / `registration_count` reflect the new
registered state on the refreshed array. Note that
`getTournamentInstanceInfo` is NOT auto-refreshed — if the
detail screen is open, call it again manually.

The user's balance (points / gems / diamonds) is exposed on the
user-properties channel and updates independently of this call's
response — subscribe to user-property updates separately if your UI
shows the balance.

**Side effects** (consumer-observable on success)
- Balance debited synchronously by the buy-in amount in the
 tournament's currency (`registration_cost_points`,
 `registration_cost_gems`, or `registration_cost_diamonds`). For
 free tournaments no deduction occurs.
- Server-side analytics events fire downstream
 (`tournament_user_registered` for immediate-registration types;
 `tournament_user_registration_pending` or
 `tournament_registered_pending_qualification` for
 manual-approval / qualification-based types).
- Any operator-configured on-join prizes are distributed (e.g.
 welcome bonus). These surface via the relevant follow-up channels
 (e.g. `getBonuses`).

**UI guidance**: see [UI Guide — `registerInTournament`](../../docs/ui/tournaments/UIGuide_registerInTournament.md).

**Visitor mode**: not supported. Calling from a visitor session
returns a generic error, not a typed `TournamentRegistrationError`.

## Example
```ts
const tournaments = await window._smartico.api.getTournamentsList({
  onUpdate: (refreshed) => console.log('[smartico] tournament list updated — re-render lobby from this array', refreshed),
});
const tournament = tournaments.find(t => t.instance_id === instanceId);

if (!tournament) {
  console.log('[smartico] tournament not in current lobby — refresh getTournamentsList and retry');
  return;
}
if (!tournament.is_can_register) {
  console.log('[smartico] tournament not currently registerable — keep CTA disabled');
  return;
}

// Clan tournament + user has no clan → resolve clan first.
if (tournament.is_clan_based) {
  const userProfile = window._smartico.api.getUserProfile();
  const userClanId = userProfile?.clan_id;
  if (userClanId == null) {
    console.log('[smartico] clan tournament — open the clan-pick modal first; after joinClan resolves, call registerInTournament again');
    return;
  }
}

console.log('[smartico] registration starting — set in-flight flag, show loading dots on the Join button, keep modal open');
const r = await window._smartico.api.registerInTournament(tournament.instance_id);
console.log('[smartico] registration response received — clear in-flight flag');

if (r.err_code === 0 || r.err_code === 30004) {
  console.log('[smartico] registered (or was already) — close any modal, show a success toast; getTournamentsList onUpdate above will fire with the refreshed array');
} else if (r.err_code === 1010) {
  console.log('[smartico] clan required — open the clan-pick modal again (this is the server-side safety net for a clan-leave race)');
} else if (r.err_code === 30002) {
  console.error('[smartico] insufficient points — show insufficient-balance UI; deficit:', tournament.registration_cost_points);
} else if (r.err_code === 300010) {
  console.error('[smartico] insufficient gems — show insufficient-balance UI; deficit:', tournament.registration_cost_gems);
} else if (r.err_code === 300011) {
  console.error('[smartico] insufficient diamonds — show insufficient-balance UI; deficit:', tournament.registration_cost_diamonds);
} else if (r.err_code === 30005) {
  console.error('[smartico] segment mismatch — prefer the operator-supplied message:', tournament.segment_dont_match_message || r.err_message);
} else if (r.err_code === 30008) {
  console.error('[smartico] tournament full — auto-refresh will hide the button on the refreshed lobby item');
} else {
  console.error('[smartico] registration failed — show a generic error toast with this message:', r.err_message);
}
```

### Example response (REAL shape)
```json
{
  "err_code": 0,
  "err_message": ""
}
```

## Errors
**Error codes** (in `err_code`, typed as `TournamentRegistrationError`)
- `0` — success; the registration is persisted, buy-in deducted,
 tournament lobby refresh fires.
- `1010` — `TOURNAMENT_USER_CANNOT_JOIN_WITHOUT_CLAN`: clan-based
 tournament and the user has no clan. Surface the clan-pick flow
 (e.g. open a clan-pick modal driven by `getClans` +
 `joinClan`), then retry registration.
- `30001` — `TOURNAMENT_INSTANCE_NOT_FOUND`: instance ID is invalid
 or the tournament was deleted. Refresh the lobby via
 `getTournamentsList()` and hide the entry from the UI.
- `30002` — `TOURNAMENT_REGISTRATION_NOT_ENOUGH_POINTS`: insufficient
 points balance for a points-cost tournament. Show an
 insufficient-balance UI naming the deficit.
- `30003` — `TOURNAMENT_INSTANCE_NOT_IN_STATE`: tournament is no
 longer in a registerable state (finished, cancelled, finalizing,
 or not yet published with late registration disabled). Refresh
 the lobby; the button should hide.
- `30004` — `TOURNAMENT_ALREADY_REGISTERED`: user is already
 registered. Treat as idempotent success — hide the Register button
 and refresh the lobby. Usually indicates a stale local state
 (e.g. registered from another tab).
- `30005` — `TOURNAMENT_USER_DONT_MATCH_CONDITIONS`: user fails the
 tournament's segment / entry conditions. Prefer
 `tournament.segment_dont_match_message` (operator-supplied) over
 `err_message` when both are available.
- `30006` — `TOURNAMENT_USER_NOT_REGISTERED`: anomalous on a fresh
 register call; usually indicates a server-side race. Treat as a
 generic transient error.
- `30007` — `TOURNAMENT_CANT_CHANGE_REGISTRATION_STATUS`: status
 transition not allowed (e.g. re-registering after a finished /
 cancelled tournament). Show a generic error; do not retry.
- `30008` — `TOURNAMENT_MAX_REGISTRATIONS_REACHED`: the tournament
 filled up between the lobby fetch and the registration click.
 Refresh the lobby — the button will hide on the refreshed item.
- `300010` — insufficient **gems** balance (gems-cost tournament).
 Same UI handling as `30002` but for the gems currency.
- `300011` — insufficient **diamonds** balance (diamonds-cost
 tournament). Same as `300010` but for diamonds. 
- other non-zero — generic server error. Surface `err_message` if any.

Note: clan-tournament registration can occasionally surface error
codes from the clan-join domain (e.g. `1011` — joined-after-start)
via the same response path. These are members of `JoinClanErrorCode`,
not `TournamentRegistrationError`. Branch on the numeric value.

## Related
- `getTournamentsList`
- `TournamentRegistrationError`
- `getTournamentInstanceInfo`
- `getBonuses`
