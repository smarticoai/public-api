# UI Guide — `playMiniGameBatch`

## Overview
- Plays the same template `spin_count` times in a single
  round-trip. Returns an array of per-spin results.
- Each result is independent — the server does NOT roll back on
  partial failures.
- Use for "Spin N times" / "Open N lootboxes" affordances.

## Result shape note

`TMiniGamePlayBatchResult` uses **camelCase** `errCode` /
`errMessage` (differs from `TMiniGamePlayResult` which uses
`err_code` / `err_message`). Branch on the camelCase keys.

## Loading state

For multi-spin batches, the UI needs to choose between:

1. **Sequential animation** — animate each spin one at a time using
   the response array as the "script". The default Smartico UI
   uses this pattern for multi-spin lootboxes. ~2-3 s per spin.
2. **Bulk reveal** — animate all spins in parallel (faster but
   visually busy). Suitable for "open 10 lootboxes" power-user
   affordances.
3. **Skip animation** — show a results table immediately.
   Suitable for "auto-spin N" power affordances.

Set an in-flight flag on click; clear it when the response lands
AND any animation completes.

## Idempotency guard

Same as `playMiniGame` — guard against double-clicks. A
double-tap sends two batches, each deducting `spin_count` worth of
buy-in.

## Per-spin result handling

Iterate `results[]` and handle each result independently:

```ts
for (const [i, r] of results.entries()) {
  if (r.errCode === 0) {
    const prize = template.prizes.find(p => p.id === r.saw_prize_id);
    if (prize?.prize_type === 'no-prize') {
      console.log('[smartico] spin', i, 'lost');
    } else {
      console.log('[smartico] spin', i, 'won:', prize?.name);
    }
  } else if (r.errCode === 40001) {
    console.log('[smartico] spin', i, '— no spins left; abort the rest of the animation early');
    break;
  } else if (r.errCode === 40004) {
    const msTillNext = template.max_spins_period_ms! - (Date.now() - (r.first_spin_in_period ?? 0));
    console.log('[smartico] spin', i, 'capped — ' + Math.ceil(msTillNext / 1000) + 's until next');
  } else {
    console.error('[smartico] spin', i, 'failed:', r.errMessage);
  }
}
```

## Partial-success handling

Common scenario: user requests 5 spins but only has 3 spin
tickets. Results[0–2] succeed; results[3–4] fail with
`SAW_NO_SPINS`.

UI options:

- Show all 3 successful prizes; then surface a "You ran out of
  spins" message for the remaining 2 attempts.
- Or skip the failed animations entirely and only render the
  successful results.

The default Smartico UI shows successful results then a brief
"No more spins" toast.

## `first_spin_in_period` for cooldown UX

When any result has `errCode === SAW_FAILED_MAX_SPINS_REACHED`
(40004), the result's `first_spin_in_period` field carries the
epoch ms of the user's first spin in the current cooldown
period. Compute the countdown:

```ts
const msTillNext = template.max_spins_period_ms! - (Date.now() - r.first_spin_in_period!);
```

Show "Available in HH:MM:SS" countdown on the disabled Play CTA.

## Jackpot wins in batches

When a result has `jackpot_amount` set, the user won a jackpot on
that specific spin. Drain the template's `jackpot_current` in the
UI (the next `getMiniGames` push will confirm the reset).

For multi-jackpot wins in a single batch (rare but possible), sum
the amounts visually.

## Animations / transitions

Sequential animation pattern (most common):

  1. Disable the Play CTA, show loading state.
  2. For each result in order:
     - Trigger the game-type animation (wheel spin, scratch
       reveal, lootbox open, etc.).
     - Sync the final position / reveal to the result's prize.
     - Show a brief prize callout (~500 ms) between spins.
  3. After the last spin, show a summary modal with total wins.

The default Smartico UI uses this pattern for lootboxes; wheel /
plinko / coin flip typically animate one at a time.

## Mobile vs desktop

- **Sequential animation**: identical on both, just smaller canvas
  on mobile.
- **Summary modal**: desktop centered; mobile full-screen sheet.

## Performance

- Single round-trip per batch — much cheaper than N sequential
  `playMiniGame` calls (one WS roundtrip vs N).
- Pre-determine the animation sequence from the result array
  before starting — don't await each spin's animation completion
  before deciding the next.
