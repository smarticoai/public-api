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
  - `saw_template_id` (number)
  - `saw_game_type_id` (SAWGameType)
  - `saw_template_ui_definition` (SAWTemplateUI)
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
  - `saw_buyin_type_id` (SAWBuyInType)
  - `buyin_cost_points` (number)
  - `visibile_when_can_spin` (boolean)
  - `spin_count` (number)
  - `prizes` (SAWPrize[])
    - `saw_prize_id` (number)
    - `saw_prize_ui_definition` (SAWPrizeUI)
      - `position` (number)
      - `name` (string)
      - `name_original` (string)
      - `hide_prize_popup` (boolean)
      - `aknowledge_message` (string)
      - `sectors` (number[])
      - `acknowledge_type` (SAWAcknowledgeType)
      - `acknowledge_dp` (string)
      - `font_size` (number)
      - `font_size_mobile` (number)
      - `sound_type` (SAWWinSoundType)
      - `icon` (string)
      - `replace_name_with_image` (boolean)
      - `acknowledge_action_title` (string)
      - `custom_win_sound` (string)
    - `prize_value` (number)
    - `prize_type_id` (SAWPrizeType)
    - `place_from` (number)
    - `place_to` (number)
    - `sawUniqueWinId` (string)
  - `is_visible` (boolean)
  - `jackpot_add_on_attempt` (number)
  - `jackpot_current` (number)
  - `jackpot_guaranteed` (number)
  - `maxActiveSpinsAllowed` (number)
  - `maxSpinsCount` (number)
  - `maxSpinsPediodMs` (number)
  - `next_available_spin_ts` (number)
  - `saw_skin_key` (string)
  - `saw_skin_ui_definition` ({
		skin_folder: string;
		skin_css: string;
	})
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
