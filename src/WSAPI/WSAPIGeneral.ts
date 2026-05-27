import { ECacheContext, OCache } from '../OCache';
import {
	TGetTranslations,
	TUICustomSection,
} from './WSAPITypes';
import { GetRelatedAchTourResponse } from '../Missions/GetRelatedAchTourResponse';
import {
	CACHE_DATA_SEC,
	onUpdateContextKey,
} from './WSAPIBase';
import { WSAPIUser } from './WSAPIUser';

/** @group General */
export class WSAPIGeneral extends WSAPIUser {
	/**
	 * Returns the operator-configured "custom sections" the current user is eligible
	 * to see. Custom sections are nav-level entries the operator builds in the BO —
	 * HTML pages, themed mission grids, store / raffle / tournament category pages,
	 * lootbox calendars, redirect links, and Liquid-templated dashboards — each
	 * surfaced with its own icon and label.
	 *
	 * Use the response to build the side menu / bottom-bar / nav grid of a
	 * gamification widget. Each section's `section_type_id` (see
	 * {@link AchCustomSectionType}) tells the consumer which page component to mount
	 * when the user opens the section.
	 *
	 * @remarks
	 * **Preconditions**
	 * - No prerequisite calls. Typically fetched once at app boot to build the
	 *   navigation skeleton.
	 *
	 * **Server-side eligibility filtering**
	 * Sections are filtered server-side by the user's segments / level / brand and
	 * the section's `active_from_date` / `active_till_date` window. Sections the
	 * user is ineligible for are omitted from the response entirely — there is no
	 * "locked" state to render.
	 *
	 * **Ordering**
	 * Response is server-ordered. Render in the order received; do NOT re-sort
	 * client-side (the operator's order is the intended nav order).
	 *
	 * **Refresh**
	 * - The SDK caches results for 30 seconds.
	 * - No push subscription. Re-call after a segment / level change might
	 *   make new sections eligible, or just rely on the 30 s cache turnover.
	 *
	 * **Visitor mode**: supported.
	 *
	 * **UI guidance**: see [UI Guide — `getCustomSections`](../../docs/ui/general/UIGuide_getCustomSections.md).
	 *
	 * @returns Array of {@link TUICustomSection} — empty if the label has no
	 * active custom sections or the user is ineligible for all of them.
	 *
	 * @example
	 * ```ts
	 * const sections = await window._smartico.api.getCustomSections();
	 *
	 * for (const s of sections) {
	 *     console.log('[smartico] nav entry', s.menu_name, 'type', s.section_type_id, '→ mount the matching page component');
	 *     // Render s.menu_img (64x64) as the nav icon and s.menu_name as the label.
	 *     // For section_type_id === AchCustomSectionType.REDIRECT_LINK, do NOT mount a page —
	 *     // resolve s.url_or_dp on click (DP string or external URL).
	 * }
	 * ```
	 */
	public async getCustomSections(): Promise<TUICustomSection[]> {
		return OCache.use(
			onUpdateContextKey.CustomSections,
			ECacheContext.WSAPI,
			() => this.api.customSectionsGetT(this.userExtId),
			CACHE_DATA_SEC,
		);
	}

	/**
	 * Returns the full set of operator-defined translation key/value pairs for the
	 * label, merged across the requested language and the English baseline.
	 *
	 * Translation keys are free-form strings defined by the operator in the BO. The
	 * SDK consumer treats the result as a flat dictionary: `translations[key]`. If
	 * the key is missing entirely, do NOT trust `undefined` semantics — defensively
	 * fall back to the key string itself or a hardcoded literal.
	 *
	 * @remarks
	 * **Preconditions**
	 * - No prerequisite calls.
	 * - `lang_code` is the ISO language code the operator uses in the BO
	 *   (e.g. `"EN"`, `"FR"`, `"ES"`). Case is not normalised — match what the
	 *   operator configured.
	 *
	 * **EN fallback**
	 * The SDK issues an English-baseline fetch first, then overlays the
	 * `lang_code` translations on top. Any key the operator has only defined in
	 * English (i.e. missing in the requested language) is returned with the
	 * English value. Keys missing in both are absent from the map — the consumer
	 * must handle missing keys (the default Smartico UI returns the key string
	 * itself as the fallback text).
	 *
	 * **What's included**
	 * The SDK passes an empty `areas` filter to the server, which returns ALL
	 * translation namespaces configured for the label (Gamification, Casino,
	 * Trading, Affiliation, etc. — whichever are populated). For a Gamification-
	 * only widget, the consumer can ignore unused namespaces — keys are flat
	 * strings, not nested.
	 *
	 * **Refresh**
	 * - Cached internally per `(lang_code, label, brand)` for ~30 seconds.
	 * - No push subscription. Operators editing translations in the BO will see
	 *   the change after the cache window expires.
	 *
	 * **Visitor mode**: supported. Translations are label-scoped, not user-
	 * scoped — `lang_code` is the sole language selector and is independent of
	 * the `vapi(lang)` argument used elsewhere.
	 *
	 * @param lang_code  ISO language code (e.g. `"EN"`, `"FR"`). Defaults to
	 *                   `"EN"` server-side if empty.
	 * @returns {@link TGetTranslations} — `{ translations: { [key]: string } }`.
	 *
	 * @example
	 * ```ts
	 * const r = await window._smartico.api.getTranslations('FR');
	 *
	 * // Defensive lookup: fall back to the key itself if the operator hasn't
	 * // defined the string.
	 * const t = (k: string) => r.translations[k] ?? k;
	 *
	 * console.log('[smartico] localized label "missions_title" →', t('missions_title'));
	 * ```
	 */
	public async getTranslations(lang_code: string): Promise<TGetTranslations> {
		const r = await this.api.getTranslationsT(this.userExtId, lang_code, []);

		return {
			translations: r.translations,
		};
	}

	/**
	 * Returns the missions and tournaments associated with a casino / sportsbook
	 * game in the operator's games catalog — the reverse of "given this mission,
	 * which games count for it" — so you can surface "play this game to progress
	 * mission X" / "tournament Y features this game" badges on game tiles or
	 * detail screens.
	 *
	 * The shape mirrors `getMissions` (`UserAchievement[]`) and `getTournamentsList`
	 * (`Tournament[]`) — same wire types, no reduced subset.
	 *
	 * @remarks
	 * **Preconditions**
	 * - `related_game_id` must be a Games Catalog ID (the same external string the
	 *   operator uses in the catalog at
	 *   {@link https://help.smartico.ai/welcome/technical-guides/games-catalog-api}).
	 *
	 * **Server-side eligibility filtering**
	 * Missions and tournaments are filtered by the user's segments / level / brand
	 * before being returned. A user who is ineligible for a mission segment will
	 * NOT see that mission in the result even if it lists the game. The same
	 * filtering applies to tournaments. Treat the response as "what this user
	 * should see" — no client-side eligibility pass needed.
	 *
	 * **No cache**
	 * Every call is a live server round-trip. Missions/tournaments are operator-
	 * mutated state (opt-in, completion, expiry) that changes during a session;
	 * caching staler than the user's last action would mis-render eligibility.
	 * Avoid building a consumer-side cache for UI-critical paths.
	 *
	 * **Refresh**
	 * - Re-call when the user navigates to a new game tile / detail surface.
	 * - Re-call after the user opts into / completes a related mission to refresh
	 *   the "play this game" badge.
	 *
	 * **Visitor mode**: supported via `_smartico.vapi(lang).getRelatedItemsForGame(...)`.
	 *
	 * **UI guidance**: see [UI Guide — `getRelatedItemsForGame`](../../docs/ui/general/UIGuide_getRelatedItemsForGame.md).
	 *
	 * @param related_game_id  External Games Catalog ID of the game (e.g. `"gold-slot2"`).
	 * @returns {@link GetRelatedAchTourResponse} — `{ achievements, tournaments? }`.
	 * `tournaments` may be `undefined` (treat as empty); both arrays may be empty
	 * when no eligible entities reference the game.
	 *
	 * @example
	 * ```ts
	 * const r = await window._smartico.api.getRelatedItemsForGame('gold-slot2');
	 *
	 * const missions = r.achievements ?? [];
	 * const tournaments = r.tournaments ?? [];
	 *
	 * if (missions.length === 0 && tournaments.length === 0) {
	 *     console.log('[smartico] no related missions / tournaments — hide the related badge on the game tile');
	 * } else {
	 *     console.log('[smartico] related entities:', missions.length, 'missions /', tournaments.length, 'tournaments — show a "X missions / Y tournaments" badge');
	 * }
	 * ```
	 */
	public async getRelatedItemsForGame(related_game_id: string): Promise<GetRelatedAchTourResponse> {
		const result = await this.api.getRelatedItemsForGame(this.userExtId, related_game_id);
		return result;
	}
}
