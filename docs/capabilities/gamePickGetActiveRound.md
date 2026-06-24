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
  - `odds_details` ({ odd_value: { [key: string]: number } }) — Betting odds details for the event outcomes
  - `question_image` (string) — URL of a question-specific image (quiz events)
- `user_score` (number) — Current user's total score in this round
- `user_placed_bet` (boolean) — Whether the current user has submitted any predictions in this round
- `has_open_for_bet_events` (boolean) — Whether there are events still open for betting
- `has_not_submitted_changes` (boolean) — Whether the user has unsaved changes to their predictions

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
