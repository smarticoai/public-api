import type { MissionCategory } from "../Missions";
import type { AnalyticsTournamentsLobbySubScreenNameId } from "./AnalyticStoreData";
import type { AnalyticsInboxSubScreenNameId } from "./AnalyticStoreData";

export type AnalyticSubNames = 
	| MissionCategory
	| AnalyticsTournamentsLobbySubScreenNameId
	| AnalyticsInboxSubScreenNameId
	| number
	| null;