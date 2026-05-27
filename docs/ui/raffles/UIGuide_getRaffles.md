# UI Guide — `getRaffles`

## Overview
- Returns the user's visible raffles, each carrying an embedded
  `draws[]` array with full per-draw state. Use as the source-of-truth
  for the raffles lobby + draw cards.
- The list refreshes automatically after
  [`claimRafflePrize`](../../api/classes/WSAPIRaffles.md#claimraffleprize)
  or
  [`requestRaffleOptin`](../../api/classes/WSAPIRaffles.md#requestraffleoptin)
  resolves. Server-side draw executions invalidate the SDK cache too.
- Winner detail (usernames, avatars) requires a follow-up call to
  [`getRaffleDrawRun`](../../api/classes/WSAPIRaffles.md#getraffledrawrun)
  — the embedded `draws[]` carry only pagination metadata.

## List view organization

The default Smartico UI renders raffles as a vertical list with each
raffle expanding to show its draws. There are no top-level tabs.

Per-raffle, draws are bucketed within the detail panel:

  1. **Active / Upcoming** — `draws.filter(d => d.current_state !== 3)`
     (1 = Open, 2 = WinnerSelection); sort by `execution_ts` ASC.
  2. **Executed** — `draws.filter(d => d.current_state === 3)`;
     rendered after the active draws.

## Ticket-cap banner

Drive from `TRaffle.ticket_cap_visualization` (enum):

| Value | Banner |
|---|---|
| `Empty` (0) | No banner. |
| `Counter` (1) | "X tickets remaining" where X = `max_tickets_count - current_tickets_count`. Format large numbers with locale separators. |
| `Message` (2) | "All tickets have been distributed" (when 0 remaining). |

## Raffle card (top-level)

Fields rendered on each raffle row:

- `image_url` (890×193 px desktop) / `image_url_mobile` (300×142 px).
- `name`, `description`.
- `start_date` / `end_date` — formatted as user-local dates.
- Total tickets banner (see above).
- Draw count or active-draw summary.

`custom_section_id` lets the consumer place the raffle into an
operator-defined custom section. `custom_data` is operator-defined
JSON / string for custom UI extensions.

## Draw card (per-raffle children)

Fields rendered on each `draws[i]`:

| Field | Notes |
|---|---|
| Card image | `background_image_url` (900×85 px desktop) / `background_image_url_mobile` (1328×240 px). Falls back to `icon_url` (256×256). |
| Title | `name`. |
| Description | `description`. |
| Grand badge | If `is_grand === true`, render a "Grand draw" pill. |
| Countdown | To `execution_ts`. See "Countdown / timing format". |
| State chip | Drive from `current_state` ({@link RaffleDrawInstanceState}): Open / Drawing / Finished. |
| My-tickets | `my_tickets_count` if > 0. |
| Last tickets preview | `my_last_tickets[]` (capped at ~5; newest first). Note the SDK field is spelled `ticekt_id` (typo). |
| Total tickets | `total_tickets_count`. |
| Prize summary | Top-priority prize from `prizes[]`. |
| Opt-in / Opted-in chip | See "Action button decision matrix". |

The draw card click target opens the draw detail (which fetches
winners via `getRaffleDrawRun`).

## Action button decision matrix

Per-draw CTA (evaluate in priority order):

| Condition | CTA |
|---|---|
| `current_state === WinnerSelection` (2) | "Drawing now…" (informational) — show the Lottie drawing animation |
| `current_state === Executed` (3) | "View winners" — opens detail via `getRaffleDrawRun` |
| `requires_optin && user_opted_in && current_state !== Executed` | "Fully opted in" (informational pill, no click) |
| `requires_optin && !user_opted_in && is_active && current_state !== Executed` | "Opt in" — invokes `requestRaffleOptin` |
| `!requires_optin && is_active && current_state === Open` | "View prizes" (or no CTA — the user is automatically participating) |
| `!is_active` and other terminal states | No CTA |

Opt-in is per-run — when a recurring draw advances to a new run,
`user_opted_in` resets to `false` on the new run. The Opt-in CTA
returns even for users who opted in to the previous run.

## Image / asset specs

| Field | Documented source | Aspect | Used where |
|---|---|---|---|
| `TRaffle.image_url` | 890×193 px | ~4.6:1 | Raffle row header (desktop) |
| `TRaffle.image_url_mobile` | 300×142 px | ~2.1:1 | Raffle row header (mobile) |
| `TRaffleDraw.image_url` | 365×175 px | ~2:1 | Draw promo |
| `TRaffleDraw.image_url_mobile` | 300×145 px | ~2:1 | Draw promo (mobile) |
| `TRaffleDraw.icon_url` | 256×256 px | 1:1 | Draw icon (compact contexts) |
| `TRaffleDraw.background_image_url` | 900×85 px | ~10.6:1 | Draw row background (desktop) |
| `TRaffleDraw.background_image_url_mobile` | 1328×240 px | ~5.5:1 | Draw row background (mobile) |
| `TRafflePrize.image_url` | 256×256 px | 1:1 | Prize card |

Fallback chain (per element): brand-supplied placeholder if the
field is empty. The SDK doesn't ship default images.

## Status-specific visual treatments

- **Open** (`current_state === 1`): full-color card with active
  countdown. Show My-tickets / prizes prominently.
- **WinnerSelection** (`current_state === 2`): show Lottie drawing
  animation (full-screen overlay in the default Smartico UI). The
  default UI polls every 3 s during this state.
- **Executed** (`current_state === 3`): subtle desaturation; show
  "View winners" CTA; surface "You won!" badge if any prize matches
  the user.
- **Grand** draws (`is_grand: true`): larger card, distinct accent
  color, grand badge. Otherwise identical fields.
- **Sold out** (ticket cap reached): banner + no opt-in CTA.

## Countdown / timing format

The default Smartico UI uses a hard-stamped `DD : HH : MM : SS`
ticker counting down to `execution_ts`. CSS state classes:

- Normal — default styling
- `alert` — applied when < 5 minutes remain (yellow/amber accent)
- `alarm` — applied when < 1 minute remains (red accent)

**Polling escalation**: the widget polls
[`getRaffleDrawRun`](../../api/classes/WSAPIRaffles.md#getraffledrawrun)
at a variable rate keyed to remaining time:

- 30 s default
- 10 s when < 5 minutes remain
- 3 s when in `WinnerSelection` state

For non-default UIs, mirror this pattern or use a constant 30 s
poll — the cost is one network round-trip per poll tick.

## Empty / loading / error states

- **Loading (cold fetch)**: render a skeleton grid sized to the
  eventual layout.
- **Loading (cache hit)**: do not render a loading state — the
  promise resolves within a microtask.
- **Empty result**: `[]` means no visible raffles. Render a neutral
  empty-state illustration.
- **Error**: keep the prior list if any; show a non-blocking error
  banner; retry on next user-driven action.

## Animations / transitions

- **List entry**: cards fade-in on first render.
- **WinnerSelection state**: full-screen Lottie animation while the
  server selects winners.
- **No celebration animation on claim** — the winner row updates
  in-place. See `claimRafflePrize` UI guide.
- **Opt-in success**: ~500 ms delay then UI state flip via
  `onUpdate` refresh.

## Mobile vs desktop

- **Image source**: `*_url` for desktop, `*_url_mobile` for mobile.
- **Draw row background**: desktop 900×85 px (wide strip); mobile
  1328×240 px (taller hero treatment).
- **Detail modal**: desktop centered modal with backdrop dim; mobile
  full-screen slide-up sheet.

## Performance

- The 30 s cache deduplicates rapid refetches.
- During an in-flight draw (WinnerSelection), polling
  `getRaffleDrawRun` instead of `getRaffles` is cheaper — the latter
  is a larger payload.
- Image assets are CDN-served; lazy-load images below the fold.
