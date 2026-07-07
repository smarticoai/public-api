# UI Guide — `getMissions`

## Overview
- Register `onUpdate` on first render and treat each invocation as
  "discard prior list, re-render from this array". Do not merge with
  the previous list — fields like `progress` are absolute, not deltas.
- Loading indicator: the first `getMissions()` is a server round-trip
  (typically 100–500 ms); subsequent calls within the cache window
  resolve effectively synchronously.
- Don't poll `getMissions()` to detect opt-in / claim completion. The
  `onUpdate` callback is the authoritative signal.
- The SDK returns a flat array; there is no pre-computed status bucket
  field. Consumers apply the bucketing filter chain below themselves.

## Status bucketing
Partition the array using this **priority order — first match wins** —
reading the raw state fields directly (NOT `availability_status`; see the
note below):

  1. **Missed / Expired** — not completed and the window has closed:
     `(!is_completed) && ((time_limit_ms && dt_start && (dt_start + time_limit_ms) < Date.now())`
     `|| (active_till_ts && active_till_ts < Date.now()))`.
     Do NOT gate this on opt-in — an opt-in mission whose window closed
     before the user ever opted in still belongs in Missed. Sort: `position` ASC.
  2. **Completed** — `is_completed === true`, OR (recurring-upon-completion
     missions) at least one cycle done / the cap reached:
     `completion_count > 0`, or `max_completion_count != null && completion_count >= max_completion_count`.
     `is_completed` NEVER flips for recurring-upon-completion missions, so use
     `completion_count`; a non-null `completion_count` is what identifies the
     type, and `max_completion_count === null` means an INFINITE cap (still
     recurring), so only compare against it when it is set.
     Sort: `complete_date_ts` DESC (most recent first).
  3. **Locked** — `is_locked === true`, OR not yet available
     (`active_from_ts > Date.now()`). Sort: `position` ASC.
  4. **In progress** — `is_opted_in === true`, OR (no opt-in required and
     `progress > 0`). Sort: `position` ASC.
  5. **Available** — everything else: opt-in required but not yet joined, or
     an unrestricted mission not yet started. Sort: `position` ASC.

Each mission belongs to exactly ONE bucket. Many UIs render these as
status tabs / sections; an "Overview" tab curating featured + in-progress +
a sample locked is a common pattern.

**Do not bucket by `availability_status`.** That field
([AchievementAvailabilityStatus](../../api/enumerations/AchievementAvailabilityStatus.md))
is the **timer / window** signal only — which countdown to show, whether the
window elapsed. It does NOT read `completion_count`, so for
recurring-upon-completion missions it reports a stale `Missed*` value from the
just-elapsed cycle even after `dt_start` / `active_till_ts` are cleared for the
next attempt — using it to bucket sends recurring missions to the wrong tab.
Distinguishing "locked" from "opt-in required" likewise needs `is_locked` /
`is_opted_in` read directly.

## Mission card / tile (list view)

Fields to render on the card:
- `image` — documented source size 256×256 px. Render at a 1:1 aspect
  ratio; CSS `background-image` is conventional. There is no built-in
  placeholder for missing images — provide a neutral fallback.
- `name` — the title. Translated server-side. Safe to render as HTML
  if the consumer sanitizes first.
- Status chip — derived from the bucket the mission falls into;
  includes a live countdown for time-limited entries (see "time
  formatting" below).
- Description (fallback chain): `description` → `unlock_mission_description`
  (when `is_locked`) → `tasks[0].name` (when no description and tasks
  exist).
- Progress bar — render only when `progress > 0` (the 0–100 integer),
  with one exception: a mission that requires opt-in and isn't opted in
  yet (`is_requires_optin && !is_opted_in`) shows the bar at 0%, so the
  card/modal signals it has a progress track waiting behind opt-in.
  Hide for completed recurring missions (`AchievementStatus.RecurringUponCompletion`
  on the Completed tab) to avoid showing residual percentage from a
  prior cycle.
- Reward summary (`reward` HTML) — show only when `progress === 0`.
  For in-progress missions, the progress percentage replaces the reward.
- Ribbon overlay (`ribbon` field) — presets `'sale'`, `'hot'`, `'new'`,
  `'vip'` use built-in styling; a URL means a custom **250×300 px** image.
  Position: top-left corner overlay.
- "Claim" button — replaces the progress bar when
  `is_completed && requires_prize_claim && !prize_claimed_date_ts`.
- "Featured" marker — alternative to ribbon for operator-marked
  featured missions.

Fields NOT shown on the card (detail popup only):
- Full `description` HTML beyond a single line
- `sub_header`
- `tasks[]` (except as description fallback)
- `hint_text` (T&C)
- `related_games`
- Opt-in / CTA action buttons (the status chip alone communicates
  "opt-in required" on cards; the actual button lives in the popup)

Click target: the **whole card** opens the detail popup. The Claim
button (when present) is the only sub-element with its own handler;
it must `event.stopPropagation()` so the popup doesn't also open.

## Mission detail popup

Top-to-bottom structure (omit sections whose source field is empty):
  1. Close button.
  2. Ribbon overlay (same as card).
  3. Title (`name`).
  4. Sub-header (`sub_header`).
  5. Status chip — typically without countdown (use the dedicated
     time-remaining block below).
  6. Image (`image`) — render larger than the card variant.
  7. Lock icon overlay on the image when `is_locked === true`.
  8. Time-remaining block — "Available again in" countdown for
     recurring waiting; "Starts on" for `active_from_ts > now`;
     "Expired on" for missed; countdown for in-window.
  9. Full `description` (HTML).
  10. Action button — see the decision matrix below.
  11. Hint / T&C — `hint_text` surfaced as an info-icon tooltip
      (tap to expand). Not inline.
  12. Task list — only when `tasks.length > 1` (single-task missions
      use the task name as description fallback on the card; the
      list is redundant). Each task row: completion indicator
      (checkbox/circle) + `task.name`. Append "N / M" using
      `execution_count_actual / execution_count_expected` when the
      operator has enabled count display. A single task can grant MORE
      THAN ONE reward type — render one reward badge per non-zero amount
      among `points_reward`, `gems_reward` and `diamonds_reward` (stack
      them when a task grants several), each with that reward type's icon.
      Don't assume points-only.
  13. Progress bar (conditional, same rule as card).
  14. Reward block (`reward`).
  15. Related games — only games where `game_public_meta.enabled === true`.
      Render as a horizontal carousel; show navigation arrows when
      5+ games on desktop, 4+ on mobile. Thumbnails are 1:1 aspect
      ratio; tap a thumbnail to launch the underlying game.
  16. Unlock description (`unlock_mission_description`) at the
      bottom when `is_locked`.

## Action button decision matrix

Apply in priority order; **first match wins**:

  1. `is_locked === true` → **no action button**. Show the unlock
     description and a lock-icon overlay on the image.
  2. `is_completed && requires_prize_claim && !prize_claimed_date_ts`
     AND `prize_claim_expiration_date >= Date.now()` (claimable) →
     **"Claim" button**. Use `claim_button_title` as the label if set,
     otherwise a localized default. On click: call
     `requestMissionClaimReward(id, ach_completed_id)`. Optionally
     animate a celebration overlay after success.
  3. Same as (2) but claim window expired (`prize_claim_expiration_date < Date.now()`) →
     render the Claim label as **disabled**; show the formatted expiration
     date with a "claim expired on" prefix.
  4. `is_completed` (no claim required, or already claimed) →
     **no action button**. Show progress / completion state.
  5. `is_requires_optin && !is_opted_in` (and not locked) →
     **"Opt In" button**. Disable when:
       - `active_from_ts > Date.now()` (not yet started),
       - the mission falls in the Missed bucket,
       - `active_till_ts && active_till_ts < Date.now()` (expired).
     While the opt-in request is in flight, show a loading indicator
     on the button. The SDK does NOT enforce a single in-flight call —
     guard against double-clicks at the UI layer (set a local
     `optInLoading` flag on click).
  6. `cta_text && cta_action` (and none of the above) → **CTA button**
     labeled with `cta_text`. On click: call
     `_smartico.dp(cta_action)`. `cta_action` is a deep-link string
     (e.g. `'dp:deposit'`, `'dp:gf_store'`) — not a URL.
     Disable when the mission falls in the Missed bucket or is
     otherwise out of window.
  7. None of the above → no action button.

Recurring missions:
- Waiting for next cycle (`next_recurrence_date_ts > Date.now()`) →
  **no button**; the status chip carries the "Available again in
  DD:HH:MM:SS" countdown.
- Cap reached (`max_completion_count === completion_count`) → treated
  as Completed; no button.

## `claim_button_action` companion action

*(important caveat)*

If `claim_button_action` is set, the consumer's claim handler is
expected to fire BOTH the claim API call AND the deep-link action
**at the same time** (concurrently). The deep-link runs synchronously
on click — it does NOT wait for the claim RPC to succeed. Consequences:
- If the deep-link navigates away (e.g. opens a casino game), the
  user may miss the claim loading animation or any error toast.
- If the claim RPC fails after the navigation has already started,
  there is no rollback.
- Treat `claim_button_action` as a *companion navigation*, not a
  post-claim follow-up. Common pattern:
  `dispatch claim → _smartico.dp(claim_button_action)` in the same
  click handler, without `await`-ing the claim.
- `claim_button_action` accepts both `dp:...` deep-links and full
  `http(s)://...` URLs (URLs open in a new tab).

## Image / asset specs
- Mission `image`: documented source size **256×256 px**, 1:1 aspect ratio.
- Custom ribbon URL: documented source size **250×300 px**.
- Related-game thumbnails: **1:1 aspect ratio** per `game_public_meta.image`.
- All assets are typically rendered as CSS `background-image` (no
  `<img>` element) so dimensions are controlled by the consumer's CSS.
- No built-in fallback placeholders — consumers should provide one
  when source fields are empty.

## Status-specific visual treatments
- **Locked**: lock-icon overlay on the image and a "locked" CSS
  modifier on the image container. NOT grayscale (grayscale is the
  convention for locked badges, not locked missions).
- **Completed**: no tint or strikethrough on the card itself; the
  status chip carries the completion date.
- **Missed**: same chip styling as Locked, different label.
  Missions stay visible in the Missed bucket unless an operator
  config hides expired missions after N days.
- **In progress**: default styling.
- **Opt-in required** (`is_requires_optin && !is_opted_in`): styled like
  in-progress, but the status chip carries a "Requires opt-in" label
  (not "Available") to signal the mission needs opt-in before progress
  starts; pair it with the 0%-progress bar noted above.
- **Featured**: replace the ribbon (when no `ribbon` is set) with a
  "featured" modifier; some brands use a gold border / glow.
- **Claimable** (claim button visible): add a "claimable" modifier
  to the card root to apply a highlight border or glow drawing
  attention to the action.

## Time-remaining countdown format

Convention used by the default Smartico UI (consumers should match for
a consistent feel across Smartico widgets):
- `≤ 0` → `00:00`
- `< 1 hour` → `MM:SS`
- `< 1 day` → `HH:MM:SS`
- `< 1 month` → `DD:HH:MM:SS`
- `< 1 year` → `MO:DD:HH:MM:SS`
- `≥ 1 year` → `YY:MO:DD:HH:MM:SS`

Update the displayed text every 1 second while the mission is in
progress.

## Empty states

Show a contextual empty-state message per bucket:
- Completed: "No completed missions yet"
- Locked: "No locked missions"
- Others (Available / Missed): "Nothing to show yet"

## Animations / transitions
- List entry: brief zoom-in or fade-in per card (stagger optional).
- Popup open: bounce + fade-in; stagger inner elements (title, image,
  description, actions) for a layered reveal.
- Progress bar fill: animate the width over ~1 second when progress
  advances (especially in the popup; cards often render the bar
  statically).
- Claim success: hide the Claim button immediately on success and
  (optionally) overlay a confetti or celebration animation.
- In-flight buttons (opt-in / claim): show a loading indicator
  (animated dots, spinner) and disable the trigger element until the
  response arrives.

## Mobile vs desktop
- Mobile: single-column vertical scroll.
- Desktop: multi-column grid. The default Smartico UI alternates a "big"
  and "small" card variant in a masonry pattern (every 4th in even
  rows / every 5th in odd rows is "big"). Consumers may use any grid
  pattern that suits their design.
- The detail popup is structurally identical on mobile and desktop;
  only sizing differs.

## Performance

The list is not paginated; the SDK returns the full visible mission
set in one response. For very large catalogs (50+ missions visible),
consider client-side virtualization in the consumer UI. The official
tracker does NOT virtualize.

**Cache TTL**: the SDK caches the response for 30 seconds. The cache
is invalidated and re-fetched automatically on each of the three
trigger events above; `onUpdate` fires after the re-fetch completes.

**Visitor mode**: supported, with caveats.
- The returned list reflects the brand's proxy "visitor" user, not
  the actual anonymous viewer. Per-user fields (`is_opted_in`,
  `progress`, `completed_count`) reflect the proxy user's state and
  are not meaningful for display.
- `onUpdate` is accepted by the API but NEVER fires in visitor mode —
  there is no live channel, so push events are not delivered.
  Visitor-mode consumers should re-poll `getMissions()` periodically
  if fresh data is needed.
- Additional server-side caching applies on top of the SDK cache,
  so visitor-mode data may be a few minutes stale.
