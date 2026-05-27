# UI Guide — `gamePickGetActiveRound`

## Overview
- Returns a single round with its events, user selections, scoring rules.
- Powers the round-detail / prediction-input screen.
- No cache; no push subscription.

## Detail view layout

Top-to-bottom sections in the default Smartico UI:

1. **Header**: round name + description + status pill (see
   [`gamePickGetActiveRounds`](../../api/classes/WSAPIGamePick.md#gamepickgetactiverounds)
   for status mapping).
2. **Timer / deadline**: countdown to `last_bet_date` ("Bets close in 2h 15m").
3. **Score recap (if scored)**: `user_score`, full/partial/lost counts.
4. **Event list**: one row per event in `events[]`.

## Event row layout

Each event row carries:

| Field | Source | Notes |
|---|---|---|
| Teams / question | `event_meta.team1_name`, `event_meta.team2_name` (MatchX) or `event_meta.text` (Quiz) | Heading |
| Team images | `event_meta.team1_img`, `event_meta.team2_img` | 32×32 px (1:1) |
| Match date | `match_date` | "Sat 25 May · 16:00" |
| Sport | `event_meta.sport` | Small chip |
| Odds | `odds_details` | Optional display |
| User selection input | based on `market_type_id` | Score pickers (MatchX) / radio (Quiz) |
| Resolution badge | `resolution_type_id` (`GamePickResolutionType`) | Only after resolution |
| `is_open_for_bets` | boolean | Disable input when false |

## Prediction input by `market_type_id`

| Market | Input type |
|---|---|
| MatchX Goals / Winner | Two numeric pickers (team1 score / team2 score) |
| Quiz 1×2 | Three buttons (1 / X / 2) |
| Quiz Yes / No | Two buttons (Yes / No) |
| Quiz custom | Operator-defined buttons |

## Action button decision matrix

Bottom CTA per round state:

| State | CTA |
|---|---|
| `is_active_now && has_open_for_bet_events && !user_placed_bet` | "Submit predictions" (primary) |
| `is_active_now && has_open_for_bet_events && user_placed_bet` (and edits made) | "Update predictions" (primary) |
| `is_active_now && user_placed_bet` (no pending changes) | Disabled "Predictions submitted" |
| `!has_open_for_bet_events` | Hidden / "View only" message |
| `is_resolved` | "View results" — links to history |

## Resolution badges (`GamePickResolutionType`)

| Value | Badge |
|---|---|
| `None` (0) | No badge (event not yet resolved) |
| `Lost` (2) | Red X icon |
| `PartialWin` (3) | Amber half-star |
| `FullWin` (4) | Green checkmark |

## Edits and `allow_edit_answers`

When the round is open and an event's `is_open_for_bets` is true, the user
can edit predictions for that event. The `allow_edit_answers` flag on the
round controls whether edits are accepted; the server enforces this and
returns `errCode: 3` (no-op) if submits happen after the deadline.

## Error states

| `errCode` | Treatment |
|---|---|
| `4` (round / event not found) | Refresh active rounds and bounce back to lobby |
| `100002` (template not found) | Bounce back to lobby |
| `100000` (auth) | Re-init session |

## Refresh

- No SDK cache.
- Re-call after a submit to surface the persisted predictions and updated
  state.
- Poll every 30–60 s while the user is on the screen if event resolution
  updates matter.

## Mobile vs desktop

- **Mobile**: event rows stack full-width with score pickers below the
  teams.
- **Desktop**: 2-column event grid; score pickers inline with teams.

## Performance

- Single round-trip. The full event list ships in one payload.
- For lobby views with many rounds, prefer
  [`gamePickGetGameInfo`](../../api/classes/WSAPIGamePick.md#gamepickgetgameinfo)
  for a metadata-only round list and only call this method when the user
  opens a specific round.
