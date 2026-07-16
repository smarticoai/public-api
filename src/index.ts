export * from './Base/ClassId';
export * from './ILogger';
export * from './SmarticoAPI';
export * from './WSAPI/WSAPI';
export * from './SmarticoGlobal';
export * from './CookieStore';

// Consumer-facing transformed ("T") types. They are defined in WSAPI/WSAPITypes.ts
// and returned by the WSAPI methods, but that file is not a barrel export, so the
// names never reached the package root — integrators could not `import { TX }`.
// Re-export them by name here. (Names that collide with a domain-module export —
// AchRelatedGame, BonusStatus, BonusMetaMap, BonusTemplateMetaMap — are intentionally
// omitted; import those from their domain module.)
export type {
	TAchCategory, TActivityLog, TActivityLogEntry, TAvatarCustomized, TAvatarDefinition, TAvatarPrompt,
	TBonus, TBuyStoreItemResult, TClaimBonusResult, TClan, TClanInfo, TClanJoinResult,
	TClanTournamentPlayers, TClans, TGetTranslations, TInboxMessage, TInboxMessageBody,
	TLevel, TLevelCurrent, TMiniGamePlayBatchResult, TMiniGamePlayResult, TMiniGamePrize,
	TMiniGameTemplate, TMissionClaimRewardResult, TMissionOptInResult, TMissionOrBadge,
	TMissionOrBadgeTask, TRaffle, TRaffleDraw, TRaffleDrawRun, TRaffleOptinResponse,
	TRafflePrize, TRafflePrizeWinner, TRaffleTicket, TSawHistory, TSegmentCheckResult,
	TSetAvatarResult, TStoreCategory, TStoreItem, TTournament, TTournamentDetailed,
	TTournamentRegistrationResult, TUICustomSection, TUserProfile,
	TransformedRaffleClaimPrizeResponse, InboxMarkMessageAction, LeaderBoardDetailsT,
	LeaderBoardUserT, LeaderBoardsRewardsT, UserLevelExtraCountersT,
} from './WSAPI/WSAPITypes';

export * from './Analytics';
export * from './Core';
export * from './UserProfile';
export * from './Inbox';
export * from './Leaderboard';
export * from './MiniGames';
export * from './Missions';
export * from './Store';
export * from './Tournaments';
export * from './Level';
export * from './GamePick';
export * from './Jackpots';
export * from './Raffle';

export * from './OCache';
export * from './Bonuses';
export * from './CustomSections';
export * from './ActivityLog';
export * from './Base/AchRelatedGame';
export * from './Avatars';
export * from './Clans';
