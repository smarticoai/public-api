# UI Guide — `getClanInfo`

## Overview
- Powers the **clan detail modal / page** — the surface opened after a
  user clicks a row in the clan list (see
  [`getClans`](../../api/classes/WSAPIClans.md#getclans)).
- One-shot fetch. No cache, no subscription, no push refresh. Re-call
  to refresh.
- Returns everything a `TClan` list entry has PLUS the ranked
  `members[]` roster and a fresh `cooldown_until`.

## Detail modal layout

Top-to-bottom (single responsive component — same layout on mobile
and desktop, just resized via the modal frame):

  1. **Header** — close affordance, clan icon (`public_meta.image_url`
     fallback to first-letter avatar), clan name, description.
  2. **Metadata row** — entry fee (or "Free"),
     `member_count / capacity_limit` text, rating position badge.
  3. **Members list** — see "Members list".
  4. **Sticky "my member" footer** — when `members.find(m => m.is_me)`
     is non-null, pin a duplicate of the user's member row at the
     bottom of the scroll area. No row-count threshold — fires
     whenever the user is in the clan, regardless of total member
     count.
  5. **Join CTA** — see "Action button decision matrix" below.

There is NO inline capacity progress bar in the detail modal (the
progress bar appears only on the list-page row, not in detail).

## Members list

Sourced from `members[]`, server-ordered by `contribution_score` DESC
(i.e. `position` ASC). No client-side re-sort required.

Per-row columns:

| Column | Source | Notes |
|---|---|---|
| Position | `member.position` | Plain text — no podium / top-3 styling in the detail modal. (The list page does apply podium styling to clan rows.) |
| Avatar | `member.avatar_url` (or derived from `avatar_id` + brand avatar domain) | Square. Render as CSS `background-image` or `<img>`. Letter-avatar fallback if both are empty. |
| Username | `member.public_username` | The default Smartico UI uses `public_username`; some sibling surfaces (tournament clan drill-down) prefer `member.clean_ext_user_id` as primary with `public_username` as fallback. Pick whichever matches your product's identity model. |
| "You" badge | rendered when `member.is_me === true` | Small inline pill next to the username. |
| Contribution | `member.contribution_score` | Format with `toLocaleString()` (locale-aware thousand separators). |

**"Me" row highlight**: when `member.is_me === true`, apply a row CSS
class (e.g. `is-me`) — background tint + inline "You" badge.

## Sticky "my member" footer

The default Smartico UI pins a duplicate of the user's member row at
the bottom of the scrollable members list whenever the user is in this
clan (i.e. `members.find(m => m.is_me)` returns a non-null value).
Same visual treatment as the inline row, just pinned to the modal's
footer area above the Join CTA.

Skip the sticky footer when the user is not a member of this clan.

## Action button decision matrix

Same as the list-level CTA matrix — evaluate in priority order. The
detail modal has the most accurate state because `cooldown_until` here
is always fresh (vs the list's 30 s-cached value).

| State | Condition | Button label | Enabled? |
|---|---|---|---|
| **Your clan** | `detail.clan_id === user_clan_id` | "Your clan" | No-op |
| **Cooldown active** | `detail.cooldown_until !== null` | `"Cooldown until <local-date>"` | Disabled |
| **Clan full** | `member_count >= capacity_limit` | "Clan is full" | Disabled |
| **Insufficient balance** | `entry_fee_amount > 0` AND balance for `entry_fee_currency_type_id` < `entry_fee_amount` | `"Not enough {Points|Gems|Diamonds} (deficit)"` | Disabled |
| **Joinable — free** | `entry_fee_amount === 0` OR `entry_fee_currency_type_id === 3` | "Join free" | Enabled |
| **Joinable — paid** | default | `"Join ({amount} {Points|Gems|Diamonds})"` | Enabled |

Enabled Join click invokes
[`joinClan(clan_id)`](../../api/classes/WSAPIClans.md#joinclan); see
its own UI guide.

**Note on cooldown freshness**: the detail's `cooldown_until` will
reflect a just-expired cooldown 30 s sooner than the list's cached
value. If your UI cares to surface a "you're now eligible" hint
right when the cooldown ends, watch the detail's value rather than
the list's.

## Image / asset specs

| Field | Aspect ratio | Used where | Fallback |
|---|---|---|---|
| `public_meta.image_url` | 1:1 (square) | Modal header icon | First character of `public_meta.name` rendered as a letter avatar |
| `members[i].avatar_url` (or derived) | 1:1 | Member row avatars | Letter-avatar with the username's first character |

CDN-resolved automatically by the SDK. The default Smartico UI
re-derives member avatars from `avatar_id` + brand `avatarDomain`
even though `avatar_url` is pre-populated — either works.

## Empty / loading / error states

- **Loading**: render the modal frame and header immediately
  (driven by the caller-side `TClan` from the list); leave the
  members list area as a shimmer skeleton until the detail
  response lands.
- **`members` empty**: render an empty-state placeholder (e.g.
  "No members yet"). Rare — clans with `member_count === 0` are
  unusual.
- **Invalid `clanId` / network error**: the default Smartico UI
  silently swallows the error and leaves the members list empty.
  For better UX, attach a `.catch()` and surface "Failed to load
  details — Try again".

## Close affordance

Three independent dismiss mechanisms:

1. Close button (top-right).
2. Click outside the modal card.
3. `Escape` key.

The default Smartico UI wires all three via a shared `useModalClose`
hook.

## Animations / transitions

- **Modal entry**: fade-in + scale-up (~150 ms ease-out).
- **Modal exit**: fade-out + scale-down (~120 ms).
- **Member rows**: stagger fade-in (~20 ms per row) on first render.
- **Join success celebration**: when the user successfully joins
  THIS clan (detect by `joinClan` resolving with `errCode === 0`
  for `detail.clan_id`), re-fetch `getClanInfo` and animate the
  sticky-footer row sliding in.
- **Rank changes between fetches**: if you poll the detail (uncommon
  — typically only the list polls), use a FLIP animation when
  `position` values shift between snapshots.

## Mobile vs desktop

- **Single component** — no separate mobile / desktop variants of
  the detail modal. Layout adapts via the modal frame's responsive
  sizing.
- **Members list density**: identical on both. Rows are compact
  enough to fit ~6–8 visible at once on a mobile sheet.
- **Sticky footer**: same logic on both — no row-count threshold
  (different from the list-page sticky footer which requires ≥ 7
  rows).

## Performance

- Each call is a fresh network round-trip. Avoid auto-polling the
  detail unless your UI explicitly needs live updates — the
  default Smartico UI fetches once per modal mount.
- If you do poll for live rank/score updates, use a 10–30 s
  interval and diff snapshots to animate only the changed rows.
- Member avatars use CDN-resized URLs; lazy-loading is usually
  unnecessary for typical clan sizes (capacity_limit is the bound).
