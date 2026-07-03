# UI Guide — `getMiniGames`

## Overview
- Returns the operator-configured mini-game templates ("SAW" =
  Spin And Win — covers wheel, scratch card, lootbox, gift box,
  treasure hunt, plinko, coin flip, quiz, and several other formats).
- Templates carry per-user state (`spin_count`,
  `next_available_spin_ts`, `jackpot_current`) — these update via
  `onUpdate` after any spin / acknowledge / server-pushed grant.
- The list is NOT filtered by spin availability — apply
  `visibile_when_can_spin` client-side to hide templates the user
  can't currently play.
- Visitor mode supported.

## List view organization

The default Smartico UI presents mini-game templates as a **flat
list** (no per-game-type tabs). Templates of different
`saw_game_type` values appear together, sorted by the operator's
configured priority.

Client-side visibility filter:

```ts
const visible = games.filter(g =>
  !g.visibile_when_can_spin || (g.spin_count && g.spin_count > 0)
);
```

`visibile_when_can_spin` is operator-configured per template. When
`true`, the template should be hidden from the lobby until the user
has spins (or balance for paid templates).

## Item card

Fields rendered per game card:

| Field | Source | Notes |
|---|---|---|
| Thumbnail | `thumbnail` (256×256 px source from template UI definition) | Render at 1:1 aspect ratio. |
| Name | `name` | Server-side `{{jackpot}}` substitution inlines the live jackpot value. |
| Description | `description` | Short marketing tagline. |
| Game-type pill | `saw_game_type` | E.g. "Spin", "Scratch", "Lootbox" — translate the enum value to a display label. |
| Spin-count badge | `spin_count` (only when `saw_buyin_type === 'spins'`) | Show as a chip on the card. |
| Buy-in indicator | `saw_buyin_type` + `buyin_cost_points` / `_gems` / `_diamonds` | "Free", "100 pts", "5 gems", etc. |
| Jackpot display | `jackpot_current` + `jackpot_symbol` | Only when `jackpot_add_on_attempt > 0`. Animate the value count-up when it changes via push. |
| Promo image | `promo_image` (500×240 px) | Optional larger artwork for featured / hero rendering. |
| Countdown | `next_available_spin_ts` (epoch ms) | Show "Available in HH:MM:SS" when set and in the future. |
| Play CTA | (derived) | See "Action button decision matrix". |

**Whole-card click target**: opens the detail / play view for that
template.

## Detail / play view per game type

The `saw_game_type` value drives the renderer:

| `SAWGameType` | Renderer | Behavior |
|---|---|---|
| `SpinAWheel` (1) | Canvas wheel; spin to a stop position on a 360° track | ~15 s animation; bezier ease-out |
| `ScratchCard` (2) | Canvas scratch-off reveal | User drags / taps to scratch; prize revealed underneath |
| `MatchX` (3) | Score-prediction UI (separate games server) | DON'T call `playMiniGame` — the games server fires the spin internally |
| `GiftBox` (4) | Tap-to-reveal gift boxes | Bubbles layout; tap chooses a box |
| `PrizeDrop` (5) | None (push-only) | Don't call `playMiniGame`; prizes arrive via push |
| `Quiz` (6) | Q&A UI (separate games server) | DON'T call `playMiniGame` |
| `LootboxWeekdays` (7) | Pick-N-from-grid | Grid layout or vertical-map (`game_layout` determines) |
| `LootboxCalendarDays` (8) | Pick-N-from-grid | Same; pool filtered to current calendar date |
| `TreasureHunt` (9) | Map exploration | `steps_to_finish_game` cells |
| `Voyager` (10) | Journey UI | `min_steps_to_finish_game` floor |
| `Plinko` (11) | Physics ball-drop | Animated drop through pegs |
| `CoinFlip` (12) | Binary coin flip | Heads-or-tails reveal |

The default Smartico UI uses a lazy-loaded component dispatcher
keyed on `saw_game_type`. For custom UIs, render the matching
component per game type — they share the same `playMiniGame`
trigger (except `PrizeDrop`, `MatchX`, `Quiz` as noted).

## Prize-field usage per game type

Several `prizes[]` fields only matter for specific renderers:

| Prize field | Used by | How |
|---|---|---|
| `sectors` | Spin-a-Wheel | Wheel sector indices the prize occupies — place the prize label/icon on those sectors. |
| `position` | Scratch Card | Sort prizes ascending by `position` to lay out the scratch grid. |
| `font_size` / `font_size_mobile` | Wheel, Scratch | Px size for the prize label on the game surface; mobile falls back to desktop. |
| `prize_modifiers` | Treasure Hunt, Voyager | Modifier tiles (2x…/10, 0, reset) applied to the running revealed total — presentation only; the award is still `prize_value`. |
| `allow_split_decimal` | Treasure Hunt, Voyager | Whether per-step revealed amounts may be fractional. |
| `requirements_to_get_prize` | Lootboxes | Text shown when the prize isn't yet available to the user. |
| `out_of_stock_message` | All (with stock) | Shown when the prize's pool is depleted. |
| `icon`, `name` | All | Prize strip, game surface, win modal. `name` arrives with the live jackpot value inlined. |
| `acknowledge_*`, `second_btn*`, `aknowledge_message(_lose)` | All | Win-modal contents — see [UI Guide — `playMiniGame`](UIGuide_playMiniGame.md) "Prize reveal modals". |

Template-side companions: `game_layout` picks the Lootbox grid
variant, `steps_to_finish_game` sizes step games, and
`expose_user_spin_id` asks the win view to display the player's
external user id (`'userId'`) or the spin's transaction id
(`'spinId'`) for transparency/audit.

## Action button decision matrix

CTA on the card / detail view (evaluate in priority order):

| Condition | CTA | Notes |
|---|---|---|
| `next_available_spin_ts > now` | "Available in HH:MM:SS" (countdown, disabled) | Countdown to next allowed spin |
| `saw_buyin_type === 'spins'` AND `spin_count === 0` | "No spins" (disabled) | Show `no_attempts_message` from the template |
| Insufficient balance (paid templates) | "Not enough {currency}" (disabled) | Compare `buyin_cost_*` against `getUserProfile` balance |
| User not in segment / template expired | (hidden — server filtered) | Template typically excluded by server visibility |
| Default (playable) | "Play" / "Spin" | Enabled — invokes `playMiniGame` |

`over_limit_message` and `no_attempts_message` are operator-supplied
messages; surface them under the disabled CTA rather than a generic
error.

## Image / asset specs

| Field | Aspect | Notes |
|---|---|---|
| `thumbnail` | 1:1 (square), 256×256 px | Card icon |
| `promo_image` | ~2:1 wide, 500×240 px | Featured / hero artwork |
| `prizes[].icon` | 1:1 (square) | Per-prize icon |

## Prize stock / scarcity UI (`expose_game_stat_on_api`)

When the operator enables "expose game statistics" on a template
(`template.expose_game_stat_on_api === true`), each prize carries
live stock statistics you can build scarcity affordances from:

- `pool` — remaining stock → "Only 3 left!" badges; pair with
  `pool_initial` for a depletion bar (`pool / pool_initial`).
- `wins_count` — total wins across all players → social proof
  ("won 120 times").
- `weekdays` (ISO 1–7) and `active_from_ts` / `active_till_ts` —
  the prize's availability schedule → grey out prizes not winnable
  today, or show "available Mon–Fri" hints. Evaluate against
  `relative_period_timezone` (minutes, JS `getTimezoneOffset`
  convention), not the device timezone.

The values refresh after every play, so re-render stock badges
from the `onUpdate` callback. When the setting is disabled (the
default) these fields are absent — build the prize strip from the
definition fields only and don't reserve empty space for stock
badges. Exception: `pool` is always present for MatchX / Quiz
templates. A prize with `is_surcharge: true` never runs out —
skip stock badges for it.

## Status-specific visual treatments

- **Playable**: full-color card; Play CTA enabled.
- **No spins / insufficient balance**: card desaturated or dimmed;
  CTA disabled with operator message.
- **Countdown**: card normal; CTA replaced with countdown timer
  (update every second).
- **`visibile_when_can_spin` filter**: card hidden entirely.
- **Jackpot increasing live**: pulse / glow the jackpot value when
  it ticks up via push (detect by diffing previous snapshot in
  `onUpdate`).

## Countdown / timing format

`next_available_spin_ts` — epoch ms — drives the countdown. Use:

- `> 1 hour` → `"HH:MM"` ("01:23")
- `1 minute – 1 hour` → `"MM:SS"`
- `< 1 minute` → `"0:SS"`, ticking down per second

Update once per second while visible. Hide the countdown and show
the Play CTA when the timestamp passes.

## Empty / loading / error states

- **Loading**: skeleton grid (3–6 placeholder cards).
- **Empty**: `[]` means no templates configured. Render a neutral
  empty-state.
- **Error**: keep prior list if any; show non-blocking error banner.

## Animations / transitions

- **Card entry**: fade-in stagger.
- **Jackpot tick**: count-up animation when value increases via
  push (detected by diffing prior snapshot in `onUpdate`).
- **Spin-count flash**: highlight the spin-count badge when it
  changes (campaign grant, prize win that grants spins).

## Mobile vs desktop

- **Card density**: desktop 3–4 columns; mobile 2 columns
  (sometimes 1 for large promo cards).
- **Detail view**: desktop centered modal; mobile full-screen.
- **Game canvas**: scales with viewport.

## Performance

- 30 s cache deduplicates rapid refetches.
- Diff snapshots in `onUpdate` to detect jackpot / spin-count
  changes for animations.
- Lazy-load game-type renderers (each game type is a substantial
  component bundle).
