# UI Guide — `gamePickGetBoard`

## Overview
- Returns a leaderboard scoped to one round, OR (with `round_id: -1`) the
  season / overall leaderboard for the template.
- Powers leaderboard screens within the Game Pick experience.
- No cache; no push subscription.

## List view organization

Server-ranked. `users[]` is the public top list; `my_user` carries the
current user's row separately (renders as a sticky "you are here" footer).

## Row layout

Each leaderboard row shows:

| Field | Source | Notes |
|---|---|---|
| Rank | `gp_position` | Big number or "—" when null (not yet ranked) |
| Avatar | `avatar_url` | 32×32 px (1:1) |
| Username | `public_username` | May be masked / anonymized by label settings — see below |
| Score | `resolution_score` | Total score in the scoped period |
| Stats (full / part / lost) | `full_wins_count`, `part_wins_count`, `lost_count` | Optional inline pills |

### Username masking

Label settings can anonymize `public_username` for other players. Pair the
username with the avatar so the user can still recognize themselves visually
even when usernames are masked.

## "You are here" footer (`my_user`)

When the response includes `my_user`, render it as a sticky footer always
visible at the bottom of the leaderboard. This gives the user a fixed
anchor regardless of scroll position. When `my_user` is `null` (user
hasn't predicted in this scope), render a CTA: "Play a round to join the
leaderboard."

## `round_id` modes

| `round_id` | Returns |
|---|---|
| Positive | Per-round leaderboard (only scores from that round's events) |
| `-1` | Season / overall leaderboard (aggregated across all rounds of the template) |

Use a top tab or segmented control to let the user switch between per-round
and season views.

## Empty / loading / error states

- **Empty**: "No players ranked yet — be the first!"
- **Loading**: skeleton row list (5–10 placeholders).
- **Error (`errCode: 100002`)**: "Game not found" — bounce back.
- **Error (`errCode: 100000`)**: "Session expired" — re-init.

## Refresh

- No SDK cache.
- Poll every 30–60 s while the leaderboard is on screen to surface rank
  changes after events resolve.
- Re-call after every successful round resolution (status transitions to
  `RoundResolved` (4)).

## Click-through (view another player's picks)

From a leaderboard row, allow the user to tap-through to
[`gamePickGetRoundInfoForUser`](../../api/classes/WSAPIGamePick.md#gamepickgetroundinfoforuser)
using `users[].int_user_id` to inspect that player's predictions. The default
Smartico UI opens this in a modal / sheet over the leaderboard.

## Mobile vs desktop

- **Mobile**: full-width rows; sticky footer for `my_user`.
- **Desktop**: full-width rows centered with max-width; sticky footer.

## Performance

- Server-paginated implicitly — typical responses are top 20–100 players
  plus the user's row.
- No virtualization needed unless the response is >200 rows.
