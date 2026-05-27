# UI Guide — `claimRafflePrize`

## Overview
- Action-focused mutation. The user has a winning row from a raffle
  draw (visible via
  [`getRaffleDrawRun`](../../api/classes/WSAPIRaffles.md#getraffledrawrun)
  with `should_claim === true` or via
  [`getRaffleDrawRunsHistory`](../../api/classes/WSAPIRaffles.md#getraffledrawrunshistory)
  with `has_unclaimed_prize === true`), and they click Claim.
- Success (`errorCode === 0`) means the claim is recorded and prize
  delivery is queued server-side. The actual delivery (wallet
  credit, free spins, etc.) happens through the operator's
  integration outside the SDK's response cycle.
- Latency: typically 200 ms – 1 s for a healthy WebSocket.
- Balance updates do NOT arrive in this response. Subscribe to
  [`getUserProfile`](../../api/classes/WSAPIUser.md#getuserprofile)'s
  `props_change` channel to observe credits.

## Result shape note

This method returns `{ errorCode, errorMessage? }` (camelCase
full-word) — **different** from most other SDK result types that
use `{ err_code, err_message }` (snake_case). Branch on the
camelCase keys.

## Loading state

- **Trigger**: set an in-flight flag (`claiming = true`)
  immediately on click, BEFORE the call.
- **Visual**: replace the button label with animated dots /
  spinner. Disable the button. Keep the detail / history view open.
- **Reset**: clear the flag on response — success or error.

## Idempotency UI guard

The SDK does NOT prevent double-clicks. A second call on the same
`won_id` returns `errorCode === 1` with `errorMessage` indicating
the prize has already been claimed. Guard the call site:

```ts
const [claiming, setClaiming] = useState(false);

const onClaim = async (won_id: number) => {
  if (claiming) return;                     // in-flight guard
  setClaiming(true);
  const r = await window._smartico.api.claimRafflePrize({ won_id });
  setClaiming(false);
  handleResponse(r);
};
```

Treat `errorCode === 1` with an "already claimed" message as
**idempotent success** in the UI — the underlying state is what
the consumer wants.

## Action button decision matrix

| Condition | Action |
|---|---|
| `errorCode === 0` (success) | Show a success toast ("Prize claimed!"). The raffles list auto-refreshes via [`getRaffles`](../../api/classes/WSAPIRaffles.md#getraffles)'s `onUpdate`; the winner row's `claimed_date` populates on the next refresh. Don't manually re-fetch. |
| `errorCode === 1` + `errorMessage` mentions "already claimed" | Treat as success — same UI as above. Surface a brief "Already claimed" toast for clarity if you prefer. |
| `errorCode === 1` + any other `errorMessage` (control group, mismatch) | Show a generic error toast with the operator message. Allow retry only if the message suggests transient failure. |
| Other non-zero | Show a generic error toast. Allow retry. |

## Refresh after response

The SDK auto-refreshes the raffles cache on every claim response
(success OR failure) via the same push that delivers the result.
The `onUpdate` callback registered via `getRaffles({ onUpdate })`
fires with the refreshed list. **Don't manually call `getRaffles()`
after a claim** — the refresh is already happening.

The winner row in the active detail view (`getRaffleDrawRun`) is
NOT auto-refreshed — call that separately if the detail screen is
open and you want to see `claimed_date` immediately. The default
Smartico UI re-fetches the draw detail after a successful claim.

## No celebration animation

Unlike mission / SAW celebrations, the default Smartico UI does
NOT play a confetti or full-screen animation on raffle claim. The
winner row updates in-place with the claimed timestamp; a
success toast is the primary visual feedback. Add a celebration
in your own UI if your product surface calls for it.

## Mobile vs desktop

- **Error surfacing**: desktop snackbar / toast; mobile centered
  modal.
- **Modal style**: desktop centered; mobile full-screen sheet.
- **Loading state**: identical (dots animation on the button).

## Performance

- Single round-trip per click.
- Prize delivery through the operator's integration is async
  and out-of-band — the SDK consumer doesn't observe it directly.
- Don't poll for delivery confirmation — trust the success
  response.
