# gamePickSubmitSelectionQuiz — API (GamePickRound)

> Submits all quiz answers for a round in one shot.
> Import: `import { GamePickRound } from '@smartico/public-api'`
> Search terms: gamePickSubmitSelectionQuiz, gamepick, GamePickRound, GPRoundStatus, GamePickScoreType, GameRoundOrderType, GamePickRoundPublicMeta, GamePickEvent, SAWGPMarketType, GamePickEventMeta, QuizAnswersValueType, GamePickResolutionType

## Signature
```ts
_smartico.api.gamePickSubmitSelectionQuiz(props: GamePickRequestParams & { round: Partial<GamePickRound> }): Promise<GamesApiResponse<GamePickRound>>
```

## Parameters
- `props.saw_template_id` — ID of the Quiz game template.
- `props.round` — Round object with `round_id` + `events[]` carrying the user's answer selections.

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
- `saw_template_id` and `props.round.round_id` are mandatory — SDK throws if
 either is missing.
- Each event must include `gp_event_id` and `user_selection`. Missing
 events default to "no change".



**Idempotency**: identical to `gamePickSubmitSelection` — re-submit
returns `errCode: 3` and never double-charges the buy-in.

**Side effects**: identical to `gamePickSubmitSelection` — buy-in
deduction on first submit, participation recorded, score awarded on round
resolution.

**Visitor mode**: not supported.

**UI guidance**: see [UI Guide — `gamePickSubmitSelectionQuiz`](../../docs/ui/gamepick/UIGuide_gamePickSubmitSelectionQuiz.md).

## Example
```ts
const ar = await window._smartico.api.gamePickGetActiveRound({
    saw_template_id: 1183,
    round_id:        37974,
});
if (ar.errCode !== 0 || !ar.data) {
    console.error('[smartico] could not fetch round to submit answers — show error');
    return;
}

const round = ar.data;
round.events = round.events.map(e => ({
    gp_event_id:    e.gp_event_id,
    user_selection: 'x',
}));

const r = await window._smartico.api.gamePickSubmitSelectionQuiz({
    saw_template_id: 1183,
    round,
});

if (r.errCode === 0) {
    console.log('[smartico] quiz answers saved — show confirmation');
} else if (r.errCode === 3) {
    console.log('[smartico] nothing changed — silent no-op');
} else {
    console.error('[smartico] quiz submit failed:', r.errMessage);
}
```

## Errors
**Error codes** (in `errCode`)
- `0` — success.
- `3` (`NoBetsUpdatedOnSubmit`) — no changes, OR every event past
 `last_bet_date`. Buy-in NOT consumed; current round returned in `data`.
- `4` — round / event not found.
- `100002` — template not found.
- `100000` — auth hash invalid.
- `100004` — generic server error.

Buy-in failures use the same `SAWSpinErrorCode` pass-through values
as `gamePickSubmitSelection` — see that method's TSDoc for the
`40001` / `40003` / `40004` / `40007` / `40009` / `40011` / `40012`
semantics.

## Related
- `gamePickSubmitSelection`
- `SAWSpinErrorCode`
- `GamesApiResponse`
