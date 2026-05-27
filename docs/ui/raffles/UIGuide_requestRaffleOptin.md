# UI Guide — `requestRaffleOptin`

## Overview
- Action-focused mutation. The user is on a draw card / detail
  page for a draw with `requires_optin === true`, and they click
  "Opt in".
- Success (`err_code === 0`) means the user is registered for this
  run. Tickets earned within the run's eligibility window will
  participate in the draw.
- Opt-in is **per-run** — recurring draws require a fresh opt-in
  for each new run.

## Argument mapping

The three IDs come from different fields on the embedded draw:

| Argument | Source |
|---|---|
| `raffle_id` | `TRaffle.id` (the parent raffle) |
| `draw_id` | `TRaffleDraw.id` (schedule_id, **stable** across recurring runs) |
| `raffle_run_id` | `TRaffleDraw.run_id` (per-execution instance ID) |

Don't confuse `draw.id` with `draw.run_id` — both are needed.

## Loading state

- **Trigger**: set an in-flight flag (`optingIn = true`)
  immediately on click.
- **Visual**: replace the button label with animated dots; disable
  the button.
- **Reset**: clear the flag on response.

## Idempotency UI guard

The SDK does NOT prevent double-clicks. A second call on the same
`raffle_run_id` returns `err_code === 1` with `err_message`
indicating the user is already opted in. Guard the call site:

```ts
const [optingIn, setOptingIn] = useState(false);

const onOptIn = async (draw: TRaffleDraw) => {
  if (optingIn) return;                        // in-flight guard
  if (draw.user_opted_in) return;              // already opted in
  setOptingIn(true);
  const r = await window._smartico.api.requestRaffleOptin({
    raffle_id: raffleId,
    draw_id: draw.id,        // schedule_id, NOT run_id
    raffle_run_id: draw.run_id,
  });
  setOptingIn(false);
  handleResponse(r);
};
```

Treat `err_code === 1` with an "already opted in" message as
**idempotent success** in the UI.

## Action button decision matrix

CTA label per state on the draw card (evaluate in priority order):

| Condition | CTA |
|---|---|
| `current_state === Executed` (3) | No opt-in CTA (draw is finished) |
| `current_state === WinnerSelection` (2) | No opt-in CTA (drawing in progress) |
| `!requires_optin` | No opt-in CTA (tickets participate automatically) |
| `requires_optin && user_opted_in` | Disabled "Fully opted in" pill (informational) |
| `requires_optin && !user_opted_in && is_active && current_state !== Executed` | Enabled "Opt in" button |
| `requires_optin && !is_active` | No opt-in CTA (draw is inactive) |

After opt-in success, `user_opted_in` flips to `true` on the next
`getRaffles` refresh (which fires automatically via `onUpdate`).

## Per-error-code handling

| `err_code` | Action |
|---|---|
| `0` (success) | Show "Fully opted in" pill; success toast optional |
| `1` + "already opted in" | Treat as success — same UI as above |
| `1` + "no need to opt-in" | Hide the opt-in CTA — the draw doesn't actually require it |
| `1` + "raffle id does not match" | Show a generic error toast; this is a programming bug — verify the IDs being passed |
| `1` + control-group message | Show a gating message ("Not eligible") |
| Other non-zero | Generic error toast with `err_message`. Allow retry. |

## Refresh after response

The SDK auto-refreshes the raffles cache on every opt-in response
(success OR failure). The `onUpdate` callback registered via
[`getRaffles`](../../api/classes/WSAPIRaffles.md#getraffles) fires
with the refreshed list — `user_opted_in` reflects the new state.
**Don't manually call `getRaffles()` after the opt-in response.**

## Animations / transitions

- **Loading dots**: 3-dot animation on the button while in flight.
- **Success state flip**: button transitions from "Opt in" to
  "Fully opted in" (~150 ms ease-out). The default Smartico UI
  uses a 500 ms delay before re-fetching, then the state flip is
  observed on the refreshed list.
- **No celebration animation** — opt-in is a quiet success.

## Mobile vs desktop

- **Loading state**: identical (dots).
- **CTA placement**: desktop usually inline on the draw row; mobile
  may use a sticky CTA at the bottom of the draw detail.

## Performance

- Single round-trip per click.
- The `getRaffles` auto-refresh after the response is a separate
  network call (the cache is invalidated). For UIs that already
  have fresh state, this is redundant but harmless.
