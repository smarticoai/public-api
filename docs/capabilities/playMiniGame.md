# playMiniGame — API (TMiniGamePlayResult)

> Plays one round of a mini-game template — runs the server's randomised prize selection, deducts the buy-in cost (if any), credits the won prize, and returns the won `prize_id`.
> Import: `import { TMiniGamePlayResult } from '@smartico/public-api'`
> Search terms: playMiniGame, minigames, doSAWSpin, SAWSpin, spin, TMiniGamePlayResult, SAWSpinErrorCode, onUpdate, subscription, err_code, err_message, prize_id, request_id

## Signature
```ts
_smartico.api.playMiniGame(template_id: number, { onUpdate, acknowledge = true }: { onUpdate?: (data: TMiniGameTemplate[]) => void, acknowledge?: boolean } = {}): Promise<TMiniGamePlayResult>
```

## Parameters
- `template_id` — The mini-game template ID (from `TMiniGameTemplate.id`).
- `params` — Optional options bag.
- `params.onUpdate` — Pass a callback to subscribe to subsequent template refreshes (same channel as `getMiniGames`).
- `params.acknowledge` — Whether the SDK automatically sends and awaits the win acknowledge after the spin. Defaults to `true` (recommended). Set `false` to finalise the win yourself via `miniGameWinAcknowledgeRequest`— see "Acknowledge" above for the request-id caveat.

## Returns — `Promise<TMiniGamePlayResult>`
`TMiniGamePlayResult`:
- `err_code` (SAWSpinErrorCode) — Error code. `0` = success (`SAWSpinErrorCode.SAW_OK`). See `playMiniGame` TSDoc for the full table.
- `err_message` (string) — Optional server-side error message. Present only on non-zero `err_code`; may be empty even then.
- `prize_id` (number) — ID of the won prize. Look up in `template.prizes` to interpret (including `prize_type === 'no-prize'` for a configured loss slot). Always populated, even when `err_code !== 0`.
- `request_id` (string) — Correlation id of this spin. Pass it to `miniGameWinAcknowledgeRequest` to finalise the win when playing with `acknowledge: false` — no need to look it up via `getMiniGamesHistory`.

## Behavioral contract
**Preconditions**
Read the candidate template from `getMiniGames` and check:
- `spin_count > 0` for spin-based templates
 (`saw_buyin_type === 'spins'`).
- Sufficient balance for paid templates — points / gems /
 diamonds from `getUserProfile` against
 `buyin_cost_points` / `_gems` / `_diamonds`.
- `next_available_spin_ts` is in the past (or unset) — the
 server enforces a per-period max-attempts cap.
- Template is currently in its active period
 (operator-configured `activeFromDate` / `activeTillDate`).



**Prize handling**
On `err_code === 0`, `prize_id` matches an entry in
`template.prizes`. Look up the prize's `prize_type`
(`MiniGamePrizeTypeName`) to decide UI treatment:
- `'no-prize'` — the user spun but won nothing (an operator-
 configured "loss" slot). Buy-in is still deducted.
- `'points'` / `'gems-and-diamonds'` / `'spin'` — value
 credited to the user's profile / spin balance; visible on
 the next refresh.
- `'bonus'` — surfaces via `getBonuses`.
- `'jackpot'` — drains the template's `jackpot_current` to the
 user; resets the accumulator.
- `'raffle-ticket'` — adds tickets to the relevant raffle.
- `'mission'` / `'change-level'` — visible via the
 corresponding domain methods.
- `'manual'` — operator delivers offline.

**Acknowledge** (the `acknowledge` parameter, default `true`)
Every spin is finalised by a follow-up acknowledge step that
marks the win delivered. By default the SDK sends that
acknowledge and AWAITS it, so `playMiniGame` resolves only after
the win is finalised server-side. Keep the default unless you
have a specific reason not to.

Pass `acknowledge: false` to skip that automatic step.
`playMiniGame` then resolves as soon as the spin result is known,
without waiting for the win to be marked delivered. You finalise
it later by calling `miniGameWinAcknowledgeRequest` with the
`request_id` returned on this result.

What `acknowledge: false` does and does NOT defer:
- For STANDARD prizes the value is credited at spin time
 regardless, so opting out does NOT delay the balance change —
 it only defers the "delivered" bookkeeping and the `is_claimed`
 flag flipping in `getMiniGamesHistory`.
- For operator-configured "explicit claim" prizes the credit IS
 deferred until the spin is acknowledged, so those require an
 explicit acknowledge to finalise.

A server-side fallback auto-acknowledges ordinary un-acknowledged
spins after a short delay (about 1–3 minutes), so an ordinary
prize is never lost even without consumer action. "Explicit
claim" prizes are excluded from that fallback — if you use
`acknowledge: false` for one, you MUST acknowledge it explicitly
or its prize is never credited.

**Idempotency**: NOT idempotent. A double-click sends two
spins and deducts the buy-in twice. The SDK does NOT guard
against rapid clicks at the public API level — guard the call
site with an in-flight flag. The server enforces a per-user
per-template lock that serialises concurrent requests, so two
simultaneous calls won't be processed in parallel, but they
will both be processed sequentially (i.e. both deduct).

**Refresh after success (and after failure)**
The SDK automatically refreshes the templates cache on every
spin response and fires any `onUpdate` callback registered via
`getMiniGames` or this method. After `err_code === 0`, the
affected template's `spin_count` / `jackpot_current` /
`next_available_spin_ts` reflect the new state on the
refreshed array.

**Side effects** (on `err_code === 0`)
- Buy-in deducted at spin time (points / gems / diamonds / spin
 tickets — depending on `saw_buyin_type`), already applied by the
 time the call resolves. Balance updates flow via the
 user-properties channel (observe via `getUserProfile`).
- Prize value credited per the prize's type (see "Prize handling"
 above). Standard prizes are credited at spin time; "explicit
 claim" prizes are credited when the spin is acknowledged.
- The play is recorded server-side for analytics / reporting.

**UI guidance**: see [UI Guide — `playMiniGame`](../../docs/ui/minigames/UIGuide_playMiniGame.md).

**Visitor mode**: not supported. Visitor sessions trying to
spin receive `SAW_VISITOR_STOP_SPIN_REQUEST (-40001)`.

## Example
```ts
const games = await window._smartico.api.getMiniGames({
  onUpdate: (refreshed) => console.log('[smartico] templates refreshed — re-render lobby', refreshed),
});
const game = games.find(g => g.id === templateId);

if (!game) {
  console.log('[smartico] template not in current list — refresh getMiniGames');
  return;
}
if (game.saw_buyin_type === 'spins' && (game.spin_count ?? 0) === 0) {
  console.log('[smartico] no spins available — disable Play button, show "No spins" message');
  return;
}

console.log('[smartico] play starting — set in-flight flag, start game animation (wheel spin / scratch / lootbox open / etc.)');
const r = await window._smartico.api.playMiniGame(game.id);
console.log('[smartico] play response received');

if (r.err_code === 0) {
  const prize = game.prizes.find(p => p.id === r.prize_id);
  if (prize?.prize_type === 'no-prize') {
    console.log('[smartico] user lost — animate to the no-prize slot and show "Better luck next time" modal');
  } else {
    console.log('[smartico] user won — animate to prize', prize?.name,
      '— show acknowledge modal per template.acknowledge_type;',
      'getMiniGames onUpdate fires shortly with refreshed spin_count / jackpot');
  }
} else if (r.err_code === 40004) {
  console.error('[smartico] max spins reached — show countdown to next available spin (use playMiniGameBatch for first_spin_in_period if needed)');
} else if (r.err_code === -40001) {
  console.log('[smartico] visitor stopped — silently end the game, no prize modal');
} else {
  console.error('[smartico] play failed — show generic error with this message:', r.err_message);
}
```

Manual finalisation (`acknowledge: false`) — e.g. an explicit
"Claim" CTA, or finalising on your own schedule:
```ts
const r = await window._smartico.api.playMiniGame(game.id, { acknowledge: false });
if (r.err_code === 0) {
  // Spin resolved but not yet acknowledged. For standard prizes the
  // balance already changed server-side; "explicit claim" prizes
  // are credited only by the acknowledge below.
  console.log('[smartico] prize won — show the result / Claim CTA, then finalise');

  // On the user's Claim click, finalise with the request_id from the result.
  await window._smartico.api.miniGameWinAcknowledgeRequest(r.request_id);
  console.log('[smartico] win finalised — refresh getUserProfile / getMiniGames to reflect it');
}
```

### Example response (REAL shape)
```json
{
  "err_code": 0,
  "err_message": "",
  "prize_id": 37373,
  "request_id": "00000000-0000-0000-0000-000000000000"
}
```

## Errors
**Error codes** (in `err_code`, typed as `SAWSpinErrorCode`)
- `0` (`SAW_OK`) — success; `prize_id` identifies the won prize
 in `template.prizes`.
- `40001` (`SAW_NO_SPINS`) — user has no spin attempts for a
 spin-based template.
- `40002` (`SAW_PRIZE_POOL_EMPTY`) — all prize slots in the
 template are depleted.
- `40003` (`SAW_NOT_ENOUGH_POINTS`) — insufficient points for a
 points-cost template.
- `40004` (`SAW_FAILED_MAX_SPINS_REACHED`) — per-period
 max-attempts cap reached. The server's
 `first_spin_in_period` value (exposed in
 `TMiniGamePlayBatchResult`; not surfaced in the single
 `TMiniGamePlayResult`) marks the period start.
- `40007` (`SAW_TEMPLATE_NOT_ACTIVE`) — template outside its
 active time window.
- `40009` (`SAW_NOT_IN_SEGMENT`) — user fails the template's
 visibility segment check, OR (for lootbox variants) the day's
 prize pool is empty.
- `40011` (`SAW_NO_BALANCE_GEMS`) — insufficient gems.
- `40012` (`SAW_NO_BALANCE_DIAMONDS`) — insufficient diamonds.
- `-40001` (`SAW_VISITOR_STOP_SPIN_REQUEST`) — visitor session
 tried to play a non-visitor-mode template. The default UI
 silently stops the game; no prize awarded.
- other non-zero — generic server error. Surface `err_message`.

## Related
- `getMiniGames`
- `getUserProfile`
- `SAWSpinErrorCode`
- `TMiniGamePlayBatchResult`
- `MiniGamePrizeTypeName`
- `getBonuses`
- `miniGameWinAcknowledgeRequest`
- `getMiniGamesHistory`
