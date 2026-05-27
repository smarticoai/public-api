# UI Guide — `gamePickGetGameInfo`

## Overview
- Returns the game template configuration + metadata for every round
  (without events).
- Powers the game welcome / lobby screen.
- Lighter than
  [`gamePickGetActiveRounds`](../../api/classes/WSAPIGamePick.md#gamepickgetactiverounds)
  because it omits the per-round event payload.
- No cache; no push subscription.

## Welcome / lobby layout

The default Smartico UI uses this for the top-level Game Pick screen:

| Section | Source |
|---|---|
| Game title | `sawTemplate.saw_template_ui_definition.name` |
| Branding image | `sawTemplate.saw_template_ui_definition` (theme-dependent) |
| Buy-in chip | `saw_buyin_type_id` + `buyin_cost_*` (see table below) |
| Attempts counter | `spin_count` (visible when `saw_buyin_type_id` is Spins) |
| Rounds list | `allRounds[]` |

## Buy-in chip mapping (`saw_buyin_type_id`)

| Value | Display |
|---|---|
| Free (0) | "Free to play" pill |
| Points (1) | "100 points" with points icon |
| Gems (2) | "10 gems" with gems icon |
| Diamonds (3) | "1 diamond" with diamonds icon |
| Spins (4) | "X attempts left" using `spin_count` |

## Rounds metadata list

Each row in `allRounds[]` carries:

| Field | Source | Notes |
|---|---|---|
| Round name | `round_name` | Title |
| Description | `round_description` | Subtitle |
| Window | `open_date`, `last_bet_date` | "Open • Bets close in 2h" |
| Status pill | `round_status_id` | Same mapping as [`gamePickGetActiveRounds`](../../api/classes/WSAPIGamePick.md#gamepickgetactiverounds) |

Click a row → fetch
[`gamePickGetActiveRound`](../../api/classes/WSAPIGamePick.md#gamepickgetactiveround)
for that `round_id` (events are not in this response).

## When to use this vs `gamePickGetActiveRounds`

| Use this method | Use `gamePickGetActiveRounds` |
|---|---|
| Welcome / lobby screen showing all rounds (open + closed + resolved) | Only open rounds with their event lists |
| When you only need round metadata (titles, windows) | When you want to render prediction inputs inline |
| Lighter payload — skips events | Heavier — full event payload |

## Refresh

- No cache.
- Re-call after a successful submit to refresh `spin_count`.
- Otherwise re-call on screen mount.

## Error states

| `errCode` | Treatment |
|---|---|
| `100002` (template not found) | Show "Game not available" |
| `100000` (auth) | Re-init session |

## Mobile vs desktop

- **Mobile**: header + rounds stacked vertically.
- **Desktop**: header on top, rounds in a 2-column grid below.

## Performance

- Single round-trip with no event payload — much smaller than
  [`gamePickGetActiveRounds`](../../api/classes/WSAPIGamePick.md#gamepickgetactiverounds).
