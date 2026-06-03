import { ActivityTypeLimited } from '../Core';
import { ECacheContext, OCache } from '../OCache';
import {
	InboxMarkMessageAction,
	TInboxMessage,
	TInboxMessageBody,
} from './WSAPITypes';
import { InboxCategories } from '../Inbox/InboxCategories';
import { InboxReadStatus } from '../Inbox/InboxReadStatus';
import {
	CACHE_DATA_SEC,
	onUpdateContextKey,
} from './WSAPIBase';
import { WSAPILeaderBoard } from './WSAPILeaderBoard';

/** @group Inbox */
export class WSAPIInbox extends WSAPILeaderBoard {
	/**
	 * Records that an engagement (inbox message, popup) was displayed to
	 * the user. Use this to drive engagement analytics — every visible
	 * inbox message should fire one impression event per render
	 * occurrence, and every popup display should fire one.
	 *
	 * **Fire-and-forget**: the call is asynchronous and one-way — there
	 * is no response promise to await and no error reporting. The SDK
	 * swallows transport failures silently. Returns `void`.
	 *
	 * @remarks
	 * **When to call**
	 * - Inbox: when a message becomes visible (the user opens / scrolls
	 *   it into view). The default Smartico UI fires this when the
	 *   message detail expands, alongside
	 *   {@link markInboxMessageAsRead}.
	 * - Popup: when the popup content is shown to the user.
	 *
	 * **Activity types**
	 * Pass {@link ActivityTypeLimited.Inbox} (`31`) for inbox messages,
	 * {@link ActivityTypeLimited.Popup} (`30`) for popups. Other values
	 * are not used by the engagement-impression channel.
	 *
	 * **Idempotency**: the server records every impression event —
	 * repeated calls add to the impression count. Don't fire it on
	 * every re-render; fire it once per logical "display" event
	 * (modal open, list-row scroll-into-view, popup show).
	 *
	 * **Side effects**: server-side increments the engagement's
	 * `impression_count` and updates `last_impression_date`. The
	 * counter is observable via operator analytics; the SDK consumer
	 * receives no signal back.
	 *
	 * **Visitor mode**: not supported.
	 *
	 * @example
	 * ```ts
	 * // When the user opens an inbox message in the detail view.
	 * window._smartico.api.reportImpressionEvent({
	 *   engagement_uid: message.message_guid,
	 *   activityType: 31,  // ActivityTypeLimited.Inbox
	 * });
	 * console.log('[smartico] inbox impression reported for', message.message_guid, '— no response to await, fire-and-forget');
	 * ```
	 */
	public reportImpressionEvent({
		engagement_uid,
		activityType,
	}: {
		/** For inbox: the message's `message_guid` from `getInboxMessages`. For popups: the popup's GUID from the popup display callback. */
		engagement_uid: string;
		/** `ActivityTypeLimited.Inbox` (`31`) for inbox; `Popup` (`30`) for popups. */
		activityType: ActivityTypeLimited | number;
	}): void {
		this.api.reportEngagementImpression(this.userExtId, engagement_uid, activityType);
	}

	/**
	 * Records that the user interacted with an engagement — typically
	 * tapping a CTA button, following a deep-link, or clicking a popup
	 * action. Use this to drive engagement analytics on what users
	 * actually act on (vs what they merely see —
	 * {@link reportImpressionEvent}).
	 *
	 * **Fire-and-forget**: the call is asynchronous and one-way — there
	 * is no response promise to await and no error reporting. The SDK
	 * swallows transport failures silently. Returns `void`.
	 *
	 * @remarks
	 * **When to call**
	 * - Inbox: when the user taps a CTA button on a message or follows
	 *   a deep-link inside the message body. Pass the deep-link or URL
	 *   as `action`.
	 * - Popup: when the user clicks a popup action button.
	 *
	 * **Activity types**
	 * Pass {@link ActivityTypeLimited.Inbox} (`31`) for inbox,
	 * {@link ActivityTypeLimited.Popup} (`30`) for popups.
	 *
	 * **`action` payload**
	 * Pass the deep-link or URL that the user triggered (e.g.
	 * `'dp:gf_missions'`, `'https://example.com/promo'`). The SDK
	 * forwards the string to the server for analytics — it does not
	 * execute the deep-link. To execute deep-links safely, call
	 * `_smartico.dp(action)` separately.
	 *
	 * **Idempotency**: the server records every click event —
	 * repeated calls add to the count. Fire once per logical user
	 * action.
	 *
	 * **Side effects**: server-side updates the engagement's
	 * `last_action` field; observable via operator analytics. The SDK
	 * consumer receives no signal back.
	 *
	 * **Visitor mode**: not supported.
	 *
	 * @example
	 * ```ts
	 * // When the user taps a CTA button in an inbox message.
	 * window._smartico.api.reportClickEvent({
	 *   engagement_uid: message.message_guid,
	 *   activityType: 31,  // ActivityTypeLimited.Inbox
	 *   action: 'dp:gf_missions',
	 * });
	 * window._smartico.dp('dp:gf_missions');   // separately execute the deep-link
	 * ```
	 */
	public reportClickEvent({
		engagement_uid,
		activityType,
		action,
	}: {
		/** For inbox: the message's `message_guid` from `getInboxMessages`. */
		engagement_uid: string;
		/** `ActivityTypeLimited.Inbox` (`31`) for inbox; `Popup` (`30`) for popups. */
		activityType: ActivityTypeLimited | number;
		/** The deep-link / URL the user triggered (optional but recommended for analytics fidelity). */
		action?: string;
	}): void {
		this.api.reportEngagementAction(this.userExtId, engagement_uid, activityType, action);
	}

	/**
	 * Returns the user's inbox messages — newest first — with optional
	 * filtering by category, favorite status, and read state. Each
	 * `TInboxMessage` is a lightweight envelope (`message_guid`,
	 * `sent_date`, `read`, `favorite`, `category_id`, `expire_on_dt`);
	 * fetch the rich body (title, preview, icon, html_body, buttons)
	 * separately via {@link getInboxMessageBody}.
	 *
	 * Use this to power an inbox list screen. Subscribe via `onUpdate`
	 * to react to newly-arrived messages pushed by the server (from
	 * campaigns, automation rules, manual operator sends).
	 *
	 * @remarks
	 * **Subscription model (`onUpdate`)**
	 * The callback receives the FULL refreshed message list (never a
	 * diff/patch). Each subsequent call to `getInboxMessages({ onUpdate })`
	 * REPLACES the prior callback. Pass `onUpdate: undefined` (or omit
	 * it) to keep the prior callback in place; the callback is never
	 * auto-cleared.
	 *
	 * **Update triggers** — the callback fires ONLY when:
	 *
	 * 1. A new message is pushed by the server (campaign / automation /
	 *    operator send). The refreshed list includes the new message
	 *    at the top.
	 *
	 * Does NOT fire for: `markInboxMessageAsRead`,
	 * `markAllInboxMessagesAsRead`,
	 * `markUnmarkInboxMessageAsFavorite`, `deleteInboxMessage`,
	 * `deleteAllInboxMessages`. After a mutation, re-call
	 * `getInboxMessages` manually if your UI needs the refreshed list
	 * — or maintain optimistic state locally.
	 *
	 * **Pagination**
	 * `from` (defaults to `0`) and `to` (defaults to `20`) define a
	 * half-open range of message indices. The server caps the page at
	 * **20 messages per request** — passing `to - from > 20` silently
	 * truncates to 20. For "load more" pagination, advance `from` by
	 * the prior page size on each subsequent call.
	 *
	 * **Filters**
	 * All filters are ANDed server-side. Omitting a filter means "no
	 * constraint" on that dimension:
	 * - `categoryId` ({@link InboxCategories}): `General` (0),
	 *   `Platform` (1), `Personal` (2). Omit to get all categories.
	 * - `onlyFavorite: true` returns only starred messages.
	 *   Omit / `false` returns all (starred and not).
	 * - `read_status` ({@link InboxReadStatus}): `UnreadOnly` (1) or
	 *   `ReadOnly` (2). Omit to get both.
	 *
	 * **Server-side filtering** (always applied)
	 * Expired messages (`expire_on_dt` in the past) and
	 * soft-deleted messages are excluded server-side. Consumers do not
	 * need to filter for these.
	 *
	 * **No client cache**: every call sends a fresh server round-trip.
	 * To avoid redundant fetches in your UI, hold the result in
	 * application state and re-fetch on `onUpdate` fires or explicit
	 * user-driven refresh.
	 *
	 * **Idempotency / Side effects**: safe. Read-only.
	 *
	 * **UI guidance**: see [UI Guide — `getInboxMessages`](../../docs/ui/inbox/UIGuide_getInboxMessages.md).
	 *
	 * **Visitor mode**: not supported.
	 *
	 * @param params              Optional filters + subscription.
	 * @param params.from         First message index (0-based). Defaults
	 *                            to `0`.
	 * @param params.to           Last message index (exclusive).
	 *                            Defaults to `20`. Server caps the page
	 *                            at 20.
	 * @param params.onlyFavorite When `true`, returns only favorite
	 *                            (starred) messages.
	 * @param params.categoryId   When set, returns only messages in this
	 *                            category ({@link InboxCategories}).
	 * @param params.read_status  When set, scopes to read or unread
	 *                            only ({@link InboxReadStatus}).
	 * @param params.onUpdate     Callback invoked with the full
	 *                            refreshed list when a new message
	 *                            arrives.
	 *
	 * @returns Promise resolving to up to 20 `TInboxMessage` envelopes.
	 *          Empty array when the user has no messages matching the
	 *          filter.
	 *
	 * @example
	 * ```ts
	 * const messages = await window._smartico.api.getInboxMessages({
	 *   onUpdate: (refreshed) => {
	 *     console.log('[smartico] new inbox message arrived — re-render the list from this array, new message is at index 0:', refreshed);
	 *   },
	 * });
	 *
	 * // For each message, fetch its body for the list view (title, preview, icon).
	 * for (const msg of messages) {
	 *   const body = await window._smartico.api.getInboxMessageBody(msg.message_guid);
	 *   console.log('[smartico] render message', msg.message_guid,
	 *     '— title:', body.title,
	 *     '— preview:', body.preview_body,
	 *     '— read:', msg.read,
	 *     '— favorite:', msg.favorite);
	 * }
	 *
	 * // "Load more" pagination — advance from by the prior page size.
	 * const page2 = await window._smartico.api.getInboxMessages({ from: 20, to: 40 });
	 * console.log('[smartico] page 2:', page2.length, 'messages');
	 *
	 * // Filter examples.
	 * const onlyStarred = await window._smartico.api.getInboxMessages({ onlyFavorite: true });
	 * const onlyUnread = await window._smartico.api.getInboxMessages({ read_status: 1 });  // InboxReadStatus.UnreadOnly
	 * ```
	 */
	public async getInboxMessages({
		from,
		to,
		onlyFavorite,
		categoryId,
		read_status,
		onUpdate,
	}: {
		from?: number;
		to?: number;
		onlyFavorite?: boolean;
		categoryId?: InboxCategories;
		read_status?: InboxReadStatus;
		onUpdate?: (data: TInboxMessage[]) => void;
	} = {}): Promise<TInboxMessage[]> {
		if (typeof onUpdate === 'function') {
			this.onUpdateCallback.set(onUpdateContextKey.InboxMessages, onUpdate);
		}
		return await this.api.getInboxMessagesT(this.userExtId, from, to, onlyFavorite, categoryId, read_status);
	}

	/**
	 * Returns the user's current unread inbox message count — a single
	 * integer suitable for driving a header badge. Optionally subscribe
	 * to live updates via `onUpdate`.
	 *
	 * For most UIs, prefer `core_inbox_unread_count` from
	 * {@link getUserProfile} instead: it carries the same value, is
	 * push-updated in real time via the user-properties channel, and
	 * doesn't require a separate cache. This method is useful when you
	 * want a dedicated subscription tied to the inbox surface rather
	 * than the broader user-properties channel.
	 *
	 * @remarks
	 * **Subscription model**
	 * `onUpdate` fires whenever the cached value changes — either on a
	 * push from the user-properties channel (new message arrival,
	 * mark-as-read, delete) or after an inbox-list fetch that returns
	 * a fresh count.
	 *
	 * **Cache TTL**: 30 seconds. The cached value is patched in place
	 * by push events (no full re-fetch on every push), so the
	 * `onUpdate` callback reflects server state with sub-second latency
	 * regardless of the TTL.
	 *
	 * **Idempotency / Side effects**: safe. Read-only.
	 *
	 * **Visitor mode**: not supported.
	 *
	 * @param params           Optional subscription bag.
	 * @param params.onUpdate  Callback invoked with the new unread
	 *                         count whenever it changes (push-driven).
	 * @returns                Promise resolving to the current unread
	 *                         count (integer, includes `0`).
	 *
	 * @example
	 * ```ts
	 * // Static read for an initial badge render.
	 * const count = await window._smartico.api.getInboxUnreadCount();
	 * console.log('[smartico] inbox badge initial count:', count);
	 *
	 * // Live subscription for badge updates.
	 * await window._smartico.api.getInboxUnreadCount({
	 *   onUpdate: (newCount) => {
	 *     console.log('[smartico] inbox count changed — update the badge to:', newCount,
	 *       '— hide badge entirely when 0, show raw integer otherwise (no "99+" cap in the default UI)');
	 *   },
	 * });
	 * ```
	 */
	public async getInboxUnreadCount({ onUpdate }: { onUpdate?: (unread_count: number) => void } = {}): Promise<number> {
		if (typeof onUpdate === 'function') {
			this.onUpdateCallback.set(onUpdateContextKey.InboxUnreadCount, onUpdate);
		}
		return OCache.use(
			onUpdateContextKey.InboxUnreadCount,
			ECacheContext.WSAPI,
			() => this.api.getInboxUnreadCountT(this.userExtId),
			CACHE_DATA_SEC,
		);
	}

	/**
	 * Returns the rich body of a single inbox message — title, preview
	 * text, icon, click action, optional rich HTML body, and optional
	 * buttons. Call this after fetching the envelope list via
	 * {@link getInboxMessages} to render either a list-item preview or
	 * a full detail view.
	 *
	 * The message body is served from a CDN — not over the WebSocket —
	 * so latency depends on CDN proximity rather than WS round-trip
	 * time. There is NO client-side cache; every call is a fresh
	 * HTTP fetch. Browser HTTP caching applies (Cache-Control headers
	 * from the CDN), but the SDK does not memoize the result.
	 *
	 * @remarks
	 * **Rich vs simple messages**
	 * The shape of the returned body branches on the `action` field:
	 * - When `action === 'dp:inbox'`, the message has a rich HTML body
	 *   (`html_body`) and may have up to 2 action `buttons`. Use these
	 *   for a full-detail rendering.
	 * - For any other `action` (deep-link like `'dp:deposit'` or a URL),
	 *   the message is a simple notification — `html_body` and
	 *   `buttons` will be `undefined` regardless of what's in the
	 *   underlying CDN payload. Render `title` + `preview_body` + a
	 *   single CTA driving the `action`.
	 *
	 * **The `action` field**
	 * For both shapes, `action` carries either a deep-link
	 * (`'dp:gf_missions'`) or a plain URL. Pass it to `_smartico.dp()`
	 * for safe execution — that helper handles URL vs deep-link
	 * routing.
	 *
	 * **Idempotency / Side effects**: safe. Read-only HTTP fetch.
	 *
	 * **UI guidance**: see [UI Guide — `getInboxMessageBody`](../../docs/ui/inbox/UIGuide_getInboxMessageBody.md).
	 *
	 * **Visitor mode**: not supported.
	 *
	 * @param messageGuid  The `message_guid` from a `TInboxMessage`
	 *                     returned by {@link getInboxMessages}.
	 * @returns            Promise resolving to `TInboxMessageBody`.
	 *
	 * @example
	 * ```ts
	 * const body = await window._smartico.api.getInboxMessageBody(messageGuid);
	 *
	 * console.log('[smartico] render message — title:', body.title,
	 *   '— preview:', body.preview_body,
	 *   '— icon:', body.icon);
	 *
	 * if (body.action === 'dp:inbox' && body.html_body) {
	 *   console.log('[smartico] rich message — render the html_body in a sandboxed iframe; render up to 2 action buttons:',
	 *     body.buttons?.length ?? 0);
	 * } else {
	 *   console.log('[smartico] simple message — show preview_body + single CTA wired to:', body.action,
	 *     '— execute via _smartico.dp(body.action)');
	 * }
	 * ```
	 */
	public async getInboxMessageBody(messageGuid: string): Promise<TInboxMessageBody> {
		return await this.api.getInboxMessageBodyT(messageGuid);
	}

	/**
	 * Marks a single inbox message as read. Server-side this flips the
	 * message's `is_read` flag and decrements the user's unread count
	 * (the change propagates back via the user-properties channel —
	 * subscribers to {@link getInboxUnreadCount}'s `onUpdate` and
	 * {@link getUserProfile}'s `core_inbox_unread_count` see it within
	 * ~1 second).
	 *
	 * @remarks
	 * **Error codes** (in `err_code`)
	 * - `0` — success; the message is now marked read. Idempotent — a
	 *   second call on the same `messageGuid` also returns `0`.
	 * - other non-zero — server error. Surface `err_message` if any.
	 *
	 * **Refresh after success**
	 * The SDK does NOT auto-refresh {@link getInboxMessages} (no
	 * `onUpdate` callback fires after this mutation). The unread-count
	 * channel ({@link getInboxUnreadCount}, `core_inbox_unread_count`)
	 * DOES auto-update — subscribers to it see the new count
	 * automatically. If your inbox list UI shows the `read` field, you
	 * have two options: re-call `getInboxMessages` after the mutation,
	 * or update the local copy optimistically.
	 *
	 * **Idempotency**: safe. Repeated calls return `err_code === 0`.
	 *
	 * **Side effects** (on success)
	 * - Server-side `is_read` flag set to true.
	 * - Server-side `core_inbox_unread_count` decremented (if the
	 *   message was previously unread).
	 *
	 * **UI guidance**: see [UI Guide — `markInboxMessageAsRead`](../../docs/ui/inbox/UIGuide_markInboxMessageAsRead.md).
	 *
	 * **Visitor mode**: not supported.
	 *
	 * @param messageGuid  The `message_guid` from a `TInboxMessage`.
	 * @returns `{ err_code, err_message }`; success when
	 *          `err_code === 0`.
	 *
	 * @example
	 * ```ts
	 * const r = await window._smartico.api.markInboxMessageAsRead(message.message_guid);
	 * if (r.err_code === 0) {
	 *   console.log('[smartico] marked as read — optimistically flip the local read indicator; the inbox badge auto-decrements via the user-properties channel');
	 * } else {
	 *   console.error('[smartico] mark-as-read failed — keep the local state as-is and show a non-blocking error if appropriate:', r.err_message);
	 * }
	 * ```
	 */
	public async markInboxMessageAsRead(messageGuid: string): Promise<InboxMarkMessageAction> {
		const r = await this.api.markInboxMessageRead(this.userExtId, messageGuid);

		return {
			err_code: r.errCode,
			err_message: r.errMsg,
		};
	}

	/**
	 * Marks ALL of the user's inbox messages as read in one server
	 * round-trip — typically wired to a "Mark all as read" CTA in the
	 * inbox header.
	 *
	 * The operation is global to the user — NOT filtered by the
	 * current view (active category tab, favorite filter, etc.). Every
	 * unread message in the user's inbox flips to read.
	 *
	 * @remarks
	 * **Error codes** (in `err_code`)
	 * - `0` — success; all currently-unread messages flipped to read.
	 * - other non-zero — server error. Surface `err_message` if any.
	 *
	 * **Race condition note**: a new message arriving server-side
	 * between the call and its processing remains unread (the
	 * server's mark-all operation is a snapshot in time). Subsequent
	 * `getInboxMessages` calls show the new message as unread.
	 *
	 * **Refresh after success**
	 * Same as {@link markInboxMessageAsRead} — `getInboxMessages`
	 * `onUpdate` does NOT fire automatically, but the unread-count
	 * channel does (the badge will drop to 0, or to the count of any
	 * new messages that arrived during processing).
	 *
	 * **Idempotency**: safe. A second call on an already-all-read
	 * inbox returns `err_code === 0` with no-op effect.
	 *
	 * **Side effects** (on success)
	 * - Every unread message flipped to read.
	 * - `core_inbox_unread_count` drops to 0 (or near 0 if races).
	 *
	 * **UI guidance**: included in the
	 * [UI Guide — `markInboxMessageAsRead`](../../docs/ui/inbox/UIGuide_markInboxMessageAsRead.md)
	 * (Bulk variant section).
	 *
	 * **Visitor mode**: not supported.
	 *
	 * @returns `{ err_code, err_message }`; success when
	 *          `err_code === 0`.
	 *
	 * @example
	 * ```ts
	 * console.log('[smartico] mark-all-read starting — set in-flight flag on the "Mark all read" button, show loading dots');
	 * const r = await window._smartico.api.markAllInboxMessagesAsRead();
	 * console.log('[smartico] mark-all-read response — clear in-flight flag');
	 * if (r.err_code === 0) {
	 *   console.log('[smartico] all messages marked read — optimistically flip every local read indicator; badge auto-drops via user-properties channel');
	 * } else {
	 *   console.error('[smartico] mark-all failed — surface a non-blocking error:', r.err_message);
	 * }
	 * ```
	 */
	public async markAllInboxMessagesAsRead(): Promise<InboxMarkMessageAction> {
		const r = await this.api.markAllInboxMessageRead(this.userExtId);

		return {
			err_code: r.errCode,
			err_message: r.errMsg,
		};
	}

	/**
	 * Toggles a message's favorite (starred) state — pass `mark: true`
	 * to favorite, `mark: false` to unfavorite. Use to power a star
	 * icon click handler on the inbox list.
	 *
	 * @remarks
	 * **Error codes** (in `err_code`)
	 * - `0` — success; the message's favorite state flipped to the
	 *   requested value.
	 * - other non-zero — server error. Surface `err_message` if any.
	 *
	 * **Refresh after success**
	 * The SDK does NOT auto-refresh {@link getInboxMessages}. To
	 * reflect the new state in the UI, update the local copy of the
	 * affected `TInboxMessage` (set `favorite` to the new value) or
	 * re-call `getInboxMessages`.
	 *
	 * **Idempotency**: safe. `mark: true` on an already-favorite
	 * message returns `err_code === 0` (no-op). Same for `mark: false`
	 * on a non-favorite.
	 *
	 * **Side effects** (on success)
	 * - Server-side `is_starred` flag set to the requested value.
	 * - No effect on read state, unread count, or other fields.
	 *
	 * **UI guidance**: see [UI Guide — `markUnmarkInboxMessageAsFavorite`](../../docs/ui/inbox/UIGuide_markUnmarkInboxMessageAsFavorite.md).
	 *
	 * **Visitor mode**: not supported.
	 *
	 * @param messageGuid  The `message_guid` from a `TInboxMessage`.
	 * @param mark         `true` to favorite, `false` to unfavorite.
	 * @returns            `{ err_code, err_message }`; success when
	 *                     `err_code === 0`.
	 *
	 * @example
	 * ```ts
	 * // Toggle handler — flip the local state optimistically, then
	 * // call the server, and revert if the call fails.
	 * const target = !message.favorite;
	 * console.log('[smartico] optimistically flip the star to', target, '— it will revert if the server rejects');
	 *
	 * const r = await window._smartico.api.markUnmarkInboxMessageAsFavorite(
	 *   message.message_guid,
	 *   target,
	 * );
	 *
	 * if (r.err_code === 0) {
	 *   console.log('[smartico] favorite toggled — keep the local state and show a brief "Added to favorites" / "Removed from favorites" toast');
	 * } else {
	 *   console.error('[smartico] favorite toggle failed — revert the local state and show an error toast:', r.err_message);
	 * }
	 * ```
	 */
	public async markUnmarkInboxMessageAsFavorite(messageGuid: string, mark: boolean): Promise<InboxMarkMessageAction> {
		const r = await this.api.markUnmarkInboxMessageAsFavorite(this.userExtId, messageGuid, mark);

		return {
			err_code: r.errCode,
			err_message: r.errMsg,
		};
	}

	/**
	 * Soft-deletes a single inbox message. After deletion, the message
	 * is excluded from future {@link getInboxMessages} responses
	 * server-side, but its row is retained for analytics — there is no
	 * "undelete" path via the SDK.
	 *
	 * @remarks
	 * **Error codes** (in `err_code`)
	 * - `0` — success; the message is now deleted from the user's
	 *   view.
	 * - other non-zero — server error. Surface `err_message` if any.
	 *
	 * **Refresh after success**
	 * The SDK does NOT auto-refresh {@link getInboxMessages}. Drop the
	 * deleted message from your local list, or re-call
	 * `getInboxMessages` to reload. If the deleted message was unread,
	 * the unread count drops automatically via the user-properties
	 * channel.
	 *
	 * **Idempotency**: safe. A second call on an already-deleted
	 * `messageGuid` returns `err_code === 0` (server treats it as a
	 * no-op — already-deleted messages are filtered out).
	 *
	 * **Side effects** (on success)
	 * - Server-side `is_deleted` flag set to true.
	 * - If the message was unread, `core_inbox_unread_count`
	 *   decrements via the user-properties channel.
	 *
	 * **UI guidance**: see [UI Guide — `deleteInboxMessage`](../../docs/ui/inbox/UIGuide_deleteInboxMessage.md).
	 *
	 * **Visitor mode**: not supported.
	 *
	 * @param messageGuid  The `message_guid` from a `TInboxMessage`.
	 * @returns `{ err_code, err_message }`; success when
	 *          `err_code === 0`.
	 *
	 * @example
	 * ```ts
	 * // Swipe-to-delete on mobile; trash-icon click on desktop.
	 * console.log('[smartico] delete starting — animate the row out of the list (slide left/right by 100%)');
	 * const r = await window._smartico.api.deleteInboxMessage(message.message_guid);
	 * if (r.err_code === 0) {
	 *   console.log('[smartico] deleted — drop the message from the local list, fire a brief "Message deleted" toast (no undo affordance — there is no undelete via the SDK)');
	 * } else {
	 *   console.error('[smartico] delete failed — animate the row back into place and show a non-blocking error:', r.err_message);
	 * }
	 * ```
	 */

	public async deleteInboxMessage(messageGuid: string): Promise<InboxMarkMessageAction> {
		const r = await this.api.deleteInboxMessage(this.userExtId, messageGuid);

		return {
			err_code: r.errCode,
			err_message: r.errMsg,
		};
	}

	/**
	 * Soft-deletes ALL of the user's inbox messages in one server
	 * round-trip — typically wired to a "Delete all" CTA in the inbox
	 * header (usually behind a confirm dialog given the destructive
	 * nature).
	 *
	 * The operation is global to the user — NOT filtered by the
	 * current view (active category tab, favorite filter, etc.). Every
	 * non-deleted message in the user's inbox flips to deleted.
	 *
	 * @remarks
	 * **Error codes** (in `err_code`)
	 * - `0` — success; the entire inbox is now empty from the user's
	 *   view.
	 * - other non-zero — server error. Surface `err_message` if any.
	 *
	 * **Race condition note**: a new message arriving server-side
	 * between the call and its processing is NOT deleted (the
	 * server's delete-all operation is a snapshot in time). Subsequent
	 * `getInboxMessages` calls show the new message.
	 *
	 * **Refresh after success**
	 * Same as {@link deleteInboxMessage} — `getInboxMessages` `onUpdate`
	 * does not fire automatically. Replace the local list with `[]`
	 * (or re-call `getInboxMessages`). The unread count drops to 0
	 * (or near-0 if races) via the user-properties channel.
	 *
	 * **Idempotency**: safe. A second call on an already-empty inbox
	 * returns `err_code === 0` with no-op effect.
	 *
	 * **Side effects** (on success)
	 * - Every message flipped to deleted server-side.
	 * - `core_inbox_unread_count` drops to 0.
	 * - There is no SDK undelete path — recovery requires operator
	 *   intervention.
	 *
	 * **UI guidance**: included in the
	 * [UI Guide — `deleteInboxMessage`](../../docs/ui/inbox/UIGuide_deleteInboxMessage.md)
	 * (Bulk variant section).
	 *
	 * **Visitor mode**: not supported.
	 *
	 * @returns `{ err_code, err_message }`; success when
	 *          `err_code === 0`.
	 *
	 * @example
	 * ```ts
	 * // After a confirm dialog "Are you sure you want to delete all messages?"
	 * console.log('[smartico] delete-all confirmed — show loading state on the "Delete all" button');
	 * const r = await window._smartico.api.deleteAllInboxMessages();
	 * if (r.err_code === 0) {
	 *   console.log('[smartico] inbox cleared — replace the local list with [], fire a "All messages deleted" toast, badge auto-drops to 0');
	 * } else {
	 *   console.error('[smartico] delete-all failed — show a non-blocking error toast:', r.err_message);
	 * }
	 * ```
	 */

	public async deleteAllInboxMessages(): Promise<InboxMarkMessageAction> {
		const r = await this.api.deleteAllInboxMessages(this.userExtId);

		return {
			err_code: r.errCode,
			err_message: r.errMsg,
		};
	}

	protected async updateInboxUnreadCount(count: number) {
		this.updateEntity(onUpdateContextKey.InboxUnreadCount, count);
	}

	protected async updateInboxMessages() {
		const payload = await this.api.getInboxMessagesT(this.userExtId);
		this.updateEntity(onUpdateContextKey.InboxMessages, payload);
	}
}
