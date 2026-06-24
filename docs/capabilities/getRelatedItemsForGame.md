# getRelatedItemsForGame — API (GetRelatedAchTourResponse)

> Returns the missions and tournaments associated with a casino / sportsbook game in the operator's games catalog — the reverse of "given this mission, which games count for it" — so you can surface "play this game to progress mission X" / "tournament Y features this game" badges on game tiles or detail screens.
> Import: `import { GetRelatedAchTourResponse } from '@smartico/public-api'`
> Search terms: getRelatedItemsForGame, general, GetRelatedAchTourResponse, UserAchievement, AchievementType, AchievementPublicMeta, UserAchievementTask, AchievementStatus, ScheduledMissionType, AchRelatedGame, BadgesTimeLimitStates, Tournament, TournamentType, TournamentPublicMeta, TournamentRegistrationType

## Signature
```ts
_smartico.api.getRelatedItemsForGame(related_game_id: string): Promise<GetRelatedAchTourResponse>
```

## Parameters
- `related_game_id` — External Games Catalog ID of the game (e.g. `"gold-slot2"`).

## Returns — `Promise<GetRelatedAchTourResponse>`
`GetRelatedAchTourResponse`:
- `cid` (number)
- `ts` (number)
- `uuid` (string)
- `errCode` (number)
- `errMsg` (string)
- `achievements` (UserAchievement[])
  - `ach_id` (number)
  - `ach_type_id` (AchievementType)
  - `ach_public_meta` (AchievementPublicMeta)
    - `description` (string)
    - `unlock_mission_description` (string)
    - `custom_data` (string)
    - `cta_text` (string)
    - `cta_action` (string)
    - `label_tag` (string)
    - `custom_label_tag` (string)
    - `reward` (string)
    - `image_url` (string)
    - `name` (string)
    - `position` (number)
    - `hide_tasks` (boolean)
    - `hide_locked_mission` (boolean)
    - `custom_section_id` (number)
    - `only_in_custom_section` (boolean)
    - `hint_text` (string)
    - `hide_badge_from_ui` (boolean)
    - `show_badge_first_task_completed` (boolean)
  - `isCompleted` (boolean)
  - `isLocked` (boolean)
  - `requiresOptin` (boolean)
  - `isOptedIn` (boolean)
  - `start_date` (string) — time when mission unlocked or opted-in. Needed to calculated "remaining time" in case time_limit_ms is set
  - `start_date_ts` (number)
  - `time_limit_ms` (number)
  - `progress` (number)
  - `complete_date` (string)
  - `complete_date_ts` (number)
  - `unlock_date` (string)
  - `milliseconds_till_available` (number)
  - `completed_tasks` (number)
  - `achievementTasks` (UserAchievementTask[])
    - `task_id` (number)
    - `task_public_meta` (AchievementTaskPublicMeta)
      - `name` (string)
    - `points_reward` (number)
    - `task_type_id` (AchievementTaskType)
    - `isCompleted` (boolean)
    - `userExecutedCount` (number)
    - `userProgress` (number)
    - `lastExecutionDate` (string)
    - `unlocked_by_mission_id` (number)
    - `unlocked_by_level_id` (number)
  - `next_recurrence_date_ts` (number)
  - `ach_status_id` (AchievementStatus)
  - `scheduledMissionType` (ScheduledMissionType)
  - `related_games` (AchRelatedGame[])
    - `ext_game_id` (string) — The ID of the related game
    - `game_public_meta` ({
		/** The name of the game */
		name: string;
		/** The URL to the game */
		link: string;
		/** The URL to the image of the game, 1:1 aspect ratio */
		image: string;
		/** The indicator if the game is enabled */
		enabled: boolean;
		/** The list of categories of the game */
		game_categories: string[];
		/** The name of the game provider */
		game_provider: string;
		/** The URL to the mobile game */
		mobile_spec_link: string;
		/** The priority of the game */
		priority?: number;
	}) — Game public meta information
  - `active_from_ts` (number) — indicates when 'scheduled' mission is active from,
  - `active_till_ts` (number) — indicates when 'scheduled' mission is active till,
  - `ach_categories` (number[])
  - `recurring_quantity` (number) — max completion count for Recurring upon completion
  - `completed_count` (number) — completion count for Recurring upon completion
  - `ach_completed_id` (number) — ID of the completion fact from ach_completed or ach_completed_recurring tables
  - `requires_prize_claim` (boolean) — flag from achievement if the mission prize will be given only after user claims it
  - `prize_claimed_date_ts` (number) — the date/timestamp indicating when the prize was claimed by the user
  - `completed_today` (boolean)
  - `completed_this_week` (boolean)
  - `completed_this_month` (boolean)
  - `custom_section_type_id` (number)
  - `badgeTimeLimitState` (BadgesTimeLimitStates)
- `tournaments` (Tournament[])
  - `tournamentId` (number) — ID of tournament template
  - `tournamentInstanceId` (number) — ID of tournament instance. Generated every time when tournament based on specific template is scheduled for run
  - `tournamentType` (TournamentType) — Type of the tournament. For now only SCHEDULED is support
  - `publicMeta` (TournamentPublicMeta) — Meta information about tournament that should be used to build UI
    - `name` (string) — Name of tournament
    - `image_url` (string) — 1st image
    - `image_url2` (string) — 2nd image
    - `image_url2_mobile` (string) — 2nd image for mobile
    - `description` (string) — Description, html capable
    - `prize_pool_short` (string) — Short explanation of prize pool
    - `segment_dont_match_message` (string) — Message to show when user is not matching to the segment allowed to register (error code 30005 in registration response)
    - `custom_price_text` (string) — Short explanation of registration price
    - `show_other_users_score` (boolean) — Indicator if the scores of other users should be shown in the leaderboard of tournament
    - `custom_section_id` (number)
    - `only_in_custom_section` (boolean)
    - `label_tag` (string)
    - `custom_label_tag` (string)
    - `featured` (boolean)
    - `position` (number)
    - `custom_data` (string)
  - `buyInAmount` (number) — Cost of registration in the tournament in gamification points
  - `prizePool` (number) — Not in use
  - `startTime` (string) — The time when tournament is going to start
  - `endTime` (string) — The time when tournament is going to finish
  - `startTimeTs` (number) — The time when tournament is going to start, epoch
  - `endTimeTs` (number) — The time when tournament is going to finish, epoch
  - `registrationCount` (number) — Number of users registered in the tournament
  - `totalCount` (number) — Not in use
  - `registrationType` (TournamentRegistrationType) — Type of registration in the tournament
  - `tournamentRegistrationStatus` (TournamentRegistrationStatus) — Status of registration in the tournament for current user
  - `tournamentInstanceStatus` (TournamentInstanceStatus) — Status of tournament instance
  - `isUserRegistered` (boolean) — flag indicating if current user is registered in the tournament
  - `allowLateRegistration` (boolean) — Indicator if tournament allows later registration, when tournament is already started
  - `playersMinCount` (number) — Minimum number of participant for this tournament. If tournament doesnt have enough registrations, it will not start
  - `playersMaxCount` (number) — Maximum number of participant for this tournament. When reached, new users won't be able to register
  - `durationMs` (number) — Tournament duration in millisecnnds
  - `prizeStructure` ({
		prizes: TournamentPrize[];
	}) — prizes structure
    - `name` (string)
    - `description` (string)
    - `image_url` (string)
    - `place_from` (number)
    - `place_to` (number)
    - `type` (ActivityTypeLimited)
    - `points` (number)
    - `gems` (number)
    - `diamonds` (number)
  - `tournamentPlayer` (TournamentPlayer) — Information about current user
    - `userAltName` (string)
    - `cleanExtUserId` (string)
    - `crmBrandId` (number)
    - `position` (number)
    - `scores` (number)
    - `isMe` (boolean)
    - `userId` (number)
    - `avatar_id` (string)
    - `avatar_url` (string)
  - `related_games` (AchRelatedGame[]) — List of casino games (or other types of entities) related to the tournament
    - `ext_game_id` (string) — The ID of the related game
    - `game_public_meta` ({
		/** The name of the game */
		name: string;
		/** The URL to the game */
		link: string;
		/** The URL to the image of the game, 1:1 aspect ratio */
		image: string;
		/** The indicator if the game is enabled */
		enabled: boolean;
		/** The list of categories of the game */
		game_categories: string[];
		/** The name of the game provider */
		game_provider: string;
		/** The URL to the mobile game */
		mobile_spec_link: string;
		/** The priority of the game */
		priority?: number;
	}) — Game public meta information
  - `minScoreToWin` (number) — The minimum amount of score points that the user should get in order to be qualified for the prize
  - `hideLeaderboardsMinScores` (boolean) — When enabled, users who don't meet the minimum qualifying score will be hidden from the Leaderboard.
  - `totalScores` (number) — Total scores across all participants in the tournament
  - `isClanBased` (boolean) — Indicates if the tournament is clan-based

## Behavioral contract
**Preconditions**
- `related_game_id` must be a Games Catalog ID (the same external string the
 operator uses in the catalog at
 `https` ://help.smartico.ai/welcome/technical-guides/games-catalog-api).

**Server-side eligibility filtering**
Missions and tournaments are filtered by the user's segments / level / brand
before being returned. A user who is ineligible for a mission segment will
NOT see that mission in the result even if it lists the game. The same
filtering applies to tournaments. Treat the response as "what this user
should see" — no client-side eligibility pass needed.

**No cache**
Every call is a live server round-trip. Missions/tournaments are operator-
mutated state (opt-in, completion, expiry) that changes during a session;
caching staler than the user's last action would mis-render eligibility.
Avoid building a consumer-side cache for UI-critical paths.

**Refresh**
- Re-call when the user navigates to a new game tile / detail surface.
- Re-call after the user opts into / completes a related mission to refresh
 the "play this game" badge.

**Visitor mode**: supported via `_smartico.vapi(lang).getRelatedItemsForGame(...)`.

**UI guidance**: see [UI Guide — `getRelatedItemsForGame`](../../docs/ui/general/UIGuide_getRelatedItemsForGame.md).

## Example
```ts
const r = await window._smartico.api.getRelatedItemsForGame('gold-slot2');

const missions = r.achievements ?? [];
const tournaments = r.tournaments ?? [];

if (missions.length === 0 && tournaments.length === 0) {
    console.log('[smartico] no related missions / tournaments — hide the related badge on the game tile');
} else {
    console.log('[smartico] related entities:', missions.length, 'missions /', tournaments.length, 'tournaments — show a "X missions / Y tournaments" badge');
}
```

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `https`
- `GetRelatedAchTourResponse`
