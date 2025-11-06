import type { AnalyticsInterfaceType } from "./AnalyticStoreData";
import type { IAnalyticStoreData } from "./IAnalyticStoreData";

export interface IAnalyticRequestData extends IAnalyticStoreData {
	user_id: number,
	label_id: number,
	brand_key: string,
	user_ext_id: string,
	interface_type: AnalyticsInterfaceType,
}
