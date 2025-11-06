import type { AnalyticsScreenNameId } from "./AnalyticStoreData";
import type { AnalyticSubNames } from "./AnalyticSubNames";

export interface IAnalyticStoreData {
	screen_name_id: AnalyticsScreenNameId;
	screen_subname_id?: AnalyticSubNames;
	custom_section_id?: number;
	entity_id?: number;
	create_date?: string;
}