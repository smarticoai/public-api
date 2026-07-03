# UI Guide — `miniGameWinAcknowledgeRequest`

Action-focused method — no list/card rendering of its own. It finalises
a spin played with `acknowledge: false`: as **won** (default) or as
**lost** (`{ lose: true }`). The UI patterns below cover the three
call sites: an explicit Claim CTA, a decline/forfeit outcome, and
history-row recovery.

## When the UI calls this

| Flow | Trigger | Call |
|---|---|---|
| Explicit claim | User taps "Claim" in the prize modal (`acknowledge_type === 'ExplicitAcknowledge'`) after `playMiniGame(id, { acknowledge: false })` | `miniGameWinAcknowledgeRequest(r.request_id)` |
| Decline / forfeit | Game outcome or user choice says the drawn prize is NOT won (skill games like Voyager, gamble/discard steps) | `miniGameWinAcknowledgeRequest(r.request_id, { lose: true })` |
| History recovery | User taps "Claim" on a `getMiniGamesHistory` row with `is_claimed === false` | `miniGameWinAcknowledgeRequest(row.client_request_id)` |

## Action button decision matrix

- **Win path (Claim CTA)**: enable the button as soon as the play
  result is shown; disable it (with a spinner) while the request is
  in flight; on resolve, show the prize's `aknowledge_message` modal
  copy and refresh balance widgets (`getUserProfile`) and
  `getMiniGames`.
- **Lose path**: no user-facing "lose the prize" button in most
  designs — the game flow decides. The default Smartico UI sends
  `lose: true` when the Voyager run fails (not all stars collected),
  then shows the prize's `aknowledge_message_lose` copy (fall back to
  a generic "Better luck next time" treatment when the operator
  didn't configure it).
- **If you DO offer an explicit decline choice** (keep-or-gamble
  UIs): render "Claim" and "Decline" side by side, disable both on
  first tap, and treat the two calls as mutually exclusive — the
  first one to reach the server wins; the other becomes a no-op.
- **History recovery rows**: see
  [UI Guide — `getMiniGamesHistory`](UIGuide_getMiniGamesHistory.md)
  for the row-level Claim CTA.

## Timing constraints (drive the UX)

- Standard prizes are auto-finalised as WON by a server-side fallback
  after ~1–3 minutes. A decline/forfeit decision must therefore be
  sent promptly after the spin — don't park the choice behind an
  unbounded modal. After the fallback fires, `lose: true` is a no-op
  and the prize stays credited.
- "Explicit claim" prizes are exempt from the fallback: the Claim CTA
  can wait indefinitely, and an unclaimed prize is simply never
  credited. Surface unclaimed spins via the history view.

## Idempotency guard

The call is idempotent server-side (no double credit), so a
double-tap is harmless — but still disable the button in flight to
avoid duplicate requests and modal flicker.

## Result handling

```ts
const r = await window._smartico.api.playMiniGame(game.id, { acknowledge: false });
if (r.err_code === 0) {
  const prize = game.prizes.find(p => p.id === r.prize_id);
  // ... run the game / show the Claim UI ...

  if (playerWon) {
    await window._smartico.api.miniGameWinAcknowledgeRequest(r.request_id);
    console.log('[smartico] win finalised — show', prize?.aknowledge_message,
      'and refresh getUserProfile / getMiniGames');
  } else {
    await window._smartico.api.miniGameWinAcknowledgeRequest(r.request_id, { lose: true });
    console.log('[smartico] spin finalised as lost — show',
      prize?.aknowledge_message_lose ?? 'a generic "Better luck next time" message');
  }
}
```

## Empty / loading / error states

- In flight: spinner on the CTA, inputs locked.
- On network failure: re-enable the CTA and let the user retry — the
  operation is safe to repeat. For standard prizes the server-side
  fallback will eventually deliver the win even if every retry fails
  (a pending decline, however, is lost once the fallback fires).
- No dedicated error codes: a non-zero `err_code` is a generic server
  error — show a generic error toast.

## Related guides

- [UI Guide — `playMiniGame`](UIGuide_playMiniGame.md) — prize reveal
  modals, `acknowledge_type` matrix, decline/forfeit flow.
- [UI Guide — `getMiniGamesHistory`](UIGuide_getMiniGamesHistory.md) —
  unclaimed-row recovery.
