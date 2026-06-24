# gamePickGetActiveRounds — API (GamePickRound)

> Returns every open round for a MatchX or Quiz game template, with the full event list (matches / questions) and the current user's selections per event.
> Import: `import { GamePickRound } from '@smartico/public-api'`
> Search terms: gamePickGetActiveRounds, gamepick, GamePickRound, errCode, data

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
        "round_name": "Group stage 15-28 June",
        "_translations": {
          "BR": {},
          "TH": {}
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
          "gp_event_id": 147400,
          "market_type_id": 4,
          "event_meta": {
            "event_name": "World Cup",
            "team1_name": "Czech Republic",
            "team2_name": "Mexico",
            "is_canceled": false,
            "team1_image": "https://cdn.example/games/teams-images/1299262.png",
            "team2_image": "https://cdn.example/games/teams-images/4781.png",
            "sport_type_id": 1,
            "question_image": "https://cdn.example/5ff1fc35b419e43886d227-Artboard3.png",
            "scores_manually_adjusted": false
          },
          "event_resolution_date": null,
          "match_date": "2026-06-25T01:00:00.000Z",
          "odds_details": {
            "odd_value": {
              "1": 22,
              "2": 35,
              "x": 43
            }
          },
          "user_placed_bet": false,
          "resolution_score": 0,
          "is_open_for_bets": true,
          "resolution_type_id": 0
        },
        {
          "gp_event_id": 147401,
          "market_type_id": 6,
          "event_meta": {
            "event_name": "World Cup",
            "team1_name": "South Africa",
            "team2_name": "Republic of Korea",
            "is_canceled": false,
            "team1_image": "https://cdn.example/games/teams-images/4736.png",
            "team2_image": "https://cdn.example/games/teams-images/4735.png",
            "sport_type_id": 1,
            "question_image": "https://cdn.example/c7877cf61d820ebf372382-Artboard4.png",
            "scores_manually_adjusted": false
          },
          "event_resolution_date": null,
          "match_date": "2026-06-25T01:00:00.000Z",
          "odds_details": {
            "odd_value": {
              "1": 31,
              "2": 62,
              "x": 7
            }
          },
          "user_placed_bet": false,
          "resolution_score": 0,
          "is_open_for_bets": true,
          "resolution_type_id": 0
        }
      ],
      "has_open_for_bet_events": true,
      "has_not_submitted_changes": false
    },
    {
      "round_id": 40564,
      "round_row_id": 1,
      "public_meta": {
        "round_name": "Group stage 11-14 June",
        "_translations": {
          "BR": {}
        },
        "allow_edit_answers": true,
        "final_screen_cta_dp": "dp:ok",
        "hide_resolved_round": false
      },
      "score_type_id": 1,
      "open_date": 1779269280999,
      "last_bet_date": 1781481540000,
      "is_active_now": false,
      "is_resolved": true,
      "round_status_id": 4,
      "resolution_date": 1782200293679,
      "score_full_win": 0,
      "score_part_win": 0,
      "score_lost": 0,
      "events_total": "11",
      "events_resolved": "11",
      "show_users_preference": true,
      "order_events": 1,
      "board_users_count": 20,
      "hide_users_predictions": false,
      "round_name": "Group stage 11-14 June",
      "user_score": 0,
      "user_placed_bet": false,
      "events": [
        {
          "gp_event_id": 132891,
          "market_type_id": 4,
          "event_meta": {
            "result": "1",
            "event_name": "World Cup",
            "team1_name": "Mexico",
            "team2_name": "South Africa",
            "is_canceled": false,
            "team1_image": "https://cdn.example/games/teams-images/4781.png",
            "team2_image": null,
            "sport_type_id": 1,
            "question_image": "https://cdn.example/5ff1fc35b419e43886d227-Artboard3.png",
            "scores_manually_adjusted": false
          },
          "event_resolution_date": "2026-06-11T22:09:59.536Z",
          "match_date": "2026-06-11T19:00:00.000Z",
          "odds_details": {
            "odd_value": {
              "1": 48,
              "2": 11,
              "x": 42
            }
          },
          "user_placed_bet": false,
          "resolution_score": 0,
          "is_open_for_bets": false,
          "resolution_type_id": 0
        },
        {
          "gp_event_id": 132892,
          "market_type_id": 6,
          "event_meta": {
            "result": "2",
            "event_name": "World Cup",
            "team1_name": "Republic of Korea",
            "team2_name": "Czech Republic",
            "is_canceled": false,
            "team1_image": "https://cdn.example/games/teams-images/4735.png",
            "team2_image": null,
            "sport_type_id": 1,
            "question_image": "https://cdn.example/c7877cf61d820ebf372382-Artboard4.png",
            "scores_manually_adjusted": false
          },
          "event_resolution_date": "2026-06-12T04:50:43.260Z",
          "match_date": "2026-06-12T02:00:00.000Z",
          "odds_details": {
            "odd_value": {
              "1": 48,
              "2": 44,
              "x": 8
            }
          },
          "user_placed_bet": false,
          "resolution_score": 0,
          "is_open_for_bets": false,
          "resolution_type_id": 0
        }
      ],
      "has_open_for_bet_events": false,
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
