# getMiniGames — API (TMiniGameTemplate)

> Returns all mini-game templates ("SAW" = Spin And Win — the umbrella term for wheel-spin, scratch-card, lootbox, gift-box, treasure-hunt, plinko, coin-flip, quiz, and several other formats) configured for the label.
> Import: `import { TMiniGameTemplate } from '@smartico/public-api'`
> Search terms: getMiniGames, minigames, getSAW, spins, wheel, SAWPrizeType, TMiniGameTemplate, SAWGameTypeName, SAWBuyInTypeName, TMiniGamePrize, MiniGamePrizeTypeName, SAWAcknowledgeTypeName, PrizeModifiers, AttemptPeriodType, SAWTemplateUI, SAWAskForUsername, SAWGameLayoutName, SAWExposeUserSpinIdName, onUpdate, subscription, id, name, description, thumbnail, visibile_when_can_spin, saw_game_type, saw_buyin_type, jackpot_add_on_attempt

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
- `saw_game_type` (SAWGameTypeName) — The type of the game, e.g. Spin the Wheel, Gift Box, Scratch card, MatchX etc
- `saw_buyin_type` (SAWBuyInTypeName) — How the user is charged for each game attempt e.g. Free, Points or Spin attempts
- `buyin_cost_points` (number) — in case of charging type 'Points', what is the points amount will be deducted from user balance
- `buyin_cost_gems` (number) — in case of charging type 'Gems', what is the gems amount will be deducted from user balance
- `buyin_cost_diamonds` (number) — in case of charging type 'Diamonds', what is the diamonds amount will be deducted from user balance
- `spin_count` (number) — in case of charging type 'Spin attempts', shows the current number of spin attempts that user has
- `next_available_spin_ts` (number) — If the game limits the number of attempts per period of time, the epoch-ms time (UTC) when the next attempt becomes available. Populated only when the operator enabled the "show time to the next available spin" template setting, and only when the template's maximum attempts per period is 1.
- `earliest_expiration_dt` (number | null) — Soonest-expiring spin's expiration time for the current user, as an epoch-ms timestamp. `null` when the user has no expirable spins for this template — spins only expire when the template defines a spin-expiration rule (Wheel of Fortune, Loot Boxes, etc.). Pair with `latest_expiration_dt` to render a "spins expire between X and Y" window.
- `latest_expiration_dt` (number | null) — Latest-expiring spin's expiration time for the current user, as an epoch-ms timestamp. `null` when the user has no expirable spins; equals `earliest_expiration_dt` when a single expiration applies.
- `over_limit_message` (string) — The message that should be shown to the user when he cannot play the game, server rejected attempt with error code SAWSpinErrorCode.SAW_FAILED_MAX_SPINS_REACHED
- `no_attempts_message` (string) — The message that should be shown to the user when he cannot play the game because he doesn't have spin attempts or points.
- `jackpot_current` (number) — Current jackpot amount, if jackpot is enabled.
- `jackpot_add_on_attempt` (number) — The amount that will be added to the jackpot every time when somebody plays the game. Note that the contribution amount is abstract, means that no money or points are deducted from the user balance.
- `jackpot_symbol` (string) — The symbol of jackpot that is giving the sense to the 'amount' E.g. the symbol could be EUR and connected to the amount it can indicate that amount is monetary, e.g. '100 EUR'. Or the symbol can be 'Free spins' and connected to the amount it can indicate that amount is number of free spins, e.g. '100 Free spins'.
- `promo_image` (string) — The promo image, 500x240px
- `promo_text` (string) — The promo text
- `custom_data` (any) — The custom data of the mini-game defined by operator in the BackOffice. Can be a JSON object, string or number
- `prizes` (TMiniGamePrize[]) — Prizes configured for this game — see `TMiniGamePrize`
  - `id` (number) — ID of the prize
  - `name` (string) — Display name of the prize, pre-translated; any jackpot placeholder in it arrives resolved to the live jackpot value
  - `prize_type` (MiniGamePrizeTypeName) — The type of the prize — see `MiniGamePrizeTypeName` ('no-prize', 'points', 'gems-and-diamonds', 'spin', 'bonus', 'jackpot', 'raffle-ticket', 'mission', 'change-level', 'manual')
  - `prize_value` (number) — Numeric value of the prize in case it's 'points' or 'spin' type. For other types of prizes this value is not relevant. For example for prize '100 points' the prize_value will be 100. For '100 free spins' the prize_value will be 100.
  - `font_size` (number) — Custom font size in px for rendering the prize name on the game surface (e.g. a wheel sector), desktop
  - `font_size_mobile` (number) — Custom font size in px for the prize name, mobile; falls back to `font_size` when absent
  - `icon` (string) — The URL of the icon of the prize, aspect ratio 1:1
  - `position` (number) — For Scratch Card games — relative order of the prize in the scratch grid (lower first). May be absent for other game types
  - `sectors` (number[]) — For Spin-a-Wheel games — wheel sector indices this prize occupies. Absent for non-wheel games
  - `acknowledge_type` (SAWAcknowledgeTypeName) — Which win modal the prize uses — see `SAWAcknowledgeTypeName` (Silent / QuickMessage / FullMessage / ExplicitAcknowledge)
  - `aknowledge_message` (string) — Message that will be shown to user in modal pop-up
  - `aknowledge_message_lose` (string) — Message shown instead of `aknowledge_message` when the spin is finalised as lost (`lose: true` acknowledge flows — games with a client-decided outcome, e.g. Voyager). Absent unless configured
  - `acknowledge_dp` (string) — Deep link executed when the user taps the main action button in the win modal (run it via `_smartico.dp()`)
  - `acknowledge_action_title` (string) — Label of the main action button in the win modal
  - `acknowledge_dp_additional` (string) — Deep link of the additional action button in the win modal
  - `acknowledge_action_title_additional` (string) — Label of the additional action button in the win modal
  - `second_btn` (string) — Deep link of the secondary button in the win modal
  - `second_btn_action_title` (string) — Label of the secondary button in the win modal
  - `out_of_stock_message` (string) — Message when the prize pool is empty for that specific prize
  - `pool` (number) — Remaining stock of the prize — decrements on each win, refunded if the spin is finalised as lost. Populated only when the template's `expose_game_stat_on_api` is enabled; always populated for MatchX / Quiz games
  - `pool_initial` (number) — Initial (configured) stock of the prize. Populated regardless of `expose_game_stat_on_api`
  - `wins_count` (number) — Number of times the prize has been won, across all players. Populated only when the template's `expose_game_stat_on_api` is enabled
  - `weekdays` (number[]) — ISO weekday numbers (1 = Monday … 7 = Sunday) on which the prize can be won; absent = any day. Populated only when the template's `expose_game_stat_on_api` is enabled
  - `active_from_ts` (number) — Time from which the prize can be won (epoch ms), evaluated against `relative_period_timezone`. Populated only when the template's `expose_game_stat_on_api` is enabled
  - `active_till_ts` (number) — Time until which the prize can be won (epoch ms), evaluated against `relative_period_timezone`. Populated only when the template's `expose_game_stat_on_api` is enabled
  - `relative_period_timezone` (number) — Timezone offset in minutes used to evaluate `weekdays` and the active window (UTC minus local, as in JS `Date.getTimezoneOffset()` — e.g. `-180` for UTC+3)
  - `is_surcharge` (boolean) — When true, the prize stays winnable even when its `pool` reaches 0 (effectively unlimited stock)
  - `is_deleted` (boolean) — Always `false` in API responses — deleted prizes are excluded server-side
  - `custom_data` (any) — The custom data of the prize defined by the operator. Can be a JSON object, string or number
  - `prize_modifiers` (PrizeModifiers[]) — Step-modifier tiles for step games (Treasure Hunt / Voyager) — see `PrizeModifiers` (2x / 5x / 10x, /2 / /5 / /10, 0, reset) applied to the running total revealed during the game. Presentation only — the awarded amount is still `prize_value`
  - `allow_split_decimal` (boolean) — Step games (Treasure Hunt / Voyager): when true, the per-step revealed amounts of the prize value may be fractional; when false the split uses whole numbers
  - `hide_prize_from_history` (boolean) — Operator hint to hide this prize when rendering prize-history UIs. Informational only — API responses are not filtered by it
  - `requirements_to_get_prize` (string) — Operator text describing what the user must do to be eligible for this prize (lootbox games); shown when the prize is not yet available to the user
  - `max_give_period_type_id` (AttemptPeriodType) — Period basis for the prize availability restriction — see `AttemptPeriodType`. `CalendarDaysUserTimeZone` evaluates `weekdays` / the active window in the user's timezone; the other types use `relative_period_timezone`
- `expose_game_stat_on_api` (boolean) — Operator template setting. When enabled, the per-prize stock statistics (`pool`, `wins_count`, `weekdays`, `active_from_ts` / `active_till_ts`) are populated on `prizes` and kept current after every play; when disabled (default) those fields are omitted. See `getMiniGames` "Per-prize statistics"
- `relative_period_timezone` (number) — Timezone offset in minutes used to evaluate the template's period-based rules (UTC minus local, as in JS `Date.getTimezoneOffset()` — e.g. `-180` for UTC+3)
- `activeFromDate` (number) — Time from which the template becomes available (epoch ms); absent when not restricted
- `activeTillDate` (number) — Time until which the template stays available (epoch ms); absent when not restricted
- `steps_to_finish_game` (number) — Number of steps to complete the game and collect the prize (step games — Voyager / Treasure Hunt)
- `custom_section_id` (number) — ID of the operator-defined custom section (widget menu grouping) the mini-game is assigned to
- `saw_template_ui_definition` (SAWTemplateUI) — Full raw UI definition of the mini-game (skin, colors, per-game visual settings) — see `SAWTemplateUI`. The commonly needed values are already lifted onto this template object
  - `skin` (string)
  - `name` (string)
  - `description` (string)
  - `over_limit_message` (string)
  - `hide_prize_names` (string)
  - `no_attempts_message` (string)
  - `thumbnail` (string)
  - `sectors_count` (number)
  - `priority` (number)
  - `flow_builder_only` (boolean)
  - `background_image` (string)
  - `background_image_mobile` (string)
  - `background_sound` (string)
  - `spin_animation_duration` (number)
  - `scratch_logo` (string)
  - `scratch_cover` (string)
  - `scratch_bg_desktop` (string)
  - `scratch_bg_mobile` (string)
  - `scratch_cursor` (string)
  - `custom_css` (string)
  - `custom_skin_folder` (string)
  - `jackpot_symbol` (string)
  - `promo_image` (string)
  - `promo_text` (string)
  - `matchx_banner` (string)
  - `matchx_seasonal_ranking` (boolean)
  - `matchx_is_completed` (boolean)
  - `matchx_general_board_users_count` (number)
  - `matchx_hide_ranking` (boolean)
  - `prize_pool_image` (string)
  - `ask_for_username` (SAWAskForUsername)
  - `show_prize_board` (boolean)
  - `max_spins_period_ms` (number)
  - `show_countdown_for_next_availability` (boolean)
  - `disable_background_music` (boolean)
  - `custom_section_id` (number)
  - `only_in_custom_section` (boolean)
  - `custom_data` (any)
  - `placeholder1` (string)
  - `placeholder2` (string)
  - `prize_drop_template` ({
		id: string;
		content: string;
	})
- `game_layout` (SAWGameLayoutName) — Grid layout of the game. Populated only for Lootbox game types (LootboxWeekdays / LootboxCalendarDays)
- `show_prize_history` (boolean) — Operator setting: show a prize-history entry point (icon / button) on this game's view
- `max_number_of_attempts` (number) — The maximum number of attempts that user can do during period of time
- `max_spins_period_ms` (number) — The period of time in milliseconds during which the user can do the maximum number of attempts
- `expose_user_spin_id` (SAWExposeUserSpinIdName) — Which identifier to show next to a win result for transparency/audit — 'userId' (the player's external user id) or 'spinId' (the spin's transaction id). Absent when the operator disabled it

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

**Per-prize statistics (`expose_game_stat_on_api`)**
Each template's `prizes` array always carries the definition
fields — name, icon, `prize_type`, `prize_value`, acknowledge
configuration. The stock-statistics fields are gated by an
operator template setting, surfaced as
`expose_game_stat_on_api`:
- Populated when enabled: `pool` (remaining stock),
 `wins_count` (total wins across all players), `weekdays`
 (ISO 1–7 days the prize can be won), `active_from_ts` /
 `active_till_ts` (prize availability window).
- Omitted when disabled (the default) — this keeps the live
 prize economy (stock levels, win rates, schedules) hidden
 from players.
- Exception: `pool` is always populated for `MatchX` / `Quiz`
 templates, whose game flow needs the remaining stock.
- `pool_initial` is populated regardless of the setting.
When enabled, the values are also kept current — the server
refreshes the prize rows on each fetch and drops its template
caches after every play, so `pool` / `wins_count` are safe to
drive an "X prizes left" scarcity UI.

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
> Where this real payload differs from the typed Returns above (TS interface vs raw wire), the REAL shape is the runtime truth.
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
    "jackpot_current": 1070,
    "spin_count": 5,
    "promo_image": "https://cdn.example/d3d65f1bc722a8c66a9493-PromoImagefromTinyPNG.png",
    "promo_text": "The Scratch of Love is better than any other scratch!",
    "custom_data": {},
    "expose_game_stat_on_api": false,
    "relative_period_timezone": 0,
    "activeFromDate": -9223372036854776000,
    "activeTillDate": 9223372036854776000,
    "next_available_spin_ts": null,
    "earliest_expiration_dt": 1952155860877,
    "latest_expiration_dt": 1952155860877,
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
