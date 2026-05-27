# UI Guide — `getTournamentsList`

## Overview
- The list is the lobby surface — designed for a tabbed grid where each
  card opens a detail view (powered by
  [`getTournamentInstanceInfo`](../../api/classes/WSAPITournaments.md#gettournamentinstanceinfo)).
- Register `onUpdate` on first render; treat each invocation as
  "discard prior list, re-render from this array". `onUpdate` fires
  only after `registerInTournament` resolves — lifecycle transitions
  (start/finish/cancel) don't push.
- Loading indicator: the first call is a server round-trip
  (typically 100–500 ms); subsequent calls within the 30 s cache window
  resolve effectively synchronously.

## List view organization

The default Smartico UI groups tournaments into category tabs. A single
tournament can appear in multiple tabs simultaneously.

| Tab | Assignment rule | Sort |
|---|---|---|
| **Overview** (default) | `is_in_progress` OR `is_user_registered` OR `is_can_register` OR `is_upcoming` — i.e. anything not finished/cancelled | Featured pinned first; then by `start_time` ASC for upcoming, registered/registrable next |
| **MyTournaments** | `is_user_registered === true` | Insertion order |
| **InProgress** | `is_in_progress === true` | Insertion order |
| **Upcoming** | `is_upcoming === true` | `start_time` ASC |
| **Finished** | `is_finished === true` | Insertion order (server returns newest finished first) |
| **Top** | `is_can_register === true` | Featured pinned first |

**Featured pinning**: tournaments with `is_featured === true` AND
`is_cancelled === false` get moved to index 0 in the Overview and Top
tabs only. No visual difference on the card itself — just position.

**Default visible tabs**:
- Desktop: Overview · MyTournaments · InProgress · Finished
- Mobile: Overview · MyTournaments · InProgress

**Custom section filtering**: if your UI scopes the lobby to a
specific custom section (e.g. a deep-link `?custom_section_id=42`),
filter to tournaments whose `custom_section_id` matches; the SDK does
not filter for you.

**Bucketing helper** (raw-state to bucket — for reference):

```ts
function bucket(t: TTournament) {
  if (t.is_in_progress) return 'live';
  if (t.is_user_registered && !t.is_finished) return 'mine';
  if (t.is_can_register) return 'available';
  if (t.is_upcoming) return 'upcoming';
  if (t.is_finished) return 'finished';
  if (t.is_cancelled) return 'cancelled';
  return 'other';
}
```

Drive UI tabs from the boolean flags directly. Avoid recomputing
state from `start_time` / `end_time` / `registration_status` — the
SDK already encodes the canonical lifecycle.

## Tournament card / tile

Fields rendered on the card (top-to-bottom):

- **Background image** — `image1`, documented source 544×216 px.
  Render at a 16:9-ish aspect ratio with `background-image`. No
  built-in placeholder — provide a neutral fallback if missing.
- **Status badge** — top-left, color-coded by lifecycle state.
  See "Status-specific visual treatments" below.
- **Clan badge** — appended to the status block when
  `is_clan_based === true`.
- **Countdown line** — relative time string driven by `start_time`
  (upcoming) or `end_time` (in-progress / finished). See "Countdown
  / timing format".
- **Tournament name** — `name`, prominent.
- **Ribbon** — `ribbon` field. Presets (`'sale'`, `'hot'`, `'new'`,
  `'vip'`) are CSS classes; a custom URL (250×300 px) renders as an
  image overlay top-right.
- **Footer row** (3 columns on desktop, may collapse on mobile):
  - Registration count: `registration_count` / `players_max_count`
  - Buy-in: derived from `registration_cost_points` /
    `registration_cost_gems` / `registration_cost_diamonds` (only
    one is set per tournament) — show "Free" if all are falsy.
    `custom_price_text` (operator-supplied string) overrides if set.
  - Prize pool: `prize_pool_short` if set, else a derived label
    from `prizes[]` (or "Mixed" / "—" as fallback).
- **CTA button** — see "Action button decision matrix".

**Mobile card variant**: ribbon renders ABOVE the image (not as an
overlay); footer typically collapses to inline buy-in/prize line.

**Whole-card click** opens the detail view via
[`getTournamentInstanceInfo`](../../api/classes/WSAPITournaments.md#gettournamentinstanceinfo);
the CTA button click triggers the same detail-view open (it does NOT
invoke `registerInTournament` from the card — registration is always
performed from inside the detail view).

**Fields NOT on the card** (detail-view-only):
- `description` (HTML), full `prizes[]` table, `me` block, full player
  leaderboard (via `getTournamentInstanceInfo`), clan leaderboard,
  `related_games`, `min_scores_win`.

## Action button decision matrix

CTA label is driven by `is_can_register`, then by
`registration_status`. Resolve in priority order — first match wins.

| Condition | CTA label | Enabled? |
|---|---|---|
| `is_can_register === true` | "Join tournament" | Enabled — opens detail view |
| `registration_status === 'REGISTERED'` AND not yet started | "You are registered" | Disabled (informational) |
| `registration_status === 'REGISTERED'` AND `is_finished` | "You are registered" | Disabled (informational) |
| `registration_status === 'PENDING'` | "Pending approval" | Disabled |
| `registration_status === 'REGISTERED_PENDING_QUALIFICATION'` | "Pending qualification" | Disabled |
| `registration_type === 'AUTO'` AND tournament active | "Automatic registration" | Disabled (informational) |
| `is_clan_based` AND user has no clan | "Registration closed" | Disabled |
| Everything else (cancelled, expired, segment-blocked, max reached, etc.) | "Registration closed" | Disabled |

When CTA is "Registration closed" and the user fails segment
conditions, surface `segment_dont_match_message` (operator-supplied)
inside the detail view, not on the card.

The CTA button is also part of the card click target — clicking it
opens the detail view rather than invoking registration directly.
Registration only happens from the detail-view CTA.

## Image / asset specs

| Field | Documented source | Aspect ratio | Used where | Fallback |
|---|---|---|---|---|
| `image1` | 544×216 px | ~5:2 (landscape banner) | Card grid background | Neutral placeholder if missing |
| `image2` | 920×200 px | ~4.6:1 | Desktop lobby-detail header (rendered by detail view, not card) | Falls back to `image1` |
| `image2_mobile` | 720×400 px | 9:5 | Mobile lobby-detail header | Falls back to `image1` |
| `ribbon` (custom URL) | 250×300 px | 5:6 (portrait) | Card overlay | Hide ribbon if URL fails |
| `prizes[].image_url` | 1:1 square | 1:1 | Detail-view prize table only | Hide image if missing |

Do not render `image2` / `image2_mobile` on the card — they're sized
for the detail-view header.

## Status-specific visual treatments

Drive from the lifecycle booleans and `registration_status`. Recommended
treatments:

| State | Card visual | Badge text |
|---|---|---|
| `is_upcoming` (PUBLISHED) | Full-color card | "New" |
| `is_upcoming` (REGISTER — accepting registrations) | Full-color card, "live registration" pulse on the CTA | "Gathering" |
| `is_in_progress` | Full-color card, optional shimmer/glow accent | "Started" / "Live" |
| `is_finished` | Subtle desaturation (e.g. 80% opacity), no shimmer | "Finished" |
| `is_cancelled` | Status badge collapses / hidden; card itself may be hidden by the consumer's tab logic | (none — badge hidden) |
| `is_user_registered && !is_finished` | Color-restored card, add a "Registered" check-mark overlay | derived from `registration_status` |

The default Smartico UI collapses the cancelled card's status block to
`height: 10 px` to keep layout consistent without surfacing the
"Cancelled" label prominently — many consumers prefer to hide cancelled
items entirely.

**Clan tournaments**: append a "Clan" pill next to the status badge
when `is_clan_based === true`. No other structural change on the card.

## Countdown / timing format

The default Smartico UI uses moment.js-style relative formatting
(`"in 3 days"`, `"in 2 hours"`, `"a few seconds ago"`) with a status
prefix:

| State | Prefix | Time source |
|---|---|---|
| `is_upcoming` | "Starts in" | `start_time` |
| `is_in_progress` | "Ends in" | `end_time` |
| `is_finished` | "Finished" | (no relative time, or `end_time` past-tense) |
| `is_cancelled` | "Cancelled" | (no time) |

Suggested format tiers (compact):
- > 7 days → `"Starts <date>"` (e.g. `"Starts 12 Jun"`)
- 1–7 days → `"in N days"`
- 1–24 h → `"in Hh Mm"`
- < 1 h → `"in Mm Ss"`, update every second
- Within 60 s → exact seconds with 1-second tick

The detail view uses a more precise `DD:HH:MM:SS` ticker; the card
uses the compact relative form.

## Empty / loading / error states

- **Loading (cold fetch)**: render a shimmer grid (skeleton cards) at
  the eventual grid layout. The first call is a network round-trip.
- **Loading (cache hit)**: do not render a loading state — the promise
  resolves within a microtask.
- **Empty list**: `[]` means the user has no visible tournaments.
  Show an empty-state illustration; copy varies by tab:
  - Finished tab: "No tournaments finished yet"
  - MyTournaments tab: "You haven't joined any tournaments yet"
  - All other tabs: "No tournaments available"
- **Error**: keep the prior list visible if any, show a small
  non-blocking error banner, retry on the next user-driven action.

## Animations / transitions

- **List entry**: cards fade-in with a ~30 ms stagger on first render.
- **Registration success celebration**: when `is_user_registered` flips
  from `false` to `true` between fetches (detect by diffing prior list
  in your `onUpdate` handler), play a check-mark scale-in on the
  registered card. The default Smartico UI also briefly highlights the
  whole card.
- **Countdown ticker**: update once per second when remaining time is
  under 1 hour; once per minute otherwise.
- **Status badge transitions**: when a tournament moves from
  `is_upcoming` to `is_in_progress` mid-render, animate the badge
  recolor over ~300 ms. This transition happens only on cache miss /
  refresh — not pushed live.

## Mobile vs desktop

- **Grid columns**: desktop 2–3, tablet 2, mobile 1 (full-width cards
  due to the landscape image aspect ratio).
- **Tab strip**: desktop shows Overview · MyTournaments · InProgress ·
  Finished; mobile drops Finished to reduce horizontal scroll.
- **Card footer**: desktop renders 3-column footer (registrations /
  buy-in / prize pool); mobile collapses to a single-line summary.
- **Ribbon position**: desktop overlays on the image (top-right);
  mobile renders above the image to avoid overlap on small cards.

## Performance

- The 30 s cache deduplicates rapid refetches; a poll loop hitting
  `getTournamentsList` every 5 s effectively translates to one
  network round-trip per 30 s.
- Diff lists between fetches to detect lifecycle transitions
  (`is_upcoming → is_in_progress`, registration flips). Avoid full
  re-renders on every poll tick if you animate the card transitions —
  keyed per-card rendering matters because the celebration animations
  break if the DOM nodes are recreated.
- The hardest perf hit is the countdown ticker. Consider rendering the
  full countdown only on currently-visible cards (use
  `IntersectionObserver` for off-screen virtualization on long lists).
