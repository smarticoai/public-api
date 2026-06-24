# getRaffleDrawRun — API (TRaffleDraw)

> Returns the full detail of a single raffle draw run — same shape as the embedded `TRaffleDraw` in `getRaffles`, but populated with paginated `prizes[].winners[]` rows including usernames and avatars.
> Import: `import { TRaffleDraw } from '@smartico/public-api'`
> Search terms: getRaffleDrawRun, raffles, TRaffleDraw, TRafflePrize, TRafflePrizeWinner, RaffleDrawInstanceState, RaffleDrawTypeExecution, TRaffleTicket, id, name, description, image_url, image_url_mobile, icon_url, background_image_url, background_image_url_mobile

## Signature
```ts
_smartico.api.getRaffleDrawRun(props: { raffle_id: number; run_id: number; winners_from?: number; winners_to?: number }): Promise<TRaffleDraw>
```

## Parameters
- `props.raffle_id` — The parent raffle's `id` (from `TRaffle.id`).
- `props.run_id` — The draw run instance ID (from `TRaffleDraw.run_id`, not `TRaffleDraw.id`).
- `props.winners_from` — First winner index to return (0-based). Defaults to `0`.
- `props.winners_to` — Last winner index (exclusive). Defaults to `20`. Server caps the window at 50 rows per call.

## Returns — `Promise<TRaffleDraw>`
- `id` (number) — Id of the Draw definition, for the repetative draws (e.g. daily), this number will be the same for all draws that are repeating daily (internal name: schedule_id)
- `name` (string) — Name of the draw, e.g. 'Daily draw'
- `description` (string) — Description of the draw
- `image_url` (string) — URL of the image that represents the draw, 365x175px
- `image_url_mobile` (string) — URL of the moible image that represents the draw, 300x145px
- `icon_url` (string) — URL of the icon that represents the draw
- `background_image_url` (string) — URL of the background image that will be used in the draw list item
- `background_image_url_mobile` (string) — URL of the moible background image that will be used in the draw list item
- `is_grand` (boolean) — Show if the draw is grand and is marked as special
- `prizes` (object[]) — Information about prizes in the draw
  - `id` (number) — The unique identifier for the prize definition
  - `name` (string) — Name of the prize
  - `image_url` (string) — URL of the image that represents the prize, 256x256px
  - `prizes_per_run` (number) — The number of prizes available per run of the draw. E.g. if the draw is run daily, this is the number of prizes available each day, for example 3 iPhones.
  - `prizes_per_run_actual` (number) — The actual number of prizes for the current instance. This value is taking into account follwing values: - min_required_total_tickets, - add_one_prize_per_each_x_tickets - stock_items_per_draw - total_tickets_count (from Draw instance) - cap_prizes_per_run For example: - prizes_per_run = 1 - min_required_total_tickets = 1000 - add_one_prize_per_each_x_tickets = 1000 - stock_items_per_draw = 5 - total_tickets_count = 7000 - cap_prizes_per_run = 6 prizes_per_run_actual will be 5, because 7000 tickets are collected, so 7 iPhones are available, but the cap is 6 and the stock is 5.
  - `chances_to_win_perc` (number) — The chances to win the prize by current player. Calculated as the ratio of the number of tickets collected by the current player to the total number of tickets collected by all players and multiplied by number of actual prizes of this kind.
  - `min_required_total_tickets` (number) — The minimum number of total tickets collected during draw period required to unlock the prize. If the number of tickets collected is less than this value, the prize is not available. Under total tickets we understand the number of tickets collected by all users. The 'draw period' is the time between the ticket_start_date value of the draw and the current time.
  - `cap_prizes_per_run` (number) — The maximum number of prizes that can be given withing one instance/run of draw. For example the prize is iPhone and add_one_prize_per_each_x_tickets is set to 1000, cap_prizes_per_run is set to 3, and the total number of tickets collected is 7000. In this case, the prizes_per_run_actual will be limitted by 3
  - `priority` (number) — The priority of the prize. The low number means higher priority (e.g. 1 is higher priority than 2). If there are multiple prizes available, the prize with the highest priority (lowest number) will be awarded first.
  - `stock_items_per_draw` (number) — Optional field that indicates total remaining number of the prize for all draws of the type. For example, the Daily draw has 1 iPhone daily, and the total number of iPhones is 10. the stock_items_per_draw will be decreasing by 1 each day (assuming there is enough tickets and it is won every day), and when it reaches 0, the prize is not available anymore.
  - `should_claim` (boolean) — Shows if the prize has been claimed
  - `winners` (array)
  - `requires_claim` (boolean) — Indicates whether the prize requires a claim action from the user.
  - `min_required_tickets_for_user` (number) — The minimum number of tickets a user must have to be eligible for the prize. For example iPhone prize may require 10 tickets to be collected, only users with 10 or more tickets will be eligible for the prize. More tickets are better, as they increase the chances of winning.
- `current_state` (number) — State of current instance of Draw
- `run_id` (number) — Field indicates the ID of the latest instance/run of draw
- `execution_type` (number) — Type of the draw execution, indicating how and when the draw is executed. - ExecDate: Draw is executed only once at a specific date and time. - Recurring: Draw is executed on a recurring basis (e.g., daily, weekly). - Grand: Draw is executed once and is marked as grand, often with larger prizes or more importance.
- `execution_ts` (number) — Date/time of the draw execution
- `previous_run_ts` (number) — Date of the previously executed draw (if there is such)
- `previous_run_id` (number) — Unique ID of the previusly executed draw (if there is such)
- `ticket_start_ts` (number) — Date/time starting from which the tickets will participate in the upcoming draw This value need to be taken into account with next_execute_ts field value, for example Next draw is at 10:00, ticket_start_date is 9:00, so all tickets that are collected after 9:00 will participate in the draw at 10:00 (internally this value is calculated as next_execute_ts - ticket_start_date)
- `allow_multi_prize_per_ticket` (boolean) — Field is indicating if same ticket can win multiple prizes in the same draw For example there are 3 types of prizes in the draw - iPhone, iPad, MacBook If this field is true, then one ticket can win all 3 prizes (depending on the chances of course), if false, then one ticket can win only one prize. The distribution of the prizes is start from top (assuming on top are the most valuable prizes) to bottom (less valuable prizes) If specific prize has multiple values, e.g. we have 3 iPhones, then the same ticket can win only one prize of a kind, but can win multiple prizes of different kind (if allow_multi_prize_per_ticket is true)
- `total_tickets_count` (number) — The number of tickets that are already given to all users for this instance of draw. In other words tickets that are collected between ticket_start_date and current time (or till current_execution_ts is the instance is executed).
- `my_tickets_count` (number) — The number of tickets collected by current user for this instance of draw.
- `my_last_tickets` (array)
- `user_opted_in` (boolean) — If true, the user has opted-in to the raffle.
- `requires_optin` (boolean) — If true, the user needs to opt-in to the raffle before they can participate.
- `is_active` (boolean) — If true, the draw is active and can be participated in.
- `winners_limit` (number) — The number of winners to return
- `winners_offset` (number) — The offset of the winners to return
- `winners_total` (number) — The total number of winners

## Behavioral contract
**Preconditions**
Pass `raffle_id` (the parent raffle's `id`) and `run_id` (the
specific run instance — `TRaffleDraw.run_id` from
`getRaffles`'s embedded draws). Note that
`TRaffleDraw.id` is the *schedule_id* (stable across runs of a
recurring draw) — that's NOT what this method takes; it takes the
per-instance `run_id`.

**Refresh model**
- **No subscription.** One-shot promise.
- **No client cache.** Every call sends a network request.
- **No push event** refreshes the response. Live winner-list
 updates require a fresh call.
- The default Smartico UI polls this method on a variable cadence
 while a draw is in flight: every 3 s during `WinnerSelection`,
 every 10 s when the countdown is under 5 minutes, every 30 s
 otherwise.

**Winner pagination**
`winners_from` / `winners_to` define a half-open range of winner
indices. The default window is `0–20` (20 winners). The server
caps the window at 50 rows per call — passing a larger range
silently truncates. For "load more" pagination, advance
`winners_from` by the prior page size and pass the same
`winners_to` offset. `winners_total` on the returned
`TRaffleDraw` is the authoritative total count for pagination.

The current user's own winning rows (if any) are server-sorted
to the top of the result.

**Throws**
Both `raffle_id` and `run_id` are required — the SDK throws
synchronously when either is missing or falsy.

**Idempotency / Side effects**: safe. Read-only.

**UI guidance**: see [UI Guide — `getRaffleDrawRun`](../../docs/ui/raffles/UIGuide_getRaffleDrawRun.md).

**Visitor mode**: supported.

## Example
```ts
const raffles = await window._smartico.api.getRaffles();
const raffle = raffles[0];
const draw = raffle.draws.find(d => d.current_state === 3);  // Executed

if (!draw) {
  console.log('[smartico] no executed draw — skip detail view');
  return;
}

// First page of winners.
const detail = await window._smartico.api.getRaffleDrawRun({
  raffle_id: raffle.id,
  run_id: draw.run_id,   // NOTE: run_id, NOT draw.id
  winners_from: 0,
  winners_to: 20,
});

for (const prize of detail.prizes) {
  console.log('[smartico] prize', prize.name, '— winners on this page:', prize.winners.length);
  const myWin = prize.winners.find(w => w.username === currentUsername);  // or another match
  if (myWin) {
    console.log('[smartico] current user won this prize — surface a Claim CTA if not yet claimed');
  }
}

// Load more — pagination via winners_from / winners_to.
if ((detail.winners_total ?? 0) > 20) {
  const next = await window._smartico.api.getRaffleDrawRun({
    raffle_id: raffle.id,
    run_id: draw.run_id,
    winners_from: 20,
    winners_to: 40,
  });
  console.log('[smartico] page 2 loaded — append', next.prizes.flatMap(p => p.winners).length, 'winners');
}
```

### Example response (REAL shape)
```json
{
  "id": 322,
  "name": "Daily draw",
  "description": "🎟️🔥Hot Daily Raffle Alert!🔥🎟️ Spin your way to amazing prizes every single day! Don't miss out!",
  "image_url": "https://cdn.example/0e61ee7d31eea85ea1e2e5-DailyDraw-Promoimage.png",
  "image_url_mobile": "https://cdn.example/7da52af5814e089897b470-DailyDraw-Promoimagemobile.png",
  "icon_url": "https://cdn.example/c681faad98ec20cf94c6cf-DailyDraw-Drawicon.png",
  "background_image_url": "https://cdn.example/e17b7d69c350b47ae0878f-DrawBackground.png",
  "background_image_url_mobile": "https://cdn.example/9ec0cc0bcf58d038ab59f9-DrawBackgroundMobilecopy.png",
  "is_grand": false,
  "prizes": [
    {
      "id": 1244,
      "name": "16\" Lenovo laptop",
      "image_url": "https://cdn.example/6b4690ea0429208b244f7c-DailyDraw-516inchLaptopLenovoPrizeimage.png",
      "prizes_per_run": 1,
      "prizes_per_run_actual": 1,
      "chances_to_win_perc": 0,
      "min_required_total_tickets": 100,
      "cap_prizes_per_run": 3,
      "priority": 1,
      "stock_items_per_draw": 9992,
      "should_claim": false,
      "winners": [],
      "requires_claim": false,
      "min_required_tickets_for_user": 10
    }
  ],
  "current_state": 1,
  "run_id": 771353,
  "execution_type": 2,
  "execution_ts": 1782291600000,
  "previous_run_ts": 1782205200000,
  "previous_run_id": 767471,
  "ticket_start_ts": 1782205200000,
  "allow_multi_prize_per_ticket": false,
  "total_tickets_count": 1409,
  "my_tickets_count": 0,
  "my_last_tickets": [],
  "user_opted_in": true,
  "requires_optin": false,
  "is_active": true,
  "winners_limit": 20,
  "winners_offset": 0,
  "winners_total": 0
}
```

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `getRaffles`
