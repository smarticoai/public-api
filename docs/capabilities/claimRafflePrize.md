# claimRafflePrize — API (TransformedRaffleClaimPrizeResponse)

> Claims a raffle prize the user has won.
> Import: `import { TransformedRaffleClaimPrizeResponse } from '@smartico/public-api'`
> Search terms: claimRafflePrize, raffles, TransformedRaffleClaimPrizeResponse

## Signature
```ts
_smartico.api.claimRafflePrize(props: { won_id: number }): Promise<TransformedRaffleClaimPrizeResponse>
```

## Parameters
- `props.won_id` — The winning row's `raf_won_id` (from `TRafflePrizeWinner` returned by `getRaffleDrawRun`).

## Returns — `Promise<TransformedRaffleClaimPrizeResponse>`
`TransformedRaffleClaimPrizeResponse` (shape from the type — capture a response into `_responses/` for a real example):
- `errorCode` (number) — Error code. `0` = success. See `claimRafflePrize` TSDoc for the full table.
- `errorMessage` (string) — Optional error message; populated on non-zero `errorCode`.

## Behavioral contract
**Result shape note**: this method returns
`TransformedRaffleClaimPrizeResponse` with `errorCode` /
`errorMessage` (camelCase full-word) — different from most other
SDK result types which use `err_code` / `err_message` (snake_case
short-word). Branch on the camelCase keys when reading this
method's result.

**Preconditions**
Pass a `won_id` that identifies an unclaimed winning row for the
current user. The `won_id` comes from
`TRafflePrizeWinner.raf_won_id` returned by
`getRaffleDrawRun`.



**Claim window**
There is no server-enforced claim deadline. Won prizes remain
claimable indefinitely until the operator archives them.

**Idempotency**: NOT idempotent. A second call on the same
`won_id` returns `errorCode === 1` with `errorMessage` indicating
the prize has already been claimed. The SDK does NOT enforce an
in-flight lock. Guard the call site against double-clicks (set
a local "claiming" flag on click, clear it on response).

**Refresh after success (and after failure)**
The SDK automatically refreshes the raffles cache on every
response — both success and failure paths fire the `onUpdate`
callback registered via `getRaffles`. After `errorCode === 0`,
the affected `TRaffleDrawRun.has_unclaimed_prize` (in history)
and the winner row's `claimed_date` reflect the claim on the next
refresh.

**Side effects** (on `errorCode === 0`)
- The winner row's `claimed_date` is set server-side.
- Prize delivery is queued for the operator's integration to
 process. Balance / bonus / inbox updates that result from the
 delivery arrive through their own channels — not in this
 response.

**Throws**
`won_id` is required — the SDK throws synchronously when missing
or falsy.

**UI guidance**: see [UI Guide — `claimRafflePrize`](../../docs/ui/raffles/UIGuide_claimRafflePrize.md).

**Visitor mode**: not meaningfully supported. The SDK does not
block the call, but visitor sessions have no win history and the
server will reject it.

## Example
```ts
const detail = await window._smartico.api.getRaffleDrawRun({
  raffle_id: raffleId,
  run_id: runId,
});
const myWin = detail.prizes.flatMap(p => p.winners).find(w => /* user match here *\/ true);

if (!myWin || !myWin.raf_won_id || myWin.claimed_date) {
  console.log('[smartico] nothing to claim — keep CTA hidden');
  return;
}

console.log('[smartico] claim starting — set in-flight flag, show loading dots on the Claim button, keep the modal open');
const r = await window._smartico.api.claimRafflePrize({ won_id: myWin.raf_won_id });
console.log('[smartico] claim response received — clear in-flight flag');

if (r.errorCode === 0) {
  console.log('[smartico] claim succeeded — show a success toast; getRaffles onUpdate above will fire with refreshed state; prize delivery happens server-side');
} else if (r.errorCode === 1 && r.errorMessage?.toLowerCase().includes('already claimed')) {
  console.log('[smartico] prize was already claimed (perhaps from another tab) — treat as success, hide the Claim CTA');
} else {
  console.error('[smartico] claim failed — surface this error message to the user and allow retry:', r.errorMessage);
}
```

## Errors
**Error codes** (in `errorCode`)
- `0` — success; the claim is recorded and prize delivery is
 queued server-side.
- `1` — generic claim failure. The `errorMessage` distinguishes
 the specific cause (the server uses one error code for several
 distinct conditions): the prize has already been claimed, the
 `won_id` doesn't match a winning row for this user, or the user
 is in a control group for this raffle. Treat `1` as a retryable
 error if the message suggests a transient condition; treat as
 idempotent success if the message indicates already-claimed
 (the underlying state is what the consumer wants either way —
 the prize is claimed).
- other non-zero — generic server error. Surface `errorMessage`
 if any.

## Related
- `getRaffleDrawRun`
- `getRaffleDrawRunsHistory`
- `getRaffles`
