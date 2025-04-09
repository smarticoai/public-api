import { RaffleTicket } from './RaffleTicket';

interface RafflePrizeWinner {
	user_id: number;
	public_username?: string;
	avatar_id: string;
	avatar_url?: string;
	ticket: RaffleTicket;
	raf_won_id: number;
	claimed_date: number
}

export { RafflePrizeWinner }
