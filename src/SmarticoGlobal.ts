import type { WSAPI } from './WSAPI/WSAPI';
import type { PublicProperties } from './Core/PublicProperties';

/**
 * Type-only module. Contains no runtime code — interfaces, type aliases and the
 * `declare global` augmentation below all compile to **nothing**, so importing
 * `@smartico/public-api` for these types adds zero bytes to a consumer bundle.
 *
 * It exists so that any TypeScript app embedding the Smartico SDK gets the global
 * `window._smartico` object fully typed *without hand-redeclaring it*. The two
 * heaviest members — `api` and `vapi` — resolve to the real {@link WSAPI} class
 * exported by this same package, so they can never drift out of sync with the SDK
 * the way a hand-copied subset does.
 *
 * The `_smartico` object itself is implemented in the tracker bundle
 * (`window._smartico`) and is loaded on the page by the Smartico embed snippet.
 * This file only describes its *shape*; it does not provide an implementation.
 *
 * @document docs/SmarticoObject.md
 */

/**
 * Widget kinds accepted by {@link SmarticoGlobal.showWidget}. Mirrors the widget
 * set the SDK supports; values are stable string identifiers.
 */
export type SmarticoWidgetType =
	| 'achievements'
	| 'short_info'
	| 'tournaments'
	| 'store'
	| 'inbox'
	| 'missions'
	| 'mini-game'
	| 'match-x-2'
	| 'quiz'
	| 'custom-section'
	| 'inbox-widget'
	| 'ui-widget'
	| 'liquid';

/** Presentation options for {@link SmarticoGlobal.showWidget} / {@link SmarticoGlobal.miniGame}. */
export interface SmarticoWidgetParams {
	/** Theme name to render the widget with. */
	theme?: string;
	/** `'auto'` to size to content, or an explicit CSS height. */
	height?: 'auto' | string;
	/** Render inline instead of as an overlay. */
	inline?: boolean;
	/** Zoom factor applied to the widget iframe. */
	zoom?: number;
	/** Force the mobile layout regardless of viewport. */
	force_mobile?: boolean;
}

/**
 * Options passed to {@link SmarticoGlobal.init} / {@link SmarticoGlobal.initVisitorMode}.
 * All fields are optional; only `brand_key` is commonly set.
 */
export interface SmarticoInitParams {
	/** Brand key for multi-brand labels. */
	brand_key?: string | null;
	/** Enable verbose SDK logging. */
	debug?: boolean;
	/** Initial UI language (e.g. `'EN'`). */
	lang?: string;
	/** Override the SDK WebSocket endpoint. */
	ws_url?: string | null;
	/** Allow additional forward-compatible init options. */
	[key: string]: unknown;
}

/**
 * The global `_smartico` object exposed by the Smartico embed on `window`.
 *
 * `api` and `vapi` are the {@link WSAPI} surface documented across this package's
 * API reference; every other member is a core SDK control method implemented in
 * the tracker bundle (see the `_smartico` object reference doc).
 *
 * @document docs/SmarticoObject.md
 */
export interface SmarticoGlobal {
	/**
	 * The authenticated WebSocket API surface (`_smartico.api.*`). Available once
	 * the SDK has initialized and identified the user — gate calls on
	 * {@link SmarticoGlobal.checkSuccessfullyIdentify}.
	 */
	api: WSAPI;

	/**
	 * Visitor-mode (unauthenticated) API surface for the given language. Returns a
	 * {@link WSAPI} scoped to anonymous visitors.
	 */
	vapi(language: string): WSAPI;

	/**
	 * `true` once the SDK is initialized **and** the user has been successfully
	 * identified. Use as a synchronous gate before calling any `api.*` method.
	 */
	checkSuccessfullyIdentify(): boolean;

	/** Initialize the SDK for an identified integration. */
	init(labelApiKey: string, params?: SmarticoInitParams): void;
	/** Initialize the SDK in visitor (anonymous) mode. */
	initVisitorMode(labelApiKey: string, params?: SmarticoInitParams): void;
	/** Identify the current user against the label. */
	identify(extUserId: string, hash: string, payload?: Record<string, unknown>): Promise<void>;
	/** Mark an identified user as online for the given language. */
	online(extUserId: string, language: string, userHash: string, payload?: Record<string, unknown>): Promise<void>;
	/** Re-run the login flow for the current session. */
	login(language?: string, payload?: Record<string, unknown>): void;
	/** Log the current user out of the SDK session. */
	logout(payload?: Record<string, unknown>): void;
	/** Clear SDK state/cookies. */
	clear(params?: Record<string, unknown>): void;
	/** Switch the active UI language. */
	changeLanguage(language: string): void;

	/**
	 * Subscribe to a lifecycle/engagement callback. Pass `null` as the handler to
	 * unsubscribe. See the callbacks reference for available keys.
	 */
	on(event: string, cb: null | ((...args: any[]) => void), params?: Record<string, unknown>): void;
	/** Remove a previously registered callback. */
	off(event: string, cb: null | ((...args: any[]) => void)): void;

	/** Trigger a Smartico deep link. */
	dp(deepLink: string): void;
	/** Open a Smartico widget overlay/inline. */
	showWidget(widgetType: SmarticoWidgetType, params?: SmarticoWidgetParams): void;
	/** Open a mini-game widget for the given template. */
	miniGame(sawTemplateId: string, params: SmarticoWidgetParams, pendingMessageId?: string | number): void;
	/** Render a banner into a host element. */
	showBanner(params: { dom_id: string; placement_key: string }): void;
	/** Push data into an already-rendered banner. */
	sendDataToBanner(params: { placement_key: string; data: Record<string, unknown> }): void;
	/** Embed the gamification block into a host element. */
	gamificationBlock(params: { dom_id: string; url: string; fit?: 'content' | 'fill' }): void;

	/** Snapshot of the user's public gamification properties. */
	getPublicProps(): PublicProperties;
	/** Add/remove/replace/clear the user's public tags. */
	updatePublicTags(operation: 'add' | 'remove' | 'replace' | 'clear', tags?: string[]): void;
	/** Set UTM attribution for the session. */
	setUTMs(source: string, campaign: string): void;
	/** Record the last login entry point. */
	setLoginEntry(entry: string): void;
	/** Set the user's avatar. */
	setAvatar(avatarId: string): void;
	/** Set the user's nickname. */
	setNickname(nickname: string): void;
	/** Set the active UI skin. */
	setSkin(skinName: string): void;

	/** Prompt the browser for web-push permission. */
	requestPushPermissions(): void;
	/** Register a native push token (mobile webviews). */
	registerNativePushToken(token: string, platform?: number, appPackageId?: string): void;

	/** Send a client event. */
	event(eventType: string, payload?: Record<string, unknown>): void;
	/** Send a client action. */
	action(actionValue: unknown, extraPayload?: Record<string, unknown>): void;
	/** Report a client-side error to the server. */
	sendServerError(message: string): void;
	/** Send a client-side debug message to the server. */
	sendServerDebug(message: string): void;

	/** Temporarily suspend/resume automatic popups. */
	suspendPopups(flag: boolean): void;
	/** Temporarily suspend/resume the inbox. */
	suspendInbox(flag: boolean): void;
	/** Temporarily suspend/resume mini-games. */
	suspendMiniGames(flag: boolean): void;

	/** Show a visitor-mode game. */
	showVisitorGame(params: Record<string, unknown>): void;
	/** Convert a visitor-mode win into an identified reward. */
	convertVisitorGame(visitorWinUuid: string): void;

	/** Start landing-page analytics for a template. */
	startLpAnalytics(params: { lp_template_uuid: string; shadow_root?: ShadowRoot | null }): void;
	/** Send a landing-page analytics activity. */
	sendAnalytics(activityId: number, viewTimeSec?: number): void;

	/** `true` on mobile viewports. */
	isMobile(): boolean;
	/** Parse the current URL query into a map. */
	parseUrl(): Record<string, string>;
	/** Parse the current URL hash into a map. */
	parseUrlHash(): Record<string, string>;
}

declare global {
	interface Window {
		/**
		 * The global Smartico SDK object, present once the embed snippet has loaded.
		 * Optional because it is `undefined` until the script initializes — guard
		 * access (`window._smartico?.…`) or gate on `checkSuccessfullyIdentify()`.
		 */
		_smartico?: SmarticoGlobal;
	}
}
