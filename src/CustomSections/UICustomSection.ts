import { TUICustomSection } from '../WSAPI/WSAPITypes'
import { AchCustomLayoutTheme, AchCustomSectionType, AchMissionsTabsOptions, AchOverviewMissionsFilter } from './AchCustomSection'

export interface UICustomSection {
	body?: string
	menu_img?: string
	menu_name?: string
	custom_skin_images?: string
	section_type_id?: AchCustomSectionType
	theme?: AchCustomLayoutTheme
	generic_custom_css?: string
	mission_tabs_options?: AchMissionsTabsOptions
	overview_missions_filter?: AchOverviewMissionsFilter
	overview_missions_count?: number
}

export const UICustomSectionTransform = (items: UICustomSection[]): TUICustomSection[] => {
	return items
		.filter((r) => r.section_type_id !== undefined && r.section_type_id >= 1)
		.map((r) => {
			const x: TUICustomSection = {
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
			}
			return x
		})
}
