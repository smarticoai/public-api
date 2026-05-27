# UI Guide — `getClanTournamentPlayers`

## Overview
- Powers the clan drill-down modal opened from a clan row on the
  tournament detail's clan leaderboard tab (see
  [`getTournamentInstanceInfo`](../../api/classes/WSAPITournaments.md#gettournamentinstanceinfo)).
- One-shot fetch. No cache, no polling, no subscription. Re-call to
  refresh.
- Returns up to ~20 players, server-sorted by score DESC. Client-side
  re-sort is unnecessary.

## Modal / drawer layout

Top-to-bottom layout (centered modal on desktop, full-screen
slide-up sheet on mobile):

  1. **Close affordance** — explicit close button (top-right);
     click-outside dismiss; Escape key dismiss.
  2. **Clan header** — clan image (1:1 aspect ratio, fallback to
     first-letter avatar with the clan's name), clan name, total
     score, contributing-members count, and a rank badge (1/2/3) if
     applicable.

     The default Smartico UI populates this header from the **caller-side**
     `ClanLeaderboardEntry` object (the row the user clicked) rather
     than from the response's `clan_public_meta` and `clan_id` — they
     contain the same identity but the parent context already has
     richer data (total_score, contributing_members, position) that the
     response doesn't carry. The response's `clan_id` and
     `clan_public_meta.name`/`image_url` are still available for
     consumers that need them.

  3. **Table header row** — three columns: `#` (rank) · Player
     (avatar + name) · Score.
  4. **Player list** — one row per `players[i]`. See "Player row".
  5. **Empty state** (when `players.length === 0`) — "No leaders" text.
     Shown both during the loading round-trip AND when the result is
     empty.

## Player row

Three columns:

| Column | Source | Notes |
|---|---|---|
| `#` (rank) | `position ?? 0` | Plain text. Server-side rank within this clan. |
| Player (avatar + name) | `avatar_url` (or derived from `avatar_id` + label `avatarDomain`) + `clean_ext_user_id ?? public_username` | Username prefers `clean_ext_user_id` over `public_username`; if both empty, the avatar fallback letter is also blank. |
| Score | `scores ?? 0` | Format with space-thousands ("1 234 567") + "pts" suffix. |

**"Me" row highlight**: when `is_me === true`, add a distinct
background (CSS class `is-me` in the default Smartico UI). There is no
sticky "me" footer in this modal — the user's row scrolls with the
list. If your UI has many players (rare — server caps at ~20), you may
want to auto-scroll the "me" row into view on first render.

**Avatar resolution**: if `avatar_url` is already populated by the SDK,
use it directly. Otherwise, derive a CDN URL from `avatar_id` and the
brand's avatar domain — the SDK's `CoreUtils.avatarUrl()` does this for
you on the response.

**Top-3 styling**: optional — apply podium accent (gold/silver/bronze)
to rows where `position <= 3`. The default Smartico UI applies the
podium treatment only on the clan header rank badge, not on individual
player rows.

## Empty / loading / error states

- **Loading**: render the modal frame and clan header immediately
  (driven by caller-side data); render an "empty state" placeholder
  in the player list area while the call is in flight. **Or** render a
  skeleton rows (3–5 grey bars) — typically friendlier than the
  empty-state text appearing then disappearing.
- **Empty (no players)**: render the "No leaders" text. This can mean:
  - no one in the clan has scored yet,
  - the call failed (network / server error — the default UI silently
    swallows the error),
  - the `(tournamentInstanceId, clanId)` combination is invalid.

  These three are not distinguishable in the response itself. The
  default UI treats them identically. If your UI cares to distinguish,
  attach a `.catch()` to surface a transient-error toast.
- **Error**: not surfaced by default. Add explicit error handling if
  needed — wrap the call in try/catch and show a "Failed to load — Try
  again" affordance.

## Close affordance

Three independent dismiss mechanisms (all dispatch the same close
action):

1. Close button (top-right of modal).
2. Click outside the modal card.
3. `Escape` key.

The default Smartico UI wires all three via a shared `useModalClose`
hook. Mirror this pattern for parity.

## Refresh

- **Don't poll inside this modal**. The default Smartico UI doesn't
  poll — the clan-leaderboard tab (parent) does poll via
  `getTournamentInstanceInfo` and refreshes the visible clan rankings
  when the modal closes. Live updates inside the modal are not part
  of the default UX.
- If your product requires live updates inside this modal, call
  `getClanTournamentPlayers` again on a 3 s interval. Be cautious —
  each call is a fresh network round-trip (no cache).

## Pagination

None at the SDK level. The server returns up to ~20 players (configured
per tournament). There is no "load more" affordance in the default UI.

## Animations / transitions

- **Modal entry**: fade-in + scale (~150 ms ease-out).
- **Modal exit**: fade-out + scale-down (~120 ms).
- **List entry**: cards/rows fade-in staggered ~20 ms per row on
  first render. No skeleton-to-data crossfade (the list is small
  enough to render instantly once data arrives).
- **Rank change between calls** (if you implement live polling): FLIP
  animation to reorder rows.

## Mobile vs desktop

- **Modal style**: centered overlay on desktop with backdrop dim;
  full-screen slide-up sheet on mobile (with a swipe-down dismiss
  gesture).
- **Header layout**: image left, identity right on desktop; stacked
  (image above identity) on mobile.
- **Row density**: identical on both — the row is already compact.

## Performance

- Each call is a fresh network round-trip. The page typically has at
  most one of these in flight at a time (driven by user clicks),
  so cost is minimal.
- If your UI offers a "view all clans" affordance that pre-fetches
  player lists for many clans, throttle the fetches — don't fan out
  20 simultaneous round-trips.
