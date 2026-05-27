# UI Guide — `getRaffleDrawRun`

## Overview
- Powers the **draw detail / winners screen** for a single raffle
  draw run. Adds paginated `prizes[].winners[]` rows (usernames +
  avatars) to the same `TRaffleDraw` shape already embedded in
  [`getRaffles`](../../api/classes/WSAPIRaffles.md#getraffles).
- One-shot fetch. No cache, no subscription. Re-call to refresh —
  the default Smartico UI polls on a variable cadence depending on
  the draw's `current_state`.

## Detail view layout

Top-to-bottom layout:

  1. **Header** — `image_url` / `image_url_mobile` as background.
  2. **Title + state chip** — `name` + a chip driven by
     `current_state` (Open / Drawing / Finished).
  3. **Countdown ticker** — `DD : HH : MM : SS` to `execution_ts`
     while Open; not rendered during WinnerSelection or after
     Executed (replaced by drawing animation / winner list).
  4. **Prize cards** — one per `prizes[]` entry. Each shows
     `name`, `description`, `image_url`, `prizes_per_run_actual`,
     and (if `current_state === Executed`) the paginated
     `winners[]` rows.
  5. **My tickets** — `my_tickets_count` / `my_last_tickets` for
     Open draws.
  6. **Opt-in / claim CTAs** — see the
     [`requestRaffleOptin`](../../api/classes/WSAPIRaffles.md#requestraffleoptin)
     and [`claimRafflePrize`](../../api/classes/WSAPIRaffles.md#claimraffleprize)
     UI guides.

## Winners list (paginated)

When `current_state === Executed`, each prize card carries a
`winners[]` array (type `TRafflePrizeWinner`). Render as a table:

| Column | Source |
|---|---|
| Position | Computed from list order (the server-sorted result places the current user's wins at the top). |
| Avatar | `winner.avatar_url`. Fallback to a letter avatar when missing. |
| Username | `winner.username`. Fallback to "Anonymous" if empty. |
| Ticket | `winner.ticket.ticket_id_string` (use the string form for display). |
| Claimed | If `winner.claimed_date` is set, show "Claimed"; otherwise show "Pending" (or a Claim CTA if `should_claim === true` and the row matches the current user). |

**Pagination** via `winners_from` / `winners_to`:

- Default window per call: `0 – 20`.
- Server cap per call: 50 rows. Passing a larger window silently
  truncates.
- Total count: `winners_total` on the returned `TRaffleDraw`.
- The default Smartico UI uses page size 7 internally with a
  custom pagination component — your UI can choose any size up to
  50.

For load-more pagination: advance `winners_from` by the prior page
size on each subsequent call; reuse the same response transform.

## Refresh / polling

`getRaffleDrawRun` has no cache and no push refresh. Poll manually
when the consumer is viewing a live draw. Recommended cadence
keyed to `current_state` + remaining time:

| State / Time | Poll interval |
|---|---|
| `WinnerSelection` (drawing) | 3 s |
| `Open`, `< 5 minutes` to execution | 10 s |
| `Open`, `> 5 minutes` to execution | 30 s |
| `Executed` | No polling needed (state is terminal) |

Stop polling when the detail view unmounts.

## Image / asset specs

Inherits from [`getRaffles`](./UIGuide_getRaffles.md#image--asset-specs):

- Draw promo: 365×175 px (desktop), 300×145 px (mobile)
- Background image: 900×85 px (desktop), 1328×240 px (mobile)
- Prize image: 256×256 px (1:1 square)
- Avatar: serve via CDN; letter-avatar fallback when empty

## Empty / loading / error states

- **Loading**: render the modal frame + countdown immediately
  (driven by the caller-side `TRaffleDraw` from `getRaffles`);
  show a winners-list skeleton while the call is in flight.
- **`winners[]` empty** (Executed draw with no winners): render
  "No winners yet" placeholder. Rare — the server should have
  selected at least one winner per `prizes_per_run_actual`.
- **Error**: keep the prior snapshot if any; show a non-blocking
  error banner; retry on next poll tick.

## Animations / transitions

- **WinnerSelection**: full-screen Lottie drawing animation; the
  winners list area is hidden until state transitions to Executed.
- **Winners-list page change**: cross-fade rows on pagination.
- **No confetti / celebration animation** on the user's win row —
  surface a "You won!" pill on rows where `should_claim` is true
  for the current user.

## Mobile vs desktop

- **Modal style**: desktop centered with backdrop dim; mobile
  full-screen slide-up sheet.
- **Image source**: desktop fields vs `*_mobile` fields.
- **Winners-list layout**: desktop 4 columns; mobile may collapse
  the position column or compact the row.

## Performance

- Each call is a fresh network round-trip. During live drawing
  (3 s polling), this is the active surface; `getRaffles` is not
  polled in parallel.
- Pagination is server-side — don't over-fetch by passing a large
  window; reuse smaller windows.
