# UI Guide — `getTournamentInstanceInfo`

## Overview
- Powers the **tournament detail / lobby screen** — the surface a user
  lands on after picking an item from
  [`getTournamentsList`](../../api/classes/WSAPITournaments.md#gettournamentslist).
- One-shot fetch. There is no subscription and no client cache.
  Re-call to refresh; the default Smartico UI polls every 3 s while
  the detail view is open.
- For a clan tournament (`is_clan_based === true`), the response also
  carries clan-level data (`clan_leaderboard[]`,
  `clan_prize_structure[]`, `user_clan_id`).

## Detail view layout

Top-to-bottom layout (desktop):

  1. **Header image** — `image2` (920×200 px) rendered as
     `background-image` on the header block; falls back to `image1` if
     missing.
  2. **Tournament name + back affordance** — above the image (desktop)
     or overlaid (mobile).
  3. **Countdown ticker** — `DD:HH:MM:SS` live ticker. Counts to
     `end_time` while `is_in_progress`; to `start_time` while
     `is_upcoming`. Hidden when `is_finished` / `is_cancelled`.
     Updates every 1 second.
  4. **Info row** — date range, buy-in, registration count
     (`registration_count / players_max_count`), duration. On desktop,
     this lives inside the header image; on mobile it sits below.
  5. **Registration CTA** — see "Registration CTA" below.
  6. **Tab strip** — General · Players (or ClanBoard) · Prizes ·
     RelatedGames (when non-empty).
  7. **Active tab content** — see per-tab sections below.
  8. **Sidebar (desktop only)** — if `related_games?.length > 0`,
     render the related-games list; otherwise render a "Prizes
     overview" panel.

Mobile layout collapses the sidebar into a tab (`RelatedGames`) and
moves the tournament name into the header overlay.

## Header image specs

| Field | Source size | Used where | Fallback |
|---|---|---|---|
| `image2` | 920×200 px | Desktop header background | Falls back to `image1` (544×216 px) |
| `image2_mobile` | 720×400 px | Mobile header background | Falls back to `image1` |

Render as CSS `background-image`, not `<img>`. No built-in placeholder
— provide a neutral fallback color/illustration if all three are
missing.

## Registration CTA

Same rules as the card-level CTA in
[`UIGuide_getTournamentsList`](./UIGuide_getTournamentsList.md), but
this time clicking it actually **invokes registration** via
[`registerInTournament`](../../api/classes/WSAPITournaments.md#registerintournament)
rather than opening the detail view (you're already in it).

| Condition | CTA label | Action |
|---|---|---|
| `is_can_register === true` (no clan constraint) | "Join tournament" | Call `registerInTournament(instance_id)`; show loading state while the promise is pending |
| `is_can_register === true` AND `is_clan_based === true` AND `user_clan_id` is null | "Join tournament" | First prompt the user to pick a clan ([`joinClan`](../../api/classes/WSAPIClans.md#joinclan)), then call `registerInTournament` |
| `registration_status === 'REGISTERED'` (before start) | "You are registered" | Disabled / informational |
| `registration_status === 'REGISTERED'` AND `is_finished` | "You are registered" | Disabled / informational |
| `registration_status === 'PENDING'` | "Pending approval" | Disabled |
| `registration_status === 'REGISTERED_PENDING_QUALIFICATION'` | "Pending qualification" | Disabled |
| `registration_type === 'AUTO'` AND active | "Automatic registration" | Disabled / informational |
| Cancelled / expired / segment-blocked | "Registration closed" | Disabled |

For segment-blocked tournaments where the user fails entry conditions,
surface `segment_dont_match_message` (operator-supplied) below the
CTA or in a tooltip on hover.

## Tabs

| Tab | When shown | Content source |
|---|---|---|
| **General / Info** | Always | `description` HTML (sanitize before injecting) + optional `hint_text` (T&C) |
| **Players** | `is_clan_based === false` | `players[]` — individual leaderboard |
| **ClanBoard** | `is_clan_based === true` (replaces Players) | `clan_leaderboard[]` — clan leaderboard |
| **Prizes** | Always | `prizes[]` (non-clan) or `clan_prize_structure[]` (clan) |
| **Related games** | `related_games?.length > 0` AND mobile (desktop renders this in the sidebar) | `related_games[]` |

Default selected tab: General.

## Player leaderboard (non-clan)

Sourced from `players[]`. Columns:

| Column | Source | Notes |
|---|---|---|
| Position | `player.position`, zero-padded (`01`, `09`, `10`, …) | Show `'-'` when tournament status is REGISTER (no one has scored yet) OR `player.position === null` |
| Avatar | `player.avatar_url` (CDN-resized; 128×128 typical) | Operator setting `config.hide_avatars_leaderboards` may suppress |
| Username | `player.public_username` | |
| Score | `player.scores` | Hidden on rows where `is_me === false` if operator setting `show_other_users_score === false`. Always shown for `me`. |

**Top-3 styling**: rows where `position <= 3` get optional podium
treatment (gold / silver / bronze background or accent). CSS classes
in the default Smartico UI: `place-1`, `place-2`, `place-3`.

**"Me" row**: when `player.is_me === true`, highlight the row (e.g.
`place-my` class — background tint, slightly larger font). The user's
position is also surfaced separately in the dedicated "me" panel
below the leaderboard (see "`me` panel").

**Empty state**: when `players[]` is empty (e.g. tournament hasn't
started yet, no scores recorded), render an empty-state illustration
with copy like "No players yet" or "Be the first to register".

## Clan leaderboard (clan tournaments)

Sourced from `clan_leaderboard[]`, filtered to entries where
`contributing_members > 0`. Each row:

| Element | Source |
|---|---|
| Position badge | `clan.position` — podium styling for 1/2/3 |
| Clan image | `clan.public_meta.image_url`; fallback to first-letter avatar |
| Clan name | `clan.public_meta.name` |
| "Your clan" badge | If `clan.clan_id === user_clan_id`, add a "Your clan" pill |
| Contributing members | `clan.contributing_members` |
| Total score | `clan.total_score`, space-formatted (`1 234 567`) + "pts" suffix |

**User's clan highlight**: row gets a distinct background when
`clan.clan_id === user_clan_id`.

**Sticky "my clan" footer**: when `clan_leaderboard.length >= 5` and
`user_clan_id` is set, pin the user's clan row at the bottom of the
scrollable list as a sticky footer.

**Clan row click** opens a modal showing that clan's individual
player breakdown via
[`getClanTournamentPlayers`](../../api/classes/WSAPITournaments.md#getclantournamentplayers).

**Empty state**: render a Lottie animation (or static illustration) +
"No leaders" copy.

## `me` panel

When `detail.me` is populated, render a **sticky "me" panel** below
(or alongside) the leaderboard with:

- Rank badge — `me.position` (or `'-'` if not yet ranked)
- Avatar — `me.avatar_url`
- Username — `me.public_username`
- Score — `me.scores` (always shown, regardless of
  `show_other_users_score`)

This panel is **not** rendered when `me` is undefined (visitor mode,
unregistered users, or registered users with no recorded score yet).

The `user_position_in_clan` and `user_score_in_clan` fields on the
response are not rendered by the default Smartico UI but are
available on `TTournamentDetailed` if your custom UI needs them.

## Prize structure

### Non-clan tournaments — `prizes[]`

Render as a ranked table. Each row:

- **Place range**: `place_from` – `place_to`; if equal, render the
  single value (e.g. `1st place`); otherwise a range (e.g.
  `2nd–5th place`).
- **Prize image**: `prizes[i].image_url` (1:1 aspect ratio).
- **Prize description**: derived from `type` + `points`:
  - `'POINTS_ADD'` → "{points} pts"
  - `'TANGIBLE'` / `'BONUS'` / `'MINI_GAME_ATTEMPT'` → `name`
  - Other types → `name` fallback

### Clan tournaments — `clan_prize_structure[]`

More complex — render as accordions, one per `clan_place` entry:

- **Group header**: `<ordinal> Place` for clan placement (e.g.
  `1st place`, `2nd place`). Overridable by
  `clan_place_entry.public_meta.prize_name`.
- **Prize type label**:
  - `prize_type_id === 1` (Fixed) → "Fixed prizes"
  - `prize_type_id === 2` (Dynamic) → "Dynamic prizes" (uses
    `prize_pool_amount`)
- **Per-tier rows** (from `tiers[]` inside each clan_place):
  - Player place range (`player_place_from` – `player_place_to`)
  - Tier image — `tier.public_meta.image_url` (optional)
  - Prize amount derived from `prize_type_id` + `distribution_type`:
    - Fixed → render `public_meta.name` (or points / gems / diamonds
      from `details_json`)
    - Dynamic + `distribution_type === 1` (ScoreWeighted) → render
      `pool_amount` as "total pool" with "Score-weighted split"
      secondary label
    - Dynamic + `distribution_type === 2` (EqualSplit) → render
      `pool_amount / range_size` as "avg per player" with "equal
      split" secondary label

The default Smartico UI uses a `compact` variant for mobile that
collapses each clan_place group into a single line.

## Countdown ticker

`DD:HH:MM:SS` exact-digit format with 1-second tick. Each segment
in its own `<span>` for styling; RTL-aware (segment order reverses
in right-to-left locales).

Timing source:
- `is_upcoming` → counts down to `start_time`
- `is_in_progress` → counts down to `end_time`
- `is_finished` / `is_cancelled` → ticker hidden

When the countdown reaches zero, don't auto-flip the UI state — wait
for the next poll-driven refresh to pick up the lifecycle transition.
(The detail-info call doesn't push; lifecycle reads come from polling.)

## Empty / loading / error states

- **Loading (first fetch)**: render a skeleton layout — header
  placeholder, blank tab strip, shimmer rows in the active tab area.
  Don't render `null` (avoid a layout jump when data arrives).
- **Loading (poll refresh)**: keep the prior snapshot visible; do not
  blank the UI. Stale state for ≤3 s is fine.
- **`players[]` empty**: empty-state illustration with copy like
  "No players yet". Common when the tournament is upcoming and no
  one has registered yet.
- **`clan_leaderboard[]` empty**: Lottie animation + "No leaders"
  text.
- **Error**: keep last snapshot, show a small non-blocking error
  banner, retry on next poll tick. If the first fetch fails, show a
  full-screen "Failed to load — Try again" with a retry button.

## Animations / transitions

- **Tab switch**: cross-fade content (~150 ms).
- **Leaderboard position change**: when a player's `position` shifts
  between polls (detect by diffing the prior snapshot), animate the
  row to its new position (slide / FLIP animation). Helps users see
  live movement.
- **Countdown final 10 s**: optional pulse / color change on the
  countdown digits.

## Mobile vs desktop

- **Header**: desktop renders tournament name above the image and
  info blocks (buy-in / registration / duration) inside the image;
  mobile overlays name inside the image and moves info blocks below.
- **Image source**: desktop uses `image2`, mobile uses
  `image2_mobile`; both fall back to `image1`.
- **Tab strip**: desktop shows all 3–4 tabs; mobile drops the
  RelatedGames tab if there are no related games (and the sidebar
  becomes an in-tab section on mobile).
- **Clan prize structure**: desktop uses the full accordion; mobile
  uses a compact variant.
- **Leaderboard**: desktop shows full 4-column rows; mobile may
  collapse avatar + username into a single column to save horizontal
  space.

## Performance

- Diff snapshots between polls to detect position changes and animate
  only the affected rows. Avoid full re-renders of the leaderboard
  table on every poll tick.
- Virtualize the player list if `players.length > 100` (uncommon —
  the server usually returns a top-N slice).
- Stop polling when the detail view is no longer visible
  (`IntersectionObserver` or your router-driven unmount). Each poll
  is a real network round-trip.
