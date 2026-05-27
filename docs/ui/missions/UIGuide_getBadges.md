# UI Guide — `getBadges`

## Overview
- Badges are completion-tracked achievements that **auto-unlock** when their
  criteria are met. No opt-in step, no claim step, no recurring cycles.
- The same `TMissionOrBadge` shape is reused; treat the mission-only fields
  on a badge object as not-applicable (see method TSDoc for the list).
- The default Smartico UI renders badges as a **category-grouped grid** —
  not a flat list and not as status tabs. Each category section shows
  `completed / total` in its header.
- No `onUpdate` subscription. Poll on the 30 s cache TTL or re-fetch on a
  domain event your app already handles (e.g. after a game round, after a
  bonus claim).
- Loading indicator: skip on cache hit; show a brief shimmer on cold fetch
  (typically 100–500 ms).

## List view organization

Group by category (`category_ids`) and resolve display metadata via
[`getAchCategories`](../../api/classes/WSAPIMissions.md#getachcategories).
The category list serves both missions and badges — use it directly.

Recommended layout — sectioned grid:

  1. Fetch badges + categories in parallel.
  2. Sort categories by `order` ascending.
  3. For each category, filter `badges.filter(b => b.category_ids.includes(cat.id))`.
  4. Render one collapsible section per non-empty category, with a header
     showing `<name> (<completed>/<total>)`.
  5. Items inside a section render as a fixed-cell grid (typically 3–4
     columns on desktop, 2 on mobile — see "Mobile vs desktop").

Items with `category_ids: []` (uncategorized): the SDK does NOT return a
synthetic "Other" category. If your UI surfaces uncategorized badges,
generate that bucket client-side. Many badge UIs simply hide uncategorized
badges.

A badge can appear in multiple categories — duplicate rendering across
sections is intentional. Do NOT dedupe; users navigate categories
independently.

**Sort within a category**: typical priority — `is_completed === true`
first (most recently completed by `complete_date_ts` DESC), then
in-progress (by `position` ASC), then not-yet-started (by `position` ASC),
then expired (by `position` ASC). `position` is the operator-configured
display order; lower = higher priority.

## Badge card / tile

Fields to render on the card:

- `image` — documented source size 256×256 px. Render at a 1:1 aspect
  ratio. There is no built-in placeholder for missing images — provide a
  neutral fallback (e.g. a generic locked-badge silhouette).
- `name` — the title. Translated server-side.
- Stage counter — show **`<completed_tasks> / <total_tasks>`** computed
  from `tasks` (count `t.is_completed === true` over `tasks.length`), NOT
  a percentage `progress` bar. The default Smartico UI deliberately keeps
  task descriptions hidden ("surprise mechanics") and shows only the count
  of stages cleared. The exception: a single-task badge can show just a
  completion check-mark instead of `1/1`.
- Availability chip — drive from `badgeTimeLimitState`. See "Status-specific
  visual treatments" for the per-state visual treatment.
- `ribbon` — optional tag rendered as a corner badge (`sale`, `hot`, `new`,
  `vip` or a custom 250×300 px image URL). Render top-right on the card.

Fields NOT on the card (detail-view only): `description`, full task list
with names, `hint_text` (T&C), category memberships.

**Click target**: whole card opens the detail view. There is no action
button on the card itself — badges have no opt-in or claim flow.

## Detail view / popup

Top-to-bottom layout:

  1. **Hero image** — `image` rendered at a larger size (typically
     320×320 px or full-width up to a max). Apply the same status overlay
     as the card (see "Status-specific visual treatments").
  2. **Title & availability chip** — `name` + status chip.
  3. **Description** — `description` HTML.
  4. **Task list** — render `tasks[].name` as a vertical list, each with
     a check-mark when `task.is_completed === true`. Do NOT render
     `tasks[].progress` percentages; the badge UX convention is "stages
     cleared", not "percent complete". Optionally show stage `points_reward`
     beside each task name if the brand surfaces task rewards.
  5. **Reward summary** — `reward` HTML if non-empty.
  6. **Timing block** — formatted `active_from_ts` / `active_till_ts` or
     completion date `complete_date_ts`. See "Countdown / timing format".
  7. **T&C** — `hint_text` if present, in a smaller collapsible
     "Terms" panel.
  8. **Related games** — `related_games` array rendered as a horizontal
     game-tile strip if non-empty. Each tile clicks through to the game
     using `related_games[i].game_public_meta.link`.

No primary CTA button at the bottom — badges are passive. If the brand
wants to drive engagement from the popup, surface a `related_games` strip
or a deep-link CTA derived from the brand's own configuration; the SDK
itself does not return one for badges.

## Action button decision matrix

Badges have **no action buttons**. They auto-unlock when criteria are met.
Anything that looks like an action button in a badge view is either:

- A close / back affordance (popup chrome), or
- A "View related game" link derived from `related_games[i].game_public_meta.link`, or
- A custom brand-defined CTA the operator wires up externally — the SDK
  does not return a `cta_action` payload for badges in practice.

Do NOT render opt-in buttons, claim buttons, or anything that mutates
state. Both surfaces would no-op against badge IDs (no server endpoint
accepts a badge for opt-in / claim).

## Image / asset specs

| Field | Documented source size | Aspect ratio | Fallback |
|---|---|---|---|
| `image` | 256×256 px | 1:1 | Neutral locked-badge silhouette |
| `ribbon` (custom URL) | 250×300 px | 5:6 portrait | Hide ribbon if URL fails to load |
| `related_games[i].game_public_meta.image` | per game-catalog spec (1:1) | 1:1 | Hide tile if image missing |

If `image` is missing or fails to load: render the fallback at the same
size. Do not show a broken-image icon — this UI surface is consumer-facing
gamification and a broken image undermines the reward fantasy.

## Status-specific visual treatments

Drive from `badgeTimeLimitState` first, then layer completion state on
top.

| `badgeTimeLimitState` | Card visual | Availability chip text |
|---|---|---|
| `BeforeStartDate` (0) — window hasn't started | Grayscale + subtle dim overlay. Lock-icon corner badge if `is_locked === true`. | `"Starts on <date>"` from `active_from_ts` |
| `AfterStartDateNoProgress` (1) — active, no progress yet, no end date | Full-color, no overlay | No chip (or a neutral `"Available"`) |
| `AfterStartDateNoProgressAndEndDate` (2) — active, no progress, has end date | Full-color | `"Until <date>"` from `active_till_ts` |
| `AfterStartDateWithProgressAndEndDate` (3) — active with progress, has end date | Full-color | `"<countdown>"` to `active_till_ts` (see "Countdown / timing format") |
| `AfterEndDateNotStarted` (4) — expired, never started | Grayscale + dim overlay + slash/X overlay | `"Expired"` |
| `AfterEndDateWithProgress` (5) — expired with some progress | Grayscale + dim overlay | `"Ended"` (or `"Expired"`) |

On top of the time-window treatment, layer the completion state:

- `is_completed === true` — color-restored card (override grayscale),
  prominent check-mark corner badge, glow / shine accent. The default
  Smartico UI shows the most-recently-completed badges first within a
  category by `complete_date_ts` DESC.
- `is_completed === false` and at least one `task.is_completed === true` —
  show the stage counter prominently (e.g. larger font, contrasting color)
  to signal in-progress.
- All other cases — neutral card, stage counter at default emphasis.

## Countdown / timing format

Time displayed varies by badge state. Recommended format ("compact"):

- **Time-until-start** (`badgeTimeLimitState === BeforeStartDate`):
  - More than 7 days away → `"Starts <date>"` (e.g. `"Starts 12 Jun"`)
  - 1–7 days → `"Starts in <N> days"`
  - < 24 h → `"Starts in <Hh Mm>"`
- **Time-until-end** (`AfterStartDateWithProgressAndEndDate`,
  `AfterStartDateNoProgressAndEndDate`):
  - > 7 days → `"Until <date>"`
  - 1–7 days → `"<N> days left"`
  - 1–24 h → `"<Hh Mm> left"`
  - < 1 h → `"<Mm Ss> left"`, updated every second
- **Completed**: `"Completed <relative>"` (e.g. `"Completed 2 days ago"`)
  from `complete_date_ts`. Tooltip shows full timestamp.
- **Expired / ended**: just the static label `"Expired"` or `"Ended"`.

Update cadence:
- > 1 hour away from boundary → refresh once a minute is enough.
- < 1 hour → refresh once a second.
- Avoid rendering ticking timers for badges that don't have an `active_till_ts`
  (most badges) — most badges are open-ended.

## Empty / loading / error states

- **Loading (cold fetch)**: render a shimmer grid (skeleton cards) matching
  the eventual grid layout. Show category-section headers if cached, else
  shimmer the entire view.
- **Loading (cache hit)**: do not render a loading state. The promise
  resolves within a microtask.
- **Empty result**: `[]` from the server means the brand has no badges
  configured for the user (rare). Render a neutral empty-state illustration
  with copy like `"No badges yet"`. Do NOT show this state during the
  cold-fetch shimmer.
- **Error**: cache the prior result if any and keep rendering it; show a
  small non-blocking error banner. Retry on the next poll tick. Do not
  break the page on a single fetch failure.

## Animations / transitions

- **List entry**: cards fade-in on first render. Within a category section,
  the default Smartico UI staggers the fade by ~30 ms per card.
- **Category section expand/collapse**: smooth height animation (~200 ms
  ease-out).
- **Badge completion celebration**: when `is_completed` flips from `false`
  to `true` between fetches (your consumer detects this by diffing the
  prior list), play a celebration animation on the affected card —
  shine sweep + check-mark scale-in. The default Smartico UI also opens
  the detail popup automatically on a freshly-completed badge if the
  user is currently viewing the badge surface; mirror this only if your
  product surface justifies it.
- **Stage tick**: when `completed_tasks` increases between fetches without
  full completion, briefly highlight the stage counter (color flash for
  ~500 ms) to acknowledge progress.

## Mobile vs desktop

- **Grid columns**: desktop typically 3–4 columns, tablet 2–3, mobile 2.
  Cards are square (1:1 image aspect ratio drives the layout).
- **Card density**: mobile cards may hide the ribbon to reduce visual
  noise; the stage counter remains.
- **Detail view**: mobile opens as a full-screen modal (slide-up); desktop
  opens as a centered popup with backdrop dim.
- **Category sections**: mobile may default-collapse all sections except
  the first one with non-zero progress; desktop typically renders all
  sections expanded.

## Performance

- Diff the badge list between fetches to detect completion / stage events
  for animations. Avoid full re-renders on every poll tick — keyed
  per-card rendering matters because the celebration animations break
  if the DOM nodes are recreated.
- The `image` URLs are CDN-hosted; let the browser cache them. Lazy-load
  images below the fold; eager-load images in the first visible category.
- 30 s polling is fine for a small to medium badge catalog (< 200 badges).
  For very large catalogs, consider polling only when the badges surface
  is in the viewport (use `IntersectionObserver`) — the SDK doesn't
  throttle for you.

**Visitor mode: not supported.** Use [`getMissions`](../../api/classes/WSAPIMissions.md#getmissions)
(visitor mode supported) or [`getAchCategories`](../../api/classes/WSAPIMissions.md#getachcategories)
(visitor mode supported) if you need achievement data for anonymous users.
Calling `_smartico.vapi(lang).getBadges()` returns no usable data — visitor
sessions have no badge-progress path on the server.
