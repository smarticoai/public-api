# getMissions — API (TMissionOrBadge)

> Returns all missions visible to the current user, scoped server-side to what the user is qualified to see.
> Import: `import { TMissionOrBadge } from '@smartico/public-api'`
> Search terms: getMissions, missions, getUserMissions, achievements, TMissionOrBadge, TMissionOrBadgeTask, AchRelatedGame, TRibbon, AchievementAvailabilityStatus, AchievementClaimPeriodTypeId, BadgesTimeLimitStates, onUpdate, subscription, id, name, image, is_completed, is_locked, is_requires_optin, is_opted_in, time_limit_ms

## Signature
```ts
_smartico.api.getMissions({ onUpdate }: { onUpdate?: (data: TMissionOrBadge[]) => void } = {}): Promise<TMissionOrBadge[]>
```

## Parameters
- `params` — Optional. Omit to fetch without subscribing.
- `params.onUpdate` — Callback invoked with the full refreshed mission array on every server-pushed update (after opt-in / claim-reward calls, or when the server pushes an asynchronous mission-state change). Each call to `getMissions` overwrites the prior callback. Never fires in visitor mode.

## Returns — `Promise<TMissionOrBadge[]>`
Array of `TMissionOrBadge`. Each item:
- `id` (number) — ID of the mission or badge
- `type` ('mission' | 'badge') — Type of entity. Can be 'mission' or 'badge'
- `name` (string) — Name of the mission or badge, translated to the user language
- `sub_header` (string) — Sub-header of the mission, translated to the user language
- `description` (string) — Description of the mission or badge, translated to the user language
- `reward` (string) — Description of the mission reward if defined
- `image` (string) — URL of the image of the mission or badge, 256x256px
- `is_completed` (boolean) — Indicator if the mission is completed or badge is granted. Stays `false` for Recurring-upon-completion missions even after cycles complete — use `completion_count` to detect completed cycles (see `getMissions` bucketing).
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
- `max_completion_count` (number) — Max number of times the user can complete a mission in case if mission type is Recurring upon completion. NULL equals infinite (still recurring — not "no cap disables recurring").
- `completion_count` (number) — Current completion count for Recurring-upon-completion missions. Non-null ONLY for that mission type, so its presence identifies one; `> 0` means at least one cycle completed.
- `next_recurrence_date_ts` (number) — The date/timestamp for recurring missions, which indicating the time remaining until the next recurrence of the mission. Note that if a mission has an "Active till" date defined, this field is not relevant after that date.
- `availability_status` (AchievementAvailabilityStatus) — Timer/window state derived from the mission's time limits (which countdown to show / whether the window elapsed). NOT a tab-bucketing signal — it ignores `completion_count`, so bucket sections from the raw fields instead (see `getMissions`).
- `claim_button_title` (string) — Title for the claim reward button
- `claim_button_action` (string) — Action for the claim reward button
- `prize_claim_expiration_date` (number) — The date/timestamp indicating when the mission claim will expire
- `prize_claim_period_type_id` (AchievementClaimPeriodTypeId) — The type of the prize claim period (Relative or Exact time and date)
- `badgeTimeLimitState` (BadgesTimeLimitStates) — Badge time limit state for badges with time restrictions
- `hide_locked_mission` (boolean) — Flag from achievement if the mission should be hidden when it is locked, until it's unlocked

## Behavioral contract
**Subscription model (`onUpdate`)**
The callback receives the FULL refreshed mission array (never a
diff/patch). Each subsequent call to `getMissions({ onUpdate })`
REPLACES the prior callback — only one active subscriber at a time.
Pass `onUpdate: undefined` (or omit it) to keep the prior callback in
place; the callback is never auto-cleared.

**Update triggers** — the callback fires when:
1. **Mutation responses**: `requestMissionOptIn(...)` or
 `requestMissionClaimReward(...)` resolves (any `err_code`).
2. **Asynchronous server pushes**: a user activity (deposit, bet,
 login, etc.) advances task progress on a task configured to push
 updates, or completes a mission.
3. **Visibility changes**: the user's level changes, or other
 gamification visibility tags change.

Operator-side BO mission-config edits do NOT push to connected
clients — those changes surface only on the next cache miss (after
the 30 s TTL) or alongside the next trigger from (1)–(3).

**What's in the returned list / what's filtered server-side**
The response is pre-filtered by the server. Missions EXCLUDED before
reaching the SDK:
- Missions in `DRAFT` or `ARCHIVED` status (see `AchievementStatus`).
- Missions where the user fails visibility conditions. Exception:
 completed missions may remain visible after the user no longer
 qualifies (configurable per-brand).
- `FEATURED_MANUALLY` missions that are still locked — they appear
 only after the user unlocks them.
- Locked missions configured to hide while locked — UNLESS the
 mission is configured to expose immediately on unlock (then the
 locked mission is included as a teaser).
- `RECURRING` missions between cycles, until the next cycle starts.
- `RECURRING_QUANTITY` missions outside their `active_from_ts` /
 `active_till_ts` window.

Client-side filtering you may still want: missions with
`only_in_custom_section: true` are intended for their custom-section
view only and should be hidden from the main mission list.

**Status bucketing (which tab / section a mission belongs to)**
There is no pre-computed bucket field — assign each mission to exactly
ONE section reading the raw state fields directly (NOT `availability_status`;
see "Timers" below). Priority order, FIRST match wins:
1. **Missed / Expired** — not completed and the window has closed:
 `!is_completed && ((time_limit_ms && dt_start && dt_start + time_limit_ms < Date.now())`
 `|| (active_till_ts && active_till_ts < Date.now()))`. Do NOT gate this on
 opt-in — an opt-in mission whose window closed before the user ever
 opted in is still Missed. Sort by `position` ASC.
2. **Completed** — `is_completed === true`, OR (recurring-upon-completion
 missions) at least one cycle done / the cap reached — see the recurring
 caveats below. Sort by `complete_date_ts` DESC.
3. **Locked** — `is_locked === true`, OR not yet started
 (`active_from_ts > Date.now()`). Sort by `position` ASC.
4. **In-progress** — `is_opted_in === true`, OR (no opt-in required and
 `progress > 0`). Sort by `position` ASC.
5. **Available** — everything else (opt-in required but not yet joined, or
 an unrestricted mission not yet started). Sort by `position` ASC.

**Recurring-upon-completion caveats** (the common mis-bucketing trap):
- `is_completed` NEVER flips true for a recurring-upon-completion mission
 (only for one-shot missions) — detect a completed cycle from
 `completion_count > 0`, not `is_completed`.
- A non-null `completion_count` is what identifies a recurring-upon-completion
 mission. `max_completion_count === null` means an INFINITE cap (still
 recurring — never read null as "not recurring"), so only test
 `completion_count >= max_completion_count` when `max_completion_count` is set.

**Timers & timestamps** (display only — NOT bucketing)
`availability_status` (enum `AchievementAvailabilityStatus`) is the
timer/window signal: use it to pick WHICH countdown to show and whether the
window has elapsed — NOT to choose the section. It does not read
`completion_count`, and between cycles the server may keep reporting the
just-elapsed cycle's `Missed*` value even after `dt_start` / `active_till_ts`
are cleared for the next attempt, so bucketing by it sends recurring missions
to the wrong tab. For time-limited / opt-in missions `dt_start` is the opt-in
timestamp (or unlock timestamp for previously-locked missions), and a
time-limited mission expires at `dt_start + time_limit_ms`.
`next_recurrence_date_ts` is populated for `RECURRING` / `RECURRING_QUANTITY`
missions but is no longer meaningful once `active_till_ts` has passed.

**Refresh after a mutation**
After `requestMissionOptIn(...)` or `requestMissionClaimReward(...)`
resolves, the SDK auto-refreshes the mission cache; the `onUpdate`
callback fires with the new array shortly after. `is_opted_in`,
`progress`, and `is_completed` flip on the refreshed mission — do
NOT mutate them optimistically while the round-trip is pending.
Render any pending state from your own loading flag.

**UI guidance**: see [UI Guide — `getMissions`](../../docs/ui/missions/UIGuide_getMissions.md).

## Example
```ts
// 1. Initial fetch + subscribe to live updates
const missions = await window._smartico.api.getMissions({
  onUpdate: (refreshed) => {
    console.log('[smartico] mission list refreshed — re-render the entire mission list UI from this array, do not merge with prior state:', refreshed);

    // 2. onUpdate fires for: opt-in/claim responses, task-progress
    //    pushes that complete a mission or move a "pushToClient" task,
    //    and user-level changes. Treat each call as authoritative.
    const claimable = refreshed.filter(m =>
      m.is_completed && m.requires_prize_claim && !m.prize_claimed_date_ts,
    );
    if (claimable.length > 0) {
      console.log('[smartico] there are unclaimed mission prizes — surface a "Claim" CTA on each of these missions:', claimable.map(m => m.id));
    }
  },
});

// 3. Filter/render from the returned list. The server already excludes
//    DRAFT/ARCHIVED missions and ones the user can't see. You may need
//    client-side filters for view-specific concerns (custom sections,
//    completed/missed tabs).
const generalView = missions
  .filter(m => !m.only_in_custom_section)
  .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

console.log('[smartico] initial mission list ready — render', generalView.length, 'missions sorted by position');

// 4. Visitor-mode equivalent: onUpdate is accepted but never fires.
//    Re-poll if you need fresh data.
// const visitorMissions = await window._smartico.vapi('EN').getMissions();
// console.log('[smartico] visitor missions are the brand proxy user\'s — per-user fields are not meaningful');
```

### Example response (REAL shape)
> Where this real payload differs from the typed Returns above (TS interface vs raw wire), the REAL shape is the runtime truth.
```json
[
  {
    "id": 4015,
    "name": "Looking good!",
    "image": "https://cdn.example/be339e036eea69ecef4246-Mission4.png",
    "is_completed": true,
    "is_locked": false,
    "is_requires_optin": false,
    "is_opted_in": true,
    "time_limit_ms": null,
    "active_from_ts": null,
    "active_till_ts": null,
    "dt_start": 1780586690767,
    "reward": "10 pt",
    "progress": 100,
    "type": "mission",
    "cta_action": "dp:gf_change_avatar",
    "cta_text": "Pick an avatar",
    "only_in_custom_section": false,
    "custom_data": {},
    "position": 1,
    "tasks": [
      {
        "id": 9107,
        "name": "Change your avatar",
        "points_reward": 10,
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
    "ach_completed_id": 3407657653,
    "requires_prize_claim": false,
    "prize_claimed_date_ts": null,
    "complete_date": "08/06/2026 14:52:48",
    "complete_date_ts": 1780930368099,
    "completed_today": false,
    "completed_this_week": false,
    "completed_this_month": true,
    "availability_status": 2,
    "hide_locked_mission": true,
    "prize_claim_expiration_date": null,
    "prize_claim_period_type_id": null
  }
]
```

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `AchievementStatus`
- `AchievementAvailabilityStatus`
