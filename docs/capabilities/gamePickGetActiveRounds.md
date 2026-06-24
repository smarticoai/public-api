# gamePickGetActiveRounds — API (GamePickRound)

> Returns every open round for a MatchX or Quiz game template, with the full event list (matches / questions) and the current user's selections per event.
> Import: `import { GamePickRound } from '@smartico/public-api'`
> Search terms: gamePickGetActiveRounds, gamepick, GamePickRound, GPRoundStatus, GamePickScoreType, GameRoundOrderType, GamePickRoundPublicMeta, GamePickEvent, SAWGPMarketType, GamePickEventMeta, QuizAnswersValueType, GamePickResolutionType, errCode, data

## Signature
```ts
_smartico.api.gamePickGetActiveRounds(props: GamePickRequestParams): Promise<GamesApiResponse<GamePickRound[]>>
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
- User must be authenticated.
- `saw_template_id` must reference a MatchX or Quiz game template. The SDK
 throws synchronously if it's missing.

**Transport**
Game Pick methods are HTTP REST calls to a separate Game Pick games server
(not the main WebSocket). One consequence: there is no SDK cache and no push
subscription — every call is a fresh server roundtrip.

**Round status**
Each round's `round_status_id` is a `GPRoundStatus` value. Rounds with
status `NoEventsDefined` (1) are filtered out server-side and never appear
here. Other values: `Other` (-1, normally open), `NoMoreBetsAllowed` (2),
`AllEventsResolved_ButNotRound` (3), `RoundResolved` (4 — appears here only
briefly during transition; use `gamePickGetHistory` for resolved rounds).



**Refresh**
- No cache; every call is live.
- No push subscription. Poll while the user is on the screen if you need
 live round-status changes (typically every 30–60 s is enough).

**Visitor mode**: not supported. The SDK throws synchronously on visitor
sessions.

**UI guidance**: see [UI Guide — `gamePickGetActiveRounds`](../../docs/ui/gamepick/UIGuide_gamePickGetActiveRounds.md).

## Example
```ts
const r = await window._smartico.api.gamePickGetActiveRounds({ saw_template_id: 1083 });

if (r.errCode !== 0) {
    console.error('[smartico] active rounds fetch failed — show empty rounds lobby:', r.errMessage);
    return;
}

for (const round of r.data ?? []) {
    console.log('[smartico] render a round card:', round.round_name, '— events:', round.events.length, 'user has placed bet:', round.user_placed_bet);
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
- `100002` — template not found (the `saw_template_id` doesn't reference a
 MatchX/Quiz game).
- `100003` — no open rounds available for this template right now.
- `100000` — auth hash invalid; SDK session needs re-initialization.
- `100004` — generic server error.

## Related
- `gamePickGetActiveRound`
- `GPRoundStatus`
- `gamePickGetHistory`
- `GamesApiResponse`
- `GamePickRound`
