# gamePickGetGameInfo — API (GamePickGameInfo)

> Returns the game template configuration plus a metadata listing of every round (without events).
> Import: `import { GamePickGameInfo } from '@smartico/public-api'`
> Search terms: gamePickGetGameInfo, gamepick, GamePickGameInfo, SAWTemplate, SAWGameType, SAWTemplateUI, SAWBuyInType, SAWPrize, GamePickRoundBase, GPRoundStatus, GamePickScoreType, GameRoundOrderType, GamePickRoundPublicMeta, errCode, data

## Signature
```ts
_smartico.api.gamePickGetGameInfo(props: GamePickRequestParams): Promise<GamesApiResponse<GamePickGameInfo>>
```

## Parameters
- `props.saw_template_id` — ID of the MatchX or Quiz game template.

## Returns — `Promise<GamesApiResponse<GamePickGameInfo>>`
Wrapped in `GamesApiResponse`: `errCode` (number — `0` = success), `errMessage?` (string), `data?` — the payload:

`GamePickGameInfo`:
- `sawTemplate` (SAWTemplate) — Game template configuration (SAW template) with UI settings, buy-in type, cost, and spin count
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
- `allRounds` (GamePickRoundBase[]) — List of all rounds (metadata only, no events)
  - `round_id` (number) — Unique round identifier
  - `round_row_id` (number) — Sequential row ID used for ordering rounds
  - `round_name` (string) — Localized display name of the round
  - `round_description` (string) — Localized description of the round
  - `final_screen_cta_button_title` (string) — Label for the CTA button on the final/results screen
  - `final_screen_message` (string) — Message displayed on the final/results screen
  - `final_screen_image_desktop` (string) — URL of the final screen image (desktop)
  - `final_screen_image_mobile` (string) — URL of the final screen image (mobile)
  - `promo_image` (string) — URL of the promotional image for the round
  - `promo_text` (string) — Promotional text displayed with the round
  - `open_date` (number) — Timestamp (ms) when the round opens for participation
  - `last_bet_date` (number) — Timestamp (ms) of the last moment bets are accepted
  - `resolution_date` (number) — Timestamp (ms) when the round is expected to be resolved
  - `score_full_win` (number) — Points awarded for a fully correct prediction
  - `score_part_win` (number) — Points awarded for a partially correct prediction
  - `score_lost` (number) — Points awarded (or deducted) for an incorrect prediction
  - `is_active_now` (boolean) — Whether the round is currently active for participation
  - `is_resolved` (boolean) — Whether the round has been fully resolved and scored
  - `round_status_id` (GPRoundStatus) — Current lifecycle status of the round
  - `events_total` (number) — Total number of events in the round
  - `events_resolved` (number) — Number of events that have been resolved
  - `score_type_id` (GamePickScoreType) — Scoring method used for this round
  - `order_events` (GameRoundOrderType) — How events are ordered for display
  - `board_users_count` (number) — Maximum number of users shown on the leaderboard
  - `hide_users_predictions` (boolean) — Whether other users' predictions are hidden until resolution
  - `public_meta` (GamePickRoundPublicMeta) — Public metadata including translations and display settings from the BackOffice
    - `round_name` (string) — Localized round name
    - `round_description` (string) — Localized round description
    - `promo_image` (string) — URL of the promotional image for the round
    - `promo_text` (string) — Promotional text displayed with the round
    - `hide_resolved_round` (boolean) — Whether to hide the round from the UI after it has been resolved
    - `final_screen_image_desktop` (string) — URL of the final screen image for desktop
    - `final_screen_image_mobile` (string) — URL of the final screen image for mobile
    - `final_screen_message` (string) — Message displayed on the final/results screen
    - `final_screen_cta_button_title` (string) — Label for the CTA button on the final screen
    - `final_screen_cta_dp` (string) — Deep link triggered by the CTA button on the final screen
    - `allow_edit_answers` (boolean) — Whether users can edit their answers after initial submission (within betting window)
    - `_translations` ({
		[key: string]: {
			round_name: string;
			round_description: string;
			promo_image: string;
			promo_text: string;
			final_screen_image_desktop: string;
			final_screen_image_mobile: string;
			final_screen_message: string;
			final_screen_cta_button_title: string;
		};
	}) — Per-language overrides for round display content
  - `next_round_open_date` (number) — Timestamp (ms) when the next round opens, if available
  - `show_users_preference` (boolean) — Whether to show aggregated user preference percentages for each outcome
- `labelInfo` (any) — Label/brand configuration and settings

## Behavioral contract
**Preconditions**
- User must be authenticated. Visitor mode not supported.

**Buy-in semantics**
The `sawTemplate.saw_buyin_type_id` value determines which currency is
deducted on the user's first prediction in any round:
- Free — no deduction.
- Points — `buyin_cost_points` deducted from the user's points balance.
- Gems — deducted from the user's gems balance.
- Diamonds — deducted from the user's diamonds balance.
- Spins — one spin counted from `spin_count`.



**Refresh**
- No cache.
- No push subscription. Re-call after a successful
 `gamePickSubmitSelection` to refresh `spin_count`.

**Visitor mode**: not supported.

**UI guidance**: see [UI Guide — `gamePickGetGameInfo`](../../docs/ui/gamepick/UIGuide_gamePickGetGameInfo.md).

## Example
```ts
const r = await window._smartico.api.gamePickGetGameInfo({ saw_template_id: 1189 });

if (r.errCode === 0 && r.data) {
    console.log('[smartico] render Game Pick lobby — title:', r.data.sawTemplate.saw_template_ui_definition.name);
    console.log('[smartico] rounds available:', r.data.allRounds.length, '— buy-in type:', r.data.sawTemplate.saw_buyin_type_id, 'cost:', r.data.sawTemplate.buyin_cost_points);
}
```

### Example response (REAL shape)
> Where this real payload differs from the typed Returns above (TS interface vs raw wire), the REAL shape is the runtime truth.
```json
{
  "errCode": 0,
  "data": {
    "sawTemplate": {
      "saw_template_id": 11487,
      "saw_game_type_id": 6,
      "saw_template_ui_definition": {
        "show_prize_board": true,
        "matchx_is_completed": false,
        "description": "<style>\n    .custom-rules {\n        font-family: inherit;\n        background-color: #27244F !important;\n        margin: 0;\n        padding: 4px;  \n        co…",
        "priority": 1,
        "ask_for_username": "no-ask",
        "show_countdown_for_next_availability": false,
        "promo_image": "https://cdn.example/b1cddefabccba88a16fad7-Artboard4.png",
        "matchx_hide_ranking": false,
        "matchx_remove_ties_in_leaders": false,
        "name": "FIFA World Cup",
        "matchx_seasonal_ranking": true,
        "flow_builder_only": false,
        "custom_section_id": null
      },
      "saw_buyin_type_id": 1,
      "buyin_cost_points": 0,
      "visibile_when_can_spin": false,
      "spin_count": 0,
      "prizesMap": "…(keyed duplicate of `prizes[]`)",
      "prizes": [
        {
          "saw_prize_id": 65863,
          "saw_template_id": 11487,
          "saw_prize_ui_definition": {
            "name": "25 Free Spins on Book of Cleopatra"
          },
          "prize_value": 1,
          "prize_type_id": 3,
          "pool": 1000000,
          "wins_count": null,
          "pool_initial": null,
          "prize_ref_id": 0,
          "is_surcharge": false,
          "prize_details_json": {
            "ui_amount": "",
            "bonus_coupon_code": "",
            "label_bonus_template_id": 2156
          },
          "affects_points_progress": true,
          "affects_leaderboard_progress": true,
          "affects_level_progress": true,
          "affects_current_balance_progress": true,
          "place_from": 2,
          "place_to": 2,
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
          "win_conditions": null,
          "max_give_period_type_id": 2
        }
      ],
      "segment_id": 6557,
      "label_id": 16018,
      "maxActiveSpinsAllowed": null,
      "maxSpinsCount": 0,
      "maxSpinsPeriodMs": 0,
      "sawStatusId": 2,
      "needsTagReplacement": false,
      "containsConditionalPrize": false,
      "jackpot_guaranteed": null,
      "jackpot_add_on_attempt": null,
      "jackpot_current": null,
      "saw_skin_key": null,
      "saw_skin_ui_definition": null,
      "maxSpinPeriodTypeId": 1,
      "expireSpinsMs": 0,
      "next_available_spin_ts": null,
      "saw_expire_spin_type": null,
      "saw_expire_spin_config": null,
      "isVisitorMode": false,
      "activeFromDate": -9223372036854776000,
      "activeTillDate": 9223372036854776000,
      "requires_prize_claim": false,
      "expose_game_stat_on_api": false,
      "relative_period_timezone": 0,
      "templateName": "FIFA World Cup",
      "show_prize_history": true,
      "visibility_conditions": "[]",
      "active_start_time": null,
      "active_end_time": null
    },
    "allRounds": [
      {
        "round_name": "",
        "round_id": -1,
        "hide_users_predictions": true
      }
    ],
    "labelInfo": "…(label config — typed `any`, omitted)"
  }
}
```

## Errors
**Error codes** (in `errCode`)
- `0` — success.
- `100002` — template not found.
- `100000` — auth hash invalid.
- `100004` — generic server error.

## Related
- `gamePickGetActiveRound`
- `gamePickGetActiveRounds`
- `gamePickGetBoard`
- `gamePickSubmitSelection`
- `GamesApiResponse`
- `GamePickGameInfo`
