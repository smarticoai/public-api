# gamePickGetRoundInfoForUser — API (GamePickRound)

> Returns a round with another player's predictions instead of the current user's.
> Import: `import { GamePickRound } from '@smartico/public-api'`
> Search terms: gamePickGetRoundInfoForUser, gamepick, GamePickRound, GPRoundStatus, GamePickScoreType, GameRoundOrderType, GamePickRoundPublicMeta, GamePickEvent, SAWGPMarketType, GamePickEventMeta, QuizAnswersValueType, GamePickResolutionType

## Signature
```ts
_smartico.api.gamePickGetRoundInfoForUser(props: GamePickRoundRequestParams & { int_user_id: number }): Promise<GamesApiResponse<GamePickRound>>
```

## Parameters
- `props.saw_template_id` — ID of the MatchX or Quiz game template.
- `props.round_id` — ID of the round to inspect.
- `props.int_user_id` — Internal user ID from `gamePickGetBoard.users[].int_user_id`.

## Returns — `Promise<GamesApiResponse<GamePickRound>>`
`GamePickRound` (shape from the type — capture a response into `_responses/` for a real example):
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
- `next_round_open_date` (number) — Timestamp (ms) when the next round opens, if available
- `show_users_preference` (boolean) — Whether to show aggregated user preference percentages for each outcome
- `events` (GamePickEvent[]) — List of events (matches/questions) in this round
- `user_score` (number) — Current user's total score in this round
- `user_placed_bet` (boolean) — Whether the current user has submitted any predictions in this round
- `has_open_for_bet_events` (boolean) — Whether there are events still open for betting
- `has_not_submitted_changes` (boolean) — Whether the user has unsaved changes to their predictions

## Behavioral contract
**Preconditions**
- User must be authenticated. Visitor mode not supported.
- `saw_template_id`, `round_id`, and `int_user_id` are all mandatory — SDK
 throws synchronously if any is missing.
- `int_user_id` must come from a leaderboard fetch in the same game
 template; it is stable within a template but not portable across
 templates.

**Shape vs `gamePickGetActiveRound`**
Same `GamePickRound` structure, but `user_selection` /
`team1_user_selection` / `team2_user_selection` reflect the TARGET user's
predictions instead of the caller's. Each event still carries its own
`resolution_type_id` (see `GamePickResolutionType`) so the UI can
render result badges per pick.



**Refresh**
- No cache. Re-call when opening a different leaderboard row's
 "view picks" modal.
- No push subscription.

**Visitor mode**: not supported.

**UI guidance**: see [UI Guide — `gamePickGetRoundInfoForUser`](../../docs/ui/gamepick/UIGuide_gamePickGetRoundInfoForUser.md).

## Example
```ts
const board = await window._smartico.api.gamePickGetBoard({
    saw_template_id: 1083, round_id: 31652,
});
const topPlayer = board.data?.users?.[0];
if (!topPlayer) return;

const r = await window._smartico.api.gamePickGetRoundInfoForUser({
    saw_template_id: 1083,
    round_id:        31652,
    int_user_id:     topPlayer.int_user_id,
});

if (r.errCode === 0 && r.data) {
    for (const ev of r.data.events) {
        console.log('[smartico] render row —', ev.event_meta.team1_name, 'vs', ev.event_meta.team2_name, '— picked:', ev.user_selection, '— resolution:', ev.resolution_type_id);
    }
}
```

## Errors
**Error codes** (in `errCode`)
- `0` — success.
- `4` — round / event / user not found.
- `100002` — template not found.
- `100000` — auth hash invalid.
- `100004` — generic server error.

## Related
- `gamePickGetBoard`
- `GamePickRound`
- `GamePickResolutionType`
- `GamesApiResponse`
