# UI Guide — `getLeaderBoard`

## Overview
- Returns the top-20 ranked entries for one period, the current user's
  own rank, and the configured prize table.
- One call per (period type, current-or-previous) — the SDK caches
  under a single key, so switching periods or current/previous within
  30 s returns stale cached data unless `clearCaches()` is invoked.
- No subscription, no push refresh. Poll manually if the consumer
  needs live updates during an in-progress period.

## List view organization

The default Smartico UI renders the leaderboard with three top-level
tabs inside the page:

| Tab | Content |
|---|---|
| **Leaders** | The ranked `users[]` list + sticky "me" row |
| **Prizes** | The `rewards[]` table — one row per paid place |
| **Rules** | The `rules` HTML (operator-defined terms) |

A separate **period selector** sits above the tabs — one tab per
configured board (DAILY / WEEKLY / MONTHLY). Switching periods
dispatches a new `getLeaderBoard()` call.

A **current ↔ previous** toggle button sits below the Leaders list.
Label depends on the active period: "Yesterday's winners" /
"Last week's winners" / "Previous month's winners" / "Today's
leaders" / "Current standings".

## Rank table layout

Columns per row (in the Leaders tab):

| Column | Source | Notes |
|---|---|---|
| Position | `user.position` | Server-computed DENSE_RANK. Show as `01`, `02`, … `20`. |
| Avatar | `user.avatar_url` | Hide via operator config `hide_avatars_leaderboards` if applicable. |
| Username | `user.public_username` | |
| Points | `user.points` | Operator config `leaderboard_hide_other_points` may suppress points for everyone except the current user. |
| Level badge | (Drives from separate `getCurrentLevel` lookup, not on this type) | Operator config `leaderboard_hide_levels` may suppress. |

**Top-3 podium styling**: apply distinct CSS classes (`place-1`,
`place-2`, `place-3`) to rows with `position <= 3` (and
`position !== -1`). The default Smartico UI uses CSS-only treatment
— no podium banner or 1st/2nd/3rd icons.

**Desktop padding**: when `users.length < 8`, the default UI pads the
list height with a vertical spacer so the card height stays stable
across periods. Skip this on mobile.

## "Me" sticky row

`board.me` is the current authenticated user's entry. Render rules:

- **Visitor mode**: `me` is `undefined` — skip the sticky row.
- **`me.position === -1`**: the user has not yet accumulated points
  this period (or is otherwise unranked). Show a friendly state:
  `"You're unranked — earn points to climb the board"`.
- **`me.position > 0` AND visible in `users[]` (top 20)**: highlight
  the matching row in the main list (CSS class). The default
  Smartico UI also keeps a sticky bottom row for consistency.
- **`me.position > 20`**: pin the sticky bottom row with the user's
  rank, avatar, username, and points. The default Smartico UI shows
  this on desktop only (mobile uses a stub spacer to keep layout
  height stable but does not render the sticky row).

## Prize table (Prizes tab)

Render `rewards[]` as a two-column table:

| Column | Source |
|---|---|
| Place | `reward.place` (e.g. `1`, `2`, `3`) formatted as "1st place", "2nd place", etc. — use the locale's plural-ordinal helper for proper rendering. |
| Prize | `reward.points` formatted with locale separators + the brand's points unit (e.g. `"100 points"`, `"1,000 pts"`). |

Show in order — the first array element is place 1.

The default Smartico UI does NOT inline rewards on the main leaders
list (only in the dedicated Prizes tab). Custom UIs may want to
inline a hint on the top-3 rows.

## Rules tab

Render `board.rules` as sanitized HTML. The default Smartico UI uses
`dangerouslySetInnerHTML` — **sanitize before injecting** to
prevent XSS if your product surface is exposed to untrusted operator
content.

## Period selector (current ↔ previous)

When the user switches between current and previous period:

1. Call `clearCaches()` to bust the shared OCache key
   (otherwise the second call returns stale data within 30 s).
2. Call `getLeaderBoard(periodType, getPreviousPeriod)` with the new
   `getPreviousPeriod` value.
3. Replace the rendered data.

```ts
const onTogglePrevious = async (showPrevious: boolean) => {
  await window._smartico.api.clearCaches();
  const board = await window._smartico.api.getLeaderBoard(
    activePeriodType,
    showPrevious,
  );
  console.log('[smartico] switched to', showPrevious ? 'previous' : 'current', 'period — re-render with this board:', board);
};
```

Same pattern applies when switching between period types
(`DAILY` → `WEEKLY` → `MONTHLY`).

## Status-specific visual treatments

- **Current period**: full-color rendering; live point counts.
- **Previous period** (`getPreviousPeriod: true`): identical
  rendering — the default Smartico UI does not visually
  differentiate. Custom UIs may want to apply subtle desaturation
  or an "ENDED" pill to signal that the rankings are final.
- **Unranked `me`** (`position === -1`): friendly "earn points to
  enter the board" copy in the sticky panel.

## Empty / loading / error states

- **Loading (cold fetch)**: render a skeleton table (8 placeholder
  rows) sized to the eventual layout. The default Smartico UI uses
  a `Loader` spinner.
- **Empty `users[]`**: render a Lottie / static illustration with
  copy like "No Leaders Yet". Common early in a fresh period.
- **`board === undefined`** (no board configured for this period):
  hide the leaderboard surface entirely or surface a neutral
  "Leaderboard not available" message.
- **Error**: keep the prior list if any; show a non-blocking error
  banner; retry on the next user-driven action.

## Animations / transitions

- **Initial fade-in**: rows fade in on first paint.
- **Rank change between fetches**: the default Smartico UI does NOT
  animate rank changes — rows re-render in-place. Custom UIs that
  poll may want to diff snapshots and apply a FLIP animation to
  highlight position movement.
- **Period switch**: cross-fade table contents (~150 ms ease-out).

## Mobile vs desktop

- **Period tab strip**: desktop uses a standard tab component;
  mobile uses a scrollable custom-styled strip.
- **Sticky "me" row**: desktop renders it; mobile renders only a
  stub spacer (no sticky row, to save vertical space).
- **Desktop padding**: list height padded to ≥ 8 rows; mobile does
  not pad.

## Performance

- The 30 s cache deduplicates rapid refetches, but the single-key
  design means switching periods within the window returns stale
  data. `clearCaches()` is the only way to force a fresh fetch
  before the TTL expires.
- For live polling during an in-progress period, ~30 s cadence is
  appropriate (matching the cache TTL — additional polls within
  the window are free).
- The leaderboard list is small (max 20 rows + 1 me row); no
  virtualization needed.
