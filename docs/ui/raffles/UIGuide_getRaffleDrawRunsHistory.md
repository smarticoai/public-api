# UI Guide — `getRaffleDrawRunsHistory`

## Overview
- Powers a **draw-history modal / page** showing past-executed runs
  for a raffle (optionally scoped to a single recurring draw
  schedule).
- Use to surface unclaimed-prize CTAs across the user's history,
  let the user revisit completed draws, or build a "my wins"
  surface.
- One-shot fetch, no cache. Re-call to refresh — typically only
  needed after a new execution lands or after a
  [`claimRafflePrize`](../../api/classes/WSAPIRaffles.md#claimraffleprize)
  call resolves.

## List view organization

Server-sorted by `execution_ts` DESC (newest first). No client-side
sort required.

If `props.draw_id` is omitted, the list interleaves history across
all draws of the raffle. The default Smartico UI shows them in
their server order — no per-draw grouping. To group by draw, key on
`row.id` (the schedule_id) client-side.

If `props.draw_id` is set, the list scopes to one draw's recurring
history.

## Item row

Fields rendered per row:

| Field | Source | Notes |
|---|---|---|
| Image | `image_url` (or `image_url_mobile` on mobile); fallback to `icon_url` | Same specs as in `getRaffles` UI guide. |
| Name | `name` | |
| Description | `description` | Optional; the default UI may omit it on dense lists. |
| Grand badge | If `is_grand === true`, render a "Grand" pill | |
| Scheduled date | `execution_ts` formatted as user-local date/time | |
| Actual date | `actual_execution_ts` — typically same as scheduled, but may differ slightly on recovery paths | |
| User won? | If `is_winner === true`, surface a "You won!" pill | |
| Claim CTA | If `has_unclaimed_prize === true`, show a "Claim" button that opens the prize detail via [`getRaffleDrawRun`](../../api/classes/WSAPIRaffles.md#getraffledrawrun) | |

Row click target: opens the executed draw's detail view (winner
list) by calling `getRaffleDrawRun({ raffle_id, run_id })`.

## Claim CTA on history rows

When `row.has_unclaimed_prize === true`, surface a Claim button.
Clicking it should:

1. Fetch the run detail via
   [`getRaffleDrawRun`](../../api/classes/WSAPIRaffles.md#getraffledrawrun)
   to locate the user's winning row(s).
2. Pass each winner row's `raf_won_id` to
   [`claimRafflePrize`](../../api/classes/WSAPIRaffles.md#claimraffleprize).

The default Smartico UI renders the Claim button inline on the
history row and opens a confirmation flow when clicked.

## Empty / loading / error states

- **Loading (cold fetch)**: render a skeleton list (3–5
  placeholder rows) sized to the eventual layout.
- **Empty result**: `[]` means no executed runs yet. Render a
  neutral empty-state ("No history yet").
- **Error**: keep prior state if any; show a non-blocking error
  banner; retry on next user-driven action.

## Refresh

No subscription, no cache, no push. Call manually:

- After a `claimRafflePrize` resolves (to refresh
  `has_unclaimed_prize`).
- After a new run executes on the server side (the user observes
  the new history row).
- On a periodic poll if your UI wants to show new executions
  promptly — typically not necessary for history surfaces.

## Mobile vs desktop

- **Image source**: `image_url_mobile` / `background_image_url_mobile`
  on mobile.
- **Row density**: mobile may collapse description and date columns
  to save horizontal space.

## Performance

- Each call is a fresh network round-trip. Scope with `draw_id` when
  possible to keep response size manageable.
- Don't poll the history surface in real time — re-fetch
  on user-initiated actions only.
