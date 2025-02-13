import { RaffleTicket } from "./RaffleTicket";

interface RafflePrizeWinner {
    user_id: number;
	public_username?: string;    
	avatar_id: string;
	avatar_url?: string;        
    ticket: RaffleTicket;
}

export { RafflePrizeWinner }