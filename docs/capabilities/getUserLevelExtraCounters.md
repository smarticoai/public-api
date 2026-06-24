# getUserLevelExtraCounters — API (UserLevelExtraCountersT)

> Returns the user's current values for the two label-defined "extra counters" used by sliding-window leveling logic.
> Import: `import { UserLevelExtraCountersT } from '@smartico/public-api'`
> Search terms: getUserLevelExtraCounters, user, UserLevelExtraCountersT, level_counter_1, level_counter_2

## Signature
```ts
_smartico.api.getUserLevelExtraCounters(): Promise<UserLevelExtraCountersT>
```

## Parameters
_None._

## Returns — `Promise<UserLevelExtraCountersT>`
`UserLevelExtraCountersT`:
- `level_counter_1` (number) — Current value of the user's first level counter. Operator-defined semantics per label. `undefined` on points-only labels.
- `level_counter_2` (number) — Current value of the user's second level counter. Operator-defined semantics per label. `undefined` on points-only labels.

## Behavioral contract
**When this matters**
Only labels configured for sliding-window leveling populate the
counter fields. On the default points-only leveling model, both
`level_counter_1` and `level_counter_2` are `undefined`. Detect
a points-only label by either counter being `undefined`.

**Counter semantics — operator-defined**
The SDK exposes raw numeric values; the meaning of each counter
(deposit amount, wager amount, lifetime spend, etc.) is fully
operator-defined per label. Resolve labels for display via
`getTranslations` — the operator's display strings are
stored under the translation keys `levelsCounter1Name` and
`levelsCounter2Name`.

**Refresh cadence**
Sliding-window counters are recomputed by a periodic server-side
job. Its rebuild cadence is operator-configured per brand —
commonly daily, though it can be set more frequent — so level
transitions driven by counter changes surface with a latency tied
to that rebuild schedule after the underlying activity (e.g. a
deposit), not in real time.

**Idempotency**: safe. Read-only. Repeated calls within the cache
window return a deep-cloned cached value without a network
round-trip.

**Side effects**: none — pure read.

**Visitor mode**: not supported.

## Example
```ts
const [counters, levels, profile] = await Promise.all([
  window._smartico.api.getUserLevelExtraCounters(),
  window._smartico.api.getLevels(),
  Promise.resolve(window._smartico.api.getUserProfile()),
]);

// Quick detection: undefined means this label doesn't use sliding-window leveling.
if (counters.level_counter_1 === undefined) {
  console.log('[smartico] points-only label — skip counter UI; show points progress only');
  return;
}

// Find the next level and render a 3-bar progress block.
const currentIdx = levels.findIndex(l => l.id === profile.ach_level_current_id);
const next = levels[currentIdx + 1];
if (next) {
  console.log('[smartico] render points bar:', profile.ach_points_ever, '/', next.required_points);
  if (next.required_level_counter_1) {
    console.log('[smartico] render counter 1 bar:', counters.level_counter_1, '/', next.required_level_counter_1);
  }
  if (next.required_level_counter_2) {
    console.log('[smartico] render counter 2 bar:', counters.level_counter_2, '/', next.required_level_counter_2);
  }
}
```

### Example response (REAL shape)
> Where this real payload differs from the typed Returns above (TS interface vs raw wire), the REAL shape is the runtime truth.
```json
{
  "level_counter_1": null,
  "level_counter_2": null
}
```

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `getLevels`
