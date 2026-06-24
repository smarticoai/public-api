# requestMissionClaimReward — API (TMissionClaimRewardResult)

> Claim the prize for a completed mission.
> Import: `import { TMissionClaimRewardResult } from '@smartico/public-api'`
> Search terms: requestMissionClaimReward, missions, TMissionClaimRewardResult

## Signature
```ts
_smartico.api.requestMissionClaimReward(mission_id: number, ach_completed_id: number): Promise<TMissionClaimRewardResult>
```

## Parameters
- `mission_id` — The mission `ach_id` (from `getMissions()`).
- `ach_completed_id` — The completion-row identifier, read from `mission.ach_completed_id` on the same mission object fetched via `getMissions()`. Never fabricate or cache across sessions.

## Returns — `Promise<TMissionClaimRewardResult>`
`TMissionClaimRewardResult` (shape from the type — capture a response into `_responses/` for a real example):
- `err_code` (number) — Error code. `0` = success (rewards credited). See `requestMissionClaimReward` TSDoc for the full table.
- `err_message` (string) — Optional error message; populated on non-zero `err_code`.

## Behavioral contract
**Preconditions**
Only call when, on the mission object from `getMissions()`:
- `is_completed === true`
- `requires_prize_claim === true`
- `prize_claimed_date_ts == null` (i.e. not already claimed)
- `prize_claim_expiration_date` is `null` OR still in the future

The `ach_completed_id` argument must be passed straight from the same
mission object (`mission.ach_completed_id`). It is a server-side primary
key identifying the specific completion row; the SDK consumer should
never synthesise or cache it across sessions — always re-read it from a
fresh `getMissions()` result.



**Recurring missions**
The server transparently handles both one-shot and recurring mission
completions. The SDK consumer passes a single `ach_completed_id`
regardless of mission type; the server resolves the correct completion.

**Refresh after success**
On any claim response (success OR failure), the SDK automatically
re-fetches the mission list and fires any `onUpdate` callback
registered via `getMissions({ onUpdate })`. No manual re-fetch needed.
Note: points balance, badges, and level state arrive through their
own push channels — subscribe to them separately if your UI shows
those values.

**Idempotency**: not idempotent at the row level. A second call on the
same `ach_completed_id` returns `40017` (already claimed). For a stale
`ach_completed_id` the second call returns `1`. Guard the call site
against double-clicks; the SDK does not enforce its own in-flight lock.

**Side effects** (consumer-observable effects of a successful claim):
- Points credited to the user's balance.
- CRM-rule activities executed (may grant bonuses, badges; may unlock
  follow-up missions, which arrive as a later mission auto-refresh).
- Analytics / automation events fired downstream; not directly observable
  in the response, but visible via the mission auto-refresh and any
  subsequent bonus / badge updates.

**UI guidance**: see [UI Guide — `requestMissionClaimReward`](../../docs/ui/missions/UIGuide_requestMissionClaimReward.md).

## Example
```ts
const missions = await window._smartico.api.getMissions({
  onUpdate: (m) => console.log('[smartico] mission list updated — re-render mission UI from this new array', m),
});
const mission = missions.find(m => m.ach_id === missionId);

if (
  !mission ||
  !mission.is_completed ||
  !mission.requires_prize_claim ||
  mission.prize_claimed_date_ts ||
  (mission.prize_claim_expiration_date && Date.now() >= mission.prize_claim_expiration_date)
) {
  console.log('[smartico] claim not applicable — keep claim button hidden');
  return;
}

console.log('[smartico] claim starting — show loading spinner on claim button and disable it to prevent double-clicks');
const r = await window._smartico.api.requestMissionClaimReward(mission.ach_id, mission.ach_completed_id);
console.log('[smartico] claim response received — clear loading spinner');

if (r.err_code === 0 || r.err_code === 40017) {
  console.log('[smartico] claim succeeded (or was already claimed) — points/bonuses are credited; mission list auto-refresh will fire via the onUpdate above; hide the claim button');
} else if (r.err_code === 40015) {
  console.error('[smartico] claim window expired — show a "claim period ended" message and remove the claim button:', mission.prize_claim_expiration_date);
} else if (r.err_code === 40016) {
  console.error('[smartico] mission reported as not completed by server — local state was stale; auto-refresh will reconcile, do not retry');
} else {
  console.error('[smartico] claim failed — show an error toast with this message to the user (and re-fetch missions to recover from a stale ach_completed_id):', r.err_message);
}
```

## Errors
**Error codes** (in `err_code`)
- `0` — success; the prize was claimed and rewards have been credited.
- `1` — generic server error. Covers several distinct underlying
  conditions, all collapsed into the same code: stale or wrong
  `ach_completed_id` (does not match user / mission), the mission no
  longer requiring a prize claim, the mission being archived/draft,
  label mismatch, or the completion being too old (server enforces a
  freshness window of several months). Recovery: re-fetch missions
  with `getMissions()`; if the mission still appears claimable,
  surface a generic error.
- `40015` — claim window expired (`prize_claim_expiration_date` has
  passed). Show a "claim period ended" message; do not retry.
- `40016` — mission is not completed yet. Indicates a race or a stale
  local cache. Re-fetch via `getMissions()`; if `is_completed` is still
  false, the UI should hide the claim button.
- `40017` — prize already claimed. Treat as idempotent success: refresh
  the mission list (auto-refresh will fire) and hide the claim button.
  Usually means another tab/session already claimed it.
- other non-zero — generic server error. Surface `err_message` if any.
