import { ProtocolMessage } from '../Base/ProtocolMessage';
import { JackPotWinPushWinner } from './JackPotWinPushWinner';
import { JackpotDetails } from './JackpotDetails';

/**
 * Live jackpot-win notification. Delivered both to the winner and to other players
 * taking part in the same jackpot — use `winners[].is_me` to tell the two apart;
 * the copy sent to other players has its `public_username` masked.
 *
 * Surfaced to consumers through the `jackpot_win` callback
 * (`_smartico.on('jackpot_win', …)`).
 *
 * The explosion time is `jackpot.pot.explode_date_ts` (epoch milliseconds).
 */
export interface JackpotWinPush extends ProtocolMessage {
	/** The jackpot that exploded, including its live `pot` snapshot */
	jackpot: JackpotDetails;
	/** Winner entries; currently always a single entry */
	winners: JackPotWinPushWinner[];
}
