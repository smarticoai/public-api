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
Wrapped in `GamesApiResponse`: `errCode` (number — `0` = success), `errMessage?` (string), `data?` — the payload:

`GamePickRoundBoard`:
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
- `my_user` (GamePickBoardUser) — Current user's leaderboard entry, or null if user hasn't participated
  - `ext_user_id` (string) — External user ID (Smartico numeric user ID)
  - `int_user_id` (number) — Internal user ID within the games system
  - `public_username` (string) — Display name shown on the leaderboard
  - `avatar_url` (string) — URL of the user's avatar image
  - `gp_position` (number) — User's rank position on the leaderboard, null if not yet ranked
  - `resolution_score` (number) — User's total score in this round/season
  - `full_wins_count` (number) — Number of fully correct predictions
  - `part_wins_count` (number) — Number of partially correct predictions
  - `lost_count` (number) — Number of incorrect predictions
- `users` (GamePickBoardUser[]) — Ranked list of users on the leaderboard
  - `ext_user_id` (string) — External user ID (Smartico numeric user ID)
  - `int_user_id` (number) — Internal user ID within the games system
  - `public_username` (string) — Display name shown on the leaderboard
  - `avatar_url` (string) — URL of the user's avatar image
  - `gp_position` (number) — User's rank position on the leaderboard, null if not yet ranked
  - `resolution_score` (number) — User's total score in this round/season
  - `full_wins_count` (number) — Number of fully correct predictions
  - `part_wins_count` (number) — Number of partially correct predictions
  - `lost_count` (number) — Number of incorrect predictions

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
    "events_resolved": "1",
    "show_users_preference": true,
    "order_events": 1,
    "board_users_count": 20,
    "hide_users_predictions": false,
    "round_name": "Group stage 15-28 June",
    "users": [
      {
        "ext_user_id": "222849599",
        "int_user_id": "228975556",
        "public_username": "Alex*****",
        "avatar_url": "https://cdn.example/d58c99035fadf00dcfe638-Dragongenderless.webp",
        "gp_position": null,
        "resolution_score": 0,
        "full_wins_count": 0,
        "part_wins_count": 0,
        "lost_count": 0
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
