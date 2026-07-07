# getRaffles — API (TRaffle)

> Returns all raffles visible to the current user, each carrying an embedded `draws[]` array with per-draw state (current state, ticket counts, opt-in status, prize structure).
> Import: `import { TRaffle } from '@smartico/public-api'`
> Search terms: getRaffles, raffles, TRaffle, TRaffleDraw, TRafflePrize, RaffleDrawInstanceState, RaffleDrawTypeExecution, TRaffleTicket, RaffleTicketCapVisualization, onUpdate, subscription, id, name, description, custom_section_id, image_url, image_url_mobile, start_date, end_date

## Signature
```ts
_smartico.api.getRaffles({ onUpdate }: { onUpdate?: (data: TRaffle[]) => void } = {}): Promise<TRaffle[]>
```

## Parameters
- `params` — Optional. Omit to fetch without subscribing.
- `params.onUpdate` — Callback invoked with the full refreshed raffles list after every `claimRafflePrize` or `requestRaffleOptin` round-trip on this connection.

## Returns — `Promise<TRaffle[]>`
Array of `TRaffle`. Each item:
- `id` (number) — ID of the Raffle template
- `name` (string) — Name of the raffle
- `description` (string) — Description of the raffle
- `custom_section_id` (number) — ID of the custom section that is linked to the raffle in the Gamification widget
- `image_url` (string) — URL of the image that represents the raffle, 890x193px
- `image_url_mobile` (string) — URL of the mobile image that represents the raffle, 300x142px
- `custom_data` (string) — Custom data as string or JSON string that can be used in API to build custom UI You can request from Smartico to define fields for your specific case that will be managed from Smartico BackOffice Read more here - https://help.smartico.ai/welcome/products/tools-and-guides/custom-fields-attributes
- `start_date` (number) — Date of start
- `end_date` (number) — Date of end
- `max_tickets_count` (number) — Maximum numer of tickets that can be given to all users for the whole period of raffle
- `current_tickets_count` (number) — Number of tickets that are already given to all users for this raffle
- `draws` (TRaffleDraw[]) — List of draws that are available for this raffle. For example, if the raffle is containg one hourly draw, one daily draw and one draw on fixed date like 01/01/2022, Then the list will always return 3 draws, no matter if the draws are already executed or they are in the future.
  - `id` (number) — Id of the Draw definition, for the repetative draws (e.g. daily), this number will be the same for all draws that are repeating daily (internal name: schedule_id)
  - `name` (string) — Name of the draw, e.g. 'Daily draw'
  - `description` (string) — Description of the draw
  - `image_url` (string) — URL of the image that represents the draw, 365x175px
  - `image_url_mobile` (string) — URL of the moible image that represents the draw, 300x145px
  - `icon_url` (string) — URL of the icon that represents the draw
  - `background_image_url` (string) — URL of the background image that will be used in the draw list item
  - `background_image_url_mobile` (string) — URL of the moible background image that will be used in the draw list item
  - `is_grand` (boolean) — Show if the draw is grand and is marked as special
  - `prizes` (TRafflePrize[]) — Information about prizes in the draw
    - `id` (string) — The unique identifier for the prize definition
    - `name` (string) — Name of the prize
    - `description` (string) — Description of the prize
    - `image_url` (string) — URL of the image that represents the prize, 256x256px
    - `custom_data` (string) — Custom data field set in the backoffice prize setup. Can be used to build custom UI for gamification.
    - `prizes_per_run` (number) — The number of prizes available per run of the draw. E.g. if the draw is run daily, this is the number of prizes available each day, for example 3 iPhones.
    - `prizes_per_run_actual` (number) — The actual number of prizes for the current instance. This value is taking into account follwing values: - min_required_total_tickets, - add_one_prize_per_each_x_tickets - stock_items_per_draw - total_tickets_count (from Draw instance) - cap_prizes_per_run For example: - prizes_per_run = 1 - min_required_total_tickets = 1000 - add_one_prize_per_each_x_tickets = 1000 - stock_items_per_draw = 5 - total_tickets_count = 7000 - cap_prizes_per_run = 6 prizes_per_run_actual will be 5, because 7000 tickets are collected, so 7 iPhones are available, but the cap is 6 and the stock is 5.
    - `chances_to_win_perc` (number) — The chances to win the prize by current player. Calculated as the ratio of the number of tickets collected by the current player to the total number of tickets collected by all players and multiplied by number of actual prizes of this kind.
    - `min_required_total_tickets` (number) — The minimum number of total tickets collected during draw period required to unlock the prize. If the number of tickets collected is less than this value, the prize is not available. Under total tickets we understand the number of tickets collected by all users. The 'draw period' is the time between the ticket_start_date value of the draw and the current time.
    - `add_one_prize_per_each_x_tickets` (number) — One additional prize will be awarded for each X tickets. E.g. if the prize is 1 iPhone and the value is set to 1000, then for every 1000 tickets collected, an additional iPhone is awarded. If min_required_total_tickets is set to 1000, then next iPhone is awarded when 2000 tickets are collected, and so on. If min_required_total_tickets is not set, then the next iPhone will be awarded when 1000 tickets are collected.
    - `requires_claim` (boolean) — Indicates whether the prize requires a claim action from the user.
    - `min_required_tickets_for_user` (number) — The minimum number of tickets a user must have to be eligible for the prize. For example iPhone prize may require 10 tickets to be collected, only users with 10 or more tickets will be eligible for the prize. More tickets are better, as they increase the chances of winning.
    - `cap_prizes_per_run` (number) — The maximum number of prizes that can be given withing one instance/run of draw. For example the prize is iPhone and add_one_prize_per_each_x_tickets is set to 1000, cap_prizes_per_run is set to 3, and the total number of tickets collected is 7000. In this case, the prizes_per_run_actual will be limitted by 3
    - `priority` (number) — The priority of the prize. The low number means higher priority (e.g. 1 is higher priority than 2). If there are multiple prizes available, the prize with the highest priority (lowest number) will be awarded first.
    - `stock_items_per_draw` (number) — Optional field that indicates total remaining number of the prize for all draws of the type. For example, the Daily draw has 1 iPhone daily, and the total number of iPhones is 10. the stock_items_per_draw will be decreasing by 1 each day (assuming there is enough tickets and it is won every day), and when it reaches 0, the prize is not available anymore.
    - `should_claim` (boolean) — Shows if the prize has been claimed
    - `winners` (TRafflePrizeWinner[])
      - `id` (number) — Id of the winner definition, for the repetative winners (e.g. same winner won two prizes), this number will be the same for all winner that are repeating (internal name: schedule_id)
      - `username` (string) — Winner user name
      - `avatar_url` (string) — URL of the image of user avatar
      - `ticket` (TRaffleTicket) — Ticket information (number string and integer)
        - `ticekt_id` (number) — Int presentation of the ticket
        - `ticket_id_string` (string) — String presentation of the ticket
      - `raf_won_id` (number) — Unique ID of winning
      - `claimed_date` (number) — Date when the prize was claimed
  - `current_state` (RaffleDrawInstanceState) — State of current instance of Draw
  - `run_id` (number) — Field indicates the ID of the latest instance/run of draw
  - `execution_type` (RaffleDrawTypeExecution) — Type of the draw execution, indicating how and when the draw is executed. - ExecDate: Draw is executed only once at a specific date and time. - Recurring: Draw is executed on a recurring basis (e.g., daily, weekly). - Grand: Draw is executed once and is marked as grand, often with larger prizes or more importance.
  - `execution_ts` (number) — Date/time of the draw execution
  - `previous_run_ts` (number) — Date of the previously executed draw (if there is such)
  - `previous_run_id` (number) — Unique ID of the previusly executed draw (if there is such)
  - `ticket_start_ts` (number) — Date/time starting from which the tickets will participate in the upcoming draw This value need to be taken into account with next_execute_ts field value, for example Next draw is at 10:00, ticket_start_date is 9:00, so all tickets that are collected after 9:00 will participate in the draw at 10:00 (internally this value is calculated as next_execute_ts - ticket_start_date)
  - `allow_multi_prize_per_ticket` (boolean) — Field is indicating if same ticket can win multiple prizes in the same draw For example there are 3 types of prizes in the draw - iPhone, iPad, MacBook If this field is true, then one ticket can win all 3 prizes (depending on the chances of course), if false, then one ticket can win only one prize. The distribution of the prizes is start from top (assuming on top are the most valuable prizes) to bottom (less valuable prizes) If specific prize has multiple values, e.g. we have 3 iPhones, then the same ticket can win only one prize of a kind, but can win multiple prizes of different kind (if allow_multi_prize_per_ticket is true)
  - `total_tickets_count` (number) — The number of tickets that are already given to all users for this instance of draw. In other words tickets that are collected between ticket_start_date and current time (or till current_execution_ts is the instance is executed).
  - `my_tickets_count` (number) — The number of tickets collected by current user for this instance of draw.
  - `my_last_tickets` (TRaffleTicket[])
    - `ticekt_id` (number) — Int presentation of the ticket
    - `ticket_id_string` (string) — String presentation of the ticket
  - `user_opted_in` (boolean) — If true, the user has opted-in to the raffle.
  - `requires_optin` (boolean) — If true, the user needs to opt-in to the raffle before they can participate.
  - `is_active` (boolean) — If true, the draw is active and can be participated in.
  - `winners_limit` (number) — The number of winners to return
  - `winners_offset` (number) — The offset of the winners to return
  - `winners_total` (number) — The total number of winners
- `ticket_cap_visualization` (RaffleTicketCapVisualization) — Ticket cap visualization

## Behavioral contract
**Subscription model (`onUpdate`)**
The callback receives the FULL refreshed raffle list (never a
diff/patch). Each subsequent call to `getRaffles({ onUpdate })`
REPLACES the prior callback. Pass `onUpdate: undefined` (or omit
it) to keep the prior callback in place; the callback is never
auto-cleared.

**Update triggers** — the callback fires when:

1. `claimRafflePrize` resolves on this connection (any
 response code) — the refreshed list reflects the new
 `has_unclaimed_prize` / `claimed_date` state.
2. `requestRaffleOptin` resolves on this connection (any
 response code) — the refreshed list reflects the new
 `user_opted_in` state on the affected draw.

Does NOT fire for: server-side draw executions, ticket increments
(other users earning tickets), or operator-side raffle/draw config
changes. Those changes surface only on the next cache miss (after
the 30 s TTL) — poll manually if your UI needs sub-30s freshness
during an in-progress draw.

**Reading state from the returned raffle**
- `current_tickets_count` vs `max_tickets_count` drives the
 `ticket_cap_visualization` banner (enum
 `RaffleTicketCapVisualization`: `Empty` = no banner,
 `Counter` = show "X tickets remaining", `Message` = show
 sold-out message).
- Within each draw, `current_state`
 (`RaffleDrawInstanceState`) buckets the draw into Open
 (accepting tickets), WinnerSelection (currently drawing), or
 Executed (winners selected).
- `execution_type` (`RaffleDrawTypeExecution`) distinguishes
 one-shot (`ExecDate`), repeating (`Recurring`), or special
 one-shot (`Grand`) draws. Recurring draws share a stable
 `draws[i].id` (the schedule definition) across runs — `run_id`
 is the per-execution instance.

**Cache TTL**: the SDK caches the response for 30 seconds. Cache
is fully cleared on login / logout. The server also invalidates
the SDK cache when a draw executes on the server side.

**Idempotency / Side effects**: safe. Read-only.

**UI guidance**: see [UI Guide — `getRaffles`](../../docs/ui/raffles/UIGuide_getRaffles.md).

**Visitor mode**: supported. The same shape is returned, scoped
to the brand's public raffles. Per-user fields (`my_tickets_count`,
`my_last_tickets`, `user_opted_in`) are not meaningful for
visitors. The `onUpdate` callback is accepted but never fires
because the mutation methods that trigger it
(`claimRafflePrize`, `requestRaffleOptin`) are not
available / not effective in visitor mode.

## Example
```ts
const raffles = await window._smartico.api.getRaffles({
  onUpdate: (refreshed) => {
    console.log('[smartico] raffles refreshed (after claim/optin) — re-render from this array:', refreshed);
  },
});

for (const raffle of raffles) {
  console.log('[smartico] render raffle', raffle.id, '—', raffle.name, ':', raffle.draws.length, 'draws');

  // Bucket draws: active/upcoming first (sorted by execution_ts ASC), then executed last.
  const sorted = [...raffle.draws].sort((a, b) => {
    const aDone = a.current_state === 3;  // Executed
    const bDone = b.current_state === 3;
    if (aDone !== bDone) return aDone ? 1 : -1;  // executed sink to the bottom
    return a.execution_ts - b.execution_ts;
  });

  for (const d of sorted) {
    if (d.requires_optin && !d.user_opted_in && d.is_active && d.current_state !== 3) {
      console.log('[smartico] draw', d.run_id, '— show OPT IN CTA (requires_optin + not yet opted in + still active)');
    }
    if (d.current_state === 3) {
      console.log('[smartico] draw', d.run_id, 'executed — fetch winner details via getRaffleDrawRun');
    }
  }
}

// For winner detail on an executed draw, call getRaffleDrawRun separately.
```

### Example response (REAL shape)
> Where this real payload differs from the typed Returns above (TS interface vs raw wire), the REAL shape is the runtime truth.
```json
[
  {
    "id": 158,
    "name": "ICE Raffle 3.0",
    "description": "<h2>🎉 Join the Excitement – Enter Our Raffle Draws Today! 🎟️</h2>\n\n<p>Get ready to dive into the thrill of <b>winning amazing prizes</b>! 🏆 Don’t miss you…",
    "custom_section_id": 1621,
    "image_url": "https://cdn.example/14077931496fd2091ac794-RaffleLobbyImage.png",
    "image_url_mobile": "https://cdn.example/330ba5ab6c0aa2e74d203d-Rafflelobbyimagemobile.png",
    "start_date": 1780669800000,
    "end_date": 1796157059000,
    "max_tickets_count": 2000000,
    "current_tickets_count": 13198,
    "draws": [
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
            "stock_items_per_draw": 9991,
            "should_claim": false,
            "winners": [],
            "requires_claim": false,
            "min_required_tickets_for_user": 10
          }
        ],
        "current_state": 1,
        "run_id": 775459,
        "execution_type": 2,
        "execution_ts": 1782378000000,
        "previous_run_ts": 1782291600000,
        "previous_run_id": 771353,
        "ticket_start_ts": 1782291600000,
        "allow_multi_prize_per_ticket": false,
        "total_tickets_count": 93,
        "my_tickets_count": 0,
        "my_last_tickets": [],
        "user_opted_in": true,
        "requires_optin": false,
        "is_active": true,
        "winners_limit": 20,
        "winners_offset": 0,
        "winners_total": 0
      }
    ]
  }
]
```

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `getRaffleDrawRun`
- `claimRafflePrize`
- `requestRaffleOptin`
- `RaffleTicketCapVisualization`
- `RaffleDrawInstanceState`
- `RaffleDrawTypeExecution`
