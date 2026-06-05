import { LeaderBoardDetailsT, LeaderBoardUserT, LeaderBoardsRewardsT } from '../WSAPI/WSAPITypes';
import { LeaderBoardDetails } from './LeaderBoardDetails';
import { LeaderBoardPeriodType } from './LeaderBoardPeriodType';
import { LeaderBoardPosition } from './LeaderBoardPosition';

const pointsRewardTransform = (reward_points: number[]): LeaderBoardsRewardsT[] => {
	if (reward_points && reward_points.length) {
		return reward_points.map((r, i) => ({ place: i + 1, points: r }));
	}

	return null;
};

const getLeaderBoardPlayerTransformed = (user: LeaderBoardPosition, isMe?: boolean): LeaderBoardUserT => {
	if (user) {
		return {
			public_username: user?.public_username || user.user_alt_name,
			avatar_url: user.avatar_url,
			level_id: user.level_id,
			position: user.position_in_board,
			points: user.points_accumulated,
			// The `me` entry is the current user by definition, so force `true`
			// there; list rows carry the server-provided flag.
			is_me: isMe ? true : user.is_me,
		};
	}

	return null;
};

export const getLeaderBoardTransform = (board: LeaderBoardDetails): LeaderBoardDetailsT => {
	if (board) {
		return {
			board_id: board.board_id,
			name: board.board_public_meta.name,
			description: board.board_public_meta.description,
			rules: board.board_public_meta.rules,
			period_type_id: board.period_type_id,
			version_id: board.versiod_id,
			create_date: board.create_date,
			rewards: pointsRewardTransform(board.reward_points),
			users: (board.positions || []).map((p) => getLeaderBoardPlayerTransformed(p)),
			me: getLeaderBoardPlayerTransformed(board.userPosition, true),
		};
	}

	return null;
};
