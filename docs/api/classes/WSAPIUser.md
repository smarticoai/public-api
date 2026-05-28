# Class: WSAPIUser
## Methods

### getUserProfile()

> **getUserProfile**(): [`TUserProfile`](../interfaces/TUserProfile.md)

Returns the current user's public profile — the source of truth for
balances (points / gems / diamonds), the current level ID, the
display username + avatar, language, public tags, and the inbox
unread count. **This method is synchronous** (returns `TUserProfile`,
not a Promise): the SDK keeps a local snapshot of the user's public
properties that is initialised at identify time and kept live by a
server-driven update channel — every call returns the latest cached
values without a network round-trip.

Subscribe to changes by registering a callback on `_smartico.on('props_change', ...)`
— the callback fires with the full snapshot at identify and with
partial-key updates on every subsequent server push (typically
under 1 second after the underlying state change).

#### Returns

[`TUserProfile`](../interfaces/TUserProfile.md)

The current cached `TUserProfile` snapshot. A shallow copy —
         mutating it does not affect the SDK's internal state.

#### Remarks

**Preconditions**
The tracker must be initialised — calling this before the identify
round-trip completes throws (`"Tracker is not initialized, cannot
getUserProfile"`). Safe ways to wait for readiness:
- register `_smartico.on('identify', (errCode, props) => ...)` —
  fires once after a successful identify with the full props
- register `_smartico.on('props_change', () => ...)` — fires first
  at identify with the full snapshot, then on every push update

**What's kept live (push-updated)**
Balance fields (`ach_points_balance`, `ach_gems_balance`,
`ach_diamonds_balance`, `ach_points_ever`), `ach_level_current_id`,
`core_public_tags`, `core_inbox_unread_count`, `core_user_language`,
`avatar_url`, `public_username`, and the AI-driven recommended-amount
fields all flow over the SDK's user-properties update channel as
partial updates — the snapshot is patched in place when any of them
change server-side. Re-call `getUserProfile()` (or watch
`props_change`) to observe new values.

**Reading state from the returned profile**
Balances (`ach_points_balance`, `ach_gems_balance`,
`ach_diamonds_balance`) are the canonical source for affordability
checks across the SDK — compare against `entry_fee_amount` (clans),
`registration_cost_points` / `_gems` / `_diamonds` (tournaments), and
`price` / `discounted_price` + `purchase_type` (store items).
`ach_points_ever` is monotonic — store purchases deduct from
`ach_points_balance` but NEVER from `ach_points_ever`, so it remains
useful for level-progress math (`required_points` on the next
[getLevels](#getlevels) entry minus `ach_points_ever`). `ach_level_current_id`
is the FK into the level ladder — resolve metadata via
[getCurrentLevel](#getcurrentlevel) (richer, includes progress %) or
[getLevels](#getlevels) (full ladder lookup table).

**Inbox unread count** — `core_inbox_unread_count` on this profile
is push-updated in real time (under 1 second). For an inbox badge,
prefer this field over getInboxUnreadCount (which is cached
for 30 s) — same value, fresher signal.

**Language**: `core_user_language` reflects the server's stored
language. If the consumer just called `_smartico.changeLanguage(...)`,
the field may briefly lag the local intent until the server push
arrives. Use `_smartico.getPublicProps()` for the
client-fallback-applied version if instant accuracy matters.

**Idempotency / Side effects**: trivially safe — no network call,
no state mutation.

**UI guidance**: see [UI Guide — `getUserProfile`](../_media/UIGuide_getUserProfile.md).

**Visitor mode**: not supported — throws. Visitor sessions do not
have a public-profile snapshot.

#### Throws

`Error("Tracker is not initialized, cannot getUserProfile")`
         if called before identify completes or from a visitor session.

#### Example

```ts
// Wait for identify before calling.
window._smartico.on('identify', (errCode) => {
  if (errCode !== 0) return;
  const profile = window._smartico.api.getUserProfile();
  console.log('[smartico] initial profile loaded — render the user widget:', profile);
});

// Stay in sync with live updates.
window._smartico.on('props_change', (changed) => {
  // `changed` is the partial keys for this push (full snapshot at identify).
  const profile = window._smartico.api.getUserProfile();
  console.log('[smartico] profile updated — re-render any widgets bound to:', Object.keys(changed),
    '— balances now:', profile.ach_points_balance, profile.ach_gems_balance, profile.ach_diamonds_balance);

  // React to specific fields.
  if ('ach_level_current_id' in changed) {
    console.log('[smartico] level changed — call getCurrentLevel() for richer detail, animate the level badge');
  }
  if ('core_inbox_unread_count' in changed) {
    console.log('[smartico] inbox unread count changed — update the badge to:', profile.core_inbox_unread_count);
  }
});

// Affordability gating example — used inside a clan / tournament / store CTA handler.
const profile = window._smartico.api.getUserProfile();
const item = await window._smartico.api.getStoreItems().then(items => items[0]);
const price = item.discounted_price ?? item.price;
const balance = {
  points: profile.ach_points_balance,
  gems: profile.ach_gems_balance,
  diamonds: profile.ach_diamonds_balance,
}[item.purchase_type];
if (balance < price) {
  console.log('[smartico] insufficient', item.purchase_type, '— disable Buy and show deficit', price - balance);
}
```

***

### checkSegmentMatch()

> **checkSegmentMatch**(`segment_id`): `Promise`\<`boolean`\>

Checks whether the current user matches a single segment, returning
`true` / `false` directly. Use this as a decision primitive to gate
UI surfaces (e.g. show a "VIP lounge" tab only when the user is in
the VIP segment), or to drive segment-specific CTA copy.

Every call is a server round-trip — there is no SDK-side cache. For
checking multiple segments in one round-trip, use
[checkSegmentListMatch](#checksegmentlistmatch) instead.

#### Parameters

##### segment\_id

`number`

The segment ID. Segment IDs are label-scoped;
                   the same numeric ID can refer to different
                   segments under different labels. Use the IDs
                   configured for your label.

#### Returns

`Promise`\<`boolean`\>

`true` if the user currently matches the
                   segment, `false` otherwise. `false` also covers
                   the "segment doesn't exist for this label"
                   case — these are not distinguishable.

#### Remarks

**Refresh model**
- **No client cache.** Every call sends a request; the SDK does not
  memoize results.
- **No push event** notifies the consumer when segment membership
  flips (the user crosses a qualification threshold, or the
  operator changes the segment definition). Membership changes
  become visible only on the next `checkSegmentMatch` call.
- **Behavioral segments (configured against BigQuery) have batch
  lag** — even if the user's activity has changed (deposit, wager,
  etc.), the segment-membership result may not reflect that change
  until the next batch evaluation run (typically up to several
  hours).

**Rate limit** (important)
The server caps `checkSegment*` calls at **10 requests per
60-second window**, with a minimum gap of **~5 seconds between
consecutive calls**. Avoid calling on every render — cache the
result client-side for the session, or until you have a reason to
believe the user's state changed (e.g. after a deposit completes,
a level changes via [getUserProfile](#getuserprofile)'s `props_change`, or a
specific custom event fires).

**`is_matching: false` is ambiguous on the server** — both "the
segment doesn't exist for this label" and "the user doesn't
qualify" return `false` with no distinguishing signal. Pass IDs
you've verified are valid for your label.

**Idempotency**: safe. Read-only. No side effects (no analytics
events, no DB writes).

**Visitor mode**: not supported.

#### Example

```ts
const isVip = await window._smartico.api.checkSegmentMatch(vipSegmentId);
if (isVip) {
  console.log('[smartico] user is in VIP segment — render the VIP-only widget surface');
} else {
  console.log('[smartico] user not in VIP segment (or segment id misconfigured) — hide the VIP surface');
}

// Cache the result for the session; re-check after material user-state changes.
window._smartico.on('props_change', async (changed) => {
  if ('ach_points_ever' in changed || 'ach_level_current_id' in changed) {
    const fresh = await window._smartico.api.checkSegmentMatch(vipSegmentId);
    console.log('[smartico] user state changed — VIP membership now:', fresh);
  }
});
```

***

### checkSegmentListMatch()

> **checkSegmentListMatch**(`segment_ids`): `Promise`\<[`TSegmentCheckResult`](../interfaces/TSegmentCheckResult.md)[]\>

Checks the current user's membership in multiple segments in a
single server round-trip — returns a `TSegmentCheckResult[]` with
one entry per *unique* segment ID. Use this instead of looping
[checkSegmentMatch](#checksegmentmatch) when you need to evaluate several
segments at once (e.g. multi-segment composite gating, A/B-style
cohort detection).

#### Parameters

##### segment\_ids

`number`[]

Array of segment IDs to check. Duplicates are
                    silently de-duplicated server-side. Segment IDs
                    are label-scoped — use the IDs configured for
                    your label.

#### Returns

`Promise`\<[`TSegmentCheckResult`](../interfaces/TSegmentCheckResult.md)[]\>

Array of `{ segment_id, is_matching }` results.
                    Order is NOT guaranteed; correlate by
                    `segment_id`. Length may be less than the input
                    when duplicate IDs were sent.

#### Remarks

**Response order is NOT guaranteed**
The server returns results in an unspecified order — different
from the input array. Always correlate by the `segment_id` field on
each `TSegmentCheckResult` rather than by array position. The
returned array length may also be smaller than the input array
(duplicate IDs are silently de-duplicated server-side).

**Single round-trip**
The entire `segment_ids` array is sent in one request. Two segments
cost the same as one in terms of network latency and rate-limit
consumption (one call = one rate-limit slot, regardless of how many
segments).

**Shared semantics with `checkSegmentMatch`**
Both methods wrap the same underlying server endpoint and share
the same caching, refresh, rate-limit, and ambiguity behavior. See
[checkSegmentMatch](#checksegmentmatch) for: no client cache · no push event for
membership changes · behavioral segments have batch lag · rate
limit (10 requests / 60 s, ~5 s minimum gap between calls) ·
`is_matching: false` doesn't distinguish "not in segment" from
"segment doesn't exist for this label".

**Idempotency**: safe. Read-only. No side effects.

**Visitor mode**: not supported.

#### Example

```ts
const segmentIds = [vipSegmentId, newPlayerSegmentId, freeRollSegmentId];
const results = await window._smartico.api.checkSegmentListMatch(segmentIds);

// Always correlate by segment_id — the response order is unspecified.
const byId = new Map(results.map(r => [r.segment_id, r.is_matching]));

if (byId.get(vipSegmentId)) {
  console.log('[smartico] user is in VIP segment — render VIP surface');
}
if (byId.get(newPlayerSegmentId) && byId.get(freeRollSegmentId)) {
  console.log('[smartico] new player AND eligible for free roll — show the welcome promo');
}

// Cache the result map for the session; refresh on material state changes.
```

***

### getLevels()

> **getLevels**(): `Promise`\<[`TLevel`](../interfaces/TLevel.md)[]\>

Returns the full level ladder configured for the current label —
one `TLevel` per active level, server-sorted by `required_points`
ASC (lowest first; `ordinal_position` is a 1-based index into the
returned array). Use this to render a level map / progression
screen, or as a lookup table to resolve `ach_level_current_id` from
[getUserProfile](#getuserprofile) into a richer level object.

#### Returns

`Promise`\<[`TLevel`](../interfaces/TLevel.md)[]\>

Promise resolving to the ordered `TLevel[]` ladder. Empty
         if no levels are configured for the label.

#### Remarks

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
(see [getUserLevelExtraCounters](#getuserlevelextracounters)) and you want to sort by
a multi-criteria key (`required_points`, then
`required_level_counter_1`, then `required_level_counter_2`), do
that client-side.

**Cache TTL**: the SDK caches the response for 30 seconds. Cache
is fully cleared on login / logout. Operator-driven level edits
surface on the next cache miss.

**Idempotency / Side effects**: safe. Read-only metadata. Calls
within the cache window de-duplicate to the same cached array.

**UI guidance**: see [UI Guide — `getLevels`](../_media/UIGuide_getLevels.md).

**Visitor mode**: supported. Use `_smartico.vapi(lang).getLevels()`
to fetch the ladder for anonymous viewers; the level configuration
is label-scoped static data so the response is meaningful even
without an authenticated user. Per-user fields (the implicit
"current level" via [getCurrentLevel](#getcurrentlevel), or the user's progress)
are not available in visitor mode.

#### Example

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

***

### getCurrentLevel()

> **getCurrentLevel**(): `Promise`\<[`TLevelCurrent`](../interfaces/TLevelCurrent.md)\>

Returns the user's current level — every `TLevel` field plus a
computed `progress` percentage toward the next level. Use this to
power a level badge with a progress bar.

#### Returns

`Promise`\<[`TLevelCurrent`](../interfaces/TLevelCurrent.md)\>

Promise resolving to `TLevelCurrent` — the current level
         plus `progress: number` (0–100).

#### Remarks

**How `progress` is computed**
The SDK derives `progress` as the *delta-from-current-level-floor*:
`(ach_points_ever − current.required_points) / (next.required_points
− current.required_points) × 100`, clamped to `[0, 100]`. At the
highest level (no next level), `progress` is `100`. Reading the
source values directly from [getUserProfile](#getuserprofile)'s
`ach_points_ever` and [getLevels](#getlevels) would also work, but
`progress` saves the math.

**Cache TTL**: the SDK caches the response for 30 seconds. There is
no push event that refreshes this cache; a server-side level change
(visible immediately on [getUserProfile](#getuserprofile)'s `ach_level_current_id`
via the user-properties update channel) becomes visible on this
method only after the cache TTL expires, or after
`_smartico.api.clearCaches()` is called.

**Leveling logic**
The semantics of how a user advances depends on the label's
leveling logic (configured per brand): points-only (the default),
sliding-window with extra counters (uses
[getUserLevelExtraCounters](#getuserlevelextracounters)), or fully-manual operator
assignment. The `progress` percentage on this method assumes the
points-only model — it's not meaningful for manual-only labels
where level changes are operator-driven rather than points-driven.

**Idempotency**: safe. Read-only. Repeated calls within the cache
window return a deep-cloned cached value without a network
round-trip.

**Side effects**: none — pure read.

**Visitor mode**: not supported.

#### Example

```ts
const level = await window._smartico.api.getCurrentLevel();
console.log('[smartico] render level badge — name:', level.name,
  'progress:', Math.round(level.progress), '%');

// Detect level-up via getUserProfile's push channel.
window._smartico.on('props_change', async (changed) => {
  if ('ach_level_current_id' in changed) {
    await window._smartico.api.clearCaches();   // bust the 30 s cache
    const fresh = await window._smartico.api.getCurrentLevel();
    console.log('[smartico] user levelled up — animate badge to new level:', fresh.name);
  }
});
```

***

### getUserLevelExtraCounters()

> **getUserLevelExtraCounters**(): `Promise`\<[`UserLevelExtraCountersT`](../interfaces/UserLevelExtraCountersT.md)\>

Returns the user's current values for the two label-defined "extra
counters" used by sliding-window leveling logic. Operators
configure what each counter means per label (e.g. `level_counter_1`
= total deposits in the last 30 days, `level_counter_2` = total
wagering in the last 30 days). Compare against
`required_level_counter_1` / `_2` on the next level from
[getLevels](#getlevels) to know how close the user is to advancing.

#### Returns

`Promise`\<[`UserLevelExtraCountersT`](../interfaces/UserLevelExtraCountersT.md)\>

Promise resolving to `UserLevelExtraCountersT`. Both
         fields are `undefined` on labels not using sliding-window
         leveling.

#### Remarks

**When this matters**
Only labels configured for sliding-window leveling populate the
counter fields. On the default points-only leveling model, both
`level_counter_1` and `level_counter_2` are `undefined`. Detect
a points-only label by either counter being `undefined`.

**Counter semantics — operator-defined**
The SDK exposes raw numeric values; the meaning of each counter
(deposit amount, wager amount, lifetime spend, etc.) is fully
operator-defined per label. Resolve labels for display via
getTranslations — the operator's display strings are
stored under the translation keys `levelsCounter1Name` and
`levelsCounter2Name`.

**Refresh cadence**
Sliding-window counters are recomputed by a server-side job that
runs roughly every 60 seconds against the operator's BigQuery
dataset; level transitions driven by counter changes have a
latency of up to several minutes after the underlying activity
(e.g. a deposit). The SDK caches the response for 30 seconds; no
push event refreshes this cache. After a level change visible on
[getUserProfile](#getuserprofile)'s `ach_level_current_id`, call
`_smartico.api.clearCaches()` to force a fresh fetch.

**Idempotency**: safe. Read-only. Repeated calls within the cache
window return a deep-cloned cached value without a network
round-trip.

**Side effects**: none — pure read.

**Visitor mode**: not supported.

#### Example

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

***

### getActivityLog()

> **getActivityLog**(`__namedParameters`): `Promise`\<[`TActivityLog`](../interfaces/TActivityLog.md)[]\>

Returns the user's unified balance-change history — every points, gems, and
diamonds transaction within the requested time window, ordered newest-first.
Use to power an "Activity" / "History" tab showing wins, claims, purchases,
level-up rewards, and operator adjustments.

The returned shape is the same regardless of currency type — `type` (see
[UserBalanceType](../enumerations/UserBalanceType.md)) distinguishes points / gems / diamonds and
`source_type_id` (see [PointChangeSourceType](../enumerations/PointChangeSourceType.md)) names the originating
event.

#### Parameters

##### \_\_namedParameters

###### startTimeSeconds

`number`

###### endTimeSeconds

`number`

###### from

`number`

###### to

`number`

###### onUpdate?

(`data`) => `void`

#### Returns

`Promise`\<[`TActivityLog`](../interfaces/TActivityLog.md)[]\>

Array of [TActivityLog](../interfaces/TActivityLog.md) ordered newest-first.

#### Remarks

**Preconditions**
- User must be authenticated. Visitor mode is not guarded at the SDK level
  but is not meaningful — activity is per-user.

**Pagination — `from` / `to` are offset + ceiling, not timestamps**
The SDK derives `offset = from`, `limit = min(to - from, 50)` — the server
hard-caps a single response at 50 entries. For infinite scroll, advance
`from` by 50 between calls. Both `startTimeSeconds` and `endTimeSeconds`
are epoch seconds bounding the window the server scans.

**Subscription model (`onUpdate`)**
The callback fires when the user's `ach_points_balance`,
`ach_gems_balance`, or `ach_diamonds_balance` changes (i.e. whenever a
wallet event lands). The pushed payload is a FIXED re-fetch of the
**last 10 minutes / first 50 entries** — it does NOT honor the original
call's `startTimeSeconds` / `endTimeSeconds` / `from` / `to`. Consumers
maintaining a long historical view must re-call `getActivityLog` with
their own params after receiving an `onUpdate` notification.

**Refresh**
- The SDK caches results for 30 seconds.
- Push triggers fire only on balance changes; transactions that don't
  alter a balance (theoretical zero-amount entries) won't refresh.

**Visitor mode**: not meaningful (no per-user history available).

**UI guidance**: see [UI Guide — `getActivityLog`](../_media/UIGuide_getActivityLog.md).

#### Example

```ts
const now = Math.floor(Date.now() / 1000);
const start = now - 86400 * 30; // 30 days

const log = await window._smartico.api.getActivityLog({
    startTimeSeconds: start,
    endTimeSeconds:   now,
    from: 0,
    to:   50,
    onUpdate: (refreshed) => {
        console.log('[smartico] wallet changed — refreshed payload is last 10 min / 50 entries:', refreshed.length, 'rows');
        // If the consumer is showing a full 30-day view, re-call getActivityLog with the original params here.
    },
});

for (const row of log) {
    const sign = row.amount >= 0 ? '+' : '';
    console.log('[smartico] activity row — render with', row.type === 0 ? 'points' : row.type === 1 ? 'gems' : 'diamonds', 'icon, color by sign:', sign + row.amount, 'balance after:', row.balance, 'source:', row.source_type_id);
}
```
