# UI Guide — `getLevels`

## Overview

- Returns the full level ladder for the label — one `TLevel` per
active level, server-sorted by `required_points` ASC.
- Use as a lookup table to resolve `ach_level_current_id` from
`[getUserProfile](../../api/classes/WSAPIUser.md#getuserprofile)`
into a richer level object, or as the source for a level map UI.
- Loading indicator: skip on cache hit (30 s); show a brief shimmer
on cold fetch (typically 100–300 ms).

## List view organization

The default Smartico UI renders levels as a **vertical grid** —
2-column on mobile (`grid-boxes-2 levels`), responsive on desktop
(`grid-boxes-levels`). No horizontal-scroll layout, no tabs.

Items are already sorted by `required_points` ASC; `ordinal_position`
is a 1-based index matching that sort. Render in the returned array
order — no client-side sort needed unless your label uses
sliding-window leveling (then sort secondary on
`required_level_counter_1`, then `required_level_counter_2`).

## Client-side filtering by `visibility_points`

The server returns ALL active levels; the default Smartico UI hides
levels the user hasn't reached the visibility threshold for:

```ts
const visible = levels.filter(l =>
  l.visibility_points == null || l.visibility_points <= profile.ach_points_ever
);
```

Hidden levels are absent from the render entirely — no "?" tile, no
silhouette. If your product surface wants a teaser for upcoming
levels, render the hidden ones with a custom CSS treatment instead
of filtering them out.

## Level tile

Fields rendered per tile:


| Field              | Use                                                                                                  |
| ------------------ | ---------------------------------------------------------------------------------------------------- |
| `image`            | Tile icon (square, 256×256 px source).                                                               |
| `name`             | Tile heading.                                                                                        |
| `description`      | Optional sub-text under the heading; the default UI shows this in the detail modal, not on the tile. |
| `required_points`  | Threshold display: `"{N} pts to reach"` or progress bar.                                             |
| `ordinal_position` | Tile order; matches array order.                                                                     |


**Locked vs unlocked treatment** — apply a `disabled` class to tiles
where the user hasn't met the threshold:

- Points-only leveling (most labels): `disabled = ach_points_ever < required_points`
- Sliding-window leveling: also check
`level_counter_1 < required_level_counter_1` (and `_2`) from
`[getUserLevelExtraCounters](../../api/classes/WSAPIUser.md#getuserlevelextracounters)`.
- Manual-only leveling: `disabled` unless the level matches the
user's current `ach_level_current_id`.

The default Smartico UI uses CSS-only treatment for locked tiles —
no padlock icon, no greyscale by default. Brands can add those via
custom CSS / Liquid skin overrides.

## Detail view (per-level modal)

When the user taps a tile, open a modal showing:

- Hero image (`image`)
- Title (`name`), description (`description`)
- Progress block: for the user's current level, three stacked
progress bars (points / counter 1 / counter 2) — see "Sliding-window
leveling" below. For other levels, just the requirement display.
- Custom fields rendered from `custom_data` (operator-defined).

`custom_data` is typed as `string` but at runtime is `any` — the SDK
auto-parses JSON-looking strings. Always guard with
`typeof custom_data === 'object'` before property access; treat
non-object values as raw strings.

## Sliding-window leveling (advanced)

If your label uses sliding-window leveling (the "Logic 2" model), the
`required_level_counter_1` and `required_level_counter_2` fields are
populated. Render alongside the points threshold:

```
Points:    {ach_points_ever} / {required_points}
Counter 1: {level_counter_1} / {required_level_counter_1}   ← from getUserLevelExtraCounters
Counter 2: {level_counter_2} / {required_level_counter_2}
```

The operator names the counters via translation keys
(`levelsCounter1Name`, `levelsCounter2Name`) — typical values are
"Total Deposits", "Total Wagering", etc. The SDK does not expose the
operator's chosen labels; resolve them via
`[getTranslations](../../api/classes/WSAPIGeneral.md#gettranslations)`.

On points-only labels, both `required_level_counter_*` fields are
`null` — skip rendering the counter rows.

## Progress to next level

Two formulas are in use; pick whichever fits your design:

- **From-zero (default Smartico UI uses this)**:
`ach_points_ever / next_level.required_points × 100`. Shows
"absolute" progress; never decreases as the user gains points.
- **From-current-level-floor (SDK uses this in
`[getCurrentLevel](../../api/classes/WSAPIUser.md#getcurrentlevel)`)**:
`(ach_points_ever − current.required_points) / (next.required_points − current.required_points) × 100`. Resets to 0 when the user levels
up; better for "how far through this level" UX.

Both bound at 100; at the max level the bar shows full.

## Image / asset specs


| Field   | Aspect                                     | Notes                                                                                                  |
| ------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `image` | 1:1 (square), 256×256 px documented source | Render in a square tile container; fallback: text-only tile with the level name if `image` is missing. |


## Empty / loading / error states

- **Loading (cold fetch)**: render a skeleton grid (3–6 placeholder
tiles) sized to the eventual layout.
- **Loading (cache hit)**: do not render a loading state — the
promise resolves within a microtask.
- **Empty result**: `[]` means no levels are configured for the
label. Hide the level UI entirely (or render a neutral
"no levels configured" placeholder).
- **Error**: keep the prior list visible if any; show a small
non-blocking error banner; retry on next user-driven action.

## Animations / transitions

- **Tile entry**: stagger fade-in (~30 ms per tile) on first render.
- **Level-up celebration**: when `ach_level_current_id` flips on a
push (detect via `[getUserProfile](../../api/classes/WSAPIUser.md#getuserprofile)`'s
`props_change`), animate the newly-reached tile (scale-up,
shine sweep). The default Smartico UI does this on the header
badge, not on the level-map tiles.

## Mobile vs desktop

- **Grid columns**: desktop responsive (3–5 columns depending on
viewport); mobile 2 columns.
- **Detail view**: desktop opens as a centered modal with backdrop
dim; mobile opens as a full-screen sheet.
- **Counter rows in detail**: identical on both — three stacked
progress bars on Logic 2 labels.

## Performance

- The 30 s cache deduplicates rapid refetches; a poll loop hitting
`getLevels()` every 5 s effectively translates to one network
round-trip per 30 s.
- `getLevels` is suitable to call once at app boot and cache the
array in your own state (re-fetch only when the user's level
changes per `props_change`, since the operator-driven ladder
rarely changes mid-session).

