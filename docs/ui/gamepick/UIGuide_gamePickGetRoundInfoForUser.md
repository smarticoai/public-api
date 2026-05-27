# UI Guide — `gamePickGetRoundInfoForUser`

## Overview
- Returns a round with another player's predictions instead of the
  current user's.
- Use to power "view this player's picks" modals opened from leaderboard
  rows.
- The `int_user_id` comes from
  [`gamePickGetBoard`](../../api/classes/WSAPIGamePick.md#gamepickgetboard)
  (`users[].int_user_id`).
- No cache.

## Modal layout

Open as a modal / sheet over the leaderboard. Top-to-bottom sections:

1. **Header**: target player's avatar + username + rank ("Rank #3 · 240
   pts").
2. **Round summary**: round name + final score line.
3. **Event list**: one row per event with the target user's pick + the
   resolution result.

## Event row layout

Same as
[`gamePickGetActiveRound`](../../api/classes/WSAPIGamePick.md#gamepickgetactiveround)
but with two key differences:

| Field | Difference |
|---|---|
| `user_selection` / `team{1,2}_user_selection` | Shows the TARGET user's picks, not the current user's |
| Input | Read-only — no edit affordance |
| Resolution badge | `resolution_type_id` ({@link GamePickResolutionType}) drives the badge — same mapping as the active round detail |

## Stable `int_user_id` semantics

`int_user_id` is stable within a single game template but NOT portable
across templates. Always source it fresh from
[`gamePickGetBoard`](../../api/classes/WSAPIGamePick.md#gamepickgetboard)
in the current template — don't cache across template boundaries.

## Empty / error states

| `errCode` | Treatment |
|---|---|
| `4` (round / event / user not found) | Show "This player has no predictions for this round" — close the modal |
| `100002` (template not found) | Bounce back |
| `100000` (auth) | Re-init session |

When the target user has no picks (rare — every leaderboard entry has at
least one pick), the response succeeds with all events showing empty
selection fields. Render as "No picks recorded for this round".

## Refresh

- No cache.
- Re-fetch on modal open. Don't poll — another player's predictions are
  fixed once they submit.

## Mobile vs desktop

- **Mobile**: full-screen modal sheet sliding up from the bottom.
- **Desktop**: centered modal with backdrop.

## Performance

- Single round-trip. Same payload size as
  [`gamePickGetActiveRound`](../../api/classes/WSAPIGamePick.md#gamepickgetactiveround)
  (full event list).
- Lazy-load — don't fetch until the user explicitly opens a leaderboard
  row.
