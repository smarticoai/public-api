# getRaffleDrawRunsHistory — API (TRaffleDrawRun)

> Returns the history of past-executed draw runs for a raffle — optionally scoped to a single recurring draw schedule.
> Import: `import { TRaffleDrawRun } from '@smartico/public-api'`
> Search terms: getRaffleDrawRunsHistory, raffles, TRaffleDrawRun, id, run_id, name, description, image_url, image_url_mobile, icon_url, background_image_url

## Signature
```ts
_smartico.api.getRaffleDrawRunsHistory(props: { raffle_id: number; draw_id?: number }): Promise<TRaffleDrawRun[]>
```

## Parameters
- `props.raffle_id` — The parent raffle's `id` (from `TRaffle.id`). Required.
- `props.draw_id` — Optional — the draw's schedule_id (`TRaffleDraw.id`). When set, scopes the history to that one draw's runs. When omitted, includes all draws of the raffle.

## Returns — `Promise<TRaffleDrawRun[]>`
Array of `TRaffleDrawRun`. Each item:
- `id` (number) — Id of the Draw definition, for the repetative draws (e.g. daily), this number will be the same for all draws that are repeating daily (internal name: schedule_id)
- `run_id` (number) — Field indicates the ID of the latest instance/run of draw
- `name` (string) — Name of the draw, e.g. 'Daily draw'
- `description` (string) — Description of the draw
- `image_url` (string) — URL of the image that represents the draw
- `image_url_mobile` (string) — URL of the moible image that represents the draw
- `icon_url` (string) — URL of the icon that represents the draw
- `background_image_url` (string) — URL of the background image that will be used in the draw list item
- `background_image_url_mobile` (string) — URL of the moible background image that will be used in the draw list item
- `is_grand` (boolean) — Show if the draw is grand and is marked as special
- `execution_ts` (number) — Date/time of the draw execution
- `actual_execution_ts` (number) — Actual Date/time of the draw execution
- `ticket_start_ts` (number) — Date/time starting from which the tickets will participate in the upcoming draw This value need to be taken into account with next_execute_ts field value, for example Next draw is at 10:00, ticket_start_date is 9:00, so all tickets that are collected after 9:00 will participate in the draw at 10:00 (internally this value is calculated as next_execute_ts - ticket_start_date)
- `is_winner` (boolean) — Shows if user has won a prize in a current run
- `has_unclaimed_prize` (boolean) — Shows if user has unclaimed prize

## Behavioral contract
**Preconditions**
`raffle_id` is required. `draw_id` is optional — when omitted,
the response includes history for ALL draws of the raffle; when
supplied, it scopes to that one draw's recurring history. The
`draw_id` to pass is `TRaffleDraw.id` (the schedule_id, stable
across runs), not `run_id`.

**Server-side filtering**
Draws configured by the operator to hide their history are
excluded from the response automatically. Cancelled runs are
also excluded.

**Sort order**
Server returns rows by scheduled `execution_ts` descending
(newest first). No client-side sort required.

**Refresh model**
- **No subscription.** One-shot promise.
- **No client cache.** Every call hits the server.
- **No push event** refreshes the response. Re-call manually to
 pick up newly-executed runs or `has_unclaimed_prize` flips
 after a `claimRafflePrize` call.

**Idempotency / Side effects**: safe. Read-only.

**UI guidance**: see [UI Guide — `getRaffleDrawRunsHistory`](../../docs/ui/raffles/UIGuide_getRaffleDrawRunsHistory.md).

**Visitor mode**: supported. The same shape is returned with
`is_winner` and `has_unclaimed_prize` always `false` for visitors.

## Example
```ts
const raffles = await window._smartico.api.getRaffles();
const raffle = raffles[0];

// History across all draws of the raffle.
const allHistory = await window._smartico.api.getRaffleDrawRunsHistory({
  raffle_id: raffle.id,
});

// Highlight rows where the user has an unclaimed prize.
const unclaimed = allHistory.filter(r => r.has_unclaimed_prize);
if (unclaimed.length > 0) {
  console.log('[smartico] surface a "Claim" CTA on these', unclaimed.length, 'history rows:', unclaimed.map(r => r.run_id));
}

// Scoped history of one recurring draw (use draw.id, the schedule_id).
const oneDrawHistory = await window._smartico.api.getRaffleDrawRunsHistory({
  raffle_id: raffle.id,
  draw_id: raffle.draws[0].id,   // schedule_id (stable across recurring runs)
});
console.log('[smartico] render history rows for the daily draw — newest first:', oneDrawHistory.length, 'rows');
```

### Example response (REAL shape)
```json
[
  {
    "id": 323,
    "run_id": 688934,
    "name": "Hourly draw",
    "description": "💰 Every hour, the luck could be yours! 🍀 Participate in our hourly draw for a chance to WIN BIG! 💸 Don't miss out!",
    "image_url": "https://cdn.example/5bcd2fd9bf96f3709d96b5-HourlyDraw-Promoimage.png",
    "image_url_mobile": "https://cdn.example/5bcd2fd9bf96f3709d96b5-HourlyDraw-Promoimage.png",
    "icon_url": "https://cdn.example/c20dcc73645e365a387dc2-HourlyDraw-Drawicon.png",
    "background_image_url": "https://cdn.example/867db7f6791f0a45039608-DrawBackground.png",
    "background_image_url_mobile": "https://cdn.example/d31a8d4708a17723d57b4b-DrawBackgroundMobilecopy.png",
    "is_grand": false,
    "execution_ts": 1780876800000,
    "ticket_start_ts": 1780873200000,
    "is_winner": false,
    "has_unclaimed_prize": false
  }
]
```

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `claimRafflePrize`
