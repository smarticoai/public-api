import { ECacheContext, OCache } from '../OCache';
import {
	TAvatarDefinition,
	TAvatarCustomized,
	TAvatarPrompt,
	TSetAvatarResult,
} from './WSAPITypes';
import {
	CACHE_DATA_SEC,
	onUpdateContextKey,
} from './WSAPIBase';
import { WSAPIMiniGames } from './WSAPIMiniGames';

/** @group Avatars */
export class WSAPIAvatars extends WSAPIMiniGames {
	/**
	 * Returns the avatar catalog available to the current user — every pre-defined
	 * avatar configured for the label, with per-user unlock flags (`is_given`, `is_in_use`)
	 * applied server-side.
	 *
	 * The returned `avatar_url` is the absolute CDN URL (the SDK prefixes relative paths
	 * with the configured avatar domain). AI-customized variants are NOT returned here —
	 * those live in {@link getAvatarsCustomized}.
	 *
	 * @remarks
	 * **Preconditions**
	 * - User must be authenticated. Visitor mode is not supported.
	 * - No other prerequisite calls.
	 *
	 * **Visibility filter** (consumer-applied)
	 * Avatars with `hide_until_achieved === true && is_given === false` should be filtered
	 * out of the grid — they represent surprise unlocks that should remain hidden until
	 * the user earns them. The default Smartico UI drops these before rendering.
	 *
	 * **Lock state** (consumer-applied)
	 * Lock condition: `!is_given && avatar_source_type_id !== 0`. Free avatars
	 * (`avatar_source_type_id === 0`) are always selectable; non-free avatars are locked
	 * until `is_given` flips to true (operator grants via campaign, mission reward, store
	 * purchase, etc.).
	 *
	 * **Sort order**
	 * Server does NOT pre-sort. Caller must sort by `priority` ascending (lower = first).
	 *
	 * **Refresh**
	 * - The SDK caches results for 30 seconds.
	 * - {@link setAvatar} clears this cache on completion; the next call re-fetches.
	 * - No push subscription — there is no `onUpdate` callback for avatar methods.
	 * - When `is_given` flips server-side (e.g. the user earns a new avatar), the change
	 *   surfaces only on the next call after the 30-second cache window expires.
	 *
	 * **Visitor mode**: not supported.
	 *
	 * **UI guidance**: see [UI Guide — `getAvatarsList`](../../docs/ui/avatars/UIGuide_getAvatarsList.md).
	 *
	 * @returns Array of {@link TAvatarDefinition} — empty array if the feature is disabled
	 * on the label.
	 *
	 * @example
	 * ```ts
	 * const avatars = await window._smartico.api.getAvatarsList();
	 *
	 * // Apply the standard visibility filter and sort.
	 * const visible = avatars
	 *     .filter((a) => !a.hide_until_achieved || a.is_given)
	 *     .sort((a, b) => a.priority - b.priority);
	 *
	 * console.log('[smartico] visible avatars:', visible.length, '— render as a grid');
	 *
	 * const active = visible.find((a) => a.is_in_use);
	 * if (active) {
	 *     console.log('[smartico] currently in use — overlay a checkmark on this card:', active.avatar_real_id);
	 * }
	 * ```
	 */
	public async getAvatarsList(): Promise<TAvatarDefinition[]> {
		return OCache.use(
			onUpdateContextKey.AvatarsList,
			ECacheContext.WSAPI,
			() => this.api.avatarsGetListT(this.userExtId),
			CACHE_DATA_SEC,
		);
	}

	/**
	 * Returns the user's previously generated AI-customized avatar variants.
	 *
	 * Each entry is one AI-generated image derived from a base avatar in the catalog
	 * (the base is identified by `avatar_real_id` and was originally a
	 * {@link TAvatarDefinition} from {@link getAvatarsList}). These variants are stored
	 * server-side under the user record and persist across sessions.
	 *
	 * @remarks
	 * **Preconditions**
	 * - User must be authenticated. Visitor mode is not supported.
	 * - Has meaning only after at least one successful AI customization run (see below).
	 *   New users get an empty array.
	 *
	 * **Where customized avatars come from**
	 * AI customization is **not** a WebSocket method on this SDK. It is a separate HTTP
	 * POST to the operator-configured `avatar-customize` endpoint that takes a base avatar
	 * plus a style prompt from {@link getAvatarPrompts} and returns a generated CDN URL.
	 * Once that POST resolves successfully, the new variant is persisted and surfaces in
	 * the next `getAvatarsCustomized()` call. The variant URL can then be passed to
	 * {@link setAvatar} to activate it.
	 *
	 * **Relation to `getAvatarsList`**
	 * AI variants do NOT appear in {@link getAvatarsList}. Catalog and variants are two
	 * separate collections — combine them client-side if the UI needs a unified view per
	 * base avatar.
	 *
	 * **Sort order**
	 * Server does NOT pre-sort. Caller typically sorts by `dt_created` descending to show
	 * the newest variant first.
	 *
	 * **Refresh**
	 * - The SDK caches results for 30 seconds.
	 * - {@link setAvatar} clears this cache on completion.
	 * - After a successful AI customization POST, the consumer should re-call to surface
	 *   the new variant — the customization endpoint is outside the SDK so the SDK cannot
	 *   auto-invalidate.
	 * - No push subscription.
	 *
	 * **Visitor mode**: not supported.
	 *
	 * **UI guidance**: see [UI Guide — `getAvatarsCustomized`](../../docs/ui/avatars/UIGuide_getAvatarsCustomized.md).
	 *
	 * @returns Array of {@link TAvatarCustomized} — empty if the user has never run AI
	 * customization, or if the feature is disabled on the label.
	 *
	 * @example
	 * ```ts
	 * const variants = await window._smartico.api.getAvatarsCustomized();
	 *
	 * // Group by the base avatar so the UI can show "this base has 3 AI variants".
	 * const byBase = new Map<number, typeof variants>();
	 * for (const v of variants) {
	 *     const list = byBase.get(v.avatar_real_id) ?? [];
	 *     list.push(v);
	 *     byBase.set(v.avatar_real_id, list);
	 * }
	 *
	 * // Newest-first within each base.
	 * for (const list of byBase.values()) {
	 *     list.sort((a, b) => b.dt_created.localeCompare(a.dt_created));
	 * }
	 *
	 * console.log('[smartico] AI variants by base avatar — render as a carousel under each base');
	 * ```
	 */
	public async getAvatarsCustomized(): Promise<TAvatarCustomized[]> {
		return OCache.use(
			onUpdateContextKey.AvatarsCustomized,
			ECacheContext.WSAPI,
			() => this.api.avatarsGetCustomizedT(this.userExtId),
			CACHE_DATA_SEC,
		);
	}

	/**
	 * Returns the catalog of AI style prompts available for avatar customization.
	 *
	 * Each entry is a "style" the user can apply to a base avatar (e.g. "Cartoon",
	 * "Watercolor", "Cyberpunk"). Prompts carry a cost expressed in points, gems, or
	 * diamonds — applying a prompt deducts the cost server-side as part of the AI
	 * generation request.
	 *
	 * @remarks
	 * **Preconditions**
	 * - User must be authenticated. Visitor mode is not supported.
	 * - No other prerequisite calls. The customization UI typically calls this on demand
	 *   when the user opens the style picker, not on app boot.
	 *
	 * **Cost handling**
	 * Each prompt declares `cost_currency_type_id` (0 = points, 1 = gems, 2 = diamonds)
	 * and `cost_value` (amount). The deduction happens server-side inside the
	 * `avatar-customize` HTTP POST (the AI generation request, which is NOT part of this
	 * SDK). The client should compare `cost_value` against the live balance from
	 * {@link getUserProfile} to disable prompts the user cannot afford, but the server is
	 * the source of truth and will reject under-funded requests authoritatively.
	 *
	 * **Refresh**
	 * - The SDK caches results for 30 seconds.
	 * - Not invalidated by {@link setAvatar} (prompts are catalog metadata, independent
	 *   of the user's active avatar).
	 * - No push subscription.
	 *
	 * **Visitor mode**: not supported.
	 *
	 * **UI guidance**: see [UI Guide — `getAvatarPrompts`](../../docs/ui/avatars/UIGuide_getAvatarPrompts.md).
	 *
	 * @returns Array of {@link TAvatarPrompt} — empty if the AI customization feature is
	 * disabled on the label.
	 *
	 * @example
	 * ```ts
	 * const [prompts, profile] = await Promise.all([
	 *     window._smartico.api.getAvatarPrompts(),
	 *     window._smartico.api.getUserProfile(),
	 * ]);
	 *
	 * for (const p of prompts) {
	 *     // The consumer reads the matching balance from profile based on
	 *     // p.cost_currency_type_id (0=points, 1=gems, 2=diamonds).
	 *     console.log('[smartico] prompt', p.name, '— cost', p.cost_value, 'currency_type', p.cost_currency_type_id);
	 * }
	 * ```
	 */
	public async getAvatarPrompts(): Promise<TAvatarPrompt[]> {
		return OCache.use(
			onUpdateContextKey.AvatarPrompts,
			ECacheContext.WSAPI,
			() => this.api.avatarsGetPromptsT(this.userExtId),
			CACHE_DATA_SEC,
		);
	}

	/**
	 * Activates the specified avatar for the current user. The chosen image becomes the
	 * profile avatar — any subsequent {@link getUserProfile} call will reflect the new
	 * `avatar_url`.
	 *
	 * Pass `avatar_url` (a {@link TAvatarDefinition.url} from the catalog or a
	 * {@link TAvatarCustomized.url} from the AI-variant list) plus `avatar_real_id` of the
	 * base avatar. The server validates ownership before applying — locked avatars are
	 * rejected.
	 *
	 * @remarks
	 * **Preconditions**
	 * - User must be authenticated. Visitor mode is not supported.
	 * - `avatar_url` must be non-empty and `avatar_real_id` must be truthy — the SDK
	 *   throws synchronously otherwise (the request never reaches the server).
	 * - The avatar must exist in the catalog from {@link getAvatarsList} (or be an AI
	 *   variant of a base avatar the user already owns). Free avatars
	 *   (`avatar_source_type_id === 0`) and the user's currently active avatar bypass the
	 *   ownership check; all others require `is_given === true`.
	 *
	 * **Error codes** (in `err_code`)
	 * - `0` — success; cache is cleared and the profile avatar updates immediately.
	 * - `1` — avatar not found in the catalog. The `avatar_real_id` doesn't exist for
	 *   this label.
	 * - `2` — avatar inactive (deactivated by the operator).
	 * - `3` — outside the avatar's active time window
	 *   (`active_from_date` / `active_till_date`).
	 * - `4` — user does not own this avatar (it isn't in their `is_given` set and isn't
	 *   a free / default avatar).
	 * - other non-zero — generic server error; surface `err_message` if present.
	 *
	 * The default Smartico UI shows a hardcoded "Failed to apply avatar" toast on any
	 * non-zero `err_code` and does not surface `err_message`. Custom UIs SHOULD branch
	 * on the code and prefer `err_message` when present (it is the localized server
	 * string).
	 *
	 * **Refresh after success**
	 * - The SDK clears both the `getAvatarsList` and `getAvatarsCustomized` caches —
	 *   the next call to either returns fresh data with the new `is_in_use` flag set on
	 *   the chosen avatar.
	 * - The server persists the new avatar URL on the user record; {@link getUserProfile}
	 *   reflects it on the next read in this session.
	 * - **No push to other open sessions.** A second device / tab the user is logged in
	 *   on will not see the new avatar until it next calls {@link getUserProfile} or
	 *   re-identifies. Plan UI accordingly.
	 *
	 * **Idempotency**: safe to retry. Re-applying the same `avatar_real_id` returns
	 * `err_code: 0` and produces no double side effects (no double-deduction — this
	 * method does not charge any currency — and no duplicate log entries).
	 *
	 * **Side effects**: updates the user's stored `avatar_id` / `avatar_real_id`. Does
	 * NOT cost points, gems, or diamonds — the cost lives on the separate AI
	 * customization HTTP flow ({@link getAvatarPrompts}). Does NOT write a user-visible
	 * entry to {@link getActivityLog}.
	 *
	 * **UI guidance**: see [UI Guide — `setAvatar`](../../docs/ui/avatars/UIGuide_setAvatar.md).
	 *
	 * **Visitor mode**: not supported.
	 *
	 * @param props.avatar_url       Absolute CDN URL of the avatar image. Read from
	 *                                {@link TAvatarDefinition.url} for catalog avatars or
	 *                                {@link TAvatarCustomized.url} for AI variants.
	 * @param props.avatar_real_id   Numeric ID of the base avatar from
	 *                                {@link TAvatarDefinition.avatar_real_id}. For AI
	 *                                variants, this is the `avatar_real_id` of the base
	 *                                they were derived from.
	 * @returns {@link TSetAvatarResult} — check `err_code === 0` for success.
	 *
	 * @example
	 * ```ts
	 * const avatars = await window._smartico.api.getAvatarsList();
	 * const target = avatars.find((a) => a.avatar_real_id === 7);
	 *
	 * if (!target) {
	 *     console.error('[smartico] avatar 7 not in catalog — hide the picker entry');
	 *     return;
	 * }
	 *
	 * const isLocked = !target.is_given && target.avatar_source_type_id !== 0;
	 * if (isLocked) {
	 *     console.log('[smartico] avatar is locked — show "earn this first" prompt instead of calling setAvatar');
	 *     return;
	 * }
	 *
	 * const r = await window._smartico.api.setAvatar({
	 *     avatar_url:     target.avatar_url,
	 *     avatar_real_id: target.avatar_real_id,
	 * });
	 *
	 * switch (r.err_code) {
	 *     case 0:
	 *         console.log('[smartico] avatar applied — close picker, refresh header avatar');
	 *         break;
	 *     case 1:
	 *         console.error('[smartico] avatar not in catalog — refresh catalog and show error');
	 *         break;
	 *     case 2:
	 *         console.error('[smartico] avatar inactive — operator disabled it; hide from picker');
	 *         break;
	 *     case 3:
	 *         console.error('[smartico] outside time window — show "available on X" message');
	 *         break;
	 *     case 4:
	 *         console.error('[smartico] not owned — show unlock requirements');
	 *         break;
	 *     default:
	 *         console.error('[smartico] avatar apply failed — show generic error toast:', r.err_message);
	 * }
	 * ```
	 */
	public async setAvatar(props: { avatar_url: string; avatar_real_id: number }): Promise<TSetAvatarResult> {
		if (!props.avatar_url) {
			throw new Error('avatar_url is required');
		}
		if (!props.avatar_real_id) {
			throw new Error('avatar_real_id is required');
		}

		const r = await this.api.avatarSetAvatar(this.userExtId, props.avatar_url, props.avatar_real_id);

		OCache.clear(ECacheContext.WSAPI, onUpdateContextKey.AvatarsList);
		OCache.clear(ECacheContext.WSAPI, onUpdateContextKey.AvatarsCustomized);

		return {
			err_code: r.errCode ?? 0,
			err_message: r.errMsg,
		};
	}
}
