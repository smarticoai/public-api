import { ProtocolMessage } from '../Base/ProtocolMessage'
import { JackPotWinner } from './JackPotWinner'
import { JackpotDetails } from './JackpotDetails'

export interface JackpotWinPush extends ProtocolMessage {
	jackpot: JackpotDetails
	winners: JackPotWinner[]
}
