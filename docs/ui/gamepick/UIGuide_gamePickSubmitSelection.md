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

The round's `score_type_id`
([`GamePickScoreType`](../../api/enumerations/GamePickScoreType.md)) decides
both the input and the values. Read it before rendering the round.

### Exact score (`score_type_id` 1)

Two score pickers. Each event must include:

```ts
{
  gp_event_id:          number,
  team1_user_selection: number,  // predicted score for team 1
  team2_user_selection: number,  // predicted score for team 2
}
```

### Difference in goals (`score_type_id` 2)

No score pickers. The player picks the winner and the winning margin from a
fixed list of bands. The winner's selection is a `{ from, to }` band, the other
team's is `0`:

```ts
// home wins by 11–14
{ gp_event_id, team1_user_selection: { from: 11, to: 14 }, team2_user_selection: 0 }
// away wins by 1–3
{ gp_event_id, team1_user_selection: 0, team2_user_selection: { from: 1, to: 3 } }
```

Offer exactly these bands, the same as the default Smartico UI:

| Sport (`event_meta.sport_type_id`) | Bands, closest margin first |
|---|---|
| Cricket (21) | `0–1`, `2–7`, `8–200` |
| Every other sport | `1–3`, `4–6`, `7–8`, `9–10`, `11–14`, `15–18`, `19–21`, `22–25`, `26–29`, `30–40`, `40–99` |

The default Smartico UI shows one picker across the match: from "home wins by
40–99" through the closest home bands, a middle "no pick" stop, then the away
bands up to "away wins by 40–99". The middle stop cannot be submitted, so there
is no separate draw pick. Label the pick "Home wins by 11–14", never as a score.

A saved pick comes back in the same shape: the side holding `{ from, to }` is
the predicted winner. Do not flatten the band to a number — an exact-score
input would then show `11 : 0` and overwrite the pick on the next submit.

Scoring after resolution: `FullWin` when the final margin is inside the band,
`PartialWin` for the right winner with the margin outside the band, `Lost`
otherwise.

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
