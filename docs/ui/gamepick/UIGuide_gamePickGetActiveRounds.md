# UI Guide — `gamePickGetActiveRounds`

## Overview
- Returns every open round for a MatchX or Quiz game template, with full
  event lists and the user's selections per event.
- Powers the rounds-lobby screen.
- No SDK cache; every call is a live HTTP roundtrip to the Game Pick games
  server.
- No push subscription — poll if you need live status updates.

## List view organization

Single flat list of round cards. The default Smartico UI sorts by `open_date`
ascending (closest-opening or already-open first). Rounds with status
`NoEventsDefined` (1) are filtered out server-side and never appear.

## Item card / tile

Fields rendered per round card:

| Field | Source | Notes |
|---|---|---|
| Round name | `round_name` | Title |
| Description | `round_description` | Subtitle (truncated) |
| Open / close window | `open_date`, `last_bet_date` | "Bets close in 2h 15m" |
| Event count | `events.length` | "5 matches" / "10 questions" |
| User progress | `user_placed_bet` | "Predictions submitted" badge or "Make your picks" CTA |
| Score so far | `user_score` | Visible after resolution |
| Status pill | `round_status_id` | See mapping below |

## Status pill mapping (`GPRoundStatus`)

| Value | Label / treatment |
|---|---|
| `Other` (-1) | Active — green pill "Open" |
| `NoMoreBetsAllowed` (2) | Amber pill "Bets closed" |
| `AllEventsResolved_ButNotRound` (3) | Blue pill "Awaiting resolution" |
| `RoundResolved` (4) | Gray pill "Resolved" |

(Status 1 `NoEventsDefined` never appears here.)

## Click target

Single tap opens the round-detail view (calls
[`gamePickGetActiveRound`](../../api/classes/WSAPIGamePick.md#gamepickgetactiveround)
for that round).

## Empty / loading / error states

- **Empty (`errCode: 100003`)**: "No open rounds right now — check back later."
- **Loading**: skeleton card list (2–3 placeholders).
- **Error (`errCode: 100002`)**: "Game not found" — likely template ID is
  wrong; bounce back to the lobby.
- **Error (`errCode: 100000`)**: "Session expired — please log in again" —
  hash auth failure.

## Refresh

- No SDK cache.
- Poll every 30–60 s while the user is on the lobby screen to catch
  status changes (events going from open to closed).
- Re-call after any submit ([`gamePickSubmitSelection`](../../api/classes/WSAPIGamePick.md#gamepicksubmitselection)
  or [`gamePickSubmitSelectionQuiz`](../../api/classes/WSAPIGamePick.md#gamepicksubmitselectionquiz))
  to reflect the new `user_placed_bet` state on the relevant round card.

## Mobile vs desktop

- **Mobile**: full-width round cards stacked vertically.
- **Desktop**: 2- or 3-column grid of round cards.

## Performance

- Each call ships the full event list. For lobbies with many rounds, prefer
  [`gamePickGetGameInfo`](../../api/classes/WSAPIGamePick.md#gamepickgetgameinfo)
  which returns round metadata only (no events), then call this method only
  when the user wants to see prediction-able rounds in detail.
