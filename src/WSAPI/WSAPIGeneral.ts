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
	public async getCustomSections(): Promise<TUICustomSection[]> {
		return OCache.use(
			onUpdateContextKey.CustomSections,
			ECacheContext.WSAPI,
			() => this.api.customSectionsGetT(this.userExtId),
			CACHE_DATA_SEC,
		);
	}

	/**
	 * Requests translations for the given language. Returns the object including translation key/translation value pairs. All possible translation keys defined in the back office.
	 */
	public async getTranslations(lang_code: string): Promise<TGetTranslations> {
		const r = await this.api.getTranslationsT(this.userExtId, lang_code, []);

		return {
			translations: r.translations,
		};
	}

	/**
	 * Returns all the related tournaments and missions for the provided game id for the current user
	 * The provided Game ID should correspond to the ID from the Games Catalog - https://help.smartico.ai/welcome/technical-guides/games-catalog-api
	 *
	 * **Example**:
	 * ```
	 * _smartico.api.getRelatedItemsForGame('gold-slot2').then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 *
	 * **Example in the Visitor mode**:
	 * ```
	 * _smartico.vapi('EN').getRelatedItemsForGame('gold-slot2').then((result) => {
	 *      console.log(result);
	 * });
	 * ```
	 */
	public async getRelatedItemsForGame(related_game_id: string): Promise<GetRelatedAchTourResponse> {
		const result = await this.api.getRelatedItemsForGame(this.userExtId, related_game_id);
		return result;
	}
}
