# UI Guide — `gamePickGetUserInfo`

## Overview
- Returns the user's profile within the Game Pick games server — display
  name, avatar, mirrored balances, last sync timestamp.
- Used for the in-game profile header. NOT a source of truth for the
  user's live Smartico balance — use
  [`getUserProfile`](../../api/classes/WSAPIUser.md#getuserprofile) for
  that.
- No cache; no push subscription.

## Render layout

The default Smartico UI uses this in the Game Pick header / profile panel:

| Element | Source |
|---|---|
| Avatar | `avatar_url` (40–64 px square) |
| Username | `public_username` |
| "Set custom username" CTA | shown when `pubic_username_set === false` |
| Points balance | `ach_points_balance` |
| Gems balance | `ach_gems_balance` |
| Diamonds balance | `ach_diamonds_balance` |
| Last sync hint | `last_wallet_sync_time` (small text "Synced 30s ago") |

## Balance freshness caveat

The balances here are a server-side mirror, updated at most every ~60 s
from the user's true Smartico balance. For widget components outside the
Game Pick context, or for affordability gating, prefer
[`getUserProfile`](../../api/classes/WSAPIUser.md#getuserprofile) — it
reflects the live balance with push subscription updates.

Within Game Pick itself, the mirrored balance is what the games server
uses to enforce buy-ins, so it's the correct value to display alongside
"Cost: 100 points" affordances.

## First-call lazy provisioning

On the user's very first call for a given template, the games server
lazily creates their record. The call may take an extra ~200 ms on first
call as a result. Subsequent calls are normal latency.

## Refresh

- No SDK cache.
- Re-call after every successful submit
  ([`gamePickSubmitSelection`](../../api/classes/WSAPIGamePick.md#gamepicksubmitselection)
  or
  [`gamePickSubmitSelectionQuiz`](../../api/classes/WSAPIGamePick.md#gamepicksubmitselectionquiz))
  to refresh the mirrored balances.
- Don't poll faster than every 60 s — the server-side mirror only
  refreshes that often.

## Mobile vs desktop

- **Mobile**: condensed avatar + username; balances in a row underneath.
- **Desktop**: avatar + name on the left, balances aligned right.

## Performance

- Single round-trip.
- For multi-balance display elsewhere, prefer `getUserProfile` to avoid
  the ~1-minute staleness of the mirror.
