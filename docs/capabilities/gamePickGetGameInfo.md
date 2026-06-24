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
- `errCode` (number)
- `data` (object)

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
```json
{
  "errCode": 0,
  "data": {
    "sawTemplate": {
      "saw_template_id": 11487,
      "saw_game_type_id": 6,
      "saw_template_ui_definition": {
        "…": "(nested)"
      },
      "saw_buyin_type_id": 1,
      "buyin_cost_points": 0,
      "visibile_when_can_spin": false,
      "spin_count": 0,
      "prizesMap": {
        "…": "(nested)"
      },
      "prizes": [
        "…"
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
        "…": "(nested)"
      }
    ],
    "labelInfo": {
      "settings": {
        "…": "(nested)"
      },
      "products": [
        "…"
      ],
      "theme_style_desktop": null,
      "theme_style_mobile": null,
      "label_id": 16018,
      "errCode": 0,
      "errMsg": null,
      "cid": 4,
      "ts": 1782287007134,
      "uuid": "00000000-0000-0000-0000-000000000000",
      "payload": {
        "…": "(nested)"
      },
      "duration": null
    }
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
