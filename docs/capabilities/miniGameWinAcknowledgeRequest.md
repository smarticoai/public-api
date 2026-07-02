# miniGameWinAcknowledgeRequest — API

> Manually acknowledges a mini-game spin — marks the win delivered server-side, or (with `lose: true`) finalises it as lost and returns the prize to the pool.
> Import: `import { /* types */ } from '@smartico/public-api'`
> Search terms: miniGameWinAcknowledgeRequest, minigames, doSAWAcknowledge, SAWAcknowledge, acknowledge, SAWAcknowledgeType, request_id, errCode, errMsg, cid, ts, uuid, payload, duration

## Signature
```ts
_smartico.api.miniGameWinAcknowledgeRequest(request_id: string, { lose }: { lose?: boolean } = {}): void
```

## Parameters
- `request_id` — Correlation id of the spin to finalise: the `request_id` from a `playMiniGame` result (played with `acknowledge: false`), or the `client_request_id` of a `getMiniGamesHistory` row.
- `options.lose` — Optional. When `true`, finalises the spin as lost — the prize is not credited and returns to the prize pool (see "Finalising as lost"). Omit (or pass `false`) to deliver the win.

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

**Finalising as lost (`lose: true`)**
Pass `{ lose: true }` to finalise the spin as LOST instead of won:
the prize is NOT credited and is returned to the game's prize pool
(available again for other players), and the spin fires the
mini-game "lose" engagement event instead of the win one. On the
next `getMiniGamesHistory` fetch the row shows `is_claimed:
true` with no prize attached. Use this for game mechanics where the
player can decline or forfeit the drawn prize — e.g. a
gamble/discard step, or a client-driven game where the user's final
action decides whether the pre-drawn prize is actually won. It only
works on a spin that is not yet finalised, so it requires playing
with `acknowledge: false` and calling promptly — once the automatic
acknowledge or the server-side fallback (below) has finalised the
spin, `lose: true` is a no-op and the prize stays credited.
("Explicit claim" prizes are exempt from the fallback, so for them
there is no time pressure.)

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
- Default (win): the prize value is credited on this call — this is
 the finalisation step that credits standard and "explicit claim"
 prizes alike (see `playMiniGame` "Prize handling").
- With `lose: true`: no credit; the prize returns to the prize pool
 and the "lose" engagement event fires.
- Either way the spin's `is_claimed` flips to `true` on the next
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

// Decline / forfeit — finalise the same spin as lost instead:
// the prize is not credited and goes back to the prize pool.
await window._smartico.api.miniGameWinAcknowledgeRequest(r.request_id, { lose: true });

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
