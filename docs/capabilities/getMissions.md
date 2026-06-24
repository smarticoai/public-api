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
- `name` (string) — Name of the mission or badge, translated to the user language
- `image` (string) — URL of the image of the mission or badge, 256x256px
- `is_completed` (boolean) — Indicator if the mission is completed or badge is granted
- `is_locked` (boolean) — Indicator if the mission is locked. Means that it's visible to the user, but he cannot progress in it until it's unlocked. Mission may optionally contain the explanation of what should be done to unlock it in the unlock_mission_description property
- `is_requires_optin` (boolean) — Indicator if the mission requires opt-in. Means that user should explicitly opt-in to the mission in order to start progressing in it
- `is_opted_in` (boolean) — Indicator if the user opted-in to the mission
- `time_limit_ms` (null) — The amount of time in milliseconds that user has to complete the mission
- `active_from_ts` (null) — Holds time from which mission will become available, for the missions that are targeted to be available from specific date/time
- `active_till_ts` (null) — Holds time till mission will become unavailable, for the missions that are targeted to be available from specific date/time
- `dt_start` (number) — The date when the mission was started, relevant for the time limited missions, also indicating opt-it date for mission that requires opt-in and unlock date for Locked mission.
- `reward` (string) — Description of the mission reward if defined
- `progress` (number) — The progress of the mission in percents calculated as the aggregated relative percentage of all tasks
- `type` (string) — Type of entity. Can be 'mission' or 'badge'
- `cta_action` (string) — The action that should be performed when user clicks on the mission or badge Can be URL or deep link, e.g. 'dp:deposit'. The most safe to execute CTA is to pass it to _smartico.dp(cta_action); The 'dp' function will handle the CTA and will execute it in the most safe way
- `cta_text` (string) — The text of the CTA button, e.g. 'Make a deposit'
- `only_in_custom_section` (boolean) — The indicator if the mission or badge is visible only in the custom section and should be hidden from the main overview of missions/badges
- `custom_data` (object) — The custom data of the mission or badge defined by operator. Can be a JSON object, string or number
- `position` (number) — Priority (or position) of the mission in the UI. Low value indicates higher position in the UI
- `tasks` (object[]) — The list of tasks of the mission or badge
  - `id` (number) — ID of the task
  - `name` (string) — Name of the task, translated to the user language
  - `points_reward` (number) — Reward for completing the task in points
  - `gems_reward` (null) — Reward for completing the task in gems
  - `diamonds_reward` (null) — Reward for completing the task in diamonds
  - `is_completed` (boolean) — Indicator if the task is completed
  - `progress` (number) — The progress of the task in percents
  - `execution_count_expected` (number) — This is the total number of times the user needs to execute to complete task. e.g. he needs to bet 100 times. Here will be 100
  - `execution_count_actual` (number) — This is the number of times the user has executed 'activity' of the task. e.g. he bet 5 times out of 100. Here will be 5
- `related_games` (array) — List of casino games (or other types of entities) related to the mission or badge
- `category_ids` (array) — The list of IDs of the categories where the badge item is assigned, information about categories can be retrieved with getAchCategories method
- `ach_completed_id` (number) — Stable identifier of this specific mission completion. Undefined for badges and for missions that have not yet completed.
- `requires_prize_claim` (boolean) — Flag from achievement if the mission prize will be given only after user claims it
- `prize_claimed_date_ts` (null) — The date/timestamp indicating when the prize was claimed by the user
- `complete_date` (string) — Date-time the mission/badge was completed, as a `"dd/MM/yyyy HH:mm:ss"` string (server local — NOT ISO-8601, so `new Date(complete_date)` will not parse it). Prefer the epoch-ms `complete_date_ts` for date math.
- `complete_date_ts` (number) — Time of mission/badge being completed, this property shows the epoch time in UTC
- `completed_today` (boolean) — Flag for mission/badge indicating that mission/badge completed today
- `completed_this_week` (boolean) — Flag for mission/badge indicating that mission/badge completed this week
- `completed_this_month` (boolean) — Flag for mission/badge indicating that mission/badge completed this month
- `availability_status` (number) — Availability status of the mission depends on the defined time limits
- `hide_locked_mission` (boolean) — Flag from achievement if the mission should be hidden when it is locked, until it's unlocked
- `prize_claim_expiration_date` (null) — The date/timestamp indicating when the mission claim will expire
- `prize_claim_period_type_id` (null) — The type of the prize claim period (Relative or Exact time and date)

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

**Reading state from the returned mission**
Drive availability chips ("missed", "coming soon", "needs opt-in",
"in progress", "expired") from `availability_status` (enum
`AchievementAvailabilityStatus`) — it's the canonical derived
state and reflects all server-side timing/visibility rules in one
field. For time-limited and recurring missions, `dt_start` doubles
as the opt-in timestamp (for opt-in missions) or unlock timestamp
(for previously-locked missions); the expiration of a time-limited
mission is `dt_start + time_limit_ms`. `next_recurrence_date_ts`
is populated for `RECURRING` / `RECURRING_QUANTITY` missions but
is no longer meaningful once the mission's `active_till_ts` has
passed.

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
