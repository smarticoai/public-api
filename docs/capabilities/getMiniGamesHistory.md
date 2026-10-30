# getMiniGamesHistory — API (TSawHistory)

> Returns a paginated, newest-first list of the user's past mini-game spins — each row carries the won prize ID, the client-side `request_id` used for the spin, and a server-recorded `is_claimed` flag (`true` if the spin has been acknowledged).
> Import: `import { TSawHistory } from '@smartico/public-api'`
> Search terms: getMiniGamesHistory, minigames, getSAWHistory, TSawHistory, SAWTemplate, SAWGameType, SAWTemplateUI, SAWBuyInType, SAWPrize, template, saw_template_id, saw_prize_id, prize_amount, client_request_id, is_claimed, create_date_ts, acknowledge_date_ts

## Signature
```ts
_smartico.api.getMiniGamesHistory({
		limit,
		offset,
		saw_template_id,
	}: {
		limit?: number;
		offset?: number;
		saw_template_id?: number;
	}): Promise<TSawHistory[]>
```

## Parameters
- `params` — Optional pagination + filter bag.
- `params.limit` — Page size. Defaults to 20.
- `params.offset` — Number of rows to skip. Defaults to 0.
- `params.saw_template_id` — When set, scopes the history to a single template's spins.

## Returns — `Promise<TSawHistory[]>`
Array of `TSawHistory`. Each item:
- `template` (SAWTemplate) — The initial information about mini-game
  - `saw_template_id` (number) — ID of the mini-game template
  - `saw_game_type_id` (SAWGameType) — The type of the game — see `SAWGameType`
  - `saw_template_ui_definition` (SAWTemplateUI) — Full UI definition of the mini-game (name, description, skin, colors, per-game visual settings)
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
  - `saw_buyin_type_id` (SAWBuyInType) — How the user is charged per attempt — see `SAWBuyInType`
  - `buyin_cost_points` (number) — Cost per attempt in the buy-in currency (points, gems or diamonds per `saw_buyin_type_id`)
  - `visibile_when_can_spin` (boolean) — Operator hint: show the game only while the user can actually play it (has attempts / sufficient balance)
  - `spin_count` (number) — Number of spin attempts the user currently has (initial value; later changes arrive as spin-count pushes)
  - `prizes` (SAWPrize[]) — Prizes configured for this game — see `SAWPrize`
    - `saw_prize_id` (number) — ID of the prize
    - `saw_prize_ui_definition` (SAWPrizeUI) — Visual definition of the prize (name, icon, win-modal buttons, per-game rendering hints)
      - `position` (number) — for scratch card defines position of prize in the list
      - `name` (string)
      - `name_original` (string) — keeps original name, how it came from the servers. This is needed for the Jackpot value replacemenet
      - `hide_prize_popup` (boolean) — if true, prize popup on Prize Drop will not be shown
      - `aknowledge_message` (string)
      - `aknowledge_message_lose` (string) — Message shown instead of `aknowledge_message` when the spin is finalised as lost (`lose: true` acknowledge — games with a client-decided outcome, e.g. Voyager)
      - `sectors` (number[])
      - `acknowledge_type` (SAWAcknowledgeType)
      - `acknowledge_dp` (string)
      - `font_size` (number)
      - `font_size_mobile` (number)
      - `sound_type` (SAWWinSoundType)
      - `second_btn` (string)
      - `second_btn_action_title` (string)
      - `acknowledge_dp_additional` (string)
      - `acknowledge_action_title_additional` (string)
      - `icon` (string)
      - `replace_name_with_image` (boolean)
      - `acknowledge_action_title` (string)
      - `custom_win_sound` (string)
      - `out_of_stock_message` (string)
      - `custom_data` (any)
      - `prize_modifiers` (PrizeModifiers[]) — treasure hunt specific
      - `allow_split_decimal` (boolean) — treasure hunt specific
      - `hide_prize_from_history` (boolean)
      - `hide_prize_till_won` (boolean)
      - `requirements_to_get_prize` (string)
    - `prize_value` (number) — Numeric value for 'points' / 'spin' prize types (e.g. 100 for "100 points"); not relevant for other types
    - `prize_type_id` (SAWPrizeType) — The type of the prize — see `SAWPrizeType`
    - `place_from` (number) — Competition games (MatchX / Quiz / Bingo): first finishing place this prize applies to
    - `place_to` (number) — Competition games (MatchX / Quiz / Bingo): last finishing place this prize applies to; equals `place_from` for a single-place prize
    - `sawUniqueWinId` (string) — Client-side only — unique id of a win instance generated by the default Smartico UI to dedupe render effects; never sent by the server
    - `pool` (number) — Remaining stock. Present only when the template's `expose_game_stat_on_api` is enabled; always present for MatchX / Quiz / Bingo games
    - `pool_initial` (number) — Initial (configured) stock. Present regardless of `expose_game_stat_on_api`
    - `wins_count` (number) — Times the prize has been won, across all players. Present only when `expose_game_stat_on_api` is enabled
    - `weekdays` (number[]) — ISO weekday numbers (1 = Monday … 7 = Sunday) the prize can be won on; absent = any day. Present only when `expose_game_stat_on_api` is enabled
    - `active_from_ts` (number) — Prize availability window start (epoch ms), evaluated against `relative_period_timezone`. Present only when `expose_game_stat_on_api` is enabled
    - `active_till_ts` (number) — Prize availability window end (epoch ms), evaluated against `relative_period_timezone`. Present only when `expose_game_stat_on_api` is enabled
    - `relative_period_timezone` (number) — Timezone offset in minutes for `weekdays` / active-window evaluation (UTC minus local, as in JS `Date.getTimezoneOffset()`)
    - `is_surcharge` (boolean) — When true, the prize stays winnable at `pool` 0 (unlimited stock)
    - `is_deleted` (boolean) — Always `false` in API responses — deleted prizes are excluded server-side
    - `prize_details_json` ({[key: string]: any}) — Type-specific prize details — e.g. `gems` / `_gems_diamonds_type` for gems-and-diamonds prizes, `tickets_count` for raffle-ticket prizes
    - `max_give_period_type_id` (AttemptPeriodType) — Period basis for the prize availability restriction — see `AttemptPeriodType`
  - `is_visible` (boolean) — Operator visibility flag for the template
  - `activeFromDate` (number) — Time from which the template becomes available (epoch ms); absent when not restricted
  - `activeTillDate` (number) — Time until which the template stays available (epoch ms); absent when not restricted
  - `jackpot_add_on_attempt` (number) — Amount added to the jackpot on every play (abstract contribution — nothing is deducted from the player)
  - `jackpot_current` (number) — Current jackpot accumulator value
  - `jackpot_guaranteed` (number) — Seed value of the jackpot — the accumulator starts at (and resets to) this amount after a jackpot win
  - `maxActiveSpinsAllowed` (number) — Maximum number of unspent spin attempts a user can accumulate
  - `maxSpinsCount` (number) — Maximum number of attempts a user can make during `maxSpinsPediodMs`
  - `maxSpinsPediodMs` (number) — Length of the attempt-limit period in ms (note the field-name spelling)
  - `next_available_spin_ts` (number) — Epoch-ms time when the next attempt becomes available; populated only when the operator enabled the "show time to the next available spin" setting and max attempts per period is 1
  - `earliest_expiration_dt` (number | null) — Soonest-expiring spin's expiration time for this user (epoch ms); `null`/absent when no expirable spins.
  - `latest_expiration_dt` (number | null) — Latest-expiring spin's expiration time for this user (epoch ms); `null`/absent when no expirable spins.
  - `saw_skin_key` (string) — Key of the visual skin the operator selected for the game
  - `saw_skin_ui_definition` ({
		skin_folder: string;
		skin_css: string;
		use_new_popups?: boolean;
		lottie_animation_speed?: number;
	}) — Skin assets of the game: `skin_folder` is the base URL for the skin's images, `skin_css` custom CSS overrides, plus optional popup/animation tweaks
  - `expose_game_stat_on_api` (boolean) — Operator template setting. When enabled, the per-prize stock statistics (`pool`, `wins_count`, `weekdays`, `active_from_ts` / `active_till_ts`) are populated on `prizes`; when disabled (default) the server strips them from the response (`pool` is kept for MatchX / Quiz / Bingo games).
  - `requires_prize_claim` (boolean) — Prize Drop only: when true, the pushed prize requires an explicit claim by the user before it is credited
  - `requires_manual_claim` (boolean) — Prize Drop only: when true, the pushed prize requires a manual claim by the user before it is credited. The difference between this and `requires_prize_claim` is that requires_manual_claim gives the user the ability to cancel the claim.
  - `relative_period_timezone` (number) — Timezone offset in minutes used to evaluate the template's period-based rules (UTC minus local, as in JS `Date.getTimezoneOffset()`)
  - `show_prize_history` (boolean) — Operator setting: show a prize-history entry point (icon / button) on this game's view
- `saw_template_id` (number) — ID of the mini-game template
- `saw_prize_id` (number) — The saw_prize_id that user won, details of the prize can be found in the mini-game definition
- `prize_amount` (number) — Amount of prizes in stock
- `client_request_id` (string) — Request ID that client is sending to show history
- `is_claimed` (boolean) — Flag indicating to show whether prize in the mini-game claimed or not
- `create_date_ts` (number) — Win prize date in milliseconds
- `acknowledge_date_ts` (number) — Claimed prize date in milliseconds

## Behavioral contract
**Pagination**
`limit` defaults to 20, `offset` defaults to 0. Sort order is
`create_date` DESC (newest first) — no client-side re-sort
required. For "load more" pagination, advance `offset` by the
page size on each subsequent call.

The underlying protocol carries a `hasMore` boolean on the
response, but the SDK strips it from the public surface —
detect end of list when the returned array length is less than
`limit`.

**`is_claimed` semantics**
Maps directly to the server's "acknowledge_date is non-null"
state. A spin where the auto-acknowledge fire-and-forget
succeeded shows `is_claimed: true`; a spin where the
acknowledge was lost (network drop) or where the user is on an
explicit-acknowledge flow shows `is_claimed: false` with a
usable `client_request_id`. A server-side fallback job
auto-acknowledges stale rows every ~60 seconds — so even
"lost" prizes are eventually delivered without consumer action.

**Cache TTL**: the SDK caches the response for 30 seconds.
Cache is invalidated implicitly when a new spin or acknowledge
response lands.

**Idempotency / Side effects**: safe. Read-only.

**UI guidance**: see [UI Guide — `getMiniGamesHistory`](../../docs/ui/minigames/UIGuide_getMiniGamesHistory.md).

**Visitor mode**: not supported.

## Example
```ts
const history = await window._smartico.api.getMiniGamesHistory({ limit: 20 });

// Show unacknowledged spins with a Claim CTA.
const unacknowledged = history.filter(h => !h.is_claimed);
console.log('[smartico] surface a "Claim" CTA on these', unacknowledged.length, 'history rows:',
  unacknowledged.map(h => h.client_request_id));

// Load-more pagination — advance offset by the prior page size.
const page2 = await window._smartico.api.getMiniGamesHistory({ limit: 20, offset: 20 });
console.log('[smartico] page 2 loaded —', page2.length, 'more rows;',
  page2.length < 20 ? 'end of list reached, hide "Load more"' : 'keep "Load more" visible');
```

### Example response (REAL shape)
> Where this real payload differs from the typed Returns above (TS interface vs raw wire), the REAL shape is the runtime truth.
```json
[
  {
    "template": {
      "saw_template_id": 12658,
      "saw_game_type_id": 13,
      "saw_template_ui_definition": {
        "show_countdown_for_next_availability": false,
        "promo_text": "Guess the shell, grab your iPhone",
        "promo_image": "https://cdn.example/00000000-0000-0000-0000-000000000000/entity-image-1783600519171-1.png",
        "custom_game_url": "https://00000000-0000-0000-0000-000000000000.ld-int.dev/index.html",
        "name": "Pinyata",
        "description": "Remember that shell with the prize, follow it, and open the right cap to grab it",
        "flow_builder_only": false,
        "priority": 1
      },
      "saw_buyin_type_id": 1,
      "buyin_cost_points": 0,
      "visibile_when_can_spin": false,
      "spin_count": null,
      "prizesMap": "…(keyed duplicate of `prizes[]`)",
      "prizes": [
        {
          "saw_prize_id": 75905,
          "saw_template_id": 12658,
          "saw_prize_ui_definition": {
            "aknowledge_message_lose": "Lost",
            "sectors": [
              ""
            ],
            "name": "3 diamonds",
            "second_btn": "",
            "acknowledge_dp": "dp:ok",
            "sound_type": 2,
            "aknowledge_message": "You won 3 diamonds!!!",
            "acknowledge_action_title": "OK",
            "acknowledge_type": 3,
            "second_btn_action_title": ""
          },
          "prize_value": 1,
          "prize_type_id": 10,
          "pool": 98,
          "wins_count": 7,
          "pool_initial": 100,
          "prize_ref_id": 0,
          "is_surcharge": false,
          "prize_details_json": {
            "diamonds": 3,
            "amount_type": 0,
            "_gems_diamonds_type": 1
          },
          "affects_points_progress": true,
          "affects_leaderboard_progress": true,
          "affects_level_progress": true,
          "affects_current_balance_progress": true,
          "place_from": null,
          "place_to": null,
          "weekdays": null,
          "active_from": null,
          "active_till": null,
          "active_from_ts": null,
          "active_till_ts": null,
          "is_deleted": false,
          "relative_period_timezone": 0,
          "show_prize_history": true,
          "needed_tag_replacement": false,
          "win_segment_id": null,
          "win_conditions": "[]",
          "max_give_period_type_id": 2
        }
      ],
      "segment_id": 44162,
      "label_id": 16018,
      "maxActiveSpinsAllowed": null,
      "…": "(+29 more keys)"
    },
    "saw_template_id": 12658,
    "saw_prize_id": 75907,
    "prize_amount": 1,
    "client_request_id": "00000000-0000-0000-0000-000000000000",
    "is_claimed": true,
    "create_date_ts": 1785917360000,
    "acknowledge_date_ts": 1785917360000
  }
]
```

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `miniGameWinAcknowledgeRequest`
