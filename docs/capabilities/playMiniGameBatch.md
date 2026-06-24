# playMiniGameBatch — API (TMiniGamePlayBatchResult)

> Plays a mini-game template `spin_count` times in one round-trip.
> Import: `import { TMiniGamePlayBatchResult } from '@smartico/public-api'`
> Search terms: playMiniGameBatch, minigames, TMiniGamePlayBatchResult, errCode, errMessage, saw_prize_id, jackpot_amount, first_spin_in_period

## Signature
```ts
_smartico.api.playMiniGameBatch(template_id: number, spin_count: number, { onUpdate }: { onUpdate?: (data: TMiniGameTemplate[]) => void } = {}): Promise<TMiniGamePlayBatchResult[]>
```

## Parameters
- `template_id` — The mini-game template ID.
- `spin_count` — Number of spins to play. The server attempts all `spin_count` spins — partial successes are normal when the user runs out of balance / spins mid-batch.
- `params` — Optional. Pass an `onUpdate` callback to subscribe to subsequent template refreshes.

## Returns — `Promise<TMiniGamePlayBatchResult[]>`
Array of `TMiniGamePlayBatchResult`. Each item:
- `errCode` (number) — Error code. `0` = success. See `playMiniGameBatch` TSDoc for the full table.
- `errMessage` (string) — Optional server-side error message.
- `saw_prize_id` (null) — ID of the won prize for this spin. Look up in `template.prizes`.
- `jackpot_amount` (null) — Jackpot amount the user won, populated when the prize type is `'jackpot'`.
- `first_spin_in_period` (number) — Epoch ms of the user's first spin in the current cooldown period; populated when `errCode === SAWSpinErrorCode.SAW_FAILED_MAX_SPINS_REACHED`.

## Behavioral contract
**Result shape note** — `TMiniGamePlayBatchResult` uses
`errCode` / `errMessage` (camelCase) — DIFFERENT from
`TMiniGamePlayResult` which uses `err_code` / `err_message`
(snake_case). Branch on the camelCase keys when reading batch
results.

**Per-spin independence**
The server iterates the requested spins and calls the prize
engine once per entry. If spin #2 fails with `SAW_NO_SPINS`,
spin #3 is still attempted — the server does NOT stop on first
error and does NOT roll back successful spins. Each
`results[i].errCode` is independent.

Practical implication: if the user has 3 spins available and
requests 5, expect results 0-2 with `errCode === 0` and results
3-4 with `errCode === SAW_NO_SPINS`.



**Auto-acknowledge**
The SDK fires a batch-acknowledge for all `request_id`s after
the batch response lands — fire-and-forget. Same recovery
semantics as `playMiniGame`: lost acknowledgements
become recoverable via `miniGameWinAcknowledgeRequest`
per row, and a server-side fallback job auto-acknowledges
stale spins every ~60 seconds.

**Idempotency**: NOT idempotent. A double-click sends two
batches. Guard the call site with an in-flight flag.

**Refresh after success (and after failure)**
Same as `playMiniGame` — the templates cache refreshes
and any `onUpdate` callback registered via `getMiniGames`
fires with the updated `spin_count` / `jackpot_current`.

**Side effects** (per-spin, on `errCode === 0`)
Same as `playMiniGame` — buy-in deducted, prize value
credited per prize type.

**UI guidance**: see [UI Guide — `playMiniGameBatch`](../../docs/ui/minigames/UIGuide_playMiniGameBatch.md).

**Visitor mode**: not supported.

## Example
```ts
const game = (await window._smartico.api.getMiniGames()).find(g => g.id === templateId);
if (!game) return;

console.log('[smartico] batch play starting — set in-flight flag, animate the chosen N spins sequentially in UI');
const results = await window._smartico.api.playMiniGameBatch(game.id, 5);
console.log('[smartico] batch response received — clear in-flight flag');

for (const [i, r] of results.entries()) {
  if (r.errCode === 0) {
    const prize = game.prizes.find(p => p.id === r.saw_prize_id);
    console.log('[smartico] spin', i, 'won:', prize?.name,
      r.jackpot_amount ? '(jackpot: ' + r.jackpot_amount + ')' : '');
  } else if (r.errCode === 40004) {
    const msTillNext = game.max_spins_period_ms! - (Date.now() - (r.first_spin_in_period ?? 0));
    console.log('[smartico] spin', i, 'capped — ' + Math.ceil(msTillNext / 1000) + ' s until next allowed');
  } else {
    console.error('[smartico] spin', i, 'failed —', r.errCode, r.errMessage);
  }
}
```

### Example response (REAL shape)
```json
[
  {
    "errCode": 40004,
    "errMessage": "Failed to spin. Max spins reached",
    "saw_prize_id": null,
    "jackpot_amount": null,
    "first_spin_in_period": 1782287011000
  }
]
```

## Errors
**Error codes**
Per-result `errCode` is from `SAWSpinErrorCode`. See
`playMiniGame` for the full table; the same codes apply
per spin.

**`first_spin_in_period` field**
Populated on results where `errCode === SAW_FAILED_MAX_SPINS_REACHED`
(40004). The value is the epoch-ms timestamp of the user's
first spin in the current cooldown period. Compute the
countdown as:
`template.max_spins_period_ms - (Date.now() - first_spin_in_period)`.

**`jackpot_amount` field**
Populated on results where the won prize is a jackpot
(`prize_type === 'jackpot'`). The amount the user just claimed
from the template's jackpot accumulator.

## Related
- `playMiniGame`
- `TMiniGamePlayResult`
- `SAWSpinErrorCode`
- `miniGameWinAcknowledgeRequest`
- `getMiniGames`
