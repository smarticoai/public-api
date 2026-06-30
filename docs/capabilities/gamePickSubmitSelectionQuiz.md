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
Wrapped in `GamesApiResponse`: `errCode` (number — `0` = success), `errMessage?` (string), `data?` — the payload:

`GamePickRound`:
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
- `events` (GamePickEvent[]) — List of events (matches/questions) in this round
  - `gp_event_id` (number) — Unique identifier of the event
  - `event_resolution_date` (string) — ISO 8601 date-time string when the event was resolved; null until resolved.
  - `match_date` (string) — ISO 8601 date-time string of the match/event start time.
  - `market_type_id` (SAWGPMarketType) — Market type defining the prediction format (e.g. two-team score, quiz question, custom)
  - `event_meta` (GamePickEventMeta) — Event metadata containing team names, images, sport type, and question details
    - `answers` ({
		/** Answer identifier value sent on submission */
		value: string;
		/** Localized display text of the answer */
		text: string;
		/** Per-language overrides for the answer text */
		_translations: {
			[key: string]: {
				text: string;
			};
		};
	}[]) — List of possible answer options for the quiz question
    - `question_image` (string) — URL of an image associated with the question
    - `result` (QuizAnswersValueType) — Correct answer value after resolution
    - `custom_question` (string) — Custom question text displayed to the user
    - `event_name` (string) — Display name of the event/match
    - `team1_name` (string) — Name of the first team (home)
    - `team1_image` (string) — URL of the first team's logo image
    - `team2_name` (string) — Name of the second team (away)
    - `team2_image` (string) — URL of the second team's logo image
    - `team1_result` (number) — Actual result score for team 1 after resolution
    - `team2_result` (number) — Actual result score for team 2 after resolution
    - `sport_type_id` (number) — Betradar sport type ID for the event
    - `is_canceled` (boolean) — Whether the event has been canceled
    - `auto_resolve_enabled` (boolean) — Whether auto-resolution from live data feed is enabled
    - `auto_resolve_date` (string) — ISO date string for when auto-resolution is expected
    - `team1_auto_result` (number) — Auto-resolved score for team 1 from live data feed
    - `team2_auto_result` (number) — Auto-resolved score for team 2 from live data feed
    - `auto_result` (string) — Auto-resolved answer value from live data feed (for quiz events)
    - `_translations` ({
		[key: string]: {
			team1_name: string;
			team2_name: string;
			event_name: string;
			custom_question: string;
		};
	}) — Per-language overrides for team names, event name, and custom question
  - `user_placed_bet` (boolean) — Whether the current user has submitted a prediction for this event
  - `team1_user_selection` (number | { from: number; to: number }) — User's predicted score for team 1 (MatchX only). Can be a number or a range object
  - `team2_user_selection` (number | { from: number; to: number }) — User's predicted score for team 2 (MatchX only). Can be a number or a range object
  - `user_selection` (QuizAnswersValueType) — User's selected answer (Quiz only). Value depends on market type (e.g. '1', '2', 'x', 'yes', 'no')
  - `resolution_type_id` (GamePickResolutionType) — How the user's prediction was scored after resolution
  - `resolution_score` (number) — Points awarded for this event based on prediction accuracy
  - `is_open_for_bets` (boolean) — Whether this event is still accepting predictions
  - `odds_details` ({ odd_value: { [key: string]: number } }) — Per-outcome numbers keyed by the outcome value (`'1'` / `'x'` / `'2'`, `'yes'` / `'no'`, …). Dual-purpose by event type: - Sports / MatchX: decimal **betting odds** (e.g. `{ "1": 2.45, "x": 3.26, "2": 3.01 }`). - Quiz: when the round's `show_users_preference` is `true`, these are aggregated **user-preference percentages** — what other users predicted, summing to ~100 (e.g. `{ "1": 33, "x": 25, "2": 42 }`). Render as the "what others predicted" bar.
  - `question_image` (string) — URL of a question-specific image (quiz events)
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
