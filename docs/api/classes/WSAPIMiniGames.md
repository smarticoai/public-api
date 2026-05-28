# Class: WSAPIMiniGames
## Methods

### getMiniGames()

> **getMiniGames**(`params?`): `Promise`\<[`TMiniGameTemplate`](../interfaces/TMiniGameTemplate.md)[]\>

Returns all mini-game templates ("SAW" = Spin And Win — the
umbrella term for wheel-spin, scratch-card, lootbox, gift-box,
treasure-hunt, plinko, coin-flip, quiz, and several other formats)
configured for the label. Optionally subscribes to live updates
via `onUpdate`: the callback fires whenever the user's
`spin_count` changes, jackpot grows, a manual spin is issued, or
a spin response lands.

The list is NOT filtered by spin availability — every configured
template is returned, including ones the user cannot currently
play. The `visibile_when_can_spin` flag on each template hints
which to hide in a default lobby view (consumer-side filter).

#### Parameters

##### params?

Optional. Omit to fetch without subscribing.

###### onUpdate?

(`data`) => `void`

Callback invoked with the full refreshed
                           template array after any spin-count
                           change, spin response, or acknowledge
                           response on this connection.

#### Returns

`Promise`\<[`TMiniGameTemplate`](../interfaces/TMiniGameTemplate.md)[]\>

Promise resolving to the template
                           array. Empty if no templates are
                           visible to the user.

#### Remarks

**Subscription model (`onUpdate`)**
The callback receives the FULL refreshed template list (never a
diff/patch). Each subsequent call to `getMiniGames({ onUpdate })`
REPLACES the prior callback. Pass `onUpdate: undefined` (or omit
it) to keep the prior callback in place; the callback is never
auto-cleared.

**Update triggers** — the callback fires when:

1. The server pushes a `spin_count` change (campaign award,
   store purchase, BO manual issuance, mission reward).
2. Any [playMiniGame](#playminigame) or [playMiniGameBatch](#playminigamebatch)
   resolves on this connection — the cached array refreshes
   with updated `spin_count`, `jackpot_current`, and any new
   `next_available_spin_ts`.
3. Acknowledge responses land (via auto-acknowledge or
   [miniGameWinAcknowledgeRequest](#minigamewinacknowledgerequest)).

Jackpot growth is observable on the refreshed `jackpot_current`
field — the SDK inlines the live value into template `name` /
`promo_text` / prize `name` via a `{{jackpot}}` template
substitution at fetch time.

**Game-type variants**
All twelve `SAWGameType` values (`SpinAWheel`, `ScratchCard`,
`MatchX`, `GiftBox`, `PrizeDrop`, `Quiz`, `LootboxWeekdays`,
`LootboxCalendarDays`, `TreasureHunt`, `Voyager`, `Plinko`,
`CoinFlip`) surface through the same template shape. Most are
played via [playMiniGame](#playminigame); the exceptions are:
- `PrizeDrop` — server-push only; the consumer does NOT call
  `playMiniGame`. Prizes arrive via the prize-drop push channel.
- `MatchX` / `Quiz` — predictions are submitted via a separate
  games server (not this SDK); the SAW spin is fired
  server-internally to deduct the buy-in.

**Cache TTL**: the SDK caches the response for 30 seconds. Cache
is fully cleared on login / logout.

**Idempotency / Side effects**: safe. Read-only.

**UI guidance**: see [UI Guide — `getMiniGames`](../_media/UIGuide_getMiniGames.md).

**Visitor mode**: supported. Only templates configured with
`is_visitor_mode = true` in the BO are returned for anonymous
sessions. Spins from these templates may also be played (visitor
mode is the one mini-game flow that does support play — see
[playMiniGame](#playminigame) for the visitor-stop semantics).

#### Example

```ts
const games = await window._smartico.api.getMiniGames({
  onUpdate: (refreshed) => {
    console.log('[smartico] mini-game templates refreshed — re-render lobby from this array:', refreshed);
  },
});

// Filter the lobby view per the visibility flag.
const visible = games.filter(g =>
  !g.visibile_when_can_spin || (g.spin_count && g.spin_count > 0)
);

for (const g of visible) {
  console.log('[smartico] render game card', g.id, '—', g.name,
    '— type:', g.saw_game_type,
    '— buy-in:', g.saw_buyin_type,
    '— spins available:', g.spin_count ?? 0,
    '— jackpot:', g.jackpot_current, g.jackpot_symbol);
}
```

***

### getMiniGamesHistory()

> **getMiniGamesHistory**(`params`): `Promise`\<[`TSawHistory`](../interfaces/TSawHistory.md)[]\>

Returns a paginated, newest-first list of the user's past
mini-game spins — each row carries the won prize ID, the
client-side `request_id` used for the spin, and a
server-recorded `is_claimed` flag (`true` if the spin has been
acknowledged). Optionally filter to a single template via
`saw_template_id`.

Use this to power a "My prizes" / win-history surface, or to
recover unacknowledged spins (rows with `is_claimed === false`
carry a `client_request_id` you can pass to
[miniGameWinAcknowledgeRequest](#minigamewinacknowledgerequest)).

#### Parameters

##### params

Optional pagination + filter bag.

###### limit?

`number`

Page size. Defaults to 20.

###### offset?

`number`

Number of rows to skip. Defaults to 0.

###### saw_template_id?

`number`

When set, scopes the history to
                               a single template's spins.

#### Returns

`Promise`\<[`TSawHistory`](../interfaces/TSawHistory.md)[]\>

Promise resolving to `TSawHistory[]` in newest-first
         order. Empty when the user has no history.

#### Remarks

**Pagination**
`limit` defaults to 20, `offset` defaults to 0. Sort order is
`create_date` DESC (newest first) — no client-side re-sort
required. For "load more" pagination, advance `offset` by the
page size on each subsequent call.

The underlying protocol carries a `hasMore` boolean on the
response, but the SDK strips it from the public surface —
detect end of list when the returned array length is less than
`limit`.

**`is_claimed` semantics**
Maps directly to the server's "acknowledge_date is non-null"
state. A spin where the auto-acknowledge fire-and-forget
succeeded shows `is_claimed: true`; a spin where the
acknowledge was lost (network drop) or where the user is on an
explicit-acknowledge flow shows `is_claimed: false` with a
usable `client_request_id`. A server-side fallback job
auto-acknowledges stale rows every ~60 seconds — so even
"lost" prizes are eventually delivered without consumer action.

**Cache TTL**: the SDK caches the response for 30 seconds.
Cache is invalidated implicitly when a new spin or acknowledge
response lands.

**Idempotency / Side effects**: safe. Read-only.

**UI guidance**: see [UI Guide — `getMiniGamesHistory`](../_media/UIGuide_getMiniGamesHistory.md).

**Visitor mode**: not supported.

#### Example

```ts
const history = await window._smartico.api.getMiniGamesHistory({ limit: 20 });

// Show unacknowledged spins with a Claim CTA.
const unacknowledged = history.filter(h => !h.is_claimed);
console.log('[smartico] surface a "Claim" CTA on these', unacknowledged.length, 'history rows:',
  unacknowledged.map(h => h.client_request_id));

// Load-more pagination — advance offset by the prior page size.
const page2 = await window._smartico.api.getMiniGamesHistory({ limit: 20, offset: 20 });
console.log('[smartico] page 2 loaded —', page2.length, 'more rows;',
  page2.length < 20 ? 'end of list reached, hide "Load more"' : 'keep "Load more" visible');
```

***

### playMiniGame()

> **playMiniGame**(`template_id`, `params?`): `Promise`\<[`TMiniGamePlayResult`](../interfaces/TMiniGamePlayResult.md)\>

Plays one round of a mini-game template — runs the server's
randomised prize selection, deducts the buy-in cost (if any),
and returns the won `prize_id`. After the play resolves, the SDK
automatically fires a server-side acknowledgement on a
fire-and-forget basis, marking the spin as "delivered" so the
prize takes effect.

Works for all `SAWGameType` values EXCEPT:
- `PrizeDrop` — prizes arrive server-pushed; do NOT call
  `playMiniGame` for this type.
- `MatchX` / `Quiz` — prediction submission goes through a
  separate games server; `playMiniGame` is not the entry point.

#### Parameters

##### template\_id

`number`

The mini-game template ID (from
                    `TMiniGameTemplate.id`).

##### params?

Optional. Pass an `onUpdate` callback to
                    subscribe to subsequent template refreshes.

###### onUpdate?

(`data`) => `void`

#### Returns

`Promise`\<[`TMiniGamePlayResult`](../interfaces/TMiniGamePlayResult.md)\>

`{ err_code, err_message, prize_id }` — success when
         `err_code === 0`. `prize_id` is always populated; look
         it up in `template.prizes` to interpret the prize.

#### Remarks

**Preconditions**
Read the candidate template from [getMiniGames](#getminigames) and check:
- `spin_count > 0` for spin-based templates
  (`saw_buyin_type === 'spins'`).
- Sufficient balance for paid templates — points / gems /
  diamonds from [getUserProfile](WSAPIUser.md#getuserprofile) against
  `buyin_cost_points` / `_gems` / `_diamonds`.
- `next_available_spin_ts` is in the past (or unset) — the
  server enforces a per-period max-attempts cap.
- Template is currently in its active period
  (operator-configured `activeFromDate` / `activeTillDate`).

**Error codes** (in `err_code`, typed as [SAWSpinErrorCode](../enumerations/SAWSpinErrorCode.md))
- `0` (`SAW_OK`) — success; `prize_id` identifies the won prize
  in `template.prizes`.
- `40001` (`SAW_NO_SPINS`) — user has no spin attempts for a
  spin-based template.
- `40002` (`SAW_PRIZE_POOL_EMPTY`) — all prize slots in the
  template are depleted.
- `40003` (`SAW_NOT_ENOUGH_POINTS`) — insufficient points for a
  points-cost template.
- `40004` (`SAW_FAILED_MAX_SPINS_REACHED`) — per-period
  max-attempts cap reached. The server's
  `first_spin_in_period` value (exposed in
  [TMiniGamePlayBatchResult](../interfaces/TMiniGamePlayBatchResult.md); not surfaced in the single
  `TMiniGamePlayResult`) marks the period start.
- `40007` (`SAW_TEMPLATE_NOT_ACTIVE`) — template outside its
  active time window.
- `40009` (`SAW_NOT_IN_SEGMENT`) — user fails the template's
  visibility segment check, OR (for lootbox variants) the day's
  prize pool is empty.
- `40011` (`SAW_NO_BALANCE_GEMS`) — insufficient gems.
- `40012` (`SAW_NO_BALANCE_DIAMONDS`) — insufficient diamonds.
- `-40001` (`SAW_VISITOR_STOP_SPIN_REQUEST`) — visitor session
  tried to play a non-visitor-mode template. The default UI
  silently stops the game; no prize awarded.
- other non-zero — generic server error. Surface `err_message`.

**Prize handling**
On `err_code === 0`, `prize_id` matches an entry in
`template.prizes`. Look up the prize's `prize_type`
([MiniGamePrizeTypeName](../enumerations/MiniGamePrizeTypeName.md)) to decide UI treatment:
- `'no-prize'` — the user spun but won nothing (an operator-
  configured "loss" slot). Buy-in is still deducted.
- `'points'` / `'gems-and-diamonds'` / `'spin'` — value
  credited to the user's profile / spin balance; visible on
  the next refresh.
- `'bonus'` — surfaces via [getBonuses](#getbonuses).
- `'jackpot'` — drains the template's `jackpot_current` to the
  user; resets the accumulator.
- `'raffle-ticket'` — adds tickets to the relevant raffle.
- `'mission'` / `'change-level'` — visible via the
  corresponding domain methods.
- `'manual'` — operator delivers offline.

**Auto-acknowledge**
The SDK calls the server's acknowledge endpoint immediately
after the spin response, on a fire-and-forget basis (not
awaited). This marks the spin as "delivered" so prize effects
take hold. If the auto-acknowledge fails (network drop), the
spin appears as `is_claimed: false` in
[getMiniGamesHistory](#getminigameshistory); the consumer can recover it by
passing the `client_request_id` to
[miniGameWinAcknowledgeRequest](#minigamewinacknowledgerequest). A server-side fallback
job auto-acknowledges stale spins every ~60 seconds, so prizes
are eventually delivered even without consumer action.

**Idempotency**: NOT idempotent. A double-click sends two
spins and deducts the buy-in twice. The SDK does NOT guard
against rapid clicks at the public API level — guard the call
site with an in-flight flag. The server enforces a per-user
per-template lock that serialises concurrent requests, so two
simultaneous calls won't be processed in parallel, but they
will both be processed sequentially (i.e. both deduct).

**Refresh after success (and after failure)**
The SDK automatically refreshes the templates cache on every
spin response and fires any `onUpdate` callback registered via
[getMiniGames](#getminigames) or this method. After `err_code === 0`, the
affected template's `spin_count` / `jackpot_current` /
`next_available_spin_ts` reflect the new state on the
refreshed array.

**Side effects** (on `err_code === 0`)
- Buy-in deducted from the user's balance (points / gems /
  diamonds / spin tickets — depending on `saw_buyin_type`).
  Balance updates flow via the user-properties channel
  (subscribe to [getUserProfile](WSAPIUser.md#getuserprofile) `props_change` to
  observe).
- Prize value credited per the prize's type (see "Prize
  handling" above).
- A `minigame_attempt` analytics event fires server-side with
  the result status.

**UI guidance**: see [UI Guide — `playMiniGame`](../_media/UIGuide_playMiniGame.md).

**Visitor mode**: not supported. Visitor sessions trying to
spin receive `SAW_VISITOR_STOP_SPIN_REQUEST (-40001)`.

#### Example

```ts
const games = await window._smartico.api.getMiniGames({
  onUpdate: (refreshed) => console.log('[smartico] templates refreshed — re-render lobby', refreshed),
});
const game = games.find(g => g.id === templateId);

if (!game) {
  console.log('[smartico] template not in current list — refresh getMiniGames');
  return;
}
if (game.saw_buyin_type === 'spins' && (game.spin_count ?? 0) === 0) {
  console.log('[smartico] no spins available — disable Play button, show "No spins" message');
  return;
}

console.log('[smartico] play starting — set in-flight flag, start game animation (wheel spin / scratch / lootbox open / etc.)');
const r = await window._smartico.api.playMiniGame(game.id);
console.log('[smartico] play response received');

if (r.err_code === 0) {
  const prize = game.prizes.find(p => p.id === r.prize_id);
  if (prize?.prize_type === 'no-prize') {
    console.log('[smartico] user lost — animate to the no-prize slot and show "Better luck next time" modal');
  } else {
    console.log('[smartico] user won — animate to prize', prize?.name,
      '— show acknowledge modal per template.acknowledge_type;',
      'getMiniGames onUpdate fires shortly with refreshed spin_count / jackpot');
  }
} else if (r.err_code === 40004) {
  console.error('[smartico] max spins reached — show countdown to next available spin (use playMiniGameBatch for first_spin_in_period if needed)');
} else if (r.err_code === -40001) {
  console.log('[smartico] visitor stopped — silently end the game, no prize modal');
} else {
  console.error('[smartico] play failed — show generic error with this message:', r.err_message);
}
```

***

### miniGameWinAcknowledgeRequest()

> **miniGameWinAcknowledgeRequest**(`request_id`): `Promise`\<[`SAWDoAknowledgeResponse`](../interfaces/SAWDoAknowledgeResponse.md)\>

Manually acknowledges a mini-game spin — marks the spin as
"delivered" so the prize takes effect server-side. Most consumers
do NOT need to call this method directly; [playMiniGame](#playminigame)
and [playMiniGameBatch](#playminigamebatch) auto-acknowledge on success. Use
this only for recovery scenarios.

#### Parameters

##### request\_id

`string`

The `client_request_id` from a `TSawHistory`
                   row returned by [getMiniGamesHistory](#getminigameshistory).

#### Returns

`Promise`\<[`SAWDoAknowledgeResponse`](../interfaces/SAWDoAknowledgeResponse.md)\>

#### Remarks

**When to call**
- **Lost auto-acknowledge** — when the WebSocket dropped between
  the spin response and the auto-acknowledge fire-and-forget,
  the spin shows `is_claimed: false` in
  [getMiniGamesHistory](#getminigameshistory). Pass that row's
  `client_request_id` here to deliver the prize.
- **Explicit-acknowledge UI** — for templates configured with
  the `ExplicitAcknowledge` acknowledge type (operator
  decision), the consumer's UI shows a "Claim" CTA after the
  prize animation. Click handler calls this method with the
  spin's `client_request_id` rather than auto-acknowledging.

**No-op on already-acknowledged spins**
The server's acknowledge SQL matches on `acknowledge_date IS
NULL` — a duplicate call returns successfully with no effect.

**Server-side fallback**
Even without ever calling this method, a server-side job
auto-acknowledges stale spins every ~60 seconds — so prizes are
eventually delivered. The `is_claimed` flag flips on the next
`getMiniGamesHistory` call after the job runs.

**Idempotency**: safe. Repeated calls have no effect after the
first.

**Side effects** (on first successful call for an unacknowledged
spin)
- Prize value credited per the prize's type (see
  [playMiniGame](#playminigame) "Prize handling").
- The spin's `is_claimed` flag flips to `true` on the next
  [getMiniGamesHistory](#getminigameshistory) call.

**Visitor mode**: not supported.

#### Example

```ts
const history = await window._smartico.api.getMiniGamesHistory({ limit: 20 });
const unacknowledged = history.filter(h => !h.is_claimed);

for (const row of unacknowledged) {
  console.log('[smartico] re-acknowledging stale spin', row.client_request_id);
  await window._smartico.api.miniGameWinAcknowledgeRequest(row.client_request_id);
}

// Re-fetch history to see the updated is_claimed flags.
const fresh = await window._smartico.api.getMiniGamesHistory({ limit: 20 });
console.log('[smartico] history after recovery —', fresh.filter(h => !h.is_claimed).length, 'still unacknowledged');
```

***

### playMiniGameBatch()

> **playMiniGameBatch**(`template_id`, `spin_count`, `params?`): `Promise`\<[`TMiniGamePlayBatchResult`](../interfaces/TMiniGamePlayBatchResult.md)[]\>

Plays a mini-game template `spin_count` times in one round-trip.
Returns an array of per-spin results — each independent, each
with its own error code. Like [playMiniGame](#playminigame), the SDK
auto-acknowledges every result on a fire-and-forget basis.

Use this when a UI offers "spin N times" affordances
(multi-spin buttons, lootbox open-N flows). The server processes
each spin independently — there is no atomicity / rollback if
one fails.

#### Parameters

##### template\_id

`number`

The mini-game template ID.

##### spin\_count

`number`

Number of spins to play. The server attempts
                    all `spin_count` spins — partial successes
                    are normal when the user runs out of
                    balance / spins mid-batch.

##### params?

Optional. Pass an `onUpdate` callback to
                    subscribe to subsequent template refreshes.

###### onUpdate?

(`data`) => `void`

#### Returns

`Promise`\<[`TMiniGamePlayBatchResult`](../interfaces/TMiniGamePlayBatchResult.md)[]\>

`TMiniGamePlayBatchResult[]` — one entry per requested
         spin, in request order. Note the camelCase `errCode` /
         `errMessage` keys (see "Result shape note" above).

#### Remarks

**Result shape note** — `TMiniGamePlayBatchResult` uses
`errCode` / `errMessage` (camelCase) — DIFFERENT from
[TMiniGamePlayResult](../interfaces/TMiniGamePlayResult.md) which uses `err_code` / `err_message`
(snake_case). Branch on the camelCase keys when reading batch
results.

**Per-spin independence**
The server iterates the requested spins and calls the prize
engine once per entry. If spin #2 fails with `SAW_NO_SPINS`,
spin #3 is still attempted — the server does NOT stop on first
error and does NOT roll back successful spins. Each
`results[i].errCode` is independent.

Practical implication: if the user has 3 spins available and
requests 5, expect results 0-2 with `errCode === 0` and results
3-4 with `errCode === SAW_NO_SPINS`.

**Error codes**
Per-result `errCode` is from [SAWSpinErrorCode](../enumerations/SAWSpinErrorCode.md). See
[playMiniGame](#playminigame) for the full table; the same codes apply
per spin.

**`first_spin_in_period` field**
Populated on results where `errCode === SAW_FAILED_MAX_SPINS_REACHED`
(40004). The value is the epoch-ms timestamp of the user's
first spin in the current cooldown period. Compute the
countdown as:
`template.max_spins_period_ms - (Date.now() - first_spin_in_period)`.

**`jackpot_amount` field**
Populated on results where the won prize is a jackpot
(`prize_type === 'jackpot'`). The amount the user just claimed
from the template's jackpot accumulator.

**Auto-acknowledge**
The SDK fires a batch-acknowledge for all `request_id`s after
the batch response lands — fire-and-forget. Same recovery
semantics as [playMiniGame](#playminigame): lost acknowledgements
become recoverable via [miniGameWinAcknowledgeRequest](#minigamewinacknowledgerequest)
per row, and a server-side fallback job auto-acknowledges
stale spins every ~60 seconds.

**Idempotency**: NOT idempotent. A double-click sends two
batches. Guard the call site with an in-flight flag.

**Refresh after success (and after failure)**
Same as [playMiniGame](#playminigame) — the templates cache refreshes
and any `onUpdate` callback registered via [getMiniGames](#getminigames)
fires with the updated `spin_count` / `jackpot_current`.

**Side effects** (per-spin, on `errCode === 0`)
Same as [playMiniGame](#playminigame) — buy-in deducted, prize value
credited per prize type.

**UI guidance**: see [UI Guide — `playMiniGameBatch`](../_media/UIGuide_playMiniGameBatch.md).

**Visitor mode**: not supported.

#### Example

```ts
const game = (await window._smartico.api.getMiniGames()).find(g => g.id === templateId);
if (!game) return;

console.log('[smartico] batch play starting — set in-flight flag, animate the chosen N spins sequentially in UI');
const results = await window._smartico.api.playMiniGameBatch(game.id, 5);
console.log('[smartico] batch response received — clear in-flight flag');

for (const [i, r] of results.entries()) {
  if (r.errCode === 0) {
    const prize = game.prizes.find(p => p.id === r.saw_prize_id);
    console.log('[smartico] spin', i, 'won:', prize?.name,
      r.jackpot_amount ? '(jackpot: ' + r.jackpot_amount + ')' : '');
  } else if (r.errCode === 40004) {
    const msTillNext = game.max_spins_period_ms! - (Date.now() - (r.first_spin_in_period ?? 0));
    console.log('[smartico] spin', i, 'capped — ' + Math.ceil(msTillNext / 1000) + ' s until next allowed');
  } else {
    console.error('[smartico] spin', i, 'failed —', r.errCode, r.errMessage);
  }
}
```

***
