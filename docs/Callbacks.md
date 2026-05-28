# Event callbacks — `_smartico.on(...)`

Beyond the request/response `_smartico.api.*` methods, the SDK emits **lifecycle
and engagement events** you can subscribe to. Register a handler with
`_smartico.on(...)` and it fires whenever that event occurs — user identified,
balance changed, gamification widget opened, mini-game won, jackpot hit, etc.

This is the push side of the SDK: instead of polling, you react to events as
they happen.

## Registering and removing handlers

```js
// Subscribe (works after smartico.js has loaded)
_smartico.on('identify', (errCode, props) => {
  console.log('[smartico] user identified — render the logged-in UI');
});

// The queue form also works BEFORE the library finishes loading — the call
// is queued and replayed once smartico.js is ready. Use this when wiring
// handlers in your page <head> before the script loads.
_smartico('on', 'identify', (errCode, props) => { /* ... */ });

// Remove a specific handler
function onProps(props) { /* ... */ }
_smartico.on('props_change', onProps);
_smartico.off('props_change', onProps);

// Passing null removes ALL handlers registered for that key
_smartico.on('props_change', null);
```

### Behavior

- **Multiple handlers per event stack.** Calling `on` repeatedly for the same
  key adds handlers; they all fire. Use `off(key, fn)` to remove one, or
  `on(key, null)` to clear all for that key.
- **Handlers fire asynchronously** (on the next tick) and are isolated — a
  handler that throws logs a warning and does NOT prevent the other handlers
  (or the SDK) from running. Don't rely on execution order between handlers.
- **Works in both authenticated and visitor mode.** A handler registered via
  `_smartico.on(...)` is active whether the session is a logged-in user or a
  visitor (`_smartico.vapi(...)`). Events that require an account (`identify`,
  `login`, `logout`) simply never fire in visitor mode — see the per-event
  notes below.
- **Late subscription misses past events.** `on` does not replay events that
  already happened. If you subscribe to `init` after the library has already
  initialized, your handler won't be called. For one-time lifecycle events
  (`init`, `identify`), register early (use the `_smartico('on', ...)` queue
  form in your page head).

## Event reference

The first argument of `_smartico.on(...)` is the event key — one of the
strings below.

### Lifecycle

| Event key | Fires when | Handler arguments |
|---|---|---|
| `init` | The SDK has finished loading and initializing. Fires shortly after `_smartico.init(...)`, **before** the user is identified. | `(errCode)` — `0` on success |
| `label_init_completed` | The label configuration / settings have loaded (the handshake that follows `init`). At this point gamification products are known. | `(errCode, message)` |
| `identify` | A user identify attempt completes — **both success and failure**. Branch on `errCode`. | `(errCode, props, message)` on success; `(errCode, {})` on failure. Not fired in visitor mode. |
| `login` | A login completes successfully. | `()` — no arguments. Not fired in visitor mode. |
| `logout` | A logout completes successfully. | `()` — no arguments. Not fired in visitor mode. |

### User state

| Event key | Fires when | Handler arguments |
|---|---|---|
| `props_change` | Any public user property changes — points, level, balances (gems/diamonds), avatar, unread inbox count, nickname, etc. Fires once right after identify with the full initial set, then again on each change with the changed subset. | `(props)` — a partial public-properties object containing the changed fields. `avatar_id` is returned as a fully-qualified URL. |
| `page_navigation` | A page load or SPA route change is detected. | `({ url, prev_url, referrer, source })` — `source` is `'load'` (initial page load) or the navigation trigger. |
| `session_based_dp_detected` | A deep link stored earlier in the browser session is detected after identify (and is about to be executed). | `()` — no arguments. |

### Gamification widget lifecycle

| Event key | Fires when | Handler arguments |
|---|---|---|
| `gf_starting` | The main gamification widget begins opening (e.g. the user taps the gamification entry point or a deep link opens it). | `()` |
| `gf_started` | The gamification widget has rendered and is displayed to the user. Fires after `gf_starting`. | `()` |
| `gf_closing` | The gamification widget (or a standalone mini-game) begins closing. | `()` |
| `saw_starting` | A standalone mini-game surface (Spin-a-Wheel / MatchX / Quiz) begins opening. | `()` |
| `inbox_starting` | The standalone inbox widget begins opening. | `()` |
| `gf_ux` | A screen-view / UX analytics event occurs inside the gamification widget (the user navigates to a screen or section). Use to mirror in-widget navigation into your own analytics. | `({ screen_name_id, custom_section_id, entity_id, screen_subname_id })` |

### Wins and game launches

| Event key | Fires when | Handler arguments |
|---|---|---|
| `mini_game_win` | A mini-game spin finishes and a prize is determined. Fires for both real and visitor-mode plays. | `({ prize_id, name, visitor_win_uuid })` — `name` is the prize display name. In visitor mode, `visitor_win_uuid` can be passed to `_smartico.convertVisitorGame(uuid)` to attach the win to a real account on registration. |
| `jackpot_win` | A jackpot the user participates in is hit (the pot explodes and the user is among the recipients). | `(message)` — the win payload (winner details + jackpot info). See the Jackpots UI guide (`docs/ui/jackpots/`) for how the default Smartico UI surfaces wins. |
| `ach_game_opening` | The user taps a related / eligible casino game tile from inside the gamification widget (mission, tournament, jackpot, or store context). Use this to launch the game in your own casino lobby. | `(game)` — the game object (catalog id, name, launch links, plus a `context` field naming where it was opened from). If you do not handle this event, the default Smartico UI opens the game's configured link itself. |

### Errors

| Event key | Fires when | Handler arguments |
|---|---|---|
| `protocol_error` | The server rejected a request as an unsupported command (a protocol-level error, distinct from a method's `err_code`). | `({ errCode, errMsg })` |

## Examples

### Keep a balance widget live

```js
// Render once on identify, then patch on every change.
_smartico.on('identify', (errCode, props) => {
  if (errCode === 0) {
    console.log('[smartico] initial balance — render widget:', props.ach_points_balance);
  } else {
    console.error('[smartico] identify failed — show logged-out state');
  }
});

_smartico.on('props_change', (props) => {
  if (props.ach_points_balance !== undefined) {
    console.log('[smartico] points changed — update the balance widget:', props.ach_points_balance);
  }
  if (props.core_inbox_unread_count !== undefined) {
    console.log('[smartico] unread count changed — update the inbox badge:', props.core_inbox_unread_count);
  }
});
```

### React to a mini-game win

```js
_smartico.on('mini_game_win', ({ prize_id, name, visitor_win_uuid }) => {
  console.log('[smartico] user won prize', prize_id, '—', name, '— show your own celebration overlay');

  if (visitor_win_uuid) {
    console.log('[smartico] visitor win — after the user registers, call _smartico.convertVisitorGame to attach this win');
  }
});
```

### Launch casino games from the gamification widget yourself

```js
// Take over game launching so games open in your lobby instead of the
// default link-open behavior.
_smartico.on('ach_game_opening', (game) => {
  console.log('[smartico] user wants to play game — launch it in your lobby:', game.ext_game_id, '(context:', game.context + ')');
});
```

### Mirror in-widget navigation into your analytics

```js
_smartico.on('gf_ux', ({ screen_name_id, custom_section_id, entity_id }) => {
  console.log('[smartico] gamification screen view — forward to your analytics:', screen_name_id, custom_section_id, entity_id);
});
```

## Notes

- The handler argument shapes above describe what the SDK passes today. Treat
  unfamiliar fields defensively (optional-chain / null-check) — payloads can
  gain fields over time.
- For request/response data (the current list of missions, the user profile,
  the jackpot pots, etc.), use the `_smartico.api.*` methods (see the API
  reference). Callbacks are for reacting to events; the API methods are for
  fetching and mutating state.
