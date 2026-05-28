# Class: WSAPIGamePick
## Methods

### gamePickGetActiveRounds()

> **gamePickGetActiveRounds**(`props`): `Promise`\<[`GamesApiResponse`](../interfaces/GamesApiResponse.md)\<[`GamePickRound`](../interfaces/GamePickRound.md)[]\>\>

Returns every open round for a MatchX or Quiz game template, with the full
event list (matches / questions) and the current user's selections per event.

Use to power the rounds-lobby screen — typically a list of round cards a user
can tap into to make predictions. For a single round, use
[gamePickGetActiveRound](#gamepickgetactiveround) (lighter payload when only one round is shown).

#### Parameters

##### props

[`GamePickRequestParams`](../interfaces/GamePickRequestParams.md)

#### Returns

`Promise`\<[`GamesApiResponse`](../interfaces/GamesApiResponse.md)\<[`GamePickRound`](../interfaces/GamePickRound.md)[]\>\>

Wrapped [GamesApiResponse](../interfaces/GamesApiResponse.md) of [GamePickRound](../interfaces/GamePickRound.md) array.

#### Remarks

**Preconditions**
- User must be authenticated.
- `saw_template_id` must reference a MatchX or Quiz game template. The SDK
  throws synchronously if it's missing.

**Transport**
Game Pick methods are HTTP REST calls to a separate Game Pick games server
(not the main WebSocket). One consequence: there is no SDK cache and no push
subscription — every call is a fresh server roundtrip.

**Round status**
Each round's `round_status_id` is a [GPRoundStatus](../enumerations/GPRoundStatus.md) value. Rounds with
status `NoEventsDefined` (1) are filtered out server-side and never appear
here. Other values: `Other` (-1, normally open), `NoMoreBetsAllowed` (2),
`AllEventsResolved_ButNotRound` (3), `RoundResolved` (4 — appears here only
briefly during transition; use [gamePickGetHistory](#gamepickgethistory) for resolved rounds).

**Error codes** (in `errCode`)
- `0` — success.
- `100002` — template not found (the `saw_template_id` doesn't reference a
  MatchX/Quiz game).
- `100003` — no open rounds available for this template right now.
- `100000` — auth hash invalid; SDK session needs re-initialization.
- `100004` — generic server error.

**Refresh**
- No cache; every call is live.
- No push subscription. Poll while the user is on the screen if you need
  live round-status changes (typically every 30–60 s is enough).

**Visitor mode**: not supported. The SDK throws synchronously on visitor
sessions.

**UI guidance**: see [UI Guide — `gamePickGetActiveRounds`](../_media/UIGuide_gamePickGetActiveRounds.md).

#### Example

```ts
const r = await window._smartico.api.gamePickGetActiveRounds({ saw_template_id: 1083 });

if (r.errCode !== 0) {
    console.error('[smartico] active rounds fetch failed — show empty rounds lobby:', r.errMessage);
    return;
}

for (const round of r.data ?? []) {
    console.log('[smartico] render a round card:', round.round_name, '— events:', round.events.length, 'user has placed bet:', round.user_placed_bet);
}
```

***

### gamePickGetActiveRound()

> **gamePickGetActiveRound**(`props`): `Promise`\<[`GamesApiResponse`](../interfaces/GamesApiResponse.md)\<[`GamePickRound`](../interfaces/GamePickRound.md)\>\>

Returns a single round (events, user selections, scoring rules) for a
MatchX or Quiz game. Use to power the round-detail / prediction-input
screen the user lands on after picking a round from the lobby.

Same shape as one entry of [gamePickGetActiveRounds](#gamepickgetactiverounds); cheaper when the
UI only shows one round at a time.

#### Parameters

##### props

[`GamePickRoundRequestParams`](../interfaces/GamePickRoundRequestParams.md)

#### Returns

`Promise`\<[`GamesApiResponse`](../interfaces/GamesApiResponse.md)\<[`GamePickRound`](../interfaces/GamePickRound.md)\>\>

Wrapped [GamesApiResponse](../interfaces/GamesApiResponse.md) of a single [GamePickRound](../interfaces/GamePickRound.md).

#### Remarks

**Preconditions**
- User must be authenticated. Visitor mode not supported.
- `saw_template_id` and `round_id` are mandatory — the SDK throws if either
  is missing.

**Error codes** (in `errCode`)
- `0` — success.
- `4` — round / event not found (e.g. round resolved after the last
  `gamePickGetActiveRounds` poll); non-fatal — retry after a fresh active-
  rounds fetch.
- `100002` — template not found.
- `100000` — auth hash invalid.
- `100004` — generic server error.

**Refresh**
- No cache; every call is live.
- Re-call after [gamePickSubmitSelection](#gamepicksubmitselection) or
  [gamePickSubmitSelectionQuiz](#gamepicksubmitselectionquiz) to surface the persisted predictions.
- Poll while the user is on the prediction screen if event resolution
  updates are needed (typically every 30–60 s).

**Visitor mode**: not supported.

**UI guidance**: see [UI Guide — `gamePickGetActiveRound`](../_media/UIGuide_gamePickGetActiveRound.md).

#### Example

```ts
const r = await window._smartico.api.gamePickGetActiveRound({
    saw_template_id: 1083,
    round_id:        31652,
});

if (r.errCode === 0 && r.data) {
    console.log('[smartico] render round detail page —', r.data.round_name, '— user has placed bet:', r.data.user_placed_bet, 'score so far:', r.data.user_score);
} else {
    console.error('[smartico] round fetch failed — bounce back to the lobby and refresh:', r.errMessage);
}
```

***

### gamePickGetHistory()

> **gamePickGetHistory**(`props`): `Promise`\<[`GamesApiResponse`](../interfaces/GamesApiResponse.md)\<[`GamePickRound`](../interfaces/GamePickRound.md)[]\>\>

Returns the full round history (active + resolved) for a MatchX or Quiz game
template, newest-first. Each round carries the user's predictions plus the
server-resolved outcome on each event.

Use to power a "Past predictions" / history tab. For just the open rounds,
use [gamePickGetActiveRounds](#gamepickgetactiverounds) (faster — skips resolved data).

#### Parameters

##### props

[`GamePickRequestParams`](../interfaces/GamePickRequestParams.md)

#### Returns

`Promise`\<[`GamesApiResponse`](../interfaces/GamesApiResponse.md)\<[`GamePickRound`](../interfaces/GamePickRound.md)[]\>\>

Wrapped [GamesApiResponse](../interfaces/GamesApiResponse.md) of [GamePickRound](../interfaces/GamePickRound.md) array,
newest-first.

#### Remarks

**Preconditions**
- User must be authenticated. Visitor mode not supported.

**Sort order**
Server returns rounds newest-first. No client-side sort needed.

**Per-event resolution**
Each event in the rounds carries `resolution_type_id` — values are from
[GamePickResolutionType](../enumerations/GamePickResolutionType.md): `None` (0, not yet resolved), `Lost` (2),
`PartialWin` (3), `FullWin` (4). Use these to render result badges on
each event row.

**Error codes** (in `errCode`)
- `0` — success.
- `100002` — template not found.
- `100000` — auth hash invalid.
- `100004` — generic server error.

**Refresh**
- No cache.
- No push subscription. Re-call when the user opens the history tab.

**Visitor mode**: not supported.

**UI guidance**: see [UI Guide — `gamePickGetHistory`](../_media/UIGuide_gamePickGetHistory.md).

#### Example

```ts
const r = await window._smartico.api.gamePickGetHistory({ saw_template_id: 1083 });

for (const round of r.data ?? []) {
    console.log('[smartico] history row —', round.round_name, 'score:', round.user_score, 'resolved:', round.is_resolved);
}
```

***

### gamePickGetBoard()

> **gamePickGetBoard**(`props`): `Promise`\<[`GamesApiResponse`](../interfaces/GamesApiResponse.md)\<[`GamePickRoundBoard`](../interfaces/GamePickRoundBoard.md)\>\>

Returns the leaderboard for a MatchX or Quiz game round — ranked list of
players plus the current user's entry (`my_user`). Pass `round_id: -1` for
the season / overall leaderboard across every round in the template.

#### Parameters

##### props

[`GamePickRoundRequestParams`](../interfaces/GamePickRoundRequestParams.md)

#### Returns

`Promise`\<[`GamesApiResponse`](../interfaces/GamesApiResponse.md)\<[`GamePickRoundBoard`](../interfaces/GamePickRoundBoard.md)\>\>

Wrapped [GamesApiResponse](../interfaces/GamesApiResponse.md) of [GamePickRoundBoard](../interfaces/GamePickRoundBoard.md).

#### Remarks

**Preconditions**
- User must be authenticated. Visitor mode not supported.

**`round_id` semantics**
- Positive `round_id` — per-round leaderboard scoped to that round's events.
- `-1` — season / overall leaderboard aggregating scores across every round
  of the template.

**`my_user`**
The current user's entry is returned separately from the `users[]` array
— `my_user` may be `null` if the user has never made a prediction on this
round / template. Use it to render the user's rank in a sticky footer or
"you are here" highlight regardless of pagination.

**Username masking**
`public_username` on other players may be masked / anonymized by operator
label settings. Always pair with `avatar_url` so the user can recognize
themselves in the ranking by avatar even when usernames are hidden.

**Error codes** (in `errCode`)
- `0` — success.
- `100002` — template not found.
- `100000` — auth hash invalid.
- `100004` — generic server error.

**Refresh**
- No cache.
- No push subscription. Poll while the leaderboard is visible
  (every 30–60 s) if you want live rank updates after match
  resolution.

**Visitor mode**: not supported.

**UI guidance**: see [UI Guide — `gamePickGetBoard`](../_media/UIGuide_gamePickGetBoard.md).

#### Example

```ts
const r = await window._smartico.api.gamePickGetBoard({
    saw_template_id: 1083,
    round_id:        -1, // season leaderboard
});

if (r.errCode === 0 && r.data) {
    console.log('[smartico] render leaderboard rows for top', r.data.users.length, 'players');
    if (r.data.my_user) {
        console.log('[smartico] pin "you are rank #' + r.data.my_user.gp_position + '" footer to bottom');
    } else {
        console.log('[smartico] user not ranked — render "Play a round to join the leaderboard" CTA');
    }
}
```

***

### gamePickSubmitSelection()

> **gamePickSubmitSelection**(`props`): `Promise`\<[`GamesApiResponse`](../interfaces/GamesApiResponse.md)\<[`GamePickRound`](../interfaces/GamePickRound.md)\>\>

Submits all score predictions for a round in a MatchX game in one shot.
Each event in the round must carry `team1_user_selection` and
`team2_user_selection` (the predicted scores).

On the user's FIRST submit for a round, the server charges one buy-in (one
"spin" / one currency deduction based on the template's `saw_buyin_type_id`).
Subsequent edits within the same round are free and only persist changed
selections.

#### Parameters

##### props

[`GamePickRequestParams`](../interfaces/GamePickRequestParams.md) & `object`

#### Returns

`Promise`\<[`GamesApiResponse`](../interfaces/GamesApiResponse.md)\<[`GamePickRound`](../interfaces/GamePickRound.md)\>\>

Wrapped [GamesApiResponse](../interfaces/GamesApiResponse.md) with the updated round.

#### Remarks

**Preconditions**
- User must be authenticated. Visitor mode not supported.
- `saw_template_id` and `props.round.round_id` are mandatory — SDK throws if
  either is missing.
- Each event passed must include `gp_event_id` and the two
  `team{1,2}_user_selection` fields. Missing events default to "no change".

**Error codes** (in `errCode`)
- `0` — success; the response `data` is the updated round with
  `user_placed_bet === true` and `has_not_submitted_changes === false`.
- `3` (`NoBetsUpdatedOnSubmit`) — submit produced no changes, OR every event
  is past its `last_bet_date` deadline. The buy-in is NOT consumed; the
  current round is still returned in `data`.
- `4` — round / event not found; refresh state and retry.
- `100002` — template not found.
- `100000` — auth hash invalid.
- `100004` — generic server error.

Buy-in failures pass through the [SAWSpinErrorCode](../enumerations/SAWSpinErrorCode.md) values on first
submit:
- `40001` — no spins left (when `saw_buyin_type_id` is Spins).
- `40003` — insufficient points.
- `40004` — global max-spins cap hit.
- `40007` — template outside its active date window.
- `40009` — user excluded by segment rule.
- `40011` — insufficient gems.
- `40012` — insufficient diamonds.

**Idempotency**
Re-submitting identical selections returns `errCode: 3` (no changes); the
buy-in is consumed exactly once per round-per-user. Re-submitting after
`last_bet_date` also returns `errCode: 3` without consuming the buy-in.

**Side effects**
- First successful submit deducts the buy-in (Points / Gems / Diamonds /
  one Spin) per `saw_buyin_type_id`.
- Reports a `minigame_matchx_prediction` event to the operator's event log.
- Updates the round's participant counter (`users_cnt`) and per-event
  counters (`num_users`).
- Score is awarded after the operator resolves the round
  ([GPRoundStatus](../enumerations/GPRoundStatus.md) = `RoundResolved`).

**Visitor mode**: not supported.

**UI guidance**: see [UI Guide — `gamePickSubmitSelection`](../_media/UIGuide_gamePickSubmitSelection.md).

#### Example

```ts
const ar = await window._smartico.api.gamePickGetActiveRound({
    saw_template_id: 1190,
    round_id:        38665,
});
if (ar.errCode !== 0 || !ar.data) {
    console.error('[smartico] could not fetch round to submit — show error and bounce back');
    return;
}

const round = ar.data;
round.events = round.events.map(e => ({
    gp_event_id:          e.gp_event_id,
    team1_user_selection: 1,
    team2_user_selection: 0,
}));

const r = await window._smartico.api.gamePickSubmitSelection({
    saw_template_id: 1190,
    round,
});

switch (r.errCode) {
    case 0:
        console.log('[smartico] predictions saved — show confirmation, refresh leaderboard');
        break;
    case 3:
        console.log('[smartico] nothing changed (or all events closed) — silent no-op');
        break;
    case 40001:
    case 40003:
    case 40011:
    case 40012:
        console.error('[smartico] insufficient balance / spins — show top-up CTA:', r.errMessage);
        break;
    default:
        console.error('[smartico] submit failed — show generic error toast:', r.errMessage);
}
```

***

### gamePickSubmitSelectionQuiz()

> **gamePickSubmitSelectionQuiz**(`props`): `Promise`\<[`GamesApiResponse`](../interfaces/GamesApiResponse.md)\<[`GamePickRound`](../interfaces/GamePickRound.md)\>\>

Submits all quiz answers for a round in one shot. Each event in the round
must carry `user_selection` (the answer value — typically `"1"` / `"2"` /
`"x"` for 1×2 markets, `"yes"` / `"no"` for binary markets, or any
operator-defined string for custom markets).

Same first-submit buy-in behavior as [gamePickSubmitSelection](#gamepicksubmitselection) — one
buy-in is charged on the first successful submit; subsequent edits within
the same round are free.

#### Parameters

##### props

[`GamePickRequestParams`](../interfaces/GamePickRequestParams.md) & `object`

#### Returns

`Promise`\<[`GamesApiResponse`](../interfaces/GamesApiResponse.md)\<[`GamePickRound`](../interfaces/GamePickRound.md)\>\>

Wrapped [GamesApiResponse](../interfaces/GamesApiResponse.md) with the updated round.

#### Remarks

**Preconditions**
- User must be authenticated. Visitor mode not supported.
- `saw_template_id` and `props.round.round_id` are mandatory — SDK throws if
  either is missing.
- Each event must include `gp_event_id` and `user_selection`. Missing
  events default to "no change".

**Error codes** (in `errCode`)
- `0` — success.
- `3` (`NoBetsUpdatedOnSubmit`) — no changes, OR every event past
  `last_bet_date`. Buy-in NOT consumed; current round returned in `data`.
- `4` — round / event not found.
- `100002` — template not found.
- `100000` — auth hash invalid.
- `100004` — generic server error.

Buy-in failures use the same [SAWSpinErrorCode](../enumerations/SAWSpinErrorCode.md) pass-through values
as [gamePickSubmitSelection](#gamepicksubmitselection) — see that method's TSDoc for the
`40001` / `40003` / `40004` / `40007` / `40009` / `40011` / `40012`
semantics.

**Idempotency**: identical to [gamePickSubmitSelection](#gamepicksubmitselection) — re-submit
returns `errCode: 3` and never double-charges the buy-in.

**Side effects**: identical to [gamePickSubmitSelection](#gamepicksubmitselection), with the
reported event being `minigame_quiz_prediction` instead of
`minigame_matchx_prediction`.

**Visitor mode**: not supported.

**UI guidance**: see [UI Guide — `gamePickSubmitSelectionQuiz`](../_media/UIGuide_gamePickSubmitSelectionQuiz.md).

#### Example

```ts
const ar = await window._smartico.api.gamePickGetActiveRound({
    saw_template_id: 1183,
    round_id:        37974,
});
if (ar.errCode !== 0 || !ar.data) {
    console.error('[smartico] could not fetch round to submit answers — show error');
    return;
}

const round = ar.data;
round.events = round.events.map(e => ({
    gp_event_id:    e.gp_event_id,
    user_selection: 'x',
}));

const r = await window._smartico.api.gamePickSubmitSelectionQuiz({
    saw_template_id: 1183,
    round,
});

if (r.errCode === 0) {
    console.log('[smartico] quiz answers saved — show confirmation');
} else if (r.errCode === 3) {
    console.log('[smartico] nothing changed — silent no-op');
} else {
    console.error('[smartico] quiz submit failed:', r.errMessage);
}
```

***

### gamePickGetUserInfo()

> **gamePickGetUserInfo**(`props`): `Promise`\<[`GamesApiResponse`](../interfaces/GamesApiResponse.md)\<[`GamePickUserInfo`](../interfaces/GamePickUserInfo.md)\>\>

Returns the current user's profile within the Game Pick system — display
name, avatar, balances, and last wallet-sync timestamp. The Game Pick server
maintains its own user record that mirrors the user's Smartico balances; the
mirror is updated at most once per minute, so `last_wallet_sync_time` tells
the consumer how stale the balances on the response are.

On the user's first call for a given game, the Game Pick server lazily
provisions a user record — so this method doubles as a "register the user
with this game" call.

#### Parameters

##### props

[`GamePickRequestParams`](../interfaces/GamePickRequestParams.md)

#### Returns

`Promise`\<[`GamesApiResponse`](../interfaces/GamesApiResponse.md)\<[`GamePickUserInfo`](../interfaces/GamePickUserInfo.md)\>\>

Wrapped [GamesApiResponse](../interfaces/GamesApiResponse.md) of [GamePickUserInfo](../interfaces/GamePickUserInfo.md).

#### Remarks

**Preconditions**
- User must be authenticated. Visitor mode not supported.

**Balance freshness**
The balances returned here are the cached mirror — at most ~1 minute stale.
For an up-to-the-second view of Points / Gems / Diamonds, read from
[getUserProfile](WSAPIUser.md#getuserprofile) instead. Use this method's balances only for
in-Game-Pick display.

**Error codes** (in `errCode`)
- `0` — success.
- `100002` — template not found.
- `100000` — auth hash invalid.
- `100004` — generic server error.

**Refresh**
- No cache. Server-side mirror refreshes at most every 60 s.
- No push subscription.

**Visitor mode**: not supported.

**UI guidance**: see [UI Guide — `gamePickGetUserInfo`](../_media/UIGuide_gamePickGetUserInfo.md).

#### Example

```ts
const r = await window._smartico.api.gamePickGetUserInfo({ saw_template_id: 1083 });

if (r.errCode === 0 && r.data) {
    console.log('[smartico] render Game Pick header — name:', r.data.public_username, '— points:', r.data.ach_points_balance, '— synced:', r.data.last_wallet_sync_time);
}
```

***

### gamePickGetGameInfo()

> **gamePickGetGameInfo**(`props`): `Promise`\<[`GamesApiResponse`](../interfaces/GamesApiResponse.md)\<[`GamePickGameInfo`](../interfaces/GamePickGameInfo.md)\>\>

Returns the game template configuration plus a metadata listing of every
round (without events). Use to power the game's welcome / lobby screen —
shows the template name, buy-in cost, the user's remaining attempts, and
the full round list.

The `allRounds[]` here is a lightweight metadata-only view — to render
predictions or leaderboards, call [gamePickGetActiveRound](#gamepickgetactiveround) /
[gamePickGetActiveRounds](#gamepickgetactiverounds) / [gamePickGetBoard](#gamepickgetboard) for the rounds
the user actually opens.

#### Parameters

##### props

[`GamePickRequestParams`](../interfaces/GamePickRequestParams.md)

#### Returns

`Promise`\<[`GamesApiResponse`](../interfaces/GamesApiResponse.md)\<[`GamePickGameInfo`](../interfaces/GamePickGameInfo.md)\>\>

Wrapped [GamesApiResponse](../interfaces/GamesApiResponse.md) of [GamePickGameInfo](../interfaces/GamePickGameInfo.md).

#### Remarks

**Preconditions**
- User must be authenticated. Visitor mode not supported.

**Buy-in semantics**
The `sawTemplate.saw_buyin_type_id` value determines which currency is
deducted on the user's first prediction in any round:
- Free — no deduction.
- Points — `buyin_cost_points` deducted from the user's points balance.
- Gems — deducted from the user's gems balance.
- Diamonds — deducted from the user's diamonds balance.
- Spins — one spin counted from `spin_count`.

**Error codes** (in `errCode`)
- `0` — success.
- `100002` — template not found.
- `100000` — auth hash invalid.
- `100004` — generic server error.

**Refresh**
- No cache.
- No push subscription. Re-call after a successful
  [gamePickSubmitSelection](#gamepicksubmitselection) to refresh `spin_count`.

**Visitor mode**: not supported.

**UI guidance**: see [UI Guide — `gamePickGetGameInfo`](../_media/UIGuide_gamePickGetGameInfo.md).

#### Example

```ts
const r = await window._smartico.api.gamePickGetGameInfo({ saw_template_id: 1189 });

if (r.errCode === 0 && r.data) {
    console.log('[smartico] render Game Pick lobby — title:', r.data.sawTemplate.saw_template_ui_definition.name);
    console.log('[smartico] rounds available:', r.data.allRounds.length, '— buy-in type:', r.data.sawTemplate.saw_buyin_type_id, 'cost:', r.data.sawTemplate.buyin_cost_points);
}
```

***

### gamePickGetRoundInfoForUser()

> **gamePickGetRoundInfoForUser**(`props`): `Promise`\<[`GamesApiResponse`](../interfaces/GamesApiResponse.md)\<[`GamePickRound`](../interfaces/GamePickRound.md)\>\>

Returns a round with another player's predictions instead of the current
user's. The target player is identified by `int_user_id` (the Game Pick
system's internal user ID, obtained from [gamePickGetBoard](#gamepickgetboard)'s
`users[].int_user_id`).

Use to power "view this player's picks" affordances opened from leaderboard
rows — community / social inspection of how a top-ranked user predicted.

#### Parameters

##### props

[`GamePickRoundRequestParams`](../interfaces/GamePickRoundRequestParams.md) & `object`

#### Returns

`Promise`\<[`GamesApiResponse`](../interfaces/GamesApiResponse.md)\<[`GamePickRound`](../interfaces/GamePickRound.md)\>\>

Wrapped [GamesApiResponse](../interfaces/GamesApiResponse.md) with the target user's
[GamePickRound](../interfaces/GamePickRound.md).

#### Remarks

**Preconditions**
- User must be authenticated. Visitor mode not supported.
- `saw_template_id`, `round_id`, and `int_user_id` are all mandatory — SDK
  throws synchronously if any is missing.
- `int_user_id` must come from a leaderboard fetch in the same game
  template; it is stable within a template but not portable across
  templates.

**Shape vs `gamePickGetActiveRound`**
Same [GamePickRound](../interfaces/GamePickRound.md) structure, but `user_selection` /
`team1_user_selection` / `team2_user_selection` reflect the TARGET user's
predictions instead of the caller's. Each event still carries its own
`resolution_type_id` (see [GamePickResolutionType](../enumerations/GamePickResolutionType.md)) so the UI can
render result badges per pick.

**Error codes** (in `errCode`)
- `0` — success.
- `4` — round / event / user not found.
- `100002` — template not found.
- `100000` — auth hash invalid.
- `100004` — generic server error.

**Refresh**
- No cache. Re-call when opening a different leaderboard row's
  "view picks" modal.
- No push subscription.

**Visitor mode**: not supported.

**UI guidance**: see [UI Guide — `gamePickGetRoundInfoForUser`](../_media/UIGuide_gamePickGetRoundInfoForUser.md).

#### Example

```ts
const board = await window._smartico.api.gamePickGetBoard({
    saw_template_id: 1083, round_id: 31652,
});
const topPlayer = board.data?.users?.[0];
if (!topPlayer) return;

const r = await window._smartico.api.gamePickGetRoundInfoForUser({
    saw_template_id: 1083,
    round_id:        31652,
    int_user_id:     topPlayer.int_user_id,
});

if (r.errCode === 0 && r.data) {
    for (const ev of r.data.events) {
        console.log('[smartico] render row —', ev.event_meta.team1_name, 'vs', ev.event_meta.team2_name, '— picked:', ev.user_selection, '— resolution:', ev.resolution_type_id);
    }
}
```

***
