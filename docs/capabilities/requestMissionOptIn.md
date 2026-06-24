# requestMissionOptIn — API (TMissionOptInResult)

> Opt the current user in to a mission.
> Import: `import { TMissionOptInResult } from '@smartico/public-api'`
> Search terms: requestMissionOptIn, missions, TMissionOptInResult, err_code, err_message

## Signature
```ts
_smartico.api.requestMissionOptIn(mission_id: number): Promise<TMissionOptInResult>
```

## Parameters
- `mission_id` — The mission `id` (from `getMissions()`)

## Returns — `Promise<TMissionOptInResult>`
`TMissionOptInResult`:
- `err_code` (number) — Error code. `0` = success. See `requestMissionOptIn` TSDoc for the full table.
- `err_message` (string) — Optional error message; populated on non-zero `err_code`.

## Behavioral contract
**Preconditions**
Only call when the mission has `is_requires_optin === true`,
`is_opted_in === false`, and `is_locked === false`. Calling on a
mission that does not require opt-in is wasted; calling twice returns
`40010`.



**Time-limited missions**
For missions with `time_limit_ms > 0`, the countdown begins at opt-in
time, not at mission creation. Server records expiration as
`optin_date + time_limit_ms`.

**Refresh after success**
The SDK refreshes its mission cache automatically on opt-in response;
any `onUpdate` callback passed to a prior `getMissions({ onUpdate })`
fires with the new state shortly after. No manual re-fetch needed.

**Idempotency**: not idempotent. A second call returns `40010`. Guard
the call site against double-clicks.

**Side effects**: does NOT award points / badges / levels directly.
Rewards come from task completion, which is itself gated on opt-in.
May affect visibility of other missions whose visibility conditions
depend on this opt-in.

**UI guidance**: see [UI Guide — `requestMissionOptIn`](../../docs/ui/missions/UIGuide_requestMissionOptIn.md).

**Visitor mode: not supported**

## Example
```ts
const missions = await window._smartico.api.getMissions({
  onUpdate: (m) => console.log('[smartico] mission list updated — re-render mission UI from this new array', m),
});
const mission = missions.find(m => m.id === missionId);

if (!mission || !mission.is_requires_optin || mission.is_opted_in || mission.is_locked) {
  console.log('[smartico] opt-in not applicable — keep UI as-is');
  return;
}

console.log('[smartico] opt-in starting — show loading spinner on opt-in button and disable it to prevent double-clicks');
const r = await window._smartico.api.requestMissionOptIn(mission.id);
console.log('[smartico] opt-in response received — clear loading spinner');

if (r.err_code === 0 || r.err_code === 40010) {
  console.log('[smartico] opt-in succeeded (or was already done) — onUpdate above will fire with refreshed mission state; no manual re-fetch needed');
} else if (r.err_code === 40014) {
  console.error('[smartico] mission is locked — surface the unlock description as guidance:', mission.unlock_mission_description);
} else {
  console.error('[smartico] opt-in failed — show an error toast with this message to the user:', r.err_message);
}
```

### Example response (REAL shape)
> Where this real payload differs from the typed Returns above (TS interface vs raw wire), the REAL shape is the runtime truth.
```json
{
  "err_code": 0,
  "err_message": ""
}
```

## Errors
**Error codes** (in `err_code`)
- `0` — success; task progress counting begins
- `105` — wrong mission id (different label) OR visibility conditions
  not met. Same code covers both; use `err_message` to disambiguate.
- `40010` — already opted-in. Safe to treat as "no-op success"; usually
  means local mission state was stale (e.g. user opted in from another
  session/tab).
- `40013` — mission not opt-in-able: missing `requires_optin`, in
  DRAFT/ARCHIVED state, or outside its `active_from_ts` /
  `active_till_ts` window.
- `40014` — mission is locked; user has unlock-tasks remaining.
  Surface the mission's `unlock_mission_description` to guide them.
- other non-zero — generic server error. Surface `err_message` if any.
