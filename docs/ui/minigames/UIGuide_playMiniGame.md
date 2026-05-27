# UI Guide — `playMiniGame`

## Overview
- Action-focused mutation. User clicks "Play" / "Spin" on a mini-
  game card; the server runs the prize selection and returns the
  won prize.
- Auto-acknowledges on success (fire-and-forget) — most consumers
  don't need to handle acknowledge manually.
- The SDK does NOT prevent double-clicks at the public API level;
  guard the call site.

## Loading state — the game animation IS the loading state

For most mini-game types, the **game animation itself serves as the
loading state**. Start the animation immediately on click (before
the response arrives); the server response arrives during the
animation; sync the final reveal to land at the animation's end
position.

Typical animation durations by game type:

- Wheel: ~15 s (long enough to mask any reasonable latency)
- Scratch card: user-driven (no time pressure)
- Lootbox: ~3 s (open animation)
- Gift box: ~2 s (reveal)
- Treasure hunt / Voyager / Plinko / Coin flip: ~2–5 s
- Match X / Quiz: not applicable (separate game server)

If the server response arrives late (network slow), pause the
animation or hold at a "still spinning" loop until the result
lands.

## Idempotency guard

The SDK does NOT prevent double-clicks. Guard the call site:

```ts
const [playing, setPlaying] = useState(false);

const onPlay = async () => {
  if (playing) return;
  setPlaying(true);
  startAnimation();
  const r = await window._smartico.api.playMiniGame(template_id);
  syncAnimationToResult(r);
  setPlaying(false);
  handleResult(r);
};
```

**Don't skip this guard** — a double-tap deducts the buy-in twice.
The server has its own per-user-per-template lock that serialises
concurrent requests, but it still processes both sequentially.

## Action button decision matrix

UI behavior per `err_code`:

| `err_code` | Action |
|---|---|
| `0` (success) | Animate the result; show acknowledge modal per `template.acknowledge_type` (see below); refresh balance widgets. |
| `40001` (no spins) | Disable Play; show `no_attempts_message` from the template. |
| `40002` (prize pool empty) | Disable Play; show "All prizes claimed for now". |
| `40003` (insufficient points) | Disable Play; show insufficient-balance UI naming the deficit. |
| `40004` (max spins reached) | Show countdown to next available spin. `first_spin_in_period` is on the batch result type; for the single-play path, derive next-available from `template.next_available_spin_ts`. |
| `40007` (template not active) | Disable / hide the template. |
| `40009` (segment mismatch / lootbox empty for today) | Hide the template OR show "Not available today" for lootboxes. |
| `40011` / `40012` (insufficient gems / diamonds) | Same as `40003` for the matching currency. |
| `-40001` (visitor stopped) | Silently end the game; no prize modal. Default Smartico UI doesn't surface this as an error. |
| Other non-zero | Show generic error toast. Allow retry. |

## Prize reveal modals

`template.acknowledge_type` controls the post-animation modal:

| Value | Behavior |
|---|---|
| `Silent` (1) | No modal; auto-acknowledge fires silently. |
| `QuickMessage` (2) | Toast popup; auto-closes after ~5 s; auto-acknowledge fires. |
| `FullMessage` (3) | Full-screen modal; user dismisses; auto-acknowledge fires. |
| `ExplicitAcknowledge` (4) | Modal with explicit "Claim" CTA; acknowledge sends only on tap. Use this for high-value or lootbox-style rewards. |

For `ExplicitAcknowledge`, suppress the SDK's auto-acknowledge by
NOT using this method's `playMiniGame` directly — call the
acknowledge via [`miniGameWinAcknowledgeRequest`](../../api/classes/WSAPIMiniGames.md#minigamewinacknowledgerequest)
when the user taps Claim. (The SDK still auto-fires the
acknowledge from `playMiniGame`, but the visual gate is still
meaningful.)

Modal contents per prize:

- Icon: `prize.icon` (1:1)
- Title: `prize.name`
- Message: `prize.aknowledge_message` (note the typo in the field
  name — `aknowledge` not `acknowledge`)
- CTA: `prize.acknowledge_action_title` with action
  `prize.acknowledge_dp` (pass through `_smartico.dp()` for safe
  execution)
- Optional additional CTA: `prize.acknowledge_action_title_additional`
  + `prize.acknowledge_dp_additional`

## "No prize" handling

When the won prize has `prize_type === 'no-prize'`, the user has
"lost" — the buy-in was still deducted. Show a friendly "Better
luck next time" treatment rather than a celebration. The operator
configures these slots intentionally — they're not errors.

## Refresh after success

The SDK auto-refreshes the templates cache after every spin. The
`onUpdate` callback registered via `getMiniGames` fires with the
updated array — observe the new `spin_count`, `jackpot_current`,
and `next_available_spin_ts`.

The user's balance updates (points / gems / diamonds credited from
prize wins) flow via
[`getUserProfile`](../../api/classes/WSAPIUser.md#getuserprofile)'s
`props_change` channel.

## Per-game-type animation nuances

| Game type | Animation pattern |
|---|---|
| Spin a Wheel | Start spinning on click; sync the final position to land on the won prize sector at ~15 s. Cubic-bezier deceleration. |
| Scratch Card | User-driven; the won prize is hidden under the scratch layer. Reveal at scratch completion threshold (~60% scratched). |
| Gift Box | All boxes shake on play; user taps to "open" their chosen box; the won prize appears in the tapped box. |
| Lootbox (Weekdays / CalendarDays) | Grid layout; user picks N from grid; pre-determined positions reveal the won prize. |
| Treasure Hunt | Multi-step map; each play advances one step; final step reveals the prize. |
| Voyager | Journey-style multi-step. |
| Plinko | Ball drops through pegs; landing position determines the won prize. Physics-driven path or pre-computed to match server result. |
| Coin Flip | Binary heads/tails reveal. |

The default Smartico UI ships components for all these — for
custom UIs, the consumer is responsible for the animation per type.

## Mobile vs desktop

- **Game canvas**: scales with viewport.
- **Modal**: desktop centered with backdrop; mobile full-screen.
- **Touch targets**: mobile needs 44×44 px minimum for game
  interactions.

## Performance

- Single round-trip per spin.
- Pre-load game animation assets at template card render time so
  the animation starts immediately on click.
- The `onUpdate` callback fires after each spin — use it to refresh
  the card's spin_count badge.
