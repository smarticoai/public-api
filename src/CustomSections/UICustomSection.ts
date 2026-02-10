import { TUICustomSection } from '../WSAPI/WSAPITypes';
import {
	AchCustomLayoutTheme,
	AchCustomSectionType,
	AchMissionsTabsOptions,
	AchOverviewMissionsFilter,
	LiquidEntityData,
} from './AchCustomSection';
import { GetCustomSectionsResponse } from './GetCustomSectionsResponse';

export interface UICustomSection {
	body?: string;
	menu_img?: string;
	menu_name?: string;
	custom_skin_images?: string;
	section_type_id?: AchCustomSectionType;
	theme?: AchCustomLayoutTheme;
	generic_custom_css?: string;
	mission_tabs_options?: AchMissionsTabsOptions;
	overview_missions_filter?: AchOverviewMissionsFilter;
	overview_missions_count?: number;
	liquid_entity_data?: LiquidEntityData[];
	ach_tournament_id?: number;
	show_raw_data?: boolean;
	liquid_template?: number;
	ach_category_ids?: number[];
	shop_category_ids?: number[];
}

export const UICustomSectionTransform = (response: GetCustomSectionsResponse): TUICustomSection[] => {

	const items: TUICustomSection[] = [];

	Object.keys(response.customSections || []).forEach((key: string) => {
		const r = response.customSections[key];
		const id = parseInt(key);
		if (r.section_type_id !== undefined && r.section_type_id >= 1) {
			const x: TUICustomSection = {
				id: id,
				body: r.body,
				menu_img: r.menu_img,
				menu_name: r.menu_name,
				section_type_id: r.section_type_id,
				custom_skin_images: r.custom_skin_images,
				generic_custom_css: r.generic_custom_css,
				mission_tabs_options: r.mission_tabs_options,
				overview_missions_count: r.overview_missions_count,
				overview_missions_filter: r.overview_missions_filter,
				theme: r.theme,
				...(r.section_type_id === AchCustomSectionType.LEVELS
					? {
						liquid_entity_data: r.liquid_entity_data,
						ach_tournament_id: r.ach_tournament_id,
						show_raw_data: r.show_raw_data,
						liquid_template: r.liquid_template,
					}
					: {}
				),
				...(r.section_type_id === AchCustomSectionType.BADGES
					? {
						ach_category_ids: r.ach_category_ids,
					}
					: {}
				),
				...(r.section_type_id === AchCustomSectionType.STORE
					? {
						shop_category_ids: r.shop_category_ids,
					}
					: {}
				),
			};

			items.push(x);
		}
	});

	return items;
};
