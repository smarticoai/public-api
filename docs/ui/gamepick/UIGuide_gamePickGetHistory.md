# UI Guide — `gamePickGetHistory`

## Overview
- Returns the full round history (active + resolved) for a MatchX or Quiz
  game template, newest-first.
- Powers the "Past predictions" / history tab.
- No cache; no push subscription.

## List view organization

Server-sorted newest-first. No client-side sort needed. Optionally tab by:

- "Resolved" — filter to `is_resolved === true`.
- "Awaiting resolution" — filter to `round_status_id ===
  AllEventsResolved_ButNotRound` (3).
- "Open" — same content as
  [`gamePickGetActiveRounds`](../../api/classes/WSAPIGamePick.md#gamepickgetactiverounds);
  the history endpoint includes these too but the default Smartico UI keeps
  them in the lobby instead.

## Item card / row

Each row shows:

| Field | Source | Notes |
|---|---|---|
| Round name | `round_name` | Title |
| Resolved on | `resolution_date` or `last_bet_date` | "Resolved 22 May" |
| User score | `user_score` | Right-aligned |
| Full / partial / lost counts | `events` aggregated by `resolution_type_id` | Optional summary |
| Status pill | `round_status_id` | Same mapping as [`gamePickGetActiveRounds`](../../api/classes/WSAPIGamePick.md#gamepickgetactiverounds) |

**Click target**: open the round detail (typically a read-only view showing
the user's picks plus event resolution badges).

## Empty / loading / error states

- **Empty**: "No past predictions yet — play a round to see your history."
- **Loading**: skeleton list (3–5 placeholders).
- **Error**: keep prior list if any; non-blocking banner.

## Refresh

- No cache.
- Re-call when the user opens the history tab. No need to poll — resolved
  rounds don't change once `round_status_id` reaches `RoundResolved` (4).

## Mobile vs desktop

- Identical row density on both.

## Performance

- The history endpoint can return a long list for active games. Consider
  client-side pagination or virtualization if rendering 100+ rows.
