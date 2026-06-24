# gamePickGetHistory — API (GamePickRound)

> Returns the full round history (active + resolved) for a MatchX or Quiz game template, newest-first.
> Import: `import { GamePickRound } from '@smartico/public-api'`
> Search terms: gamePickGetHistory, gamepick, GamePickRound, GPRoundStatus, GamePickScoreType, GameRoundOrderType, GamePickRoundPublicMeta, GamePickEvent, SAWGPMarketType, GamePickEventMeta, QuizAnswersValueType, GamePickResolutionType, errCode, data

## Signature
```ts
_smartico.api.gamePickGetHistory(props: GamePickRequestParams): Promise<GamesApiResponse<GamePickRound[]>>
```

## Parameters
- `props.saw_template_id` — ID of the MatchX or Quiz game template.

## Returns — `Promise<GamesApiResponse<GamePickRound[]>>`
- `errCode` (number)
- `data` (object[])
  - `round_id` (number)
  - `round_row_id` (number)
  - `public_meta` (object)
  - `score_type_id` (number)
  - `open_date` (number)
  - `last_bet_date` (number)
  - `is_active_now` (boolean)
  - `is_resolved` (boolean)
  - `round_status_id` (number)
  - `score_full_win` (number)
  - `score_part_win` (number)
  - `score_lost` (number)
  - `events_total` (string)
  - `events_resolved` (string)
  - `show_users_preference` (boolean)
  - `order_events` (number)
  - `board_users_count` (number)
  - `hide_users_predictions` (boolean)
  - `round_name` (string)
  - `user_score` (number)
  - `user_placed_bet` (boolean)
  - `events` (object[])
  - `has_open_for_bet_events` (boolean)
  - `has_not_submitted_changes` (boolean)

## Behavioral contract
**Preconditions**
- User must be authenticated. Visitor mode not supported.

**Sort order**
Server returns rounds newest-first. No client-side sort needed.

**Per-event resolution**
Each event in the rounds carries `resolution_type_id` — values are from
`GamePickResolutionType`: `None` (0, not yet resolved), `Lost` (2),
`PartialWin` (3), `FullWin` (4). Use these to render result badges on
each event row.



**Refresh**
- No cache.
- No push subscription. Re-call when the user opens the history tab.

**Visitor mode**: not supported.

**UI guidance**: see [UI Guide — `gamePickGetHistory`](../../docs/ui/gamepick/UIGuide_gamePickGetHistory.md).

## Example
```ts
const r = await window._smartico.api.gamePickGetHistory({ saw_template_id: 1083 });

for (const round of r.data ?? []) {
    console.log('[smartico] history row —', round.round_name, 'score:', round.user_score, 'resolved:', round.is_resolved);
}
```

### Example response (REAL shape)
```json
{
  "errCode": 0,
  "data": [
    {
      "round_id": 42115,
      "round_row_id": 2,
      "public_meta": {
        "…": "(nested)"
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
        "…"
      ],
      "has_open_for_bet_events": true,
      "has_not_submitted_changes": false
    }
  ]
}
```

## Errors
**Error codes** (in `errCode`)
- `0` — success.
- `100002` — template not found.
- `100000` — auth hash invalid.
- `100004` — generic server error.

## Related
- `gamePickGetActiveRounds`
- `GamePickResolutionType`
- `GamesApiResponse`
- `GamePickRound`
