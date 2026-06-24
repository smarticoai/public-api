# _smartico — global SDK surface (non-`.api.*`)

> The `window._smartico` control surface: init/identify, events, deep links, widgets, visitor-mode `vapi`, push, and utilities — everything that is NOT `_smartico.api.*` (those have their own capability pages).
> Import: typed via `SmarticoGlobal` from '@smartico/public-api'; at runtime the object is on `window._smartico` (no import).
> Search terms: api, vapi, checkSuccessfullyIdentify, init, initVisitorMode, identify, online, login, logout, clear, changeLanguage, on, off, dp, showWidget, miniGame, showBanner, sendDataToBanner, gamificationBlock, getPublicProps, updatePublicTags, setUTMs, setLoginEntry, setAvatar, setNickname, setSkin, requestPushPermissions, registerNativePushToken, event, action, sendServerError, sendServerDebug, suspendPopups, suspendInbox, suspendMiniGames, showVisitorGame, convertVisitorGame, startLpAnalytics, sendAnalytics, isMobile, parseUrl, parseUrlHash, _smartico, global, window._smartico, SmarticoGlobal, visitor mode, callbacks, events, onWin, onReady, deep link, getWidgetParams, IWidgetParams, widget params, readiness, lifecycle, push

## Readiness gate
Call `window._smartico?.checkSuccessfullyIdentify()` (synchronous) before any `_smartico.api.*` — `true` once init + identify completed. Or subscribe `_smartico.on('identify', cb)` (see the callbacks page).

## Methods
- `_smartico.api: WSAPI` — The authenticated WebSocket API surface (`_smartico.api.*`). Available once the SDK has initialized and identified the user — gate calls on `SmarticoGlobal.checkSuccessfullyIdentify`.
- `_smartico.vapi(language: string): WSAPI` — Visitor-mode (unauthenticated) API surface for the given language. Returns a `WSAPI` scoped to anonymous visitors.
- `_smartico.checkSuccessfullyIdentify(): boolean` — `true` once the SDK is initialized **and** the user has been successfully identified. Use as a synchronous gate before calling any `api.*` method.
- `_smartico.init(labelApiKey: string, params?: SmarticoInitParams): void` — Initialize the SDK for an identified integration.
- `_smartico.initVisitorMode(labelApiKey: string, params?: SmarticoInitParams): void` — Initialize the SDK in visitor (anonymous) mode.
- `_smartico.identify(extUserId: string, hash: string, payload?: Record<string, unknown>): Promise<void>` — Identify the current user against the label.
- `_smartico.online(extUserId: string, language: string, userHash: string, payload?: Record<string, unknown>): Promise<void>` — Mark an identified user as online for the given language.
- `_smartico.login(language?: string, payload?: Record<string, unknown>): void` — Re-run the login flow for the current session.
- `_smartico.logout(payload?: Record<string, unknown>): void` — Log the current user out of the SDK session.
- `_smartico.clear(params?: Record<string, unknown>): void` — Clear SDK state/cookies.
- `_smartico.changeLanguage(language: string): void` — Switch the active UI language.
- `_smartico.on(event: string, cb: null | ((...args: any[]) => void), params?: Record<string, unknown>): void` — Subscribe to a lifecycle/engagement callback. Pass `null` as the handler to unsubscribe. See the callbacks reference for available keys.
- `_smartico.off(event: string, cb: null | ((...args: any[]) => void)): void` — Remove a previously registered callback.
- `_smartico.dp(deepLink: string): void` — Trigger a Smartico deep link.
- `_smartico.showWidget(widgetType: SmarticoWidgetType, params?: SmarticoWidgetParams): void` — Open a Smartico widget overlay/inline.
- `_smartico.miniGame(sawTemplateId: string, params: SmarticoWidgetParams, pendingMessageId?: string | number): void` — Open a mini-game widget for the given template.
- `_smartico.showBanner(params: { dom_id: string; placement_key: string }): void` — Render a banner into a host element.
- `_smartico.sendDataToBanner(params: { placement_key: string; data: Record<string, unknown> }): void` — Push data into an already-rendered banner.
- `_smartico.gamificationBlock(params: { dom_id: string; url: string; fit?: 'content' | 'fill' }): void` — Embed the gamification block into a host element.
- `_smartico.getPublicProps(): PublicProperties` — Snapshot of the user's public gamification properties.
- `_smartico.updatePublicTags(operation: 'add' | 'remove' | 'replace' | 'clear', tags?: string[]): void` — Add/remove/replace/clear the user's public tags.
- `_smartico.setUTMs(source: string, campaign: string): void` — Set UTM attribution for the session.
- `_smartico.setLoginEntry(entry: string): void` — Record the last login entry point.
- `_smartico.setAvatar(avatarId: string): void` — Set the user's avatar.
- `_smartico.setNickname(nickname: string): void` — Set the user's nickname.
- `_smartico.setSkin(skinName: string): void` — Set the active UI skin.
- `_smartico.requestPushPermissions(): void` — Prompt the browser for web-push permission.
- `_smartico.registerNativePushToken(token: string, platform?: number, appPackageId?: string): void` — Register a native push token (mobile webviews).
- `_smartico.event(eventType: string, payload?: Record<string, unknown>): void` — Send a client event.
- `_smartico.action(actionValue: unknown, extraPayload?: Record<string, unknown>): void` — Send a client action.
- `_smartico.sendServerError(message: string): void` — Report a client-side error to the server.
- `_smartico.sendServerDebug(message: string): void` — Send a client-side debug message to the server.
- `_smartico.suspendPopups(flag: boolean): void` — Temporarily suspend/resume automatic popups.
- `_smartico.suspendInbox(flag: boolean): void` — Temporarily suspend/resume the inbox.
- `_smartico.suspendMiniGames(flag: boolean): void` — Temporarily suspend/resume mini-games.
- `_smartico.showVisitorGame(params: Record<string, unknown>): void` — Show a visitor-mode game.
- `_smartico.convertVisitorGame(visitorWinUuid: string): void` — Convert a visitor-mode win into an identified reward.
- `_smartico.startLpAnalytics(params: { lp_template_uuid: string; shadow_root?: ShadowRoot | null }): void` — Start landing-page analytics for a template.
- `_smartico.sendAnalytics(activityId: number, viewTimeSec?: number): void` — Send a landing-page analytics activity.
- `_smartico.isMobile(): boolean` — `true` on mobile viewports.
- `_smartico.parseUrl(): Record<string, string>` — Parse the current URL query into a map.
- `_smartico.parseUrlHash(): Record<string, string>` — Parse the current URL hash into a map.

## Visitor mode (`vapi`)
`_smartico.vapi(language)` returns a `WSAPI` scoped to anonymous visitors — same method shapes as `_smartico.api.*`, for unidentified users (pre-login surfaces).

## Reading widget params
A widget embedded via `showWidget` / `miniGame` receives `IWidgetParams` (theme, height, inline, …). Read them from the embedding snippet / `window.__SMARTICO_LP_PARAMS__`, not from an API call.

## Related
- `_smartico.on — events & callbacks` (the callbacks capability page)
- Full prose reference: the SmarticoObject doc (search source `api-raw`).