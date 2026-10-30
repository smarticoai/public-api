# getMiniGames — API (TMiniGameTemplate)

> Returns all mini-game templates ("SAW" = Spin And Win — the umbrella term for wheel-spin, scratch-card, lootbox, gift-box, treasure-hunt, plinko, coin-flip, quiz, and several other formats) configured for the label.
> Import: `import { TMiniGameTemplate } from '@smartico/public-api'`
> Search terms: getMiniGames, minigames, getSAW, spins, wheel, SAWPrizeType, TMiniGameTemplate, SAWGameTypeName, SAWBuyInTypeName, TMiniGamePrize, MiniGamePrizeTypeName, SAWAcknowledgeTypeName, PrizeModifiers, AttemptPeriodType, SAWTemplateUI, SAWWheelLayout, SAWAskForUsername, SAWExposeUserSpinId, Unique, onUpdate, subscription, id, name, description, thumbnail, visibile_when_can_spin, over_limit_message, no_attempts_message, jackpot_symbol

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
  - `prize_value` (number) — Amount of the prize: points for 'points', attempts for 'spin', gems or diamonds for 'gems-and-diamonds' (their sum when the prize gives both), tickets for 'raffle-ticket'. Not relevant for other types. For example for prize '100 points' the prize_value will be 100, for '100 free spins' 100, for '50 Diamonds' 50.
  - `gems_diamonds_type` ('gems' | 'diamonds' | 'gems-and-diamonds') — For 'gems-and-diamonds' prizes — which currency the prize gives: 'gems', 'diamonds', or 'gems-and-diamonds' (both; `prize_value` is then their sum). Absent for other types
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
  - `pool` (number) — Remaining stock of the prize — decrements on each win, refunded if the spin is finalised as lost. Populated only when the template's `expose_game_stat_on_api` is enabled; always populated for MatchX / Quiz / Bingo games
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
- `min_steps_to_finish_game` (number) — Minimum number of path steps / collectible prizes a session must include before the game can finish (step games — Voyager / Treasure Hunt). `>= 1` and `<= steps_to_finish_game`; when omitted, no minimum is enforced
- `custom_section_id` (number) — ID of the operator-defined custom section (widget menu grouping) the mini-game is assigned to
- `saw_template_ui_definition` (SAWTemplateUI) — Full raw UI definition of the mini-game (skin, colors, per-game visual settings) — see `SAWTemplateUI`. The commonly needed values are already lifted onto this template object
  - `skin` (string) — CSS skin key that selects the overall visual theme of the game. Resolved at runtime to the matching skin folder / CSS bundle.
  - `name` (string) — Display name of the mini-game template shown to players and in the Back-Office listing. Supports translations via `saw_template_ui_definition._translations.<lang>.name`.
  - `description` (string) — HTML-capable description / rules text shown to the player before or during the game. Supports translations via `saw_template_ui_definition._translations.<lang>.description`.
  - `thumbnail` (string) — URL of the thumbnail image (typically 256 × 256 px) shown in mini-game selection lists and galleries.
  - `over_limit_message` (string) — HTML-capable message shown to a player who has reached the maximum number of allowed attempts for the current period. Rendered when the server rejects a spin with `SAWSpinErrorCode.SAW_FAILED_MAX_SPINS_REACHED`. Supports translations via `saw_template_ui_definition._translations.<lang>.over_limit_message`. Only relevant when `max_spins_count` is configured on the template.
  - `no_attempts_message` (string) — HTML-capable message shown when the player has no spin attempts or insufficient points / gems / diamonds to play. Supports translations via `saw_template_ui_definition._translations.<lang>.no_attempts_message`. Only relevant for buy-in types `Spins`, `Points`, `Gems`, or `Diamonds`.
  - `sectors_count` (number) — Number of prize sectors on the wheel or gift-box grid. For Spin-the-Wheel games the Back-Office enforces a range of 3 – 10.
  - `priority` (number) — Relative display order of the mini-game within a list. Lower values appear first. Configurable in the Back-Office "Priority" field (Advanced section).
  - `flow_builder_only` (boolean) — When `true` the mini-game is **excluded from the widget's automatic game listing** and is only accessible when it is explicitly triggered via a Campaign Flow Builder action or accessed by deep links or triggered over the api. Back-Office label: _"Available only from campaign (won't be visible in the widget)"_
  - `background_image` (string) — URL of the full-bleed background image shown on desktop devices. Not used for Plinko and Coin Flip game types.
  - `background_image_mobile` (string) — URL of the full-bleed background image shown on mobile devices. Falls back to `background_image` when absent. Not used for Plinko and Coin Flip game types.
  - `background_sound` (string) — URL of the audio file (MP3 / WAV) played as background music during gameplay. Silenced when `disable_background_music` is `true` or the player has muted audio.
  - `background_music_volume` (number) — Volume level of the background music, expressed as a percentage in the range `0` – `100`.
  - `disable_background_music` (boolean) — When `true`, background music is muted even if a `background_sound` URL is provided. Defaults to `true` in the Skin Editor preview scaffolding.
  - `spin_animation_duration` (number) — Duration in milliseconds of the spin animation before the result is revealed (e.g. `3000` = 3 seconds). Applies to Spin-the-Wheel and similar animated game types.
  - `wheel_pointer_rotation` (number) — Rotation offset in degrees applied to the visual pointer / arrow on the wheel to compensate for skin-specific alignment differences.
  - `wheel_layout` (SAWWheelLayout) — Screen positioning of the wheel relative to the game panel. | Value | Meaning | | --- | --- | | `SAWWheelLayout.Centered = 1` | Wheel centred in the panel | | `SAWWheelLayout.LeftAligned = 2` | Wheel pinned to the left | | `SAWWheelLayout.RightAligned = 3` | Wheel pinned to the right | | `SAWWheelLayout.BottomAligned = 4` | Wheel pinned to the bottom | Applies to Spin-the-Wheel games only. Back-Office label: _"Wheel layout"_.
  - `scratch_logo` (string) — URL of the logo image overlaid on the scratch-card surface before the player scratches.
  - `scratch_cover` (string) — URL of the cover / foil image that the player scratches away to reveal the prize beneath.
  - `scratch_bg_desktop` (string) — URL of the background image shown behind the scratch card on desktop devices. Back-Office label: _"Scratch main desktop background"_.
  - `scratch_bg_mobile` (string) — URL of the background image shown behind the scratch card on mobile devices. Back-Office label: _"Scratch main mobile background"_.
  - `scratch_cursor` (string) — URL of a custom cursor image used when the pointer hovers over the scratchable area. Back-Office label: _"Scratch mouse cursor"_.
  - `hide_prize_names` (boolean) — When `true`, prize / reward names are hidden inside the scratch-card UI so the player does not know what they won until they have fully scratched the card. Only rendered for `SAWGameType.ScratchCard`. Back-Office label: _"Hide prize names"_.
  - `custom_css` (string) — Raw CSS injected into the game iframe, allowing fine-grained overrides beyond what the selected skin provides.
  - `custom_skin_folder` (string) — Path to an alternative folder from which skin assets (images, CSS, JS) are loaded instead of the default skin bundle.
  - `jackpot_symbol` (string) — Label / symbol appended to the jackpot amount to give it semantic meaning (e.g. `"EUR"`, `"Free spins"`). Displayed alongside `SAWTemplate.jackpot_current`. Back-Office label: _"Jackpot symbol"_.
  - `promo_image` (string) — URL of a promotional banner image (recommended 500 × 240 px) displayed inside the game UI to advertise an offer or campaign. Supports per-language variants via `saw_template_ui_definition.promo_image_<lang>`.
  - `promo_text` (string) — HTML-capable promotional text displayed alongside `promo_image`. Supports translations via `saw_template_ui_definition._translations.<lang>.promo_text`.
  - `matchx_banner` (string) — URL of the banner image shown at the top of the MatchX / Quiz tournament leaderboard on desktop. Back-Office label: _"Banner"_.
  - `matchx_banner_mobile` (string) — URL of the mobile-optimised banner image for the MatchX / Quiz tournament leaderboard.
  - `matchx_seasonal_ranking` (boolean) — When `true`, tournament rankings are reset on a seasonal cadence rather than being continuous.
  - `matchx_is_completed` (boolean) — When `true`, the MatchX / Quiz tournament has concluded. New entries are blocked and the final leaderboard is shown.
  - `matchx_general_board_users_count` (number) — Maximum number of players visible on the general leaderboard inside the MatchX / Quiz game.
  - `matchx_hide_ranking` (boolean) — When `true`, the ranking / leaderboard panel is hidden from players inside the MatchX / Quiz game. Back-Office label: _"Hide ranking"_.
  - `prize_pool_image` (string) — URL of an image used to illustrate the prize pool (e.g. a trophy or coins graphic).
  - `show_prize_board` (boolean) — When `true`, a panel listing the available prizes is displayed inside the game. Back-Office label: _"Show the list of the prizes"_. Defaults to `true` in the MatchX / Quiz game form.
  - `max_spins_period_ms` (number) — The rolling time-window in milliseconds within which `SAWTemplate.maxSpinsCount` attempts are allowed (e.g. `86400000` = 24 hours). Stored on the template root as `max_spins_period_ms`; mirrored here for convenience in UI preview payloads.
  - `show_countdown_for_next_availability` (boolean) — When `true`, a countdown timer showing when the next spin becomes available is displayed to the player. Only active when `max_spins_count === 1` **and** `max_spins_period_ms` is set; automatically forced to `false`. Back-Office label: _"Show time to the next available spin"_.
  - `ask_for_username` (SAWAskForUsername) — Controls when (or whether) the player is asked to provide a display name before or after playing. | Value | Meaning | | --- | --- | | `SAWAskForUsername.NOASK = 'no-ask'` | Never ask | | `SAWAskForUsername.ONSUMBIT = 'on-submit'` | Ask when submitting | Back-Office label: _"Ask for username"_.
  - `custom_section_id` (number) — ID of the custom section (category / tab) this mini-game belongs to, allowing operators to group games in bespoke widget sections. Back-Office label: _"Custom section"_.
  - `only_in_custom_section` (boolean) — When `true`, the template is shown **only** inside its assigned custom section and is suppressed from all standard game listings.
  - `expose_user_spin_id` (SAWExposeUserSpinId) — Determines which identifier is forwarded in webhooks and the Retention API when a spin result is produced. | Value | Meaning | | --- | --- | | `SAWExposeUserSpinId.UserId = 1` | Expose the operator's external user ID | | `SAWExposeUserSpinId.SpinId = 2` | Expose the internal spin transaction ID | Back-Office label: _"Expose 'External user ID' or 'Spin transaction ID'"_.
  - `custom_data` (any) — Arbitrary operator-defined payload attached to the template. Can be a JSON object, plain string, or number. Passed through to the front-end as-is and accessible via the public API. Back-Office label: _"Custom data field"_.
  - `placeholder1` (string) — First free-form placeholder string used by Prize Drop game skins to inject operator-defined copy into the game UI.
  - `placeholder2` (string) — Second free-form placeholder string used by Prize Drop game skins to inject operator-defined copy into the game UI.
  - `prize_drop_template` ({
        /** Unique identifier for this prize-drop HTML template. */
        id: string;
        /** HTML content rendered inside the prize-drop panel. */
        content: string;
    }) — Template definition for the Prize Drop game overlay. `id` is the unique template identifier; `content` is the raw HTML rendered inside the drop panel.
  - `game_layout` (SAWGameLayout) — Visual arrangement of items in Lootbox (Weekly / Calendar Days) game types. | Value | Meaning | | --- | --- | | `SAWGameLayout.Horizontal = 1` | Items laid out in a horizontal row | | `SAWGameLayout.VerticalMap = 2` | Items arranged as a vertical map path | Back-Office label: _"Visual layout"_.
  - `steps_to_finish_game` (number) — Total number of path steps / cells a player must progress through to complete a Treasure Hunt game and receive the final prize. Higher values result in longer gameplay sessions. Back-Office label: _"Steps to finish game"_.
  - `min_steps_to_finish_game` (number) — Minimum number of path steps / collectible prizes a Voyager session must include before the game can finish. Acts as a floor for the randomly-chosen path length so that sessions cannot terminate after only one or two prizes. When omitted, no minimum is enforced. Must be `>= 1` and `<= steps_to_finish_game`. Back-Office label: _"Min. number of prizes"_.
  - `game_difficulty` (SAWGameDifficultyType) — Difficulty level of the Voyager (space-exploration) mini-game, controlling obstacle frequency and game speed. | Value | Meaning | | --- | --- | | `SAWGameDifficultyType.EASY = 1` | Easy | | `SAWGameDifficultyType.MEDIUM = 2` | Medium | | `SAWGameDifficultyType.HARD = 3` | Hard |
  - `custom_game_url` (string) — URL of the operator-hosted custom mini-game, loaded inside an iframe by the widget for `SAWGameType.CustomMinigame`. The operator is trusted (the URL resolves to the operator's own published Vibe Studio game), but the iframe is still rendered with a restrictive sandbox as defence in depth: `sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-pointer-lock"`. Top-level navigation is intentionally not allowed, so the game cannot redirect the host page. Back-Office label: _"Game URL"_.
  - `use_custom` (boolean) — Whether this template is played as a custom mini-game. A template of any regular game type (wheel, scratch card, treasure hunt, …) can be switched over to a custom game while keeping its own type, prizes and buy-in settings — only the way it is played changes: the widget loads `custom_game_url` in an iframe instead of rendering the built-in game. `saw_game_type_id` still reports the original type, so treat this flag — not the type — as the answer to "is this played as a custom game", together with `SAWGameType.CustomMinigame` and `SAWGameType.Bingo`, which are always played that way. When `false` or omitted, the template is played as its own game type. Back-Office label: _"Use Custom Game"_.
  - `standalone_fullscreen` (boolean) — Whether a custom mini-game fills the whole mini-game window instead of the default fixed-size frame (800×516 on desktop, 400×745 on mobile). Applies wherever the game is opened — a spin attempt shown to the user, a deep link, or `_smartico.miniGame()` in standalone or inline mode. The `fullscreen` option of `_smartico.miniGame()` overrides it per call. When `false` or omitted, the default frame size is used. Back-Office label: _"Standalone full screen"_.
  - `standalone_width` (string) — Width of the custom mini-game frame on desktop when opened standalone or inline, as a CSS size (`800px`, `100%`, `90vw`; a bare number is treated as pixels). Empty or invalid values fall back to the default 800px. Ignored on mobile. Back-Office label: _"Standalone width"_.
  - `standalone_height` (string) — Height of the custom mini-game frame on desktop when opened standalone or inline, as a CSS size (`516px`, `100%`, `90vh`; a bare number is treated as pixels). Empty or invalid values fall back to the default 516px. Ignored on mobile. Back-Office label: _"Standalone height"_.
  - `voyager_seed_window_min` (number) — Minutes for the Voyager seed window. The seed window is the range of seeds that can be used to generate the map. The seed window is used to ensure that the map is generated the same way for each player.
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
All `SAWGameType` values (`SpinAWheel`, `ScratchCard`,
`MatchX`, `GiftBox`, `PrizeDrop`, `Quiz`, `LootboxWeekdays`,
`LootboxCalendarDays`, `TreasureHunt`, `Voyager`, `Plinko`,
`CoinFlip`, `CustomMinigame`, `Bingo`) surface through the same template shape. Most are
played via `playMiniGame`; the exceptions are:
- `PrizeDrop` — server-push only; the consumer does NOT call
 `playMiniGame`. Prizes arrive via the prize-drop push channel.
- `MatchX` / `Quiz` / `Bingo` — predictions are submitted via a separate
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
    "id": 651,
    "name": "Wheel of Love",
    "description": "This is demo description of mini game. <br/>\n            <hr/>\n\n            You can <b>use tags</b> like {{spins_available}}, to show number of spins that us…",
    "thumbnail": "https://cdn.example/00000000-0000-0000-0000-000000000000/ico.png",
    "visibile_when_can_spin": false,
    "over_limit_message": "That's enough for today, please come back tomorrow",
    "no_attempts_message": "You don't have any more attempts on this minigame",
    "jackpot_symbol": "hugs",
    "saw_game_type": "wheel",
    "saw_buyin_type": "free",
    "jackpot_add_on_attempt": 1,
    "jackpot_current": 5339,
    "spin_count": 1,
    "promo_image": "https://cdn.example/31c0db8a8d3e9888ba009a-promo-image.png",
    "custom_data": {},
    "expose_game_stat_on_api": false,
    "relative_period_timezone": 0,
    "activeFromDate": -9223372036854776000,
    "activeTillDate": 9223372036854776000,
    "next_available_spin_ts": null,
    "earliest_expiration_dt": null,
    "latest_expiration_dt": null,
    "saw_template_ui_definition": {
      "thumbnail": "",
      "jackpot_symbol": "hugs",
      "over_limit_message": "That's enough for today, please come back tomorrow",
      "description": "This is demo description of mini game. <br/>\n            <hr/>\n\n            You can <b>use tags</b> like {{spins_available}}, to show number of spins that us…",
      "background_image_mobile": "",
      "custom_css": "/* text of the prize on sector */\n.saw-view .wheel-sector-name .sector-text {\n\n}\n\n/* the name of the game shown under the wheel */\n.saw-info-name {\n   \n}\n\n/*…",
      "priority": 1,
      "background_image": "",
      "wheel_layout": 1,
      "sectors_count": 7,
      "show_countdown_for_next_availability": true,
      "promo_image": "https://cdn.example/31c0db8a8d3e9888ba009a-promo-image.png",
      "disable_background_music": false,
      "background_sound": "",
      "name": "Wheel of Love",
      "max_spins_period_ms": 60000,
      "spin_animation_duration": 10,
      "flow_builder_only": false,
      "wheel_pointer_rotation": 0,
      "background_music_volume": 10,
      "no_attempts_message": "You don't have any more attempts on this minigame"
    },
    "show_prize_history": true,
    "max_number_of_attempts": 1,
    "prizes": [
      {
        "id": 3272,
        "name": "Try again!",
        "prize_type": "no-prize",
        "prize_value": 1,
        "font_size": 20,
        "icon": "",
        "sectors": [
          1
        ],
        "acknowledge_type": "silent",
        "acknowledge_dp": "dp:ok",
        "acknowledge_action_title": "OK",
        "pool": null,
        "pool_initial": 500,
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
