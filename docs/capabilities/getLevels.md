# getLevels — API (TLevel)

> Returns the full level ladder configured for the current label — one `TLevel` per active level, server-sorted by `required_points` ASC (lowest first; `ordinal_position` is a 1-based index into the returned array).
> Import: `import { TLevel } from '@smartico/public-api'`
> Search terms: getLevels, user, getUserLevels, TLevel, id, name, description, image, required_points, visibility_points, required_level_counter_1, required_level_counter_2

## Signature
```ts
_smartico.api.getLevels(): Promise<TLevel[]>
```

## Parameters
_None._

## Returns — `Promise<TLevel[]>`
Array of `TLevel`. Each item:
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

## Behavioral contract
**Server-side filtering**
The server returns ALL active levels for the label. There is NO
per-user filtering on visibility, level-status, or anything else —
the response is identical across users of the same label. Apply
`visibility_points` filtering client-side if you want to hide
not-yet-reached levels (compare against
`getUserProfile().ach_points_ever` and exclude levels where
`visibility_points > ach_points_ever`).

**Sort order**
The returned array is already sorted by `required_points` ASC, and
`ordinal_position` is a 1-based index into that same sort order —
client-side re-sorting is not required for the default rendering.
If your label uses sliding-window leveling logic
(see `getUserLevelExtraCounters`) and you want to sort by
a multi-criteria key (`required_points`, then
`required_level_counter_1`, then `required_level_counter_2`), do
that client-side.

**Cache TTL**: the SDK caches the response for 30 seconds. Cache
is fully cleared on login / logout. Operator-driven level edits
surface on the next cache miss.

**Idempotency / Side effects**: safe. Read-only metadata. Calls
within the cache window de-duplicate to the same cached array.

**UI guidance**: see [UI Guide — `getLevels`](../../docs/ui/user/UIGuide_getLevels.md).

**Visitor mode**: supported. Use `_smartico.vapi(lang).getLevels()`
to fetch the ladder for anonymous viewers; the level configuration
is label-scoped static data so the response is meaningful even
without an authenticated user. Per-user fields (the implicit
"current level" via `getCurrentLevel`, or the user's progress)
are not available in visitor mode.

## Example
```ts
const [levels, profile] = await Promise.all([
  window._smartico.api.getLevels(),
  Promise.resolve(window._smartico.api.getUserProfile()),
]);

// Resolve the user's current level by ID.
const current = levels.find(l => l.id === profile.ach_level_current_id);
console.log('[smartico] render header badge — current level:', current?.name,
  '(position', current?.ordinal_position, 'of', levels.length, ')');

// Filter to levels the user has unlocked enough to see.
const visible = levels.filter(l =>
  l.visibility_points == null || l.visibility_points <= profile.ach_points_ever
);
console.log('[smartico] render the level map with', visible.length, 'visible tiles');

// Visitor-mode equivalent: returns the same ladder; no per-user state.
// const visitorLevels = await window._smartico.vapi('EN').getLevels();
```

### Example response (REAL shape)
```json
[
  {
    "id": 696,
    "name": "Stone",
    "description": "Your journey begins here! Step into the game and start climbing the ranks.",
    "image": "https://cdn.example/1a4199871dc30acf09374a-1stone.png",
    "required_points": 0,
    "visibility_points": 0,
    "required_level_counter_1": 0,
    "required_level_counter_2": 0,
    "custom_data": {
      "reward": "100 Free Spins",
      "image_inactive": "https://cdn.example/e917989495185e3fed695d-LevelLevel1Enabledfalse.png",
      "image_active": "https://cdn.example/a961023ab3f6441ac19dfc-LevelLevel1Enabledtrue.png",
      "rakeback": 0,
      "has_vip_club": false,
      "cashback": 0
    },
    "ordinal_position": 1
  }
]
```

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `getUserProfile`
- `getUserLevelExtraCounters`
- `getCurrentLevel`
