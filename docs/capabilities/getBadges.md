# getBadges — API (TMissionOrBadge)

> Returns all the badges available to the current user.
> Import: `import { TMissionOrBadge } from '@smartico/public-api'`
> Search terms: getBadges, missions, getUserBadges, TMissionOrBadge, TMissionOrBadgeTask, AchRelatedGame, TRibbon, AchievementAvailabilityStatus, AchievementClaimPeriodTypeId, BadgesTimeLimitStates, id, name, description, image, is_completed, is_locked, is_requires_optin, is_opted_in

## Signature
```ts
_smartico.api.getBadges(): Promise<TMissionOrBadge[]>
```

## Parameters
_None._

## Returns — `Promise<TMissionOrBadge[]>`
Array of `TMissionOrBadge`. Each item:
- `id` (number) — ID of the mission or badge
- `type` ('mission' | 'badge') — Type of entity. Can be 'mission' or 'badge'
- `name` (string) — Name of the mission or badge, translated to the user language
- `sub_header` (string) — Sub-header of the mission, translated to the user language
- `description` (string) — Description of the mission or badge, translated to the user language
- `reward` (string) — Description of the mission reward if defined
- `image` (string) — URL of the image of the mission or badge, 256x256px
- `is_completed` (boolean) — Indicator if the mission is completed or badge is granted
- `is_locked` (boolean) — Indicator if the mission is locked. Means that it's visible to the user, but he cannot progress in it until it's unlocked. Mission may optionally contain the explanation of what should be done to unlock it in the unlock_mission_description property
- `unlock_mission_description` (string) — Optional explaination of what should be done to unlock the mission
- `is_requires_optin` (boolean) — Indicator if the mission requires opt-in. Means that user should explicitly opt-in to the mission in order to start progressing in it
- `is_opted_in` (boolean) — Indicator if the user opted-in to the mission
- `time_limit_ms` (number) — The amount of time in milliseconds that user has to complete the mission
- `active_from_ts` (number) — Holds time from which mission will become available, for the missions that are targeted to be available from specific date/time
- `active_till_ts` (number) — Holds time till mission will become unavailable, for the missions that are targeted to be available from specific date/time
- `dt_start` (number) — The date when the mission was started, relevant for the time limited missions, also indicating opt-it date for mission that requires opt-in and unlock date for Locked mission.
- `progress` (number) — The progress of the mission in percents calculated as the aggregated relative percentage of all tasks
- `cta_action` (string) — The action that should be performed when user clicks on the mission or badge Can be URL or deep link, e.g. 'dp:deposit'. The most safe to execute CTA is to pass it to _smartico.dp(cta_action); The 'dp' function will handle the CTA and will execute it in the most safe way
- `cta_text` (string) — The text of the CTA button, e.g. 'Make a deposit'
- `custom_section_id` (number) — The ID of the custom section where the mission or badge is assigned. Resolve to section metadata via `_smartico.api.getCustomSections()`.
- `only_in_custom_section` (boolean) — The indicator if the mission or badge is visible only in the custom section and should be hidden from the main overview of missions/badges
- `custom_data` (any) — The custom data of the mission or badge defined by operator. Can be a JSON object, string or number
- `tasks` (TMissionOrBadgeTask[]) — The list of tasks of the mission or badge
  - `id` (number) — ID of the task
  - `name` (string) — Name of the task, translated to the user language
  - `is_completed` (boolean) — Indicator if the task is completed
  - `progress` (number) — The progress of the task in percents
  - `points_reward` (number) — Reward for completing the task in points
  - `gems_reward` (number) — Reward for completing the task in gems
  - `diamonds_reward` (number) — Reward for completing the task in diamonds
  - `execution_count_expected` (number) — This is the total number of times the user needs to execute to complete task. e.g. he needs to bet 100 times. Here will be 100
  - `execution_count_actual` (number) — This is the number of times the user has executed 'activity' of the task. e.g. he bet 5 times out of 100. Here will be 5
- `related_games` (AchRelatedGame[]) — List of casino games (or other types of entities) related to the mission or badge
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
- `category_ids` (number[]) — The list of IDs of the categories where the badge item is assigned, information about categories can be retrieved with getAchCategories method
- `hint_text` (string) — The T&C text for the missions
- `position` (number) — Priority (or position) of the mission in the UI. Low value indicates higher position in the UI
- `ribbon` (TRibbon) — The ribbon of the mission/badge item. Can be 'sale', 'hot', 'new', 'vip' or URL to the image in case of custom ribbon, 250x300px
- `ach_completed_id` (number) — Stable identifier of this specific mission completion. Undefined for badges and for missions that have not yet completed.
- `requires_prize_claim` (boolean) — Flag from achievement if the mission prize will be given only after user claims it
- `prize_claimed_date_ts` (number) — The date/timestamp indicating when the prize was claimed by the user
- `complete_date` (string) — Date-time the mission/badge was completed, as a `"dd/MM/yyyy HH:mm:ss"` string (server local — NOT ISO-8601, so `new Date(complete_date)` will not parse it). Prefer the epoch-ms `complete_date_ts` for date math.
- `complete_date_ts` (number) — Time of mission/badge being completed, this property shows the epoch time in UTC
- `completed_today` (boolean) — Flag for mission/badge indicating that mission/badge completed today
- `completed_this_week` (boolean) — Flag for mission/badge indicating that mission/badge completed this week
- `completed_this_month` (boolean) — Flag for mission/badge indicating that mission/badge completed this month
- `custom_section_type_id` (number) — ID of specific Custom Section type
- `max_completion_count` (number) — Max number of times the user can complete a mission in case if mission type is Recurring upon completion. NULL equals infinite.
- `completion_count` (number) — Current completion count for Recurring upon completion missions
- `next_recurrence_date_ts` (number) — The date/timestamp for recurring missions, which indicating the time remaining until the next recurrence of the mission. Note that if a mission has an "Active till" date defined, this field is not relevant after that date.
- `availability_status` (AchievementAvailabilityStatus) — Availability status of the mission depends on the defined time limits
- `claim_button_title` (string) — Title for the claim reward button
- `claim_button_action` (string) — Action for the claim reward button
- `prize_claim_expiration_date` (number) — The date/timestamp indicating when the mission claim will expire
- `prize_claim_period_type_id` (AchievementClaimPeriodTypeId) — The type of the prize claim period (Relative or Exact time and date)
- `badgeTimeLimitState` (BadgesTimeLimitStates) — Badge time limit state for badges with time restrictions
- `hide_locked_mission` (boolean) — Flag from achievement if the mission should be hidden when it is locked, until it's unlocked

## Behavioral contract
**Why no `onUpdate` callback?**
Unlike `getMissions({ onUpdate })`, this method does NOT accept an
`onUpdate` subscription. Internally the SDK never refreshes the `Badges`
cache from server pushes: the achievement-related push events
(mission opt-in / claim / reload) refresh the missions cache, NOT
the badges cache. The badges cache is flushed only by:
- its 30-second TTL
- a full SDK cache wipe at login / logout

**How to refresh the badge list**
If you need near-live badge state, poll manually after the TTL expires.
The first call inside the 30 s window returns the cached payload; the
first call after the TTL triggers a fresh server round-trip. Example:
```ts
setInterval(async () => {
 const badges = await window._smartico.api.getBadges();
 console.log('[smartico] badge list polled — re-render badge grid from this array', badges);
}, 30_000);
```
Alternatively, re-fetch on a domain event your app already handles
(e.g. after the user finishes a game round or claims a bonus).

**Differences from missions** (same `TMissionOrBadge` shape, different
feature)
The opt-in, claim, recurring-cycle, and unlock-description fields on
the returned objects are not populated for badges; treat their values
as undefined / default. Time windows are absolute calendar timestamps
(`active_from_ts` / `active_till_ts`), not opt-in-relative durations —
drive availability chips from the SDK-computed `badgeTimeLimitState`
(enum `BadgesTimeLimitStates`), not `time_limit_ms`. Locking for
badges is purely time-based: `is_locked` is `true` only when
`badgeTimeLimitState === BadgesTimeLimitStates.BeforeStartDate` (the
time window hasn't started yet). The primary navigation field is
`category_ids` — call `getAchCategories` to resolve category
metadata and group badges by category.

**Idempotency / Side effects**: fetch-only; safe to call repeatedly.
The cache layer deduplicates concurrent calls within the TTL window.

**Visitor mode**: not supported. Badges are an authenticated-only
feature; calling this on the visitor-mode handle (`_smartico.vapi`)
throws synchronously rather than silently returning an empty list.

**UI guidance**: see [UI Guide — `getBadges`](../../docs/ui/missions/UIGuide_getBadges.md).

## Example
```ts
const [badges, categories] = await Promise.all([
  window._smartico.api.getBadges(),
  window._smartico.api.getAchCategories(),
]);

console.log('[smartico] badges fetched — render grouped grid with', badges.length, 'badges across', categories.length, 'categories');

for (const category of categories) {
  const inCategory = badges.filter(b => b.category_ids?.includes(category.id));
  const completed = inCategory.filter(b => b.is_completed).length;
  console.log(`[smartico] render category section "${category.name}" header showing ${completed}/${inCategory.length}`);

  for (const badge of inCategory) {
    // Use badgeTimeLimitState (not time_limit_ms) for availability chip
    if (badge.badgeTimeLimitState === 0) { // BadgesTimeLimitStates.BeforeStartDate
      console.log('[smartico] badge not yet started — render grayscaled card with "Starts on" chip for badge', badge.id);
    } else if (badge.is_completed) {
      console.log('[smartico] badge completed — render with completed styling and check-mark for badge', badge.id);
    } else {
      console.log('[smartico] badge in progress — render with stage counter (completed_tasks / total) for badge', badge.id);
    }
  }
}

// No onUpdate available — poll if live state matters
setInterval(async () => {
  try {
    const fresh = await window._smartico.api.getBadges();
    console.log('[smartico] badge poll tick — diff against previous list and re-render any changed badge cards', fresh);
  } catch (e) {
    console.error('[smartico] badge poll failed — keep showing last known state, retry on next tick:', e);
  }
}, 30_000);
```

### Example response (REAL shape)
```json
[
  {
    "id": 40733,
    "name": "Deep Blue Bet",
    "description": "Place a bet on Ocean Riches",
    "image": "https://cdn.example/843b3b60ad20cb6df257c5-puzzle_01.webp",
    "is_completed": true,
    "is_locked": false,
    "is_requires_optin": false,
    "is_opted_in": false,
    "time_limit_ms": null,
    "active_from_ts": null,
    "active_till_ts": null,
    "dt_start": null,
    "progress": 100,
    "type": "badge",
    "custom_section_id": 1128,
    "only_in_custom_section": true,
    "custom_data": {},
    "position": 1,
    "tasks": [
      {
        "id": 71250,
        "name": "Place a bet on Ocean Riches",
        "points_reward": 0,
        "gems_reward": null,
        "diamonds_reward": null,
        "is_completed": true,
        "progress": 100,
        "execution_count_expected": 1,
        "execution_count_actual": 1
      }
    ],
    "related_games": [],
    "category_ids": [],
    "ach_completed_id": 3410338746,
    "requires_prize_claim": false,
    "prize_claimed_date_ts": null,
    "complete_date": "08/06/2026 20:59:17",
    "complete_date_ts": 1780952357322,
    "completed_today": false,
    "completed_this_week": false,
    "completed_this_month": true,
    "custom_section_type_id": 14,
    "availability_status": 0,
    "hide_locked_mission": true,
    "prize_claim_expiration_date": null,
    "prize_claim_period_type_id": null
  }
]
```

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `getMissions`
- `BadgesTimeLimitStates`
- `getAchCategories`
