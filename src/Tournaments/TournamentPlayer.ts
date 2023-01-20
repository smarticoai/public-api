export interface TournamentPlayer {

    userAltName: string;
    position: number;
    scores: number;
    isMe: boolean;
    userId: number;
    avatar_id: string;

    avatar_url?: string;
}
