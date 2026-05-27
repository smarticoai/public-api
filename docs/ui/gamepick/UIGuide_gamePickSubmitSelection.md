# UI Guide — `gamePickSubmitSelection` (MatchX)

## Overview
- Submits all MatchX score predictions for a round in one shot.
- First successful submit charges one buy-in (per `saw_buyin_type_id`);
  subsequent edits within the same round are free.
- Server hard-rejects submits after `last_bet_date` with `errCode: 3` (no
  buy-in consumed).

## Loading state

User taps "Submit" → enter in-flight state (spinner + disabled button).
Server typically responds in 200–600 ms.

```ts
const [submitting, setSubmitting] = useState(false);

const onSubmit = async () => {
  if (submitting) return;
  setSubmitting(true);
  const r = await window._smartico.api.gamePickSubmitSelection({
    saw_template_id,
    round,
  });
  setSubmitting(false);
  handleResult(r);
};
```

## Idempotency guard

Re-submit is safe (returns `errCode: 3` and never double-charges) but the
double-roundtrip wastes time. Guard the call site as above.

## Action button decision matrix

UI behavior per `errCode`:

| `errCode` | Action |
|---|---|
| `0` (success) | Show "Predictions saved" toast; refresh round to surface persisted picks; offer link to leaderboard |
| `3` (no changes / all events closed) | Silent — assume user clicked Submit with no edits |
| `4` (round / event not found) | Refresh active rounds; show "Round no longer available" |
| `40001` (no spins left) | Disable Submit; show "Out of attempts" + top-up CTA |
| `40003` (insufficient points) | Disable Submit; show insufficient-points message naming the deficit |
| `40004` (max spins cap hit) | Show "Daily limit reached — try again tomorrow" |
| `40007` (template not active) | Show "Game not currently available"; bounce back to lobby |
| `40009` (segment mismatch) | Show "This game isn't available to you" |
| `40011` / `40012` (gems / diamonds) | Same as `40003` for the matching currency |
| `100002` (template not found) | Show "Game not found"; bounce back |
| `100000` (auth) | Re-init session |
| Other non-zero | Generic error toast; allow retry |

## Buy-in feedback

On the FIRST successful submit, the server deducts the buy-in. The default
Smartico UI shows a confirmation toast naming the cost ("100 points
deducted — good luck!"). The user's balance updates via
[`getUserProfile`](../../api/classes/WSAPIUser.md#getuserprofile)'s
`props_change` channel — re-render any balance widgets.

## Refresh after success

- Re-call
  [`gamePickGetActiveRound`](../../api/classes/WSAPIGamePick.md#gamepickgetactiveround)
  for this round to surface `user_placed_bet === true` and
  `has_not_submitted_changes === false`.
- The user's balance updates push automatically via the user-properties
  channel.
- Score is awarded later, after the operator resolves the round (status
  transitions to `RoundResolved` (4)).

## Selection format

Each event must include:

```ts
{
  gp_event_id:          number,
  team1_user_selection: number,  // predicted score for team 1
  team2_user_selection: number,  // predicted score for team 2
}
```

Events not included in the submit are treated as "no change".

## Mobile vs desktop

- **Mobile**: full-width Submit button anchored to bottom of viewport.
- **Desktop**: Submit button bottom-right of the round detail card.

## Animations / transitions

- Submit tap → button morphs to spinner.
- On success → green checkmark briefly replaces the spinner; then toast
  fades in.
- On error → spinner clears; error toast slides in; button re-enables.

## Performance

- Single round-trip per submit.
- Server only writes events whose selections changed (delta UPSERT),
  so submitting the full event list is efficient.
