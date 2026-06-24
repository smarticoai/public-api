# getRaffles — API (TRaffle)

> Returns all raffles visible to the current user, each carrying an embedded `draws[]` array with per-draw state (current state, ticket counts, opt-in status, prize structure).
> Import: `import { TRaffle } from '@smartico/public-api'`
> Search terms: getRaffles, raffles, TRaffle, id, name, description, custom_section_id, image_url, image_url_mobile, start_date, end_date

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
- `start_date` (number) — Date of start
- `end_date` (number) — Date of end
- `max_tickets_count` (number) — Maximum numer of tickets that can be given to all users for the whole period of raffle
- `current_tickets_count` (number) — Number of tickets that are already given to all users for this raffle
- `draws` (object[]) — List of draws that are available for this raffle. For example, if the raffle is containg one hourly draw, one daily draw and one draw on fixed date like 01/01/2022, Then the list will always return 3 draws, no matter if the draws are already executed or they are in the future.
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
    "current_tickets_count": 13066,
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
            "stock_items_per_draw": 9992,
            "should_claim": false,
            "winners": [],
            "requires_claim": false,
            "min_required_tickets_for_user": 10
          },
          {
            "id": 1246,
            "name": "100 Elite Spins on Holy Luck",
            "image_url": "https://cdn.example/733d391eb7813f1f4ea2fd-SlotLogoPaladin.png",
            "prizes_per_run": 5,
            "prizes_per_run_actual": 7,
            "chances_to_win_perc": 0,
            "min_required_total_tickets": 10,
            "cap_prizes_per_run": 20,
            "priority": 2,
            "stock_items_per_draw": null,
            "should_claim": false,
            "winners": [],
            "requires_claim": false,
            "min_required_tickets_for_user": 1
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
      },
      {
        "id": 323,
        "name": "Hourly draw",
        "description": "💰 Every hour, the luck could be yours! 🍀 Participate in our hourly draw for a chance to WIN BIG! 💸 Don't miss out!",
        "image_url": "https://cdn.example/5bcd2fd9bf96f3709d96b5-HourlyDraw-Promoimage.png",
        "image_url_mobile": "https://cdn.example/5bcd2fd9bf96f3709d96b5-HourlyDraw-Promoimage.png",
        "icon_url": "https://cdn.example/c20dcc73645e365a387dc2-HourlyDraw-Drawicon.png",
        "background_image_url": "https://cdn.example/867db7f6791f0a45039608-DrawBackground.png",
        "background_image_url_mobile": "https://cdn.example/d31a8d4708a17723d57b4b-DrawBackgroundMobilecopy.png",
        "is_grand": false,
        "prizes": [
          {
            "id": 1249,
            "name": "50 Points",
            "image_url": "https://cdn.example/8d3401ef474e5c8f0d9372-Storeitemcopy22ice.png",
            "prizes_per_run": 1,
            "prizes_per_run_actual": 1,
            "chances_to_win_perc": 0,
            "min_required_total_tickets": 200,
            "cap_prizes_per_run": 5,
            "priority": 1,
            "stock_items_per_draw": null,
            "should_claim": false,
            "winners": [],
            "requires_claim": false,
            "min_required_tickets_for_user": 10
          },
          {
            "id": 1250,
            "name": "50 Free Spins",
            "image_url": "https://cdn.example/8328e5e60ec5eaa133a9c1-Storeitemcopy7.png",
            "prizes_per_run": 1,
            "prizes_per_run_actual": 1,
            "chances_to_win_perc": 0,
            "min_required_total_tickets": 25,
            "cap_prizes_per_run": 10,
            "priority": 2,
            "stock_items_per_draw": null,
            "should_claim": false,
            "winners": [],
            "requires_claim": false,
            "min_required_tickets_for_user": 2
          }
        ],
        "current_state": 1,
        "run_id": 775241,
        "execution_type": 2,
        "execution_ts": 1782288000000,
        "previous_run_ts": 1782284400000,
        "previous_run_id": 775126,
        "ticket_start_ts": 1782284400000,
        "allow_multi_prize_per_ticket": false,
        "total_tickets_count": 19,
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
