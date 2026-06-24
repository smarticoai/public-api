# getMiniGames — API (TMiniGameTemplate)

> Returns all mini-game templates ("SAW" = Spin And Win — the umbrella term for wheel-spin, scratch-card, lootbox, gift-box, treasure-hunt, plinko, coin-flip, quiz, and several other formats) configured for the label.
> Import: `import { TMiniGameTemplate } from '@smartico/public-api'`
> Search terms: getMiniGames, minigames, TMiniGameTemplate, id, name, description, thumbnail, visibile_when_can_spin, saw_game_type, saw_buyin_type, jackpot_add_on_attempt

## Signature
```ts
_smartico.api.getMiniGames({ onUpdate }: { onUpdate?: (data: TMiniGameTemplate[]) => void } = {}): Promise<
		TMiniGameTemplate[]
	>
```

## Parameters
- `params` — Optional. Omit to fetch without subscribing.
- `params.onUpdate` — Callback invoked with the full refreshed template array after any spin-count change, spin response, or acknowledge response on this connection.

## Returns — `Promise<
		TMiniGameTemplate[]
	>`
Array of `TMiniGameTemplate`. Each item:
- `id` (number) — ID of the mini-game template
- `name` (string) — Name of the mini-game template, translated to the user language
- `description` (string) — Description of the mini-game template, translated to the user language
- `thumbnail` (string) — URL of the icon of the mini-game template, 256x256px
- `visibile_when_can_spin` (boolean) — Indicates if the mini-game is visible when the user have attempts/points/gems/diamonds to play
- `saw_game_type` (string) — The type of the game, e.g. Spin the Wheel, Gift Box, Scratch card, MatchX etc
- `saw_buyin_type` (string) — How the user is charged for each game attempt e.g. Free, Points or Spin attempts
- `jackpot_add_on_attempt` (number) — The amount that will be added to the jackpot every time when somebody plays the game. Note that the contribution amount is abstract, means that no money or points are deducted from the user balance.
- `jackpot_current` (number) — Current jackpont amount, if jackpot is enabled.
- `spin_count` (number) — in case of charging type 'Spin attempts', shows the current number of spin attempts that user has
- `promo_image` (string) — The promo image, 500x240px
- `promo_text` (string) — The promo text
- `custom_data` (object) — The custom data of the mini-game defined by operator in the BackOffice. Can be a JSON object, string or number
- `expose_game_stat_on_api` (boolean) — When enabled, the number of items in the pool and number of won items will be exposed in the Retention API and in the UI Widgets
- `relative_period_timezone` (number) — Time zone to ensure each day aligns with your local midnight.
- `activeFromDate` (number) — Holds time from which template will become available, for the template that are targeted to be available from specific time (UNIX timestamp)
- `activeTillDate` (number) — Holds time till which template will become available, for the templates that are targeted to be available from specific time (UNIX timestamp)
- `next_available_spin_ts` (null) — if the game is limit to the number of spins that user can do during period of time, this property shows the epoch time in UTC when the next attempt will be available. Note that you need to enable 'Show time to the next available spin' setting on mini-game template in the backoffice Important: this field will not be populated if “Max number of attempts a user can do” is set to value different from 1
- `custom_section_id` (number) — Hold the id of the custom section
- `saw_template_ui_definition` (object) — The UI definition of the mini-game
- `show_prize_history` (boolean) — When enabled the prize history icon is visible on a certain template
- `max_number_of_attempts` (number) — The maximum number of attempts that user can do during period of time
- `prizes` (object[]) — List of prizes for mini-games
  - `id` (number) — ID of the prize
  - `name` (string) — The visual name of the prize
  - `prize_type` (string) — The type of the prize, no-prize, points, bonus, manual, spin, jackpot
  - `prize_value` (number) — Numeric value of the prize in case it's 'points' or 'spin' type. For other types of prizes this value is not relevant. For example for prize '100 points' the prize_value will be 100. For '100 free spins' the prize_value will be 100.
  - `font_size` (null) — Custom font size for the prize (desktop)
  - `position` (number) — for scratch card defines position of prize in the list
  - `sectors` (array) — List of sectors for the prize
  - `acknowledge_type` (string) — Type of acknowledge message for users
  - `acknowledge_dp` (string) — Deep link that will trigger some action in modal pop-up
  - `acknowledge_action_title` (string) — The name of the action button in modal pop-up
  - `pool` (null) — Number of items in stock
  - `pool_initial` (number) — Initial number of items in stock
  - `wins_count` (null) — Number of wins in game
  - `weekdays` (null) — Number of days of week, when the prize can be available
  - `active_from_ts` (null) — Holds time from which prize will become available, for the prizes that are targeted to be available from specific time (UNIX timestamp)
  - `active_till_ts` (null) — Holds time till which prize will become available, for the prizes that are targeted to be available from specific time (UNIX timestamp)
  - `relative_period_timezone` (number) — Time zone to ensure each day aligns with your local midnight.
  - `is_surcharge` (boolean) — Flag indicating that the prize is surcharged (available all the time, despite pool numbers)
  - `is_deleted` (boolean) — Flag indicating the state of the prize
  - `custom_data` (object) — The custom data of the mini-game defined by operator in the BackOffice. Can be a JSON object, string or number
  - `max_give_period_type_id` (number) — The period type for the prize to be given: Time from last attempt, Calendar days UTC, Calendar days user time zone, Lifetime

## Behavioral contract
**Subscription model (`onUpdate`)**
The callback receives the FULL refreshed template list (never a
diff/patch). Each subsequent call to `getMiniGames({ onUpdate })`
REPLACES the prior callback. Pass `onUpdate: undefined` (or omit
it) to keep the prior callback in place; the callback is never
auto-cleared.

**Update triggers** — the callback fires when:

1. The server pushes a `spin_count` change (campaign award,
 store purchase, BO manual issuance, mission reward).
2. Any `playMiniGame` or `playMiniGameBatch`
 resolves on this connection — the cached array refreshes
 with updated `spin_count`, `jackpot_current`, and any new
 `next_available_spin_ts`.
3. Acknowledge responses land (via auto-acknowledge or
 `miniGameWinAcknowledgeRequest`).

Jackpot growth is observable on the refreshed `jackpot_current`
field — the SDK inlines the live value into template `name` /
`promo_text` / prize `name` via a `{{jackpot}}` template
substitution at fetch time.

**Game-type variants**
All twelve `SAWGameType` values (`SpinAWheel`, `ScratchCard`,
`MatchX`, `GiftBox`, `PrizeDrop`, `Quiz`, `LootboxWeekdays`,
`LootboxCalendarDays`, `TreasureHunt`, `Voyager`, `Plinko`,
`CoinFlip`) surface through the same template shape. Most are
played via `playMiniGame`; the exceptions are:
- `PrizeDrop` — server-push only; the consumer does NOT call
 `playMiniGame`. Prizes arrive via the prize-drop push channel.
- `MatchX` / `Quiz` — predictions are submitted via a separate
 games server (not this SDK); the SAW spin is fired
 server-internally to deduct the buy-in.

**Cache TTL**: the SDK caches the response for 30 seconds. Cache
is fully cleared on login / logout.

**Idempotency / Side effects**: safe. Read-only.

**UI guidance**: see [UI Guide — `getMiniGames`](../../docs/ui/minigames/UIGuide_getMiniGames.md).

**Visitor mode**: supported. Only templates configured with
`is_visitor_mode = true` in the BO are returned for anonymous
sessions. Spins from these templates may also be played (visitor
mode is the one mini-game flow that does support play — see
`playMiniGame` for the visitor-stop semantics).

## Example
```ts
const games = await window._smartico.api.getMiniGames({
  onUpdate: (refreshed) => {
    console.log('[smartico] mini-game templates refreshed — re-render lobby from this array:', refreshed);
  },
});

// Filter the lobby view per the visibility flag.
const visible = games.filter(g =>
  !g.visibile_when_can_spin || (g.spin_count && g.spin_count > 0)
);

for (const g of visible) {
  console.log('[smartico] render game card', g.id, '—', g.name,
    '— type:', g.saw_game_type,
    '— buy-in:', g.saw_buyin_type,
    '— spins available:', g.spin_count ?? 0,
    '— jackpot:', g.jackpot_current, g.jackpot_symbol);
}
```

### Example response (REAL shape)
```json
[
  {
    "id": 656,
    "name": "Scratch & Love",
    "description": "This is demo description of mini game. <br/>\n            <hr/>\n\n            You can <b>use tags</b> like {{spins_available}}, to show number of spins that us…",
    "thumbnail": "https://cdn.example/00000000-0000-0000-0000-000000000000/ico.png",
    "visibile_when_can_spin": false,
    "saw_game_type": "scratch",
    "saw_buyin_type": "spins",
    "jackpot_add_on_attempt": 1,
    "jackpot_current": 1066,
    "spin_count": 5,
    "promo_image": "https://cdn.example/d3d65f1bc722a8c66a9493-PromoImagefromTinyPNG.png",
    "promo_text": "The Scratch of Love is better than any other scratch!",
    "custom_data": {},
    "expose_game_stat_on_api": false,
    "relative_period_timezone": 0,
    "activeFromDate": -9223372036854776000,
    "activeTillDate": 9223372036854776000,
    "next_available_spin_ts": null,
    "custom_section_id": 491,
    "saw_template_ui_definition": {
      "scratch_bg_mobile": "",
      "promo_text": "The Scratch of Love is better than any other scratch!",
      "thumbnail": "",
      "only_in_custom_section": false,
      "scratch_logo": "",
      "description": "This is demo description of mini game. <br/>\n            <hr/>\n\n            You can <b>use tags</b> like {{spins_available}}, to show number of spins that us…",
      "background_image_mobile": "",
      "custom_css": ".scratch-card-root-mobile .scratch-area .button-area div {\n    background-image: linear-gradient(180deg,#BD0A42,50%,#BD0A42);\n}\n.scratch-card-root .scratch-a…",
      "hide_prize_names": false,
      "scratch_bg_desktop": "",
      "priority": 1,
      "scratch_cover": "",
      "background_image": "",
      "sectors_count": 6,
      "show_countdown_for_next_availability": false,
      "promo_image": "https://cdn.example/d3d65f1bc722a8c66a9493-PromoImagefromTinyPNG.png",
      "disable_background_music": true,
      "scratch_cursor": "",
      "background_sound": "",
      "name": "Scratch & Love",
      "spin_animation_duration": 15,
      "flow_builder_only": false,
      "custom_section_id": 491,
      "background_music_volume": 10
    },
    "show_prize_history": true,
    "max_number_of_attempts": 0,
    "prizes": [
      {
        "id": 15589,
        "name": "No luck this time =(",
        "prize_type": "no-prize",
        "prize_value": 1,
        "font_size": null,
        "position": 7,
        "sectors": [
          ""
        ],
        "acknowledge_type": "silent",
        "acknowledge_dp": "dp:ok",
        "acknowledge_action_title": "OK",
        "pool": null,
        "pool_initial": 100,
        "wins_count": null,
        "weekdays": null,
        "active_from_ts": null,
        "active_till_ts": null,
        "relative_period_timezone": 0,
        "is_surcharge": false,
        "is_deleted": false,
        "custom_data": {},
        "max_give_period_type_id": 2
      },
      {
        "id": 3301,
        "name": "150 Points",
        "prize_type": "points",
        "prize_value": 150,
        "font_size": null,
        "icon": "https://cdn.example/cbc28c039c3b2b4f91034c-Storeitemcopy18.png",
        "position": 5,
        "sectors": [
          ""
        ],
        "acknowledge_type": "silent",
        "acknowledge_dp": "dp:ok",
        "acknowledge_action_title": "OK",
        "pool": null,
        "pool_initial": 1000,
        "wins_count": null,
        "weekdays": null,
        "active_from_ts": null,
        "active_till_ts": null,
        "relative_period_timezone": 0,
        "is_surcharge": true,
        "is_deleted": false,
        "custom_data": {},
        "max_give_period_type_id": 2
      }
    ]
  }
]
```

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `playMiniGame`
- `playMiniGameBatch`
- `miniGameWinAcknowledgeRequest`
