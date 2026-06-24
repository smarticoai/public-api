# getCurrentLevel — API (TLevelCurrent)

> Returns the user's current level — every `TLevel` field plus a computed `progress` percentage toward the next level.
> Import: `import { TLevelCurrent } from '@smartico/public-api'`
> Search terms: getCurrentLevel, user, getUserLevel, TLevelCurrent, id, name, description, image, required_points, visibility_points, required_level_counter_1, required_level_counter_2

## Signature
```ts
_smartico.api.getCurrentLevel(): Promise<TLevelCurrent>
```

## Parameters
_None._

## Returns — `Promise<TLevelCurrent>`
`TLevelCurrent`:
- `id` (number) — Stable ID of the level.
- `name` (string) — Display name of the level, pre-translated to the user's language.
- `description` (string) — Display description of the level, pre-translated to the user's language.
- `image` (string) — URL of the level image (256x256 px source).
- `required_points` (number) — Total `ach_points_ever` required to reach this level.
- `visibility_points` (number) — Visibility threshold — clients hide the level from the user until `ach_points_ever >= visibility_points`. `null` means always visible.
- `required_level_counter_1` (number) — Required value of the first level counter for sliding-window leveling. `null` on points-only labels. See `UserLevelExtraCountersT`.
- `required_level_counter_2` (number) — Required value of the second level counter for sliding-window leveling. `null` on points-only labels.
- `custom_data` (string) — Operator-defined custom data. The SDK auto-parses JSON-looking strings, so at runtime this is `any` despite the `string` type.
- `ordinal_position` (number) — 1-based position in the ladder (matches the order of the returned array, which is sorted by `required_points` ASC).
- `progress` (number) — Progress to the next level as a 0–100 integer percentage. `100` at the highest level.

## Behavioral contract
**How `progress` is computed**
The SDK derives `progress` as the *delta-from-current-level-floor*:
`(ach_points_ever − current.required_points) / (next.required_points
− current.required_points) × 100`, clamped to `[0, 100]`. At the
highest level (no next level), `progress` is `100`. Reading the
source values directly from `getUserProfile`'s
`ach_points_ever` and `getLevels` would also work, but
`progress` saves the math.

**Cache TTL & freshness**
The response is cached for 30 seconds, but the SDK automatically
drops that cache whenever a user-properties update arrives — the
same live channel that backs `getUserProfile`. The practical
effect depends on the label's leveling logic:
- **Points-based or operator-manual leveling**: a points or level
 change flows through the user-properties channel, so the cache is
 busted at that moment and the next `getCurrentLevel()` call
 returns up-to-date data without waiting out the TTL.
- **Counter-based leveling** (level driven by sliding-window
 counters such as deposit or wagering totals over a recent window —
 see `getUserLevelExtraCounters`): ordinary progress changes
 are recomputed by a periodic server job and do NOT emit a
 user-properties update, so they become visible on this method only
 after the 30 s TTL expires (or after `_smartico.api.clearCaches()`).

Avoid calling `clearCaches()` on the points/manual path — it's
unnecessary there (the cache is already refreshed on the property
update) and forces a slower extra round-trip.

**Leveling logic**
The semantics of how a user advances depends on the label's
leveling logic (configured per brand): points-only (the default),
sliding-window with extra counters (uses
`getUserLevelExtraCounters`), or fully-manual operator
assignment. The `progress` percentage on this method assumes the
points-only model — it's not meaningful for manual-only labels
where level changes are operator-driven rather than points-driven.

**Idempotency**: safe. Read-only. Repeated calls within the cache
window return a deep-cloned cached value without a network
round-trip.

**Side effects**: none — pure read.

**Visitor mode**: not supported.

## Example
```ts
const level = await window._smartico.api.getCurrentLevel();
console.log('[smartico] render level badge — name:', level.name,
  'progress:', Math.round(level.progress), '%');

// Detect level-up via getUserProfile's push channel. No clearCaches()
// needed — the SDK already drops the level cache on this update.
window._smartico.on('props_change', async (changed) => {
  if ('ach_level_current_id' in changed) {
    const fresh = await window._smartico.api.getCurrentLevel();
    console.log('[smartico] user levelled up — animate badge to new level:', fresh.name);
  }
});
```

### Example response (REAL shape)
> Where this real payload differs from the typed Returns above (TS interface vs raw wire), the REAL shape is the runtime truth.
```json
{
  "id": 698,
  "name": "Silver",
  "description": "Now you’re playing! Enjoy exclusive missions and exciting rewards.",
  "image": "https://cdn.example/665b45d5a01e2191288091-3silver.png",
  "required_points": 500,
  "visibility_points": 0,
  "required_level_counter_1": null,
  "required_level_counter_2": null,
  "custom_data": {
    "reward": "1000 EUR + 300 Free Spins",
    "image_inactive": "https://cdn.example/bdf58fecfda5a1b9627f8f-LevelLevel3Enabledfalse.png",
    "image_active": "https://cdn.example/90a40da1c5e201f8fa1d3c-LevelLevel3Enabledtrue.png",
    "rakeback": 5,
    "has_vip_club": true,
    "cashback": 2
  },
  "ordinal_position": 3,
  "progress": 38
}
```

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `getUserProfile`
- `getLevels`
- `getUserLevelExtraCounters`
