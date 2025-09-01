export interface TournamentPlayer {
	userAltName: string;
	cleanExtUserId: string;
	crmBrandId: number;
	position: number;
	scores: number;
	isMe: boolean;
	userId: number;
	avatar_id: string;

	avatar_url?: string;
}
