# UI Guide — `gamePickSubmitSelectionQuiz` (Quiz)

## Overview
- Submits all Quiz answers for a round in one shot.
- First successful submit charges one buy-in (per `saw_buyin_type_id`).
- Same error-handling matrix as
  [`gamePickSubmitSelection`](../../api/classes/WSAPIGamePick.md#gamepicksubmitselection).

## Loading state and idempotency guard

Identical to
[`gamePickSubmitSelection`](../../api/classes/WSAPIGamePick.md#gamepicksubmitselection)
— spinner on click, guard against double-tap, single round-trip.

## Action button decision matrix

Identical to
[`gamePickSubmitSelection`](../../api/classes/WSAPIGamePick.md#gamepicksubmitselection)
— see that UI guide for the full per-`errCode` table. The codes returned
are the same set.

The reported analytics event differs: this method emits
`minigame_quiz_prediction` instead of `minigame_matchx_prediction`.

## Selection format

Each event must include:

```ts
{
  gp_event_id:    number,
  user_selection: string,  // e.g. '1' / '2' / 'x' (1×2 market)
                           //  or  'yes' / 'no'   (binary market)
                           //  or  operator-defined string (custom)
}
```

The accepted `user_selection` values depend on `market_type_id` on the event:

| Market | Valid `user_selection` values |
|---|---|
| 1×2 | `'1'`, `'x'`, `'2'` |
| Yes / No | `'yes'`, `'no'` |
| Custom | Operator-defined; check the event's `event_meta` for allowed values |

## Quiz UI patterns

- **Radio button set** per event row — exactly one answer selectable.
- **Locked after deadline**: when `is_open_for_bets === false`, render the
  user's prior selection as read-only and disable the input.

## Refresh after success

Same as
[`gamePickSubmitSelection`](../../api/classes/WSAPIGamePick.md#gamepicksubmitselection):
re-fetch the active round to surface persisted state; balance updates push
via the user-properties channel; score is awarded after operator
resolution.

## Mobile vs desktop

- **Mobile**: vertical radio button list.
- **Desktop**: horizontal button group per event.

## Performance

- Single round-trip; delta UPSERT — only changed selections are written.
