# The `_smartico` object — core methods

The global `_smartico` object is the entry point to the SDK. It has three
surfaces:

- **Core methods** (this document) — `init`, identify, language, deep links,
  embedding widgets, push, etc. These are top-level calls: `_smartico.<method>(...)`.
- **`_smartico.api.*`** — the gamification data/mutation API (missions, store,
  jackpots, …). See the API reference.
- **`_smartico.on(...)`** — lifecycle/engagement event callbacks. See the Event
  callbacks reference (`docs/Callbacks.md`).

## Two ways to call

```js
// Direct form — after smartico.js has loaded.
_smartico.init('LABEL_API_KEY');

// Queue form — safe to call BEFORE the library finishes loading. Calls are
// queued and replayed once the script is ready. Use this in your page <head>.
_smartico('init', 'LABEL_API_KEY');
_smartico('on', 'identify', () => { /* ... */ });
```

The standard integration snippet (see
https://help.smartico.ai/welcome/technical-guides/front-end-integration)
defines `_smartico` as a queue function, then loads the library which drains
the queue. Both forms map to the same methods.

---

## Setup & identity

### `init(label_api_key, params?)`

Initializes the library for a label. Must be called once before anything else.

- **Idempotent** — calling `init` again with the same label key is a no-op.
  Calling it with a **different** label key (or after visitor mode) tears down
  and re-initializes.
- Fires the `init` callback (~immediately after setup; see the Event callbacks
  reference).
- `params` is optional configuration. Common fields: `brand_key` (string),
  `lang` (default `'EN'`), `visitor_mode` (boolean), `debug` (boolean).

```js
_smartico('init', 'YOUR_LABEL_API_KEY', { brand_key: 'main', lang: 'EN' });
```

### `initVisitorMode(label_api_key, params?)`

Shorthand for `init(label_api_key, { ...params, visitor_mode: true })` —
enables visitor (unauthenticated) features. See the "Visitor mode" section
in the project README and use `_smartico.vapi(lang)` for visitor data calls.

### `online(ext_user_id, language, user_hash, payload?)`

Identifies (logs in) a user. This is the recommended single call to attach a
real user to the session — it identifies the user, clears any cached data from
a previous session, and applies the language in one step.

- `ext_user_id` — the operator's user id. Required (throws if empty).
- `language` — 2-letter language code; applied via `changeLanguage`.
- `user_hash` — the server-issued authentication hash for the user.
- Fires the `identify` callback (success or failure) and, on success, the
  `login` callback. After it resolves, `_smartico.api.*` calls act on behalf
  of this user.

```js
_smartico('online', 'user-123', 'EN', 'SERVER_ISSUED_HASH');
```

**Login-event window**: the `login` event is generated when a new session
starts. Within ~30 minutes, page refreshes / navigations do NOT re-trigger
`login`. If the user logs out on your site you MUST call `_smartico.logout()`
explicitly — otherwise a subsequent login within the 30-minute window won't
re-trigger `login`.

### Identifying via global variables (alternative)

Instead of calling `online` / `identify`, you can set the user identity through
globals before the library initializes — the SDK reads them on init:

```html
<script>
  window._smartico_user_id = 'some_id';
  window._smartico_language = 'fr';
  // Optional but recommended when ext ids are guessable — see hash note below.
  window._smartico_user_hash = '019b370929095f0cfe6c9b02ea7524a2:1638050700000';
</script>
```

**Hash protection**: when `ext_user_id` is guessable (sequential number,
username, …), pass a `user_hash` so a third party can't impersonate a user.
The hash is `md5( (ext_user_id + ':' + salt_key + ':' + validity_ts_ms).toLowerCase() ) + ':' + validity_ts_ms`,
**computed server-side**. The salt key is issued by your Smartico Success
Manager and must be kept secret.

### `identify(ext_user_id, hash, payload?)` · `login(language?, payload?)`

The older identify/login pair. `identify` attaches the user; `login` sets the
login payload and (optionally) the language. Both are being consolidated into
`online(...)` — prefer `online` for new integrations. `identify` throws if
`ext_user_id` is empty.

### `logout(payload?)`

Logs the current user out, forgets the session, and reconnects as anonymous.
Fires the `logout` callback on success.

### `checkSuccessfullyIdentify()`

Returns `true` once the SDK is initialized **and** a user has been
successfully identified, `false` otherwise. Use it as a synchronous gate
before calling user-scoped `_smartico.api.*` methods (e.g. `getUserProfile()`),
as an alternative to waiting on the `identify` callback. Returns `false` in
visitor mode.

### `changeLanguage(language)`

Switches the active language. The code is normalized to a 2-letter form
(`en-US` → `en`). Changing the language clears the SDK data caches so
subsequent `_smartico.api.*` calls return content in the new language. Throws
if `language` is missing.

### `clear(params?)`

Tears down the tracker, clears caches and timers, and forgets the session.
Used when fully resetting the SDK (rarely needed directly — `init` with a new
label key calls this for you).

---

## User profile

### `getPublicProps()`

Returns a synchronous snapshot of the user's current public properties, or
`null` if the SDK isn't initialized yet. For live updates, subscribe to the
`props_change` event (see the Event callbacks reference). For the rich typed
profile, use `_smartico.api.getUserProfile()`.

Commonly-used properties:

| Property | Meaning |
|---|---|
| `avatar_id` | Avatar image URL |
| `ach_points_balance` / `ach_gems_balance` / `ach_diamonds_balance` | Current currency balances |
| `ach_points_ever` | Lifetime points earned |
| `ach_level_current` | Current level name |
| `core_inbox_unread_count` | Unread inbox messages |
| `core_public_tags` | Array of upper-cased user tags (see `updatePublicTags`) |
| `ach_gamification_in_control_group` | `true` when gamification is DISABLED for this user (control group) |
| `core_registration_date` | Set once the server-side profile is ready |

**Control group**: use `ach_gamification_in_control_group` to hide your
gamification entry points for users gamification is disabled for. Keep the
entry hidden by default and reveal it only when the flag is `false`:

```js
_smartico.on('props_change', (props) => {
  if (props.ach_gamification_in_control_group !== undefined) {
    const btn = document.getElementById('rewards-btn');
    btn.style.display = props.ach_gamification_in_control_group ? 'none' : 'block';
  }
});
```

### `setNickname(nickname)`

Sets the user's public display name.

### `setAvatar(avatar_id)`

Sets the user's avatar — pass the URL of a PNG with a 1:1 (square) proportion.
For the full avatar catalog / AI-customization flow, use the `_smartico.api`
avatar methods instead.

```js
_smartico.setAvatar('https://somesite.com/avatar.png');
```

### `setSkin(skin_name)`

Switches the gamification widget's visual skin (e.g. `'v3_base_dark'`,
`'v3_base_vip'`). Useful for matching a day/night site theme, or for giving
specific users a special skin:

```js
_smartico.on('props_change', (props) => {
  if (props.ach_level_current === 5) {
    _smartico.setSkin('v3_base_vip');
  }
});
```

### `updatePublicTags(operation, tags?)`

Mutates the user's public tags. `operation` is one of `'add'`, `'remove'`,
`'replace'`, `'clear'`. Tags can also be set server-side from campaigns /
automation rules, and read on the client via `props.core_public_tags` (an
array of upper-cased tag strings) on the `props_change` event.

```js
_smartico.updatePublicTags('add', ['A', 'B']);   // add A & B
_smartico.updatePublicTags('remove', ['A']);     // remove A
_smartico.updatePublicTags('replace', ['C', 'D']); // replace all with C & D
_smartico.updatePublicTags('clear');             // clear all
```

### `setUTMs(core_utm_source, core_utm_campaign)`

Attaches UTM attribution to the user's profile.

---

## Deep links & embedding the gamification UI

### `dp(deepLink)`

Executes a **deep link** — the primary way to open Smartico gamification
surfaces from your own UI (buttons, menu entries, etc.). Pass a deep-link
string such as:

| Deep link | Opens |
|---|---|
| `dp:gf` | Gamification main widget |
| `dp:gf_missions` | Missions screen |
| `dp:gf_badges` | Badges screen |
| `dp:gf_store` | Store screen |
| `dp:gf_tournaments` | Tournaments screen |
| `dp:gf_board` | Leaderboard |
| `dp:gf_bonuses` | Bonuses screen |
| `dp:inbox` | Inbox |

```js
// Open the gamification hub when the user taps your "Rewards" button.
document.querySelector('#rewards-btn').addEventListener('click', () => {
  _smartico.dp('dp:gf');
});
```

Works for identified users, and for visitors when visitor mode is enabled.
If called before the user is ready, it logs a console error and no-ops.

Special deep links beyond the gamification screens include
`dp:ask_push_permissions` (trigger the browser push-permission dialog) and
`dp:action&action=YOUR_ACTION` (fire a named client action).

**Triggering a deep link from a URL**: pass a URL-encoded deep link in the
page URL hash as `_smartico_dp=...` and the SDK executes it automatically
after the user is identified — handy for triggering a campaign when a user
lands on a specific page:

```text
https://mycasino.com/deposit.html#_smartico_dp=dp%3Aaction%26action%3DDEPOSIT_OPENED
```

### `miniGame(saw_template_id, params?, pending_message_id?)`

Opens a specific mini-game (Spin-a-Wheel / lootbox / etc.) by its template id.
Requires an identified user — for mini-games on landing pages to visitors, use
`showVisitorGame` instead.

### `showWidget(widgetType, params?)`

Embeds a pre-built Smartico widget. `widgetType` is one of:

`'achievements'`, `'short_info'`, `'tournaments'`, `'store'`, `'inbox'`,
`'missions'`, `'mini-game'`, `'match-x-2'`, `'quiz'`, `'custom-section'`,
`'inbox-widget'`, `'ui-widget'`, `'liquid'`.

`params` controls embedding (e.g. `iframe` target element id, `height`,
`theme`, `inline`, `force_mobile`). Requires an identified user.

### `gamificationBlock({ dom_id, url })`

Mounts a Smartico landing-page widget bundle (built in the LP IDE) into a host
element on your page. `dom_id` is the id of the container; `url` is the
absolute URL of the published `widget.js`. Re-calling with the same `dom_id`
cleanly remounts (the previous widget is torn down first). Requires `init`
to have run.

### `showBanner({ dom_id, placement_key })` · `sendDataToBanner({ placement_key, data })`

Renders an operator-configured banner into a host element, and pushes runtime
data into a rendered banner placement.

### `suspendPopups(flag)` · `suspendInbox(flag)` · `suspendMiniGames(flag)`

Temporarily suppress (or re-enable) automatically-triggered surfaces — popups,
inbox prompts, and server-triggered mini-game pop-ups respectively. Pass `true`
to suspend, `false` to resume. Useful while the user is mid-flow (e.g. on a
deposit page or completing a KYC form) and you don't want Smartico surfaces
interrupting. Require an identified user.

```js
_smartico.suspendPopups(true);   // on a checkout page
// ...later...
_smartico.suspendPopups(false);  // back to a safe screen
```

When suspension is turned off, the first surface that was missed while
suspended is shown — provided the session is still active (the user hasn't
refreshed or navigated away).

---

## Events & analytics

### `event(eventType, payload?)`

Sends a client event to Smartico (drives automation rules, missions, etc.).

### `action(actionValue, extraPayload?)`

Sends a named client action — a lightweight event keyed by an action string,
with optional custom payload you can evaluate later in journeys / automation
rules / missions.

```js
_smartico.action('CashierSubmitClicked');
_smartico.action('PIGGY-BANK-CLICK', { prize: 'ABC' });
```

### `setLoginEntry(core_last_login_entry)`

Records the entry point / context of the user's current login (e.g.
`'LOBBY'`, `'MOBILE_APP'`) so you can segment / react by it. Any string is
accepted, but a label is limited to 50 distinct entry-point values.

```js
_smartico.setLoginEntry('LOBBY');
```

### `sendAnalytics(activity_id, view_time_sec?)`

Reports a screen/activity impression for analytics.

### `on(key, handler, params?)` · `off(key, handler)`

Subscribe / unsubscribe to lifecycle and engagement events (`identify`,
`props_change`, `mini_game_win`, `jackpot_win`, …). Registered handlers fire in
both authenticated and visitor mode. See the **Event callbacks reference**
(`docs/Callbacks.md`) for the full event list and handler arguments.

---

## Push notifications

### `requestPushPermissions()`

Prompts the user for web-push permission and registers the subscription. Works
for an identified user OR an anonymous visitor — the push token is registered
automatically on the Smartico side once the user is identified. Can also be
triggered as a deep link: `_smartico.dp('dp:ask_push_permissions')`.

### `registerNativePushToken(token, platform?, app_package_id?)`

Registers a native (mobile app) push token for the identified user.

---

## Visitor games

### `showVisitorGame(params)`

Plays a mini-game for an unidentified visitor (visitor mode must be enabled).
`params`: `{ template_id, frame_id, onBeforePlay, onWin }` — `onBeforePlay`
returns a boolean to gate the play; `onWin(prize)` receives the won prize.

### `convertVisitorGame(visitor_win_uuid)`

Attaches a visitor's win to a now-identified account — call after the visitor
registers / logs in, passing the `visitor_win_uuid` from the visitor win (also
delivered on the `mini_game_win` event).

---

## Data API access

### `api`

The gamification data/mutation API object — `_smartico.api.getMissions()`,
`_smartico.api.buyStoreItem(...)`, etc. Available once the user is identified.
See the API reference for the full method catalogue.

### `vapi(language)`

Returns a visitor-mode data API object for the given language —
`_smartico.vapi('EN').getLevels()`. Use when running in visitor mode. Returns
`null` if the SDK isn't initialized.

---

## Utilities

### `isMobile()`

Returns `true` on mobile user agents.

### `parseUrl()` · `parseUrlHash()`

Parse the current page URL / URL hash into an object (helpers for reading
query / hash parameters).

### `sendServerError(message)` · `sendServerDebug(message)`

Forward a client-side message to Smartico's servers for support correlation —
`sendServerError` for error conditions, `sendServerDebug` for diagnostic
detail. Useful when reporting an integration issue so the message lands
alongside your session server-side. No-ops if the SDK isn't initialized.

---

## Setup notes

### IFrame bridge (B2B)

When the integrated platform is loaded inside an iframe and is NOT the owner of
the main window, the host (main-window) site loads only `smartico.js` without
initializing, and the iframe loads `smartico_inframe.js` and makes the same
calls against a **`_smartico_inframe`** object instead of `_smartico`:

```html
<script>
  (function(d,r,b,h,s){h=d.getElementsByTagName('head')[0];s=d.createElement('script');s.onload=b;s.src=r;h.appendChild(s);})
  (document, 'https://libs.smartico.ai/smartico_inframe.js', function() {
    _smartico_inframe.init('__your_label_key', { brand_key: '__your_brand_key__' });
    _smartico_inframe.online('some_user_id', 'fr');
    _smartico_inframe.dp('dp:gf');
  });
</script>
```

Contact your Customer Success Manager to confirm whether your setup needs this.

### Local development

By default the SDK refuses to run on `localhost` (to avoid creating "phantom"
users from dev/QA environments). To run against a real/production user during
local development:

```js
window._smartico_allow_localhost = true;
```

## Notes

- Most methods require `init` to have completed; calls made too early log a
  console error and no-op rather than throwing (except `online` / `identify`,
  which throw on an empty `ext_user_id`, and `changeLanguage`, which throws on
  a missing language).
- Client events (`event` / `action`) travel over a public, untrusted channel —
  use them only for non-sensitive signals (screen views, clicks). Custom events
  must be registered with your Customer Success Manager before use.
- The method argument shapes above reflect current behavior; treat optional
  `params` objects defensively as they can gain fields over time.
- For runnable, copy-pasteable widget code built on `_smartico.api.*`, see
  [expo.smartico.ai](https://expo.smartico.ai/widgets/intro).
