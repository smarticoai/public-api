export enum AchCustomSectionType {
	HTML_PAGE = 1,
	MISSIONS_CATEGORY = 2,
	TOURNAMENTS_CATEGORY = 3,
	LEVELS = 4,
	MINI_GAMES = 5,
	MISSION_CUSTOM_LAYOUT = 6,
	MATCH_X_AND_QUIZ = 7,
	REDIRECT_LINK = 9,
	LOOTBOX_WEEKLY = 10,
	LOOTBOX_CALENDAR_DAYS = 11,
	TREASURE_HUNT = 12,
}

export enum AchCustomLayoutTheme {
	VALENTINES_LIGHT = 'valentines-light',
	VALENTINES_DARK = 'valentines-dark',
	EURO_2024 = 'euro-2024',
	GENERIC = 'generic',
}

export enum AchMissionsTabsOptions {
	ONLY_OVERVIEW = 1,
	NO_OVERVIEW = 2,
	ALL = 3,
}

export enum AchOverviewMissionsFilter {
	ANY = 1,
	ALL_MISSIONS = 2,
	ALL_EXCEPT_COMPLETED = 3,
	ALL_EXCEPT_LOCKED = 4,
	ALL_EXCEPT_COMPLETED_AND_LOCKED = 5,
}
