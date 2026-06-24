# gamePickGetBoard — API (GamePickRoundBoard)

> Returns the leaderboard for a MatchX or Quiz game round — ranked list of players plus the current user's entry (`my_user`).
> Import: `import { GamePickRoundBoard } from '@smartico/public-api'`
> Search terms: gamePickGetBoard, gamepick, GamePickRoundBoard, GPRoundStatus, GamePickScoreType, GameRoundOrderType, GamePickRoundPublicMeta, GamePickBoardUser, errCode, data

## Signature
```ts
_smartico.api.gamePickGetBoard(props: GamePickRoundRequestParams): Promise<GamesApiResponse<GamePickRoundBoard>>
```

## Parameters
- `props.saw_template_id` — ID of the MatchX or Quiz game template.
- `props.round_id` — Round ID, or `-1` for the season leaderboard.

## Returns — `Promise<GamesApiResponse<GamePickRoundBoard>>`
- `errCode` (number)
- `data` (object)

## Behavioral contract
**Preconditions**
- User must be authenticated. Visitor mode not supported.

**`round_id` semantics**
- Positive `round_id` — per-round leaderboard scoped to that round's events.
- `-1` — season / overall leaderboard aggregating scores across every round
  of the template.

**`my_user`**
The current user's entry is returned separately from the `users[]` array
— `my_user` may be `null` if the user has never made a prediction on this
round / template. Use it to render the user's rank in a sticky footer or
"you are here" highlight regardless of pagination.

**Username masking**
`public_username` on other players may be masked / anonymized by operator
label settings. Always pair with `avatar_url` so the user can recognize
themselves in the ranking by avatar even when usernames are hidden.



**Refresh**
- No cache.
- No push subscription. Poll while the leaderboard is visible
  (every 30–60 s) if you want live rank updates after match
  resolution.

**Visitor mode**: not supported.

**UI guidance**: see [UI Guide — `gamePickGetBoard`](../../docs/ui/gamepick/UIGuide_gamePickGetBoard.md).

## Example
```ts
const r = await window._smartico.api.gamePickGetBoard({
    saw_template_id: 1083,
    round_id:        -1, // season leaderboard
});

if (r.errCode === 0 && r.data) {
    console.log('[smartico] render leaderboard rows for top', r.data.users.length, 'players');
    if (r.data.my_user) {
        console.log('[smartico] pin "you are rank #' + r.data.my_user.gp_position + '" footer to bottom');
    } else {
        console.log('[smartico] user not ranked — render "Play a round to join the leaderboard" CTA');
    }
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
    "users": [
      {
        "…": "(nested)"
      }
    ],
    "my_user": null
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
- `GamesApiResponse`
- `GamePickRoundBoard`
