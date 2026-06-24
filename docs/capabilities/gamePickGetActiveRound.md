# gamePickGetActiveRound — API (GamePickRound)

> Returns a single round (events, user selections, scoring rules) for a MatchX or Quiz game.
> Import: `import { GamePickRound } from '@smartico/public-api'`
> Search terms: gamePickGetActiveRound, gamepick, GamePickRound, GPRoundStatus, GamePickScoreType, GameRoundOrderType, GamePickRoundPublicMeta, GamePickEvent, SAWGPMarketType, GamePickEventMeta, QuizAnswersValueType, GamePickResolutionType, errCode, data

## Signature
```ts
_smartico.api.gamePickGetActiveRound(props: GamePickRoundRequestParams): Promise<GamesApiResponse<GamePickRound>>
```

## Parameters
- `props.saw_template_id` — ID of the MatchX or Quiz game template.
- `props.round_id` — ID of the round to fetch.

## Returns — `Promise<GamesApiResponse<GamePickRound>>`
- `errCode` (number)
- `data` (object)

## Behavioral contract
**Preconditions**
- User must be authenticated. Visitor mode not supported.
- `saw_template_id` and `round_id` are mandatory — the SDK throws if either
 is missing.



**Refresh**
- No cache; every call is live.
- Re-call after `gamePickSubmitSelection` or
 `gamePickSubmitSelectionQuiz` to surface the persisted predictions.
- Poll while the user is on the prediction screen if event resolution
 updates are needed (typically every 30–60 s).

**Visitor mode**: not supported.

**UI guidance**: see [UI Guide — `gamePickGetActiveRound`](../../docs/ui/gamepick/UIGuide_gamePickGetActiveRound.md).

## Example
```ts
const r = await window._smartico.api.gamePickGetActiveRound({
    saw_template_id: 1083,
    round_id:        31652,
});

if (r.errCode === 0 && r.data) {
    console.log('[smartico] render round detail page —', r.data.round_name, '— user has placed bet:', r.data.user_placed_bet, 'score so far:', r.data.user_score);
} else {
    console.error('[smartico] round fetch failed — bounce back to the lobby and refresh:', r.errMessage);
}
```

### Example response (REAL shape)
```json
{
  "errCode": 0,
  "data": {
    "round_id": 42115,
    "round_row_id": 2,
    "public_meta": {
      "round_name": "Group stage 15-28 June",
      "_translations": {
        "…": "(nested)"
      },
      "allow_edit_answers": true,
      "final_screen_cta_dp": "dp:ok",
      "hide_resolved_round": false
    },
    "score_type_id": 1,
    "open_date": 1782200297406,
    "last_bet_date": 1782691140000,
    "is_active_now": true,
    "is_resolved": false,
    "round_status_id": -1,
    "score_full_win": 0,
    "score_part_win": 0,
    "score_lost": 0,
    "events_total": "28",
    "events_resolved": "0",
    "show_users_preference": true,
    "order_events": 1,
    "board_users_count": 20,
    "hide_users_predictions": false,
    "round_name": "Group stage 15-28 June",
    "user_score": 0,
    "user_placed_bet": false,
    "events": [
      {
        "…": "(nested)"
      }
    ],
    "has_open_for_bet_events": true,
    "has_not_submitted_changes": false
  }
}
```

## Errors
**Error codes** (in `errCode`)
- `0` — success.
- `4` — round / event not found (e.g. round resolved after the last
 `gamePickGetActiveRounds` poll); non-fatal — retry after a fresh active-
 rounds fetch.
- `100002` — template not found.
- `100000` — auth hash invalid.
- `100004` — generic server error.

## Related
- `gamePickGetActiveRounds`
- `gamePickSubmitSelection`
- `gamePickSubmitSelectionQuiz`
- `GamesApiResponse`
- `GamePickRound`
