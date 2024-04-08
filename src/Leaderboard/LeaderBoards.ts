import { LeaderBoardDetailsT, LeaderBoardUserT, LeaderBoardsRewardsT } from "src/WSAPI/WSAPITypes";
import { LeaderBoardDetails } from "./LeaderBoardDetails";
import { LeaderBoardPeriodType } from "./LeaderBoardPeriodType";
import { LeaderBoardPosition } from "./LeaderBoardPosition";

const pointsRewardTransform = (reward_points: number[]): LeaderBoardsRewardsT[] => {
    if (reward_points && reward_points.length) {
        return reward_points.map((r, i) => ({ place: i + 1, points: r }));
    }

    return null;
}

const getLeaderBoardPlayerTransformed = (user: LeaderBoardPosition, isMe?: boolean): LeaderBoardUserT => {
    if (user) {
        const x: LeaderBoardUserT= {
            public_username: user?.public_username || user.user_alt_name,
            avatar_url: user.avatar_url,
            position: user.position_in_board,
            points: user.points_accumulated,
            is_me: user.is_me,
        }
    
        if (isMe) {
            delete x.is_me;
        }

        return x;
    }

    return null;
}

export const getLeaderBoardTransform = (board: LeaderBoardDetails): LeaderBoardDetailsT => {
    if (board) {
        const x: LeaderBoardDetailsT = {
            board_id: board.board_id,
            name: board.board_public_meta.name,
            description: board.board_public_meta.description,
            rules: board.board_public_meta.rules,
            period_type_id: board.period_type_id,
            rewards: pointsRewardTransform(board.reward_points),
            users: board.positions.map(p => getLeaderBoardPlayerTransformed(p)),
            me: getLeaderBoardPlayerTransformed(board.userPosition, true),
        }

        return x;
    }

    return null;
}