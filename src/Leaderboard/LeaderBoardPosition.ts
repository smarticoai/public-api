export interface LeaderBoardPosition {
	public_username?: string;
	user_alt_name: string; // TODO Need remove it in future
	position_in_board: number;
	points_accumulated: number;
	is_me: boolean;
	level_id: number;
	avatar_id: string;

	avatar_url?: string;
}
