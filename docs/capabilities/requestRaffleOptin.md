# requestRaffleOptin — API (TRaffleOptinResponse)

> Opts the current user into a specific raffle draw run.
> Import: `import { TRaffleOptinResponse } from '@smartico/public-api'`
> Search terms: requestRaffleOptin, raffles, TRaffleOptinResponse

## Signature
```ts
_smartico.api.requestRaffleOptin(props: { raffle_id: number; draw_id: number; raffle_run_id: number }): Promise<TRaffleOptinResponse>
```

## Parameters
- `props.raffle_id` — The parent raffle's `id`.
- `props.draw_id` — The draw's schedule_id (`TRaffleDraw.id`).
- `props.raffle_run_id` — The run instance ID (`TRaffleDraw.run_id`).

## Returns — `Promise<TRaffleOptinResponse>`
`TRaffleOptinResponse`:
- `err_code` (number) — Error code. `0` = success. See `requestRaffleOptin` TSDoc for the full table.
- `err_message` (string) — Optional error message; populated on non-zero `err_code`.

## Behavioral contract
**Preconditions**
Read the candidate draw from `getRaffles`'s embedded
`draws[]` and gate the call on
`requires_optin === true && !user_opted_in && is_active &&
current_state !== Executed`. Calling without these guards may
return a non-zero `err_code`.

**Argument mapping** — the three IDs come from different fields:
- `raffle_id` — the parent raffle's `TRaffle.id`
- `draw_id` — `TRaffleDraw.id` (schedule_id, stable across runs)
- `raffle_run_id` — `TRaffleDraw.run_id` (instance ID for this
 specific run)



**Idempotency**: NOT idempotent. A second call on the same
`raffle_run_id` returns `err_code === 1` with `err_message`
indicating the user is already opted in. Treat as success in
the UI — the underlying state is what the consumer wants.
Guard the call site against double-clicks.

**Refresh after success (and after failure)**
The SDK automatically refreshes the raffles cache on every
response and fires the `onUpdate` callback registered via
`getRaffles`. After `err_code === 0`, the affected draw's
`user_opted_in` flips to `true` on the refreshed list.

**Side effects** (on `err_code === 0`)
- The user is registered for this run. Tickets earned within
 the run's eligibility window will participate in the draw.
- No balance change. No CRM-side rewards. Opt-in is a metadata
 operation only.

**Throws**
`raffle_id`, `draw_id`, and `raffle_run_id` are all required —
the SDK throws synchronously when any is missing or falsy.

**UI guidance**: see [UI Guide — `requestRaffleOptin`](../../docs/ui/raffles/UIGuide_requestRaffleOptin.md).

**Visitor mode**: not supported.

## Example
```ts
const raffles = await window._smartico.api.getRaffles({
  onUpdate: (refreshed) => console.log('[smartico] raffles refreshed — re-render', refreshed),
});
const raffle = raffles[0];
const draw = raffle.draws.find(d =>
  d.requires_optin && !d.user_opted_in && d.is_active && d.current_state !== 3
);

if (!draw) {
  console.log('[smartico] no opt-in-required draw available — keep CTA hidden');
  return;
}

console.log('[smartico] opt-in starting — set in-flight flag, show loading dots on the Opt-in button');
const r = await window._smartico.api.requestRaffleOptin({
  raffle_id: raffle.id,
  draw_id: draw.id,        // schedule_id, NOT run_id
  raffle_run_id: draw.run_id,
});
console.log('[smartico] opt-in response received — clear in-flight flag');

if (r.err_code === 0) {
  console.log('[smartico] opted in successfully — show "Fully opted in" state on the draw card; onUpdate above will fire with user_opted_in: true');
} else if (r.err_code === 1 && r.err_message?.toLowerCase().includes('already opted in')) {
  console.log('[smartico] already opted in (perhaps from another tab) — treat as success, show "Fully opted in"');
} else {
  console.error('[smartico] opt-in failed — surface this error to the user:', r.err_message);
}
```

## Errors
**Error codes** (in `err_code`)
- `0` — success; the user is opted into this run. Tickets
 collected after the run's `ticket_start_ts` will participate.
- `1` — generic opt-in failure. The `err_message` distinguishes
 the specific cause: the draw doesn't require opt-in
 (`requires_optin === false`), `raffle_id` doesn't match the
 `draw_id`, the user is already opted in (or the draw has
 completed), or the user is in a control group for this raffle.
- other non-zero — generic server error. Surface `err_message`.

## Related
- `getRaffles`
