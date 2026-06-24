# miniGameWinAcknowledgeRequest — API

> Manually acknowledges a mini-game spin — marks the win delivered server-side.
> Import: `import { /* types */ } from '@smartico/public-api'`
> Search terms: miniGameWinAcknowledgeRequest, minigames, doSAWAcknowledge, SAWAcknowledge, acknowledge, SAWAcknowledgeType, request_id, errCode, errMsg, cid, ts, uuid, payload, duration

## Signature
```ts
_smartico.api.miniGameWinAcknowledgeRequest(request_id: string): void
```

## Parameters
- `request_id` — Correlation id of the spin to finalise: the `request_id` from a `playMiniGame` result (played with `acknowledge: false`), or the `client_request_id` of a `getMiniGamesHistory` row.

## Returns
_No return value._

## Behavioral contract
**When to call**
- **Primary — after `playMiniGame(..., { acknowledge: false })`.**
 You opted out of the automatic acknowledge to finalise the win
 on your own schedule (e.g. on a user "Claim" tap). Pass the
 `request_id` from that call's result here when ready. This is
 REQUIRED for operator-configured "explicit claim" prizes — they
 are not covered by the server-side fallback, so without this
 call their prize is never credited.
- **Recovery — a lost acknowledge.** `playMiniGameBatch`
 acknowledges on a fire-and-forget basis; if one is lost (network
 drop) the spin shows `is_claimed: false` in
 `getMiniGamesHistory`. Pass that row's `client_request_id`
 to deliver it.

The `request_id` on a `playMiniGame` result and the
`client_request_id` on a `getMiniGamesHistory` row are the
same correlation id — this method accepts either.

**Idempotency**: safe. Acknowledging a spin that is already
finalised — by you, by the automatic acknowledge, or by the
fallback — is a no-op with no double credit. Acknowledging a
failed spin's id is likewise a no-op.

**Server-side fallback**
Even if you never call this, a server-side job finalises ordinary
un-acknowledged spins automatically after a short delay (about 1–3
minutes), flipping `is_claimed` to `true` on the next
`getMiniGamesHistory` fetch. "Explicit claim" prizes are the
exception — excluded from the fallback, they require an explicit
call here.

**Side effects** (first successful call for an un-acknowledged spin)
- For "explicit claim" prizes, the prize value is credited on this
 call. For standard prizes the value was already credited at spin
 time (see `playMiniGame` "Prize handling"); this call only
 marks the win delivered.
- The spin's `is_claimed` flips to `true` on the next
 `getMiniGamesHistory` fetch.

**Visitor mode**: not supported.

## Example
```ts
// Primary — finalise a win you played with acknowledge: false.
const r = await window._smartico.api.playMiniGame(templateId, { acknowledge: false });
if (r.err_code === 0) {
  console.log('[smartico] show the prize / Claim CTA; on Claim, finalise the win');
  await window._smartico.api.miniGameWinAcknowledgeRequest(r.request_id);
}

// Recovery — re-acknowledge any spins a batch acknowledge missed.
const history = await window._smartico.api.getMiniGamesHistory({ limit: 20 });
for (const row of history.filter(h => !h.is_claimed)) {
  console.log('[smartico] re-acknowledging stale spin', row.client_request_id);
  await window._smartico.api.miniGameWinAcknowledgeRequest(row.client_request_id);
}
```

### Example response (REAL shape)
> Where this real payload differs from the typed Returns above (TS interface vs raw wire), the REAL shape is the runtime truth.
```json
{
  "request_id": "00000000-0000-0000-0000-000000000000",
  "errCode": 0,
  "errMsg": "",
  "cid": 705,
  "ts": 1782287011139,
  "uuid": "00000000-0000-0000-0000-000000000000",
  "payload": null,
  "duration": null
}
```

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `playMiniGame`
- `playMiniGameBatch`
- `getMiniGamesHistory`
