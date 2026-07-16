import { UserBalanceType } from './UserBalanceType';

/** Activity-log entry type as returned on the v2 wire (`type_id`). */
export enum ActivityLogActivities {
	Gems = 1,
	Diamonds = 2,
	Points = 3,
	LevelChanged = 4,
	Bonus = 5,
	PrizeDrop = 6,
	Minigame = 7,
	RaffleTicket = 8,
	Avatar = 9,
	Task = 10,
	Mission = 11,
	Badge = 12,
	TangiblePrize = 13,
	Jackpot = 14,
	Spin = 15,
	NoPrize = 16,
	Leaderboard = 17,
	Tournament = 18,
	ClanTournament = 19,
}

export enum WalletChangeType {
	Add = 1,
	Deduct = 2,
	Set = 3,
}

export enum LevelChangeType {
	Increase = 1,
	Decrease = 2,
}

/** Wire ctx_1 for Mission / Badge / Task — see SMR-44986. */
export enum AchievementChangeType {
	Complete = 1,
	Unlock = 2,
}

/** Wire ctx_1 for Jackpot rows — SMR-44986. */
export enum JackpotContextValue {
	Registration = 1,
	Win = 3,
}

const WALLET_TYPE_IDS = new Set<number>([
	ActivityLogActivities.Gems,
	ActivityLogActivities.Diamonds,
	ActivityLogActivities.Points,
]);

export const isWalletActivityTypeId = (typeId: number): boolean => WALLET_TYPE_IDS.has(typeId);

export const activityTypeIdToBalanceType = (typeId: ActivityLogActivities): UserBalanceType => {
	switch (typeId) {
		case ActivityLogActivities.Gems:
			return UserBalanceType.Gems;
		case ActivityLogActivities.Diamonds:
			return UserBalanceType.Diamonds;
		default:
			return UserBalanceType.Points;
	}
};
