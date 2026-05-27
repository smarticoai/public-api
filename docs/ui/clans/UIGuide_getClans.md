# UI Guide — `getClans`

## Overview
- Powers the **clan-browser screen** (and the clan-pick modal during
  tournament registration via
  [`registerInTournament`](../../api/classes/WSAPITournaments.md#registerintournament)).
- Returned `clans[]` is already server-sorted by `rating_position` ASC
  (1 = best). The default Smartico UI re-sorts on the same key as a
  defensive measure but no client-side ordering work is required.
- Loading indicator: the first call is a server round-trip
  (typically 100–500 ms); subsequent calls within the 30 s cache
  window resolve effectively synchronously.
- `onUpdate` is poll-driven (no server push). For near-live state, the
  consumer must poll on an interval — the default Smartico UI polls
  every 30 s while the clan screen is open.

## List view organization

A single flat ranked list — no tabs. Render `clans[]` in the order
returned (already sorted by `rating_position`).

**Client-side search filter**: filter `clan.public_meta.name` against
the user's typed query (case-insensitive). No server round-trip.

**Sticky "my clan" footer**: when the user is in a clan and the
visible list is long enough (the default Smartico UI uses ≥ 7 visible
items), pin a duplicate of the user's clan row at the bottom of the
scroll area so it remains visible while the user scrolls. Skip this
when the user is clanless or the list is short.

No dedicated "My Clan" panel at the top of the list — the user's clan
appears at its natural `rating_position`, just highlighted in place.

## Item card / row

Fields rendered (column structure for desktop; mobile may collapse):

| Column | Source | Notes |
|---|---|---|
| Rank | `rating_position` | Display as `#N`. Apply `.top-1` / `.top-2` / `.top-3` styling for positions 1–3. |
| Icon / image | `public_meta.image_url` | Square. Fallback: first character of `public_meta.name` rendered as a letter avatar. |
| Name | `public_meta.name` | Translated server-side. Add "Your clan" badge next to the name if `clan.clan_id === user_clan_id`. |
| Rating score | `rating_score` | Numeric; the higher, the better. |
| Members | `member_count` / `capacity_limit` | Desktop: render a progress bar at `member_count / capacity_limit * 100%` with a label `N / M`. Mobile: text-only `N / M`. |
| Entry fee | `entry_fee_amount` + `entry_fee_currency_type_id` | "Free" when `entry_fee_amount === 0` or `entry_fee_currency_type_id === 3`. Otherwise `"{amount} {Points|Gems|Diamonds}"`. |

**Whole-row click target**: opens the detail modal (via
[`getClanInfo`](../../api/classes/WSAPIClans.md#getclaninfo) to load
members on demand). The row itself has no inline Join CTA — joining
happens from inside the detail modal (see "Action button decision
matrix" below).

**Detail-only fields** (not on row): `description`, full `members[]`
list (from `getClanInfo`), full progress bar styling on desktop.

## Action button decision matrix

The Join CTA lives in the detail modal (or the clan-pick modal during
tournament registration). Evaluate in priority order — first match
wins.

| State | Condition | Button label | Enabled? | Notes |
|---|---|---|---|---|
| **Your clan** | `clan.clan_id === user_clan_id` | "Your clan" | No-op | Highlight; no join action. |
| **Cooldown active** | `cooldown_until !== null` | `"Cooldown until <local-date>"` | Disabled | Affects ALL clans — the cooldown is user-level, not per-clan. Format `cooldown_until` from UTC to local time (`DD-MM-YYYY HH:mm` style). |
| **Clan full** | `member_count >= capacity_limit` | "Clan is full" | Disabled | |
| **Insufficient balance** | `entry_fee_amount > 0` AND user's balance for `entry_fee_currency_type_id` < `entry_fee_amount` | `"Not enough {Points|Gems|Diamonds} (deficit)"` | Disabled | Cross-check against {@link getUserProfile} balance for the currency. |
| **Joinable — free** | `entry_fee_amount === 0` OR `entry_fee_currency_type_id === 3` | "Join free" | Enabled | |
| **Joinable — paid** | default | `"Join ({amount} {Points|Gems|Diamonds})"` | Enabled | |

The enabled Join click invokes
[`joinClan(clan_id)`](../../api/classes/WSAPIClans.md#joinclan). See
its own UI guide for the in-flight + error-code matrix.

**Picker mode (`registerInTournament` clan-pick modal)**: when the
user is in cooldown, the default Smartico UI disables every row in the
picker (not just the buttons) — `onClick` is suppressed entirely.

## Cooldown rendering

- The cooldown is **user-level**, not per-clan. While
  `cooldown_until !== null`, the user cannot join any clan.
- Format: `cooldown_until` is an ISO 8601 UTC string
  (`"YYYY-MM-DDTHH:MM:SS"`, no timezone suffix). Parse as UTC, display
  in user-local time. The default Smartico UI shows
  `DD-MM-YYYY HH:mm` (e.g. `"01-06-2026 16:30"`).
- No "X days remaining" countdown — show the absolute expiry datetime.
  If your product surface justifies a countdown, render one yourself.

## Image / asset specs

| Field | Aspect ratio | Notes |
|---|---|---|
| `public_meta.image_url` | 1:1 (square) | Recommended source size not strictly enforced; the default Smartico UI sizes via CSS. Provide a square image for best results. |

**Fallback**: when `image_url` is missing or fails to load, render
the first character of `public_meta.name` as a letter avatar in the
icon container.

## Status-specific visual treatments

- **Your clan**: row gets a `.highlight` background tint + "Your clan"
  badge next to the name.
- **Top-3 rank**: rows for `rating_position` 1–3 get podium accents
  (gold/silver/bronze).
- **Full clan**: no row-level treatment — only the detail-modal button
  shows the disabled state.
- **Cooldown active**: only the detail-modal button is disabled (or
  in the picker, the whole row is dimmed).
- **Insufficient balance**: only the detail-modal button is disabled.

## Empty / loading / error states

- **Loading (first fetch)**: render a spinner / shimmer skeleton of
  rows.
- **Empty list (no clans configured)**: render a neutral empty-state
  illustration with copy like "No clans available".
- **Empty search results**: same empty-state illustration with
  query-aware copy (e.g. "No clans matching '<query>'").
- **Error**: the default Smartico UI keeps the spinner visible
  indefinitely on fetch failure (no error boundary). For a better UX,
  catch the rejected promise and render a "Failed to load — Try again"
  affordance.

## Refresh

`onUpdate` is poll-driven only. Two ways to keep the list fresh:

1. **Poll**: re-call `getClans()` on a 30-second interval while the
   clan screen is visible. The cache deduplicates rapid refetches.
2. **Re-call after mutations**: after a successful
   [`joinClan`](../../api/classes/WSAPIClans.md#joinclan), re-call
   `getClans()` immediately to pick up the new `user_clan_id` and any
   refreshed `member_count` / `cooldown_until` fields.

There is no server push that refreshes the clans list automatically
— another user joining your clan, an operator kicking you, or a clan
being archived will all only surface on the next consumer-driven
fetch.

## Animations / transitions

- **List entry**: rows fade-in with a ~30 ms stagger on first render.
- **Rank reorder between polls**: if you implement live updates,
  detect `rating_position` changes by diffing the previous and
  current arrays, and animate rows to their new position (FLIP
  animation). Don't full-re-render the list.
- **Join success celebration**: when `user_clan_id` flips between
  polls (detect by comparing pre- and post-refresh values), play a
  brief "Welcome to {clan name}" toast and animate the now-highlighted
  row.

## Mobile vs desktop

- **Member fill**: desktop renders a progress bar; mobile renders
  text-only (`N / M`).
- **Columns**: desktop shows `#`, Clan, Rating, Members, Entry;
  mobile drops Members (entry fee inlines below the name).
- **Sticky my-clan footer**: same threshold on both (≥ 7 visible
  rows).
- **Search**: same client-side filter; desktop typically has a
  search input at the top; mobile may use a dedicated search sheet.

## Performance

- 30 s polling on the clans surface is fine for typical clan
  catalogs (< 200 clans). For very large catalogs, consider polling
  only while the surface is in the viewport.
- Use keyed per-row rendering — celebration / rank-reorder animations
  break if the DOM nodes are recreated on every poll tick.
- Image lazy-loading is safe; clans below the fold rarely need
  immediate paint.
